/* Terra & Lore — page script: renders the home and item views, wires the 3D hero and the product stage. */
(function () {
  var NS = window.TerraLoreRealm, $ = function (s, r) { return (r || document).querySelector(s); };
  NS.assets = {};
  NS.items.forEach(function (it) { NS.assets[it.poster] = 'img/' + it.poster + '.webp'; (it.views || []).forEach(function (v) { NS.assets[v] = 'img/' + v + '.webp'; }); });
  ['scarf-cat-front', 'scarf-cat-side', 'scarf-cat-back', 'hearth-cat-front', 'hearth-cat-side', 'hearth-cat-back', 'kiln-keeper'].forEach(function (v) { NS.assets[v] = 'img/' + v + '.webp'; });
  ['logo-wordmark-reverse', 'logo-stacked-reverse', 'logo-mark-ink', 'logo-seal-terra'].forEach(function (l) { NS.assets[l] = 'img/' + l + '.svg'; });
  NS.item('scarf-cat').views = ['scarf-cat-front', 'scarf-cat-side', 'scarf-cat-back'];
  NS.item('hearth-cat').views = ['hearth-cat-front', 'hearth-cat-side', 'hearth-cat-back'];
  var esc = NS.esc, icon = NS.icon, key = NS.key;
  var HERO = window.TL_HERO || {};

  var app = $('#app');
  var hero = null, stage = null, timer = null;
  var DROP_AT = Date.now() + (2 * 24 + 14) * 3600 * 1000 + 9 * 60000;

  function shell(inner, current) {
    return '<a class="tl-sr" href="#main">Skip to content</a>' +
      '<div class="tl-rail" aria-hidden="true"><div class="tl-rail__fill"></div></div>' +
      '<header class="tl-header"><a class="tl-header__brand" href="#home"><img src="' + NS.asset('logo-wordmark-reverse') + '" alt="Terra &amp; Lore, home"></a>' +
      '<nav class="tl-nav" aria-label="Main">' + NS.nav.slice(0, 5).map(function (d) { return '<a class="tl-nav__link' + (d.key === current ? ' is-active' : '') + '" href="#' + d.key + '" data-dest="' + d.key + '">' + esc(d.label) + '</a>'; }).join('') + '</nav>' +
      '<div class="tl-header__actions"><button class="tl-lang" type="button" aria-label="Language: English">EN</button><a class="tl-btn tl-btn--secondary tl-btn--sm" href="#guild">Sign in</a><button class="tl-btn tl-btn--icon" type="button" data-open-bag aria-label="Open your bag">' + icon('bag') + '<span class="tl-btn__count" data-bag-count hidden>0</span></button><button class="tl-btn tl-btn--icon" type="button" data-menu-open aria-label="Open the menu">' + icon('menu') + '</button></div></header>' +
      '<main id="main" class="tl-has-hotbar">' + inner + '</main>' + NS.footerHTML() + NS.runeMenuHTML(current) + NS.hotbarHTML(current) +
      '<div class="tl-drawer__scrim" data-close-bag></div><aside class="tl-drawer" aria-label="Your bag" aria-hidden="true"><div class="tl-drawer__head"><h2 class="tl-drawer__title">Your bag <small data-bag-title-count>0 pieces</small></h2><button class="tl-btn tl-btn--icon" type="button" data-close-bag aria-label="Close the bag">' + icon('close') + '</button></div><div class="tl-drawer__list" data-bag-list></div><div class="tl-drawer__foot"><div class="tl-drawer__sum"><span>Subtotal</span><strong data-bag-sum>0 GEL</strong></div><p class="tl-drawer__note">' + icon('lore') + ' Every piece ships with its numbered lore card.</p><button class="tl-btn tl-btn--primary tl-btn--lg tl-btn--block" type="button">Checkout ' + key('↵') + '</button><a class="tl-btn tl-btn--secondary tl-btn--block" href="https://instagram.com/terra_and_lore" target="_blank" rel="noopener">' + icon('instagram') + ' Order by message</a></div></aside>';
  }

  function homeHTML() {
    var featured = NS.items.filter(function (i) { return i.drop === '002'; });
    return '<section class="tl-sky tl-hero-wrap"><div class="tl-hero" id="hero">' +
      '<div class="tl-hero__scene" id="hero-scene"><img class="tl-hero__poster" src="img/hero-poster.webp" alt="" width="1600" height="900"></div><div class="tl-hero__shade"></div><span class="tl-hero__marker" aria-hidden="true"></span>' +
      '<div class="tl-hero__top"><img src="' + NS.asset('logo-wordmark-reverse') + '" alt="Terra &amp; Lore"><span class="tl-hero__hint" id="hero-hint">' + icon('sparkle') + ' Click the cat</span></div>' +
      '<div class="tl-hero__body"><div class="tl-hero__copy"><span class="tl-eyebrow">Drop 002 · Lore from earth</span><h1 class="tl-hero__title">Your own <em>legend</em>, rolled in clay</h1><div class="tl-hero__cta"><a class="tl-btn tl-btn--primary tl-btn--lg" href="#shop">Enter the shop ' + key('↵') + '</a><p class="tl-hero__lead">Handmade clay figures and charms from Tbilisi. Each one is numbered and leaves the kiln with its own story card.</p></div><div id="hero-dialog"></div></div><div></div></div>' +
      '<div class="tl-hero__foot">' + NS.scrollBadge() + '<div class="tl-timer" aria-label="Next drop countdown"><span class="tl-eyebrow">Next drop · 003 · Winter lore</span><div class="tl-timer__digits" id="drop-timer">' + ['d', 'h', 'm', 's'].map(function (u, i) { return (i ? '<span class="tl-timer__sep">:</span>' : '') + '<span class="tl-timer__unit"><span data-unit="' + u + '">00</span><small>' + { d: 'days', h: 'hrs', m: 'min', s: 'sec' }[u] + '</small></span>'; }).join('') + '</div></div></div>' +
      '</div></section>' +
      '<section class="tl-section tl-wrap" id="shop"><div class="tl-head tl-head--row"><div class="tl-head"><span class="tl-eyebrow tl-eyebrow--rune"><span class="tl-rune" aria-hidden="true">ႫႠႶႠႦႨႠ</span> The ledger</span><h2 class="tl-head__title">The shop</h2><p class="tl-head__lore">Every figure out of the kiln right now. Hover for its stats, click for its story.</p></div><a class="tl-head__action" href="#drops">All drops ' + icon('arrow') + '</a></div>' +
      '<div class="tl-filters" id="filters" style="margin-top:var(--space-6)"><button class="tl-chip" type="button" data-filter="all" aria-pressed="true">All pieces</button>' + ['common', 'rare', 'epic', 'legendary'].map(function (r) { return '<button class="tl-chip tl-chip--' + r + '" type="button" data-filter="' + r + '" aria-pressed="false"><span class="tl-chip__dot"></span>' + NS.rarityLabel[r] + '</button>'; }).join('') + '<span class="tl-filters__count" id="count">' + NS.items.length + ' pieces</span><div class="tl-select-wrap"><label class="tl-sr" for="sort">Sort</label><select class="tl-select" id="sort"><option value="drop">Newest drop</option><option value="asc">Price, low to high</option><option value="desc">Price, high to low</option><option value="rarity">Rarity</option></select>' + icon('chevron') + '</div></div>' +
      '<div class="tl-grid" id="grid" style="margin-top:var(--space-6)"></div></section>' +
      '<section class="tl-section tl-night" id="drops"><div class="tl-wrap tl-drops"><div class="tl-head"><span class="tl-eyebrow">Chapter II · Drops</span><h2 class="tl-head__title">Made from this week</h2><p class="tl-head__lore">Whatever the internet is obsessed with, we roll in clay. Thirty of each. There is no thirty-first.</p></div><div class="tl-drops__grid">' +
      [['001', 'First lore', 'Mushrooms, stars, a snake made of churchkhela and a cat that will not move. Sold through in nine days.', 'pocket-mushroom', 'closed'], ['002', 'The cats', 'Two cats from the same lump: the one that runs and the one that stays by the oven.', 'scarf-cat', 'open'], ['003', 'Winter lore', 'Lanterns, foxes, the thing under the snow. Opens when the timer says so.', 'your-own-legend', 'soon']].map(function (d) { return '<article class="tl-drop tl-drop--' + d[4] + '"><img src="' + NS.asset(d[3]) + '" alt="" loading="lazy"><div class="tl-drop__body"><span class="tl-card__meta"><span>Drop ' + d[0] + '</span><span>' + { closed: 'Sold out', open: 'Open now', soon: 'Next' }[d[4]] + '</span></span><h3>' + d[1] + '</h3><p>' + d[2] + '</p></div></article>'; }).join('') + '</div></div></section>' +
      '<section class="tl-section tl-wrap tl-lore" id="lore"><div class="tl-lore__text"><span class="tl-eyebrow">Chapter III · The lore</span><h2 class="tl-head__title" style="font-size:clamp(48px,7vw,96px)">Every piece ships with its page</h2><p class="tl-head__lore">Before a figure is rolled, its story is written. The card goes in the box, stamped with its number and the day it left the kiln.</p><a class="tl-btn tl-btn--secondary" href="#item-pocket-mushroom">Read a card ' + icon('arrow') + '</a></div><div class="tl-lore__card"><div class="tl-lore__face"><span class="tl-card__meta"><span>No. 07 / 30 · Drop 001</span><span>Rare</span></span><h3>Pocket Mushroom</h3><p>Lives in tote bags, eats crumbs, brings luck to anyone who forgets their keys.</p><img src="' + NS.asset('logo-seal-terra') + '" alt="Terra &amp; Lore seal"></div></div></section>' +
      '<section class="tl-section tl-night" id="custom"><div class="tl-wrap tl-custom"><div class="tl-custom__fig"><img src="' + NS.asset('your-own-legend') + '" alt="A raw lump of clay with a coil around it, waiting for a story"></div><div class="tl-head"><span class="tl-eyebrow">Chapter IV · Custom</span><h2 class="tl-head__title" style="font-size:clamp(48px,7vw,96px)">Your own legend</h2><p class="tl-head__lore">Send a photo, a pet, a sketch or a sentence. We roll it, write its card and number it 1 of 1.</p><div class="tl-custom__steps">' + [['1', 'Send a raven', 'A photo or a few words, by Instagram or email.'], ['2', 'We roll it', 'Five to twelve centimetres, two to three weeks.'], ['3', 'It gets a card', 'Name, number, story. Then it travels to you.']].map(function (s) { return '<div class="tl-step"><span class="tl-key tl-key--lg is-lit">' + s[0] + '</span><div><strong>' + s[1] + '</strong><span>' + s[2] + '</span></div></div>'; }).join('') + '</div><div class="tl-hero__cta"><a class="tl-btn tl-btn--primary tl-btn--lg" href="#item-your-own-legend">Start a commission</a><span class="tl-field__hint">From 120 GEL. Pets are the most requested.</span></div></div></div></section>' +
      '<section class="tl-section tl-wrap tl-guild" id="guild"><div class="tl-head"><span class="tl-eyebrow">Chapter V · The guild</span><h2 class="tl-head__title" style="font-size:clamp(48px,7vw,96px)">Two makers, one kiln</h2></div><div class="tl-guild__grid"><div class="tl-guild__who"><h3 class="tl-card__name tl-rarity--legendary">Tima</h3><p>Rolls the figures. Argues that every cat needs a scarf.</p></div><div class="tl-guild__who"><h3 class="tl-card__name tl-rarity--rare">Lika</h3><p>Writes the lore and paints the faces. Keeps the ledger of numbers.</p></div><div class="tl-guild__who"><h3 class="tl-card__name tl-rarity--epic">The kiln</h3><p>A Tbilisi flat, a window to the hills, a shelf of things that are drying.</p></div></div><div class="tl-guild__stats">' + [['240', 'figures numbered'], ['2', 'drops sold through'], ['9', 'countries reached'], ['1', 'kiln']].map(function (s) { return '<div class="tl-timer__unit"><span class="tl-timer__digits" style="font-size:40px">' + s[0] + '</span><small>' + s[1] + '</small></div>'; }).join('') + '</div></section>';
  }

  function itemHTML(it) {
    var related = NS.items.filter(function (x) { return x.id !== it.id; }).sort(function (a, b) { return (a.rarity === it.rarity ? -1 : 0) - (b.rarity === it.rarity ? -1 : 0); }).slice(0, 4);
    var views = it.views || [it.poster];
    var sizes = it.id === 'your-own-legend' ? [['Charm', '5 cm · 120 GEL'], ['Desk', '9 cm · 180 GEL'], ['Shelf', '12 cm · 260 GEL']] : [['Charm', it.height + ' · ' + NS.price(it.price)], ['Desk', '9 cm · ' + NS.price(it.price + 40)]];
    return '<div class="tl-wrap tl-section" style="padding-top:var(--space-5)"><nav class="tl-crumbs" aria-label="Breadcrumb"><a href="#shop">' + icon('arrow-left') + ' Shop</a><span>/</span><span>Drop ' + esc(it.drop) + '</span><span>/</span><b>' + esc(it.name) + '</b></nav>' +
      '<div class="tl-product" style="margin-top:var(--space-6)"><div class="tl-product__stage"><div class="tl-inspect tl-inspect--' + it.rarity + '"><div class="tl-inspect__scene" id="stage"></div><div class="tl-inspect__poster"><img src="' + NS.asset(it.poster) + '" alt="' + esc(it.name) + '" id="stage-poster"></div><div class="tl-inspect__tags">' + NS.tag(it.rarity) + (it.tag ? NS.tag(it.tag) : '<span></span>') + '</div><div class="tl-inspect__controls"><span class="tl-inspect__hint">' + (it.model ? icon('drag') + ' Drag to turn · ' + key('+') + key('−') + ' zoom' : icon('sparkle') + ' Photos until the 3D scan is ready') + '</span><div class="tl-inspect__btns"><button class="tl-btn tl-btn--icon" type="button" data-stage="zoom-in" aria-label="Zoom in">' + icon('zoom-in') + '</button><button class="tl-btn tl-btn--icon" type="button" data-stage="zoom-out" aria-label="Zoom out">' + icon('zoom-out') + '</button><button class="tl-btn tl-btn--icon" type="button" data-stage="reset" aria-label="Reset the view">' + icon('reset') + '</button></div></div></div>' +
      '<div class="tl-views">' + ['turntable', 'front', 'side', 'back'].map(function (v, i) { return '<button class="tl-view" type="button" data-view="' + v + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '"><img src="' + NS.asset(views[Math.min(i === 0 ? 0 : i - 1, views.length - 1)]) + '" alt="">' + (i === 0 ? 'Turn' : v) + '</button>'; }).join('') + '</div></div>' +
      '<div class="tl-buy"><div class="tl-buy__eyebrow">' + NS.tag(it.rarity) + '<span class="tl-eyebrow">Drop ' + esc(it.drop) + ' · ' + esc(it.type) + '</span></div><h1 class="tl-buy__name">' + esc(it.name) + '</h1><p class="tl-buy__lore">' + esc(it.lore) + '</p><p class="tl-footer__ka">' + esc(it.ka) + '</p><div class="tl-buy__price"><strong>' + NS.price(it.price) + '</strong><span>incl. lore card · ships in 2 to 4 days</span></div>' + NS.editionBar(it) +
      '<div class="tl-buy__group"><span class="tl-field__label">Size</span><div class="tl-options" role="radiogroup">' + sizes.map(function (s, i) { return '<button class="tl-option" type="button" role="radio" aria-checked="' + (i === 0 ? 'true' : 'false') + '" data-option>' + '<strong>' + s[0] + '</strong><span>' + s[1] + '</span></button>'; }).join('') + '</div></div>' +
      '<div class="tl-buy__group"><label class="tl-check"><input type="checkbox" id="gift"><span class="tl-check__box">' + icon('check') + '</span>Gift box with a wax seal · +8 GEL</label></div>' +
      '<div class="tl-buy__actions">' + NS.stepper(1) + '<button class="tl-btn tl-btn--primary tl-btn--lg" type="button" data-add="' + it.id + '"' + (it.tag === 'sold' ? ' disabled' : '') + '>' + (it.tag === 'sold' ? 'Sold out' : 'Add to bag ' + key('F')) + '</button><button class="tl-btn tl-btn--icon tl-btn--lg" type="button" aria-label="Save for later">' + icon('heart') + '</button></div>' +
      '<div class="tl-buy__rows">' + [['truck', 'Tbilisi courier', '1 to 2 days · 7 GEL'], ['globe', 'Worldwide', '7 to 14 days · from 25 GEL'], ['gift', 'Lore card', 'Numbered, in every box']].map(function (r) { return '<div class="tl-stat"><span>' + icon(r[0]) + r[1] + '</span><strong>' + r[2] + '</strong></div>'; }).join('') + '</div>' +
      '<div><div class="tl-tabs" role="tablist"><button class="tl-tab" role="tab" aria-selected="true" data-tab="sheet">Item sheet</button><button class="tl-tab" role="tab" aria-selected="false" data-tab="lore">Lore</button><button class="tl-tab" role="tab" aria-selected="false" data-tab="care">Care</button></div>' +
      '<div class="tl-tabpanel" data-panel="sheet"><div class="tl-sheet">' + [['Height', it.height], ['Material', it.material], ['Finish', it.finish], ['Edition', NS.edition(it)], ['Drop', it.drop], ['Made in', 'Tbilisi']].map(function (c) { return '<div class="tl-sheet__cell"><span class="tl-sheet__k">' + c[0] + '</span><span class="tl-sheet__v">' + esc(c[1]) + '</span></div>'; }).join('') + '</div></div>' +
      '<div class="tl-tabpanel" data-panel="lore" hidden><p class="tl-buy__lore" style="font-size:18px">' + esc(it.lore) + ' Its card carries the same words, its number and the date it left the kiln. If it ever gets lost, the number is how we know it is yours.</p></div>' +
      '<div class="tl-tabpanel" data-panel="care" hidden><p class="tl-field__hint" style="font-size:15px;color:var(--bone-muted)">Dust with a soft brush. Keep out of water and direct sun. Clay is strong but it is not a toy; a fall onto tile can chip a paw. If that happens, send a raven: we repair our own.</p></div></div>' +
      '</div></div>' +
      '<div class="tl-divider" style="margin-top:var(--space-9)"><span class="tl-eyebrow">Same kiln</span></div><div class="tl-grid" style="margin-top:var(--space-6)">' + related.map(function (r) { return NS.card(r); }).join('') + '</div></div>';
  }

  var filter = 'all', sort = 'drop';
  function renderGrid() {
    var list = NS.items.filter(function (i) { return filter === 'all' || i.rarity === filter; });
    var R = { common: 0, rare: 1, epic: 2, legendary: 3 };
    list.sort(function (a, b) { return sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : sort === 'rarity' ? R[b.rarity] - R[a.rarity] : ((b.drop === '—' ? '000' : b.drop) > (a.drop === '—' ? '000' : a.drop) ? 1 : -1); });
    var g = $('#grid'); if (!g) return;
    g.innerHTML = list.map(function (i) { return NS.card(i); }).join('');
    $('#count').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
  }

  function teardown() { if (hero) { hero.destroy(); hero = null; } if (stage) { stage.destroy(); stage = null; } if (timer) { clearInterval(timer); timer = null; } }

  function route() {
    var h = (location.hash || '#home').slice(1), m = /^item-(.+)$/.exec(h);
    teardown();
    document.body.style.overflow = '';
    if (m && NS.item(m[1])) {
      var it = NS.item(m[1]);
      app.innerHTML = shell(itemHTML(it), 'shop');
      document.title = it.name + ' · Terra & Lore';
      if (it.model) {
        stage = TL3D.mountStage($('#stage'), { url: 'models/' + it.model + '.glb' + (window.TL_MODEL_EXT || ''), height: 1.5, name: it.name });
        document.addEventListener('tl:view', onView);
      }
      window.scrollTo(0, 0);
    } else {
      var dest = NS.nav.some(function (d) { return d.key === h; }) ? h : 'home';
      app.innerHTML = shell(homeHTML(), dest === 'home' ? 'shop' : dest);
      document.title = 'Terra & Lore';
      renderGrid();
      timer = NS.countdown($('#drop-timer'), DROP_AT);
      var sceneEl = $('#hero-scene');
      hero = TL3D.mountHero(sceneEl, Object.assign({ actor: { url: 'models/scarf-cat-rigged.glb' + (window.TL_MODEL_EXT || ''), height: HERO.actorHeight || 0.95 } }, HERO.scene || {}));
      sceneEl.addEventListener('tl3d:actor', onCat);
      var lines = ['Oh. A visitor. The lanterns are not lit yet, mind the roots.', 'I am number 03 of 5. The other four went to Berlin, Batumi, and a kitchen in Kutaisi.', 'Every figure here has a card. Mine says I am never late. It is correct.'];
      var li = 0;
      function onCat() { var box = $('#hero-dialog'); box.innerHTML = '<div class="tl-dialog" style="margin-top:var(--space-3)"><div class="tl-dialog__portrait"><img src="' + NS.asset('scarf-cat-front') + '" alt=""></div><div class="tl-dialog__body"><div class="tl-dialog__name">' + NS.tag('legendary') + '<span class="tl-field__label" style="margin:0">Scarf Cat · No. 03 / 5</span></div><p class="tl-dialog__text"></p><button class="tl-dialog__next" type="button" data-next>' + key('→') + ' Next</button></div></div>'; NS.typewrite(box.querySelector('.tl-dialog__text'), lines[li % lines.length]); li++; var hint = $('#hero-hint'); if (hint) hint.hidden = true; }
      app.addEventListener('click', function (e) { if (e.target.closest('[data-next]')) { var box = $('#hero-dialog .tl-dialog__text'); if (box) { NS.typewrite(box, lines[li % lines.length]); li++; if (hero) hero.api.play('hop', { once: true }); } } });
      $('#filters').addEventListener('click', function (e) { var b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter; $('#filters').querySelectorAll('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); renderGrid(); });
      $('#sort').addEventListener('change', function (e) { sort = e.target.value; renderGrid(); });
      if (dest !== 'home') { var sec = document.getElementById(dest === 'contact' ? 'guild' : dest); if (sec) setTimeout(function () { sec.scrollIntoView({ block: 'start' }); }, 50); } else window.scrollTo(0, 0);
    }
    NS.bind.header && NS.bind.header();
    var header = $('.tl-header'); if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  function onView(e) { if (!stage) return; stage.setView(e.detail === 'side' ? 'detail' : e.detail === 'back' ? 'scale' : e.detail); if (e.detail === 'side') stage.setView('front'), stage.turn(-1.4); if (e.detail === 'back') stage.setView('front'), stage.turn(3.14); }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-stage]'); if (b && stage) { if (b.dataset.stage === 'zoom-in') stage.zoom(0.25); else if (b.dataset.stage === 'zoom-out') stage.zoom(-0.25); else stage.setView('turntable'); } });
  document.addEventListener('tl:navigate', function (e) { var d = e.detail; location.hash = d === 'contact' ? 'guild' : d; if (location.hash.slice(1) === d || d === 'contact') { var sec = document.getElementById(d === 'contact' ? 'guild' : d === 'shop' && !document.getElementById('shop') ? '' : d); if (sec) sec.scrollIntoView({ behavior: NS.reducedMotion() ? 'auto' : 'smooth' }); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'f' || e.key === 'F') { var b = document.querySelector('[data-add]:not(.tl-card__add)'); if (b && !e.target.closest('input,textarea,select') && !b.disabled) b.click(); } if ((e.key === 'e' || e.key === 'E') && !e.target.closest('input,textarea,select')) { var c = document.querySelector('.tl-card:hover'); if (c) location.hash = 'item-' + c.dataset.item; } });
  window.addEventListener('hashchange', route);
  NS.bind(document);
  NS.tooltips(document);
  route();
})();
