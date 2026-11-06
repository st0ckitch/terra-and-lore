/* Terra & Lore Realm · hero3d.js
   Real-3D hero and product stage. Palette hexes mirror tokens.json (WebGL cannot read CSS variables).
   Needs on the page, in this order, before this file:
     three@0.147.0/build/three.min.js
     three@0.147.0/examples/js/loaders/GLTFLoader.js
     three@0.147.0/examples/js/libs/meshopt_decoder.js   (models are meshopt-compressed)

   TL3D.mountHero(el, options)   → { destroy, setPaused, api }
   TL3D.mountStage(el, options)  → { destroy, setView, turn, zoom }

   Hero options (every key optional):
     actor:  { url, height: 0.95, clips: { run: 'Running', walk: 'Walking', jump: 'Jump_Run', hop: 'Regular_Jump' } }
     island: { url, scale: 1, position: [0,0,0], rotation: [0,0,0] }   // your Meshy forest GLB; omit for the stand-in island
     path:   [[x,y,z], ...]      // the actor's route in world units; an open path is run out and back (loop: true closes it); y is only a hint, feet snap to the surface
     jumpAt: [index]             // path indices where the actor jumps (Jump_Run) as it passes
     hopAt:  index               // path index where the actor stops, turns to the camera and hops (Regular_Jump); -1 for never
     speed:  1.6                 // units per second
     camera: { position: [0.6, 4.2, 10.8], target: [0, 0.5, 0], fov: 32 }
     debug:  false               // true draws the path and logs the island point you click, to pick waypoints for a new forest
*/
(function () {
  var TL3D = window.TL3D = window.TL3D || {};
  var reduce = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  TL3D.reducedMotion = reduce;
  function webglOK() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  TL3D.webglOK = webglOK;
  var T = window.THREE;

  // palette from the design tokens (hex, because WebGL cannot read CSS variables)
  var P = { earth950: '#06080e', earth850: '#0f1420', earth600: '#1e2638', clay400: '#e2774b', clay500: '#c4572f', clay700: '#7a3419', ember300: '#ffd9a0', ember500: '#ffb45e', jade: '#4fdcb6', jadeHi: '#9af3da', moss400: '#8FA66B', moss500: '#6E8552', moss600: '#4F6239', bone50: '#f2ebe0', bone200: '#cdbfab' };
  TL3D.palette = P;

  function makeRenderer(canvas) {
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    var r = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.92;
    r.setClearColor(0x000000, 0);
    return r;
  }
  var loader = null;
  function gltf() {
    if (loader) return loader;
    loader = new T.GLTFLoader();
    if (window.MeshoptDecoder) loader.setMeshoptDecoder(window.MeshoptDecoder);
    return loader;
  }
  function loadGLB(url) {
    if (!/\.txt$/.test(url)) return new Promise(function (res, rej) { gltf().load(url, res, undefined, rej); });
    // a GLB shipped as base64 text (hosts that do not serve .glb)
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.text(); }).then(function (b64) {
      var bin = atob(b64.replace(/\s+/g, '')), buf = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return new Promise(function (res, rej) { gltf().parse(buf.buffer, '', res, rej); });
    });
  }
  TL3D.loadGLB = loadGLB;

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function glowTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  }
  function sprite(tex, color, size, opacity) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: tex, color: color, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: opacity == null ? 1 : opacity }));
    s.scale.set(size, size, 1); return s;
  }
  function wobble(geo, amp, seed) {
    var p = geo.attributes.position, n = geo.attributes.normal, s = seed || 1;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      var w = Math.sin(x * 3.1 + s) * Math.sin(y * 2.6 + s * 1.7) * Math.sin(z * 3.4 + s * 2.3) + 0.5 * Math.sin(x * 7.3 + y * 5.1 + s);
      p.setXYZ(i, x + n.getX(i) * w * amp, y + n.getY(i) * w * amp, z + n.getZ(i) * w * amp);
    }
    p.needsUpdate = true; geo.computeVertexNormals(); return geo;
  }
  function mat(color, o) { o = o || {}; return new T.MeshStandardMaterial({ color: color, roughness: o.rough == null ? 0.85 : o.rough, metalness: 0, flatShading: !!o.flat, emissive: o.emissive || '#000000', emissiveIntensity: o.ei || 1 }); }

  /* ---------- the stand-in island: a floating slab with a trail, a tree, lit mushrooms ---------- */
  function standInIsland(path) {
    var g = new T.Group(), r = rng(9);
    var rock = new T.CylinderGeometry(3.5, 0.5, 2.8, 16, 4), rp = rock.attributes.position;
    for (var i = 0; i < rp.count; i++) { var y = rp.getY(i); if (y < 1.39) { rp.setX(i, rp.getX(i) * (0.86 + r() * 0.28)); rp.setZ(i, rp.getZ(i) * (0.86 + r() * 0.28)); if (y > -1.39) rp.setY(i, y + (r() - 0.5) * 0.3); } }
    rock.computeVertexNormals();
    var rockM = new T.Mesh(rock, mat('#3a2b22', { flat: true })); rockM.position.y = -1.52; rockM.scale.set(1.25, 1, 0.95); rockM.userData.ground = true; g.add(rockM);
    var top = new T.Mesh(new T.CylinderGeometry(3.55, 3.4, 0.22, 48), mat('#3f5a2a', { rough: 0.95 })); top.position.y = -0.11; top.scale.set(1.25, 1, 0.95); top.userData.ground = true; g.add(top);
    var rim = new T.Mesh(new T.TorusGeometry(3.5, 0.16, 8, 64), mat('#466127', { rough: 1 })); rim.rotation.x = Math.PI / 2; rim.scale.set(1.25, 0.95, 1); rim.position.y = -0.02; g.add(rim);
    // trail
    var curve = new T.CatmullRomCurve3(path.map(function (p) { return new T.Vector3(p[0], 0.03, p[2]); }), true, 'catmullrom', 0.6);
    var trail = new T.Mesh(new T.TubeGeometry(curve, 160, 0.32, 8, true), mat('#a8845a', { rough: 1 })); trail.scale.y = 0.12; trail.position.y = 0.02; g.add(trail);
    var pebM = mat('#8d7f6e', { flat: true });
    for (var k = 0; k < 40; k++) { var t = r(), pt = curve.getPointAt(t), pb = new T.Mesh(new T.DodecahedronGeometry(0.03 + r() * 0.03, 0), pebM); pb.position.set(pt.x + (r() - 0.5) * 0.55, 0.03, pt.z + (r() - 0.5) * 0.55); g.add(pb); }
    // tree
    var tree = new T.Group(); tree.position.set(1.15, 0, -0.75); g.add(tree);
    var trunkPts = []; for (var j = 0; j <= 8; j++) { var u = j / 8; trunkPts.push(new T.Vector2(0.42 - u * 0.26 + Math.sin(u * 9) * 0.03, u * 2.4)); }
    var trunk = new T.Mesh(wobble(new T.LatheGeometry(trunkPts, 14), 0.02, 4), mat('#5a3b26', { rough: 0.95 })); tree.add(trunk);
    [[-0.6, 1.5, 0.2, -0.8], [0.55, 1.7, -0.1, 0.75]].forEach(function (b) { var br = new T.Mesh(new T.CylinderGeometry(0.06, 0.12, 1.1, 8), mat('#5a3b26')); br.position.set(b[0] * 0.5, b[1], b[2]); br.rotation.z = b[3]; tree.add(br); });
    var leafM = [mat('#3f6a2c', { rough: 0.9 }), mat('#558a3a', { rough: 0.9 }), mat('#2f5423', { rough: 0.9 })];
    [[0, 2.7, 0, 1.05], [-0.8, 2.3, 0.3, 0.68], [0.78, 2.5, -0.2, 0.72], [0.25, 2.15, 0.7, 0.6], [-0.25, 2.25, -0.7, 0.6], [0.1, 3.2, 0.1, 0.6]].forEach(function (c, i) {
      var leaf = new T.Mesh(wobble(new T.SphereGeometry(c[3], 18, 14), 0.06, i + 2), leafM[i % 3]); leaf.position.set(c[0], c[1], c[2]); leaf.scale.y = 0.8; tree.add(leaf);
    });
    // ferns and tufts
    var tuftM = [mat('#4f7a2f'), mat('#5f8f3a'), mat('#3e6628')];
    for (var q = 0; q < 70; q++) {
      var a = r() * Math.PI * 2, rr = 1.6 + r() * 1.7, x = Math.cos(a) * rr * 1.22, z = Math.sin(a) * rr * 0.9;
      var near = false; for (var pi = 0; pi < 24; pi++) { var cp = curve.getPointAt(pi / 24); if (Math.hypot(cp.x - x, cp.z - z) < 0.55) near = true; }
      if (near) continue;
      var tf = new T.Mesh(new T.ConeGeometry(0.06 + r() * 0.05, 0.22 + r() * 0.3, 5), tuftM[q % 3]); tf.position.set(x, 0.1, z); tf.rotation.set((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5); g.add(tf);
    }
    // bushes and rocks at the edges
    var bushM = mat('#2f5222', { rough: 0.95 }), stoneM = mat('#6a6058', { flat: true });
    [[-3.2, 0.2, 0.9, 0.55], [-2.6, 0.25, -1.6, 0.6], [2.9, 0.2, 1.4, 0.5], [3.3, 0.25, -0.9, 0.6], [-0.4, 0.2, -2.4, 0.55], [2.0, 0.2, -2.1, 0.45]].forEach(function (b, i) { var m = new T.Mesh(wobble(new T.SphereGeometry(b[3], 16, 12), 0.05, i + 7), bushM); m.position.set(b[0], b[1], b[2]); m.scale.y = 0.7; g.add(m); });
    [[-3.6, 0.1, -0.2, 0.42], [2.4, 0.08, 2.2, 0.3], [-1.8, 0.1, 2.3, 0.28], [3.6, 0.1, 0.5, 0.34]].forEach(function (s) { var m = new T.Mesh(new T.DodecahedronGeometry(s[3], 0), stoneM); m.position.set(s[0], s[1], s[2]); m.rotation.set(r(), r(), r()); g.add(m); });
    // foxglove spikes
    var flM = mat('#9a5fd0', { emissive: '#4a2a80', ei: 0.3 }), stemM = mat('#4f7a2f');
    [[-2.9, 0.4], [-2.6, 1.9], [3.1, -1.6], [0.9, 2.6], [-1.4, -2.2]].forEach(function (f) {
      var st = new T.Mesh(new T.CylinderGeometry(0.02, 0.03, 0.9, 6), stemM); st.position.set(f[0], 0.45, f[1]); g.add(st);
      for (var b = 0; b < 6; b++) { var bl = new T.Mesh(new T.SphereGeometry(0.05 - b * 0.004, 8, 6), flM); bl.position.set(f[0] + (b % 2 ? 0.05 : -0.05), 0.35 + b * 0.1, f[1]); g.add(bl); }
    });
    // lit mushrooms with a small ember light each
    var capM = new T.MeshStandardMaterial({ color: '#ffb35a', emissive: '#ff8a2a', emissiveIntensity: 0.9, roughness: 0.5 }), stM = mat('#e8d6b0', { rough: 0.8 });
    var lights = [];
    [[-2.2, -0.2], [2.5, 0.4], [-0.6, 2.2], [1.9, -2.0]].forEach(function (c, i) {
      for (var n = 0; n < 3; n++) {
        var h = 0.16 + r() * 0.2, cx = c[0] + (r() - 0.5) * 0.4, cz = c[1] + (r() - 0.5) * 0.4;
        var stem = new T.Mesh(new T.CylinderGeometry(0.035, 0.05, h, 8), stM); stem.position.set(cx, h / 2, cz); g.add(stem);
        var cap = new T.Mesh(new T.SphereGeometry(0.1 + r() * 0.06, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), capM); cap.position.set(cx, h, cz); cap.scale.y = 0.7; g.add(cap);
      }
      var L = new T.PointLight('#ff9a3c', 1.4, 2.6, 2); L.position.set(c[0], 0.35, c[1]); g.add(L); lights.push(L);
    });
    // vines hanging off the edge
    var vineM = mat('#3f6a2c');
    for (var v = 0; v < 14; v++) { var va = r() * Math.PI * 2, vl = 0.5 + r() * 1.2, vm = new T.Mesh(new T.CylinderGeometry(0.02, 0.012, vl, 5), vineM); vm.position.set(Math.cos(va) * 3.45 * 1.22, -vl / 2 - 0.05, Math.sin(va) * 3.45 * 0.9); vm.rotation.z = (r() - 0.5) * 0.3; g.add(vm); }
    g.userData.lights = lights;
    return g;
  }

  /* ---------- actor: a rigged GLB with Mixamo-style clips ---------- */
  function prepActor(scene, height) {
    var root = scene, box = new T.Box3();
    root.traverse(function (m) {
      if (m.isMesh) { m.frustumCulled = false; if (m.material) { m.material.roughness = Math.min(1, (m.material.roughness || 0.8)); } }
    });
    // true bounds of the posed skin: Box3.setFromObject ignores skinning
    var v = new T.Vector3();
    root.updateMatrixWorld(true);
    root.traverse(function (m) {
      if (!m.isSkinnedMesh) return;
      var pos = m.geometry.attributes.position;
      for (var i = 0; i < pos.count; i += 3) { v.fromBufferAttribute(pos, i); m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); box.expandByPoint(v); }
    });
    if (box.isEmpty()) box.setFromObject(root);
    var size = box.getSize(new T.Vector3()), s = height / size.y;
    var holder = new T.Group();
    root.scale.multiplyScalar(s);
    var c = box.getCenter(new T.Vector3());
    root.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    holder.add(root);
    return holder;
  }

  TL3D.mountHero = function (el, o) {
    o = o || {};
    var canvas = document.createElement('canvas'); canvas.className = 'tl3d-canvas'; canvas.setAttribute('aria-hidden', 'true');
    if (!T || !webglOK()) { el.classList.add('is-static'); return { destroy: function () {}, setPaused: function () {} }; }
    el.appendChild(canvas);
    var R = makeRenderer(canvas); R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    var scene = new T.Scene(); scene.fog = new T.FogExp2(P.earth950, 0.02);
    var camO = o.camera || {}, cam = new T.PerspectiveCamera(camO.fov || 32, 1, 0.1, 100);
    var camPos = new T.Vector3().fromArray(camO.position || [0.6, 4.2, 10.8]), camTarget = new T.Vector3().fromArray(camO.target || [0, 0.5, 0]);
    var world = new T.Group(); scene.add(world);

    scene.add(new T.HemisphereLight('#7f8fb8', P.earth600, 0.42));
    var key = new T.DirectionalLight('#ffd9b0', 1.05); key.position.set(-5, 8, 6); scene.add(key);
    var moon = new T.DirectionalLight('#8fb4ff', 0.35); moon.position.set(6, 9, 2); scene.add(moon);
    var rim = new T.DirectionalLight(P.jade, 1.3); rim.position.set(4, 5, -6); scene.add(rim);
    var under = new T.PointLight(P.clay400, 2.2, 9, 2); under.position.set(0, -2.6, 1.5); world.add(under);
    var glowTex = glowTexture();
    var kiln = sprite(glowTex, P.clay500, 11, 0.5); kiln.position.set(0.4, -1.6, -1); world.add(kiln);

    var defaultPath = [[-2.4, 0, 0.5], [-1.5, 0, 1.75], [0.4, 0, 2.15], [2.1, 0, 1.3], [2.6, 0, -0.5], [1.3, 0, -1.9], [-0.9, 0, -2.0], [-2.5, 0, -1.0]];
    var path = o.path || defaultPath;
    var jumpAt = o.jumpAt || (o.path ? [] : [2]);
    var hopAt = o.hopAt == null ? (o.path ? -1 : 6) : o.hopAt;
    var island = null, actor = null, mixer = null, clips = {}, cur = null, state = 'run', t0 = performance.now(), last = t0;
    var closed = o.loop !== false && !o.path;
    if (o.path && o.loop) closed = true;
    var curve = new T.CatmullRomCurve3(path.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }), closed, 'catmullrom', 0.6);
    var length = curve.getLength(), u = 0.02, dir = 1, speed = o.speed || 1.6, hopTimer = 0, jumpTimer = 0, didHop = {}, didJump = {};
    var ray = new T.Raycaster(), down = new T.Vector3(0, -1, 0), tmp = new T.Vector3(), tmp2 = new T.Vector3(), groundMeshes = [];
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 }, running = true, visible = true, raf = 0, still = reduce() || o.still;

    function setIsland(obj) {
      if (island) world.remove(island);
      island = obj; world.add(island);
      groundMeshes = []; island.traverse(function (m) { if (m.isMesh) groundMeshes.push(m); });
      if (actor) actor.visible = true;
      if (o.debug) {
        var line = new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(200)), new T.LineBasicMaterial({ color: P.ember300 }));
        world.add(line);
        path.forEach(function (p, i) { var d = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), new T.MeshBasicMaterial({ color: i === hopAt ? '#ff5a5a' : jumpAt.indexOf(i) >= 0 ? '#5ad1ff' : P.ember300 })); d.position.fromArray(p); world.add(d); });
      }
    }
    if (o.island && o.island.url) {
      loadGLB(o.island.url).then(function (g) {
        var s = g.scene, io = o.island;
        if (io.scale) s.scale.setScalar(io.scale);
        if (io.position) s.position.fromArray(io.position);
        if (io.rotation) s.rotation.fromArray(io.rotation);
        s.traverse(function (m) { if (m.isMesh && m.material && m.material.map) m.material.map.anisotropy = 4; });
        setIsland(s); el.classList.add('has-island');
      }).catch(function (e) { console.warn('TL3D: island failed, using stand-in', e); setIsland(standInIsland(path)); });
    } else setIsland(standInIsland(path));

    var ao = o.actor || {}, clipNames = Object.assign({ run: 'Running', walk: 'Walking', jump: 'Jump_Run', hop: 'Regular_Jump' }, ao.clips || {});
    if (ao.url) {
      loadGLB(ao.url).then(function (g) {
        mixer = new T.AnimationMixer(g.scene);
        g.animations.forEach(function (c) { clips[c.name] = mixer.clipAction(c); });
        var runA = clips[clipNames.run]; if (runA) { runA.play(); mixer.update(0.05); }
        actor = prepActor(g.scene, ao.height || 0.95);
        actor.visible = !(o.island && o.island.url) || !!island;
        world.add(actor); cur = runA; el.classList.add('has-actor'); window.__tlActor = actor;
        el.dispatchEvent(new CustomEvent('tl3d:ready', { bubbles: true }));
      }).catch(function (e) { console.warn('TL3D: actor failed', e); });
    }
    function play(name, opts) {
      var a = clips[clipNames[name]]; if (!a || a === cur) return a;
      opts = opts || {};
      a.reset(); a.setLoop(opts.once ? T.LoopOnce : T.LoopRepeat, Infinity); a.clampWhenFinished = !!opts.once; a.timeScale = opts.timeScale || 1;
      if (cur) { a.play(); cur.crossFadeTo(a, opts.fade == null ? 0.18 : opts.fade, false); } else a.play();
      cur = a; return a;
    }
    var lastY = null;
    function snap(p) {
      // feet to the ground: every hit along a tall ray, keep the one nearest the route's own height (leaves and ferns above it are ignored)
      tmp.set(p.x, p.y + 2.5, p.z); ray.set(tmp, down); ray.far = 6;
      var hits = ray.intersectObjects(groundMeshes, false), best = null, bd = 0.45;
      for (var i = 0; i < hits.length; i++) { var d = Math.abs(hits[i].point.y - p.y); if (d < bd) { bd = d; best = hits[i].point.y; } }
      if (best == null) best = lastY == null ? p.y : lastY;
      lastY = lastY == null ? best : lastY + (best - lastY) * 0.25;
      return lastY;
    }
    // fireflies
    var flies = [];
    for (var f = 0; f < 16; f++) { var s = sprite(glowTex, f % 3 ? P.ember300 : P.jadeHi, 0.12 + Math.random() * 0.14, 0.9); s.userData = { r: 1.5 + Math.random() * 2.4, sp: 0.15 + Math.random() * 0.25, ph: Math.random() * 6.28, y: 0.4 + Math.random() * 2.2 }; world.add(s); flies.push(s); }
    // rising sparks (the hero's ember sparks)
    var SN = 160, sg = new T.BufferGeometry(), seeds = new Float32Array(SN * 4);
    for (var e = 0; e < SN; e++) { seeds[e * 4] = (Math.random() - 0.5) * 9; seeds[e * 4 + 1] = Math.random(); seeds[e * 4 + 2] = (Math.random() - 0.5) * 5; seeds[e * 4 + 3] = Math.random(); }
    sg.setAttribute('position', new T.BufferAttribute(new Float32Array(SN * 3), 3)); sg.setAttribute('seed', new T.BufferAttribute(seeds, 4));
    var smat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPix: { value: R.getPixelRatio() }, uColor: { value: new T.Color(P.ember500) } },
      vertexShader: 'attribute vec4 seed; uniform float uTime; uniform float uPix; varying float vA; void main(){ float life = fract(seed.y + uTime * (0.03 + seed.w * 0.05)); vec3 p = vec3(seed.x + sin(uTime*0.5 + seed.w*20.0)*0.3, -3.0 + life * 7.0, seed.z); vA = smoothstep(0.0,0.12,life)*(1.0-smoothstep(0.6,1.0,life))*(0.4+seed.w*0.6); vec4 mv = modelViewMatrix * vec4(p,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = (2.0 + seed.w*4.0) * uPix * (9.0 / -mv.z); }',
      fragmentShader: 'uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d); gl_FragColor = vec4(uColor*(1.0+a), a*vA); }' });
    var sparks = new T.Points(sg, smat); sparks.frustumCulled = false; world.add(sparks);

    var layout = {};
    function resize() {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      R.setSize(w, h, false); cam.aspect = w / h;
      var wide = cam.aspect > 1.2;
      // desktop: island sits in the right 55%; phone: centred, camera pulled back
      layout.shift = wide ? Math.min(3.6, w / 400) : 0;
      layout.dist = wide ? 1 : Math.max(1.25, 0.72 / cam.aspect);
      layout.lift = wide ? 0 : 3.5;
      cam.updateProjectionMatrix();
    }
    var ro = new ResizeObserver(resize); ro.observe(el); resize();
    function onMove(ev) { var r = el.getBoundingClientRect(); pointer.tx = ((ev.clientX - r.left) / r.width - 0.5) * 2; pointer.ty = ((ev.clientY - r.top) / r.height - 0.5) * 2; }
    el.addEventListener('pointermove', onMove);
    var ndc = new T.Vector2(), pick = new T.Raycaster();
    function onClick(ev) {
      var r = el.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      pick.setFromCamera(ndc, cam);
      if (actor && state === 'run' && pick.intersectObject(actor, true).length) { state = 'hop'; hopTimer = 2.0; play('hop', { once: true, fade: 0.2 }); el.dispatchEvent(new CustomEvent('tl3d:actor', { bubbles: true })); return; }
      if (!o.debug || !island) return;
      var hit = pick.intersectObjects(groundMeshes, false)[0];
      if (hit) { var lp = world.worldToLocal(hit.point.clone()); console.log('TL3D waypoint: [' + lp.x.toFixed(2) + ', ' + lp.y.toFixed(2) + ', ' + lp.z.toFixed(2) + ']'); }
    }
    el.addEventListener('click', onClick);
    var io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && running && !raf && !still) loop(); }, { threshold: 0.01 });
    io.observe(el);

    var facing = 0;
    function frame(now) {
      var t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
      pointer.x += (pointer.tx - pointer.x) * 0.05; pointer.y += (pointer.ty - pointer.y) * 0.05;
      world.position.set(layout.shift, 0, 0);
      world.rotation.y = Math.sin(t * 0.08) * 0.04;
      cam.position.set(camPos.x + pointer.x * 0.9, camPos.y - pointer.y * 0.5, camPos.z * layout.dist);
      cam.lookAt(camTarget.x + layout.shift * 0.55, camTarget.y - layout.lift, camTarget.z);
      // island breathes
      if (island) { island.position.y = Math.sin(t * 0.6) * 0.06; island.rotation.z = Math.sin(t * 0.35) * 0.008; if (island.userData.lights) island.userData.lights.forEach(function (L, i) { L.intensity = 1.2 + Math.sin(t * 3 + i * 1.7) * 0.25 + Math.sin(t * 7.1 + i) * 0.12; }); }
      // actor along the path
      if (actor && mixer) {
        if (!still) {
          if (state === 'run' || state === 'jump') {
            if (closed) u = (u + dt * speed / length) % 1;
            else { u += dir * dt * speed / length; if (u >= 0.985) { u = 0.985; dir = -1; state = 'turn'; hopTimer = 1.6; play('hop', { once: true, fade: 0.2 }); } else if (u <= 0.015) { u = 0.015; dir = 1; state = 'turn'; hopTimer = 1.6; play('hop', { once: true, fade: 0.2 }); } }
            if (state === 'jump') { jumpTimer -= dt; if (jumpTimer <= 0) { state = 'run'; play('run'); } }
          }
          if (state === 'turn') { hopTimer -= dt; if (hopTimer <= 0) { state = 'run'; play('run'); } }
          var idx = Math.floor(u * path.length + 0.5) % path.length, frac = (u * path.length) % 1;
          var key = idx + ':' + Math.floor(t / 30);
          if (state === 'run' && jumpAt.indexOf(idx) >= 0 && frac < 0.5 && !didJump[key + ':' + dir]) { didJump[key + ':' + dir] = 1; state = 'jump'; jumpTimer = 1.5; play('jump', { fade: 0.12, timeScale: 1.35 }); }
          if (state === 'run' && idx === hopAt && frac > 0.45 && frac < 0.55 && !didHop[key]) { didHop[key] = 1; state = 'hop'; hopTimer = 2.0; play('hop', { once: true, fade: 0.2 }); }
          if (state === 'hop') { hopTimer -= dt; facing += ((Math.atan2(cam.position.x - actor.position.x - layout.shift, cam.position.z - actor.position.z)) - facing) * 0.12; if (hopTimer <= 0) { state = 'run'; play('run'); } }
        }
        var pos = curve.getPointAt(u), ahead = curve.getPointAt(closed ? (u + 0.01) % 1 : Math.max(0, Math.min(1, u + 0.01 * dir)));
        if (island) { var yy = snap(pos); pos.y = yy; }
        actor.position.copy(pos);
        if (state !== 'hop') { var want = state === 'turn' ? Math.atan2(cam.position.x - actor.position.x - layout.shift, cam.position.z - actor.position.z) : Math.atan2(ahead.x - pos.x, ahead.z - pos.z); var d = want - facing; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; facing += d * 0.18; }
        actor.rotation.y = facing; if (o.debug || window.__tlActor) window.__tlState = state + ' u=' + u.toFixed(3) + ' dir=' + dir + ' hop=' + hopTimer.toFixed(2);
        actor.position.y += island ? island.position.y : 0;
        mixer.update(still ? 0 : dt);
      }
      flies.forEach(function (fl) { var d = fl.userData, a = d.ph + t * d.sp; fl.position.set(Math.cos(a) * d.r * 1.2, d.y + Math.sin(t * 1.3 + d.ph) * 0.25, Math.sin(a) * d.r); fl.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.7 + d.ph)); });
      smat.uniforms.uTime.value = t; kiln.material.opacity = 0.42 + Math.sin(t * 0.8) * 0.06;
      R.render(scene, cam);
    }
    function loop() { raf = 0; if (!running || !visible) return; frame(performance.now()); raf = requestAnimationFrame(loop); }
    if (still) { var stillTimer = setInterval(function () { if (actor || !ao.url) { frame(performance.now()); } if (actor) { clearInterval(stillTimer); if (clips[clipNames.walk]) { play('walk'); mixer.update(0.4); frame(performance.now()); } } }, 200); }
    else loop();
    document.addEventListener('visibilitychange', function () { if (!document.hidden && running && !raf && !still) loop(); });
    el.classList.add('is-live');
    return {
      destroy: function () { running = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener('pointermove', onMove); el.removeEventListener('click', onClick); R.dispose(); canvas.remove(); },
      setPaused: function (p) { running = !p; if (!p && !raf && !still) loop(); },
      renderStill: function (sec) { t0 = performance.now() - (sec || 4) * 1000; frame(performance.now()); },
      api: { play: play, setIsland: setIsland, scene: scene, world: world, camera: cam }
    };
  };

  /* ---------- product stage: one model, drag to turn, view presets ---------- */
  TL3D.mountStage = function (el, o) {
    o = o || {};
    if (!T || !webglOK()) { el.classList.add('is-static'); return { destroy: function () {}, setView: function () {}, turn: function () {}, zoom: function () {} }; }
    var canvas = document.createElement('canvas'); canvas.className = 'tl3d-canvas'; canvas.tabIndex = 0; canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', (o.name || 'Figurine') + ' in 3D. Drag, or use the arrow keys, to turn it.');
    el.appendChild(canvas);
    var R = makeRenderer(canvas); R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 1, 0.05, 50);
    scene.add(new T.HemisphereLight(P.ember300, P.earth600, 0.6));
    var key = new T.DirectionalLight('#ffe2bf', 1.5); key.position.set(-3, 5, 5); scene.add(key);
    var rim = new T.DirectionalLight(P.ember500, 1.2); rim.position.set(3, 3, -5); scene.add(rim);
    var fill = new T.DirectionalLight(P.clay400, 0.5); fill.position.set(4, -1, 3); scene.add(fill);
    var pivot = new T.Group(); scene.add(pivot);
    var glowTex = glowTexture(), halo = sprite(glowTex, P.clay500, 4.2, 0.45); halo.position.set(0, 0.2, -1.5); if (!o.bare) scene.add(halo);
    var ped = new T.Mesh(new T.CylinderGeometry(0.95, 1.05, 0.16, 64), mat(P.earth600, { rough: 0.9 })); ped.position.y = -0.08; if (!o.bare) scene.add(ped);
    var ring = new T.Mesh(new T.TorusGeometry(1.0, 0.012, 8, 96), new T.MeshBasicMaterial({ color: P.ember500, transparent: true, opacity: 0.8 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.003; if (!o.bare) scene.add(ring);
    var runes = []; for (var i = 0; i < 12; i++) { var d = new T.Mesh(new T.PlaneGeometry(0.06, 0.06), new T.MeshBasicMaterial({ color: i % 3 ? P.ember500 : P.ember300, transparent: true, opacity: 0.9 })); d.rotation.x = -Math.PI / 2; d.rotation.z = Math.PI / 4; d.position.set(Math.cos(i / 12 * 6.283) * 1.12, 0.004, Math.sin(i / 12 * 6.283) * 1.12); if (!o.bare) scene.add(d); runes.push(d); }
    var model = null, h = o.height || 1.5, rotY = -0.5, rotX = 0.08, vY = 0, zoom = 1, tz = 1, idle = 0, drag = null, mixer = null, views = { turntable: { rotX: 0.08, zoom: 1, spin: true }, front: { rotY: 0, rotX: 0.05, zoom: 1.05, spin: false }, detail: { rotY: -0.4, rotX: 0.25, zoom: 1.7, spin: false }, scale: { rotY: -0.6, rotX: 0.05, zoom: 0.8, spin: false } }, view = 'turntable';
    if (o.url) loadGLB(o.url).then(function (g) {
      var s = g.scene; var box = new T.Box3().setFromObject(s), size = box.getSize(new T.Vector3()), sc = h / size.y;
      s.scale.setScalar(sc); box.setFromObject(s); var c = box.getCenter(new T.Vector3()); s.position.set(-c.x, -box.min.y, -c.z);
      s.traverse(function (m) { if (m.isMesh && m.material && m.material.map) m.material.map.anisotropy = 8; });
      if (g.animations.length && o.clip) { mixer = new T.AnimationMixer(s); var cl = g.animations.find(function (a) { return a.name === o.clip; }); if (cl) mixer.clipAction(cl).play(); }
      model = s; pivot.add(model); el.classList.add('has-model');
    }).catch(function (e) { console.warn('TL3D: stage model failed', e); el.classList.add('is-static'); });
    function resize() { var w = el.clientWidth || 1, hh = el.clientHeight || 1; R.setSize(w, hh, false); cam.aspect = w / hh; cam.userData.d = (h * 1.45) / (2 * Math.tan(14 * Math.PI / 180)) * Math.max(1, 1.1 / cam.aspect); cam.updateProjectionMatrix(); }
    var ro = new ResizeObserver(resize); ro.observe(el); resize();
    canvas.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); el.classList.add('is-dragging'); });
    canvas.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; vY = dx * 0.008; rotY += vY; rotX = Math.max(-0.3, Math.min(0.6, rotX + dy * 0.005)); idle = 0; });
    var end = function () { drag = null; el.classList.remove('is-dragging'); }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('keydown', function (e) { var k = e.key; if (k === 'ArrowLeft') { rotY -= 0.25; idle = 0; } else if (k === 'ArrowRight') { rotY += 0.25; idle = 0; } else if (k === 'ArrowUp') rotX = Math.max(-0.3, rotX - 0.1); else if (k === 'ArrowDown') rotX = Math.min(0.6, rotX + 0.1); else if (k === '+' || k === '=') tz = Math.min(2, tz + 0.2); else if (k === '-') tz = Math.max(0.7, tz - 0.2); else return; e.preventDefault(); });
    var still = reduce() || o.still, raf = 0, visible = true, last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now; idle += dt;
      if (!drag) { vY *= 0.92; rotY += vY; if (views[view].spin && idle > 2 && !still) rotY += dt * 0.35; }
      zoom += (tz - zoom) * 0.1;
      pivot.rotation.set(rotX, rotY, 0);
      var d = cam.userData.d / zoom; cam.position.set(0, h * 0.42 + rotX * 0.4, d); cam.lookAt(0, h * 0.42, 0);
      ring.material.opacity = 0.55 + 0.25 * Math.sin(now / 700);
      runes.forEach(function (r, i) { r.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(now / 900 + i)); });
      if (mixer) mixer.update(still ? 0 : dt);
      R.render(scene, cam);
    }
    function loop() { raf = 0; if (!visible) return; frame(performance.now()); raf = requestAnimationFrame(loop); }
    var io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) loop(); }); io.observe(el);
    loop(); el.classList.add('is-live');
    return {
      setView: function (name) { var v = views[name] || views.turntable; view = name in views ? name : 'turntable'; if (v.rotY != null) rotY = v.rotY; rotX = v.rotX; tz = v.zoom; vY = 0; idle = v.spin ? 3 : 0; },
      turn: function (a) { rotY += a; idle = 0; }, zoom: function (z) { tz = Math.max(0.7, Math.min(2, tz + z)); },
      destroy: function () { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); R.dispose(); canvas.remove(); }
    };
  };
})();
