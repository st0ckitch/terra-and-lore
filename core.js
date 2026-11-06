/* Terra & Lore Realm — behaviours and builders. One classic script: window.TerraLoreRealm.
   Nothing here paints a colour; every visual comes from bundle.css and tokens.css. */
window.TerraLoreRealm = window.TerraLoreRealm || {};
(function (NS) {
  var reduce = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  NS.reducedMotion = reduce;
  NS.assets = NS.assets || {};        // name -> url, filled per page (logos, renders, models)
  NS.asset = function (n) { return NS.assets[n] || ('/_blob/' + n); };

  /* ---- icons: single-stroke, 24 box. Stroke is currentColor. ---- */
  var ICONS = {
    shop: '<path d="M4 9h16l-1.2 10.2a1.5 1.5 0 0 1-1.5 1.3H6.7a1.5 1.5 0 0 1-1.5-1.3L4 9z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
    lore: '<path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 1-2-2V4z"/><path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2"/><path d="M10 9h5M10 13h5"/>',
    bag: '<path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    'zoom-in': '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/>',
    'zoom-out': '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M8 11h6"/>',
    reset: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
    rotate: '<path d="M3 12a9 9 0 0 1 15.5-6.3"/><path d="M21 12a9 9 0 0 1-15.5 6.3"/><path d="M18.5 2v4h-4M5.5 22v-4h4"/>',
    drag: '<path d="M8 6l-3 3 3 3M16 6l3 3-3 3"/><path d="M5 9h14"/><path d="M12 14v6M9 17l3 3 3-3"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    instagram: '<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r=".8" fill="currentColor"/>',
    send: '<path d="M21 3L3 10l8 3 3 8 7-18z"/><path d="M11 13l10-10"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    gift: '<path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13"/><path d="M12 7c-1.5-2-4-3-5-1s2 1 5 1zM12 7c1.5-2 4-3 5-1s-2 1-5 1z"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14h3"/>',
    hammer: '<path d="M14 4l6 6-2 2-6-6z"/><path d="M12 6l-8 8 2 2 8-8"/><path d="M4 20l4-4"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    flame: '<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5.5 1.5 1.5 2 2 2 .5-2-.5-4 1-7z"/>',
    globe: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 13v6H5V5h6"/>'
  };
  NS.icon = function (name, cls) { return '<svg class="tl-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.sparkle) + '</svg>'; };
  NS.icons = ICONS;
  NS.key = function (k, lg) { return '<kbd class="tl-key' + (lg ? ' tl-key--lg' : '') + '">' + k + '</kbd>'; };

  /* ---- destinations (nav) ---- */
  NS.nav = [
    { key: 'shop', label: 'Shop', glyph: 'Ⴋ', title: 'The shop', lore: 'Every figure currently out of the kiln, numbered and ready to leave.' },
    { key: 'drops', label: 'Drops', glyph: 'Ⴃ', title: 'Drops', lore: 'A new set every month, made from whatever the world is obsessed with this week.' },
    { key: 'lore', label: 'Lore', glyph: 'Ⴆ', title: 'The lore', lore: 'Each piece ships with its card. This is the whole book.' },
    { key: 'custom', label: 'Custom', glyph: 'Ⴀ', title: 'Your own legend', lore: 'Send a photo or a sketch. We roll it in clay and write its story.' },
    { key: 'guild', label: 'Guild', glyph: 'Ⴂ', title: 'The guild', lore: 'Tima and Lika, the kiln, the Tbilisi workshop and the people who collect.' },
    { key: 'contact', label: 'Contact', glyph: 'Ⴌ', title: 'Send a raven', lore: 'Instagram is fastest. Email for commissions and wholesale.' }
  ];

  /* ---- items (example catalogue; stand-ins until real photos) ---- */
  NS.items = [
    { id: 'scarf-cat', name: 'Scarf Cat', type: 'Figure · 9 cm', price: 85, rarity: 'legendary', edition: [3, 5], tag: 'last', drop: '002', model: 'scarf-cat', poster: 'scarf-cat', height: '9 cm', material: 'Air-dry clay, varnished', finish: 'Matte, hand-painted', lore: 'Runs the ridge every evening so the lanterns know it is time to light. Never late, never cold.', ka: 'ყოველ საღამოს სერზე დარბის' },
    { id: 'hearth-cat', name: 'Hearth Cat', type: 'Figure · 7 cm', price: 70, rarity: 'epic', edition: [6, 10], tag: 'new', drop: '002', model: 'hearth-cat', poster: 'hearth-cat', height: '7 cm', material: 'Air-dry clay, varnished', finish: 'Matte, hand-painted', lore: 'Sits by the tone oven and judges the bread. Approves of most of it.', ka: 'თონესთან ზის და პურს აფასებს' },
    { id: 'pocket-mushroom', name: 'Pocket Mushroom', type: 'Charm · 5.5 cm', price: 45, rarity: 'rare', edition: [7, 30], tag: null, drop: '001', poster: 'pocket-mushroom', views: ['pocket-mushroom-front', 'pocket-mushroom-side', 'pocket-mushroom-back'], height: '5.5 cm', material: 'Polymer clay', finish: 'Satin', lore: 'Lives in tote bags, eats crumbs, brings luck to anyone who forgets their keys.', ka: 'ჩანთებში ცხოვრობს და იღბალს მოაქვს' },
    { id: 'lucky-star', name: 'Lucky Star', type: 'Charm · 5 cm', price: 40, rarity: 'common', edition: null, tag: 'order', drop: '001', poster: 'lucky-star', height: '5 cm', material: 'Polymer clay', finish: 'Satin', lore: 'Fell off the sky over Vake and refused to go back up. Keeps your keys found.', ka: 'ვაკეს ცაზე ჩამოვარდა' },
    { id: 'churchkhela-snake', name: 'Churchkhela Snake', type: 'Charm · 7 cm', price: 55, rarity: 'rare', edition: [21, 30], tag: null, drop: '001', poster: 'churchkhela-snake', height: '7 cm', material: 'Polymer clay', finish: 'Gloss', lore: 'Walnuts on a string, dipped in grape must. It is not edible. It has been asked.', ka: 'არ იჭმევა. უკვე ჰკითხეს.' },
    { id: 'tone-cat', name: 'Tone Cat', type: 'Figure · 6 cm', price: 60, rarity: 'common', edition: null, tag: 'order', drop: '001', poster: 'tone-cat', height: '6 cm', material: 'Polymer clay', finish: 'Satin', lore: 'Sleeps on the warm side of the bread oven. Has never once been moved.', ka: 'თონის თბილ მხარეს სძინავს' },
    { id: 'pomegranate-spirit', name: 'Pomegranate Spirit', type: 'Figure · 6 cm', price: 65, rarity: 'epic', edition: [2, 10], tag: 'last', drop: '001', poster: 'pomegranate-spirit', height: '6 cm', material: 'Polymer clay', finish: 'Gloss', lore: 'Every seed is a wish someone forgot to make. It keeps them until they remember.', ka: 'ყოველი მარცვალი დავიწყებული სურვილია' },
    { id: 'tamada-frog', name: 'Tamada Frog', type: 'Figure · 7 cm', price: 75, rarity: 'epic', edition: [0, 10], tag: 'sold', drop: '001', poster: 'tamada-frog', height: '7 cm', material: 'Polymer clay', finish: 'Satin', lore: 'Leads every toast at the supra. The horn is never empty; nobody knows why.', ka: 'ყველა სადღეგრძელოს ის ამბობს' },
    { id: 'your-own-legend', name: 'Your Own Legend', type: 'Custom · any size', price: 120, rarity: 'legendary', edition: [1, 1], tag: 'order', drop: '—', poster: 'your-own-legend', height: '5 to 12 cm', material: 'Your choice', finish: 'Your choice', lore: 'Raw clay waiting for a story. Send a photo; we send back a 1 of 1 with its card.', ka: 'ნედლი თიხა ამბავს ელოდება' }
  ];
  NS.item = function (id) { for (var i = 0; i < NS.items.length; i++) if (NS.items[i].id === id) return NS.items[i]; return null; };
  var RLABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
  var TLABEL = { 'new': 'New', last: 'Last few', sold: 'Sold out', order: 'Made to order' };
  NS.rarityLabel = RLABEL; NS.tagLabel = TLABEL;
  NS.price = function (n) { return n + ' GEL'; };
  NS.edition = function (it) { return it.edition ? 'No. ' + String(it.edition[0]).padStart(2, '0') + ' / ' + it.edition[1] : 'Open edition'; };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  NS.esc = esc;

  /* ---- builders ---- */
  NS.tag = function (kind, text) { return '<span class="tl-tag tl-tag--' + kind + '">' + esc(text || RLABEL[kind] || TLABEL[kind] || kind) + '</span>'; };
  NS.editionBar = function (it, o) {
    o = o || {};
    if (!it.edition) return '<div class="tl-edition tl-edition--' + it.rarity + '" style="--pct:100%"><div class="tl-edition__row"><strong>Open edition</strong><span>Made to order</span></div><div class="tl-edition__track"><div class="tl-edition__fill"></div></div></div>';
    var left = it.edition[1] - it.edition[0] + (it.tag === 'sold' ? 0 : 1), pct = Math.round((it.edition[1] - Math.max(0, left)) / it.edition[1] * 100);
    if (it.tag === 'sold') { left = 0; pct = 100; }
    var low = left > 0 && left <= 4;
    return '<div class="tl-edition tl-edition--' + it.rarity + (low ? ' tl-edition--low' : '') + '" style="--pct:' + pct + '%"><div class="tl-edition__row"><strong>' + esc(NS.edition(it)) + '</strong><span>' + (left > 0 ? left + ' left' : 'None left') + '</span></div><div class="tl-edition__track" role="progressbar" aria-valuemin="0" aria-valuemax="' + it.edition[1] + '" aria-valuenow="' + (it.edition[1] - left) + '"><div class="tl-edition__fill"></div></div></div>';
  };
  NS.card = function (it, o) {
    o = o || {};
    var left = it.edition ? it.edition[1] - it.edition[0] + 1 : null;
    var meta = it.edition ? NS.edition(it) : 'Open edition';
    return '<article class="tl-card tl-card--' + it.rarity + (it.tag === 'sold' ? ' is-sold' : '') + '" data-item="' + it.id + '">' +
      '<div class="tl-card__stage">' +
        '<div class="tl-card__tags">' + NS.tag(it.rarity) + (it.tag ? NS.tag(it.tag) : '<span></span>') + '</div>' +
        '<img class="tl-card__img" src="' + NS.asset(it.poster) + '" alt="' + esc(it.name) + ', ' + esc(it.type) + '" loading="lazy" width="760" height="760">' +
      '</div>' +
      '<div class="tl-card__body">' +
        '<button class="tl-card__add" type="button" data-add="' + it.id + '" aria-label="Add ' + esc(it.name) + ' to bag">' + NS.icon('plus') + '</button>' +
        '<div class="tl-card__top"><div><h3 class="tl-card__name"><a href="' + (o.href || ('#item-' + it.id)) + '">' + esc(it.name) + '</a></h3><div class="tl-card__type">' + esc(it.type) + '</div></div><div class="tl-card__price">' + NS.price(it.price) + '</div></div>' +
        '<div class="tl-card__meta"><span>' + esc(meta) + '</span><span>Drop ' + esc(it.drop) + '</span></div>' +
        '<div class="tl-card__lore"><p>' + esc(it.lore) + '</p></div>' +
      '</div></article>';
  };
  NS.tooltip = function (it) {
    return '<div class="tl-tip tl-tip--' + it.rarity + '" role="tooltip">' +
      '<h4 class="tl-tip__name">' + esc(it.name) + '</h4>' +
      '<div class="tl-tip__sub">' + NS.tag(it.rarity) + '<span>' + esc(it.type) + '</span></div>' +
      '<div class="tl-tip__stats">' + [['Height', it.height], ['Material', it.material], ['Finish', it.finish], ['Edition', NS.edition(it)], ['Drop', it.drop]].map(function (r) { return '<div class="tl-stat"><span>' + r[0] + '</span><strong>' + esc(r[1]) + '</strong></div>'; }).join('') + '</div>' +
      '<p class="tl-tip__lore">' + esc(it.lore) + '</p>' +
      '<div class="tl-tip__foot"><span>' + NS.key('E') + ' Inspect</span><span>' + NS.key('F') + ' Add to bag</span></div></div>';
  };
  NS.toast = function (it, kicker) {
    return '<div class="tl-toast tl-toast--' + it.rarity + '" role="status"><div class="tl-toast__thumb"><img src="' + NS.asset(it.poster) + '" alt=""></div><div class="tl-toast__body"><span class="tl-toast__kicker">' + esc(kicker || 'Added to bag') + '</span><span class="tl-toast__title">' + esc(it.name) + '</span><span class="tl-toast__sub">' + esc(NS.edition(it)) + ' · ' + NS.price(it.price) + '</span></div><button class="tl-btn tl-btn--ghost tl-btn--sm" type="button" data-open-bag>View</button></div>';
  };
  NS.bagRow = function (it, qty) {
    return '<div class="tl-bagrow tl-bagrow--' + it.rarity + '" data-item="' + it.id + '"><div class="tl-bagrow__thumb"><img src="' + NS.asset(it.poster) + '" alt=""></div><div class="tl-bagrow__body"><span class="tl-bagrow__name">' + esc(it.name) + '</span><span class="tl-bagrow__meta">' + esc(NS.edition(it)) + ' · ' + esc(it.type) + '</span><button class="tl-dialog__next" type="button" data-remove="' + it.id + '">Remove</button></div><div class="tl-bagrow__side"><span class="tl-bagrow__price">' + NS.price(it.price * (qty || 1)) + '</span>' + NS.stepper(qty || 1, it.id) + '</div></div>';
  };
  NS.stepper = function (v, id) { return '<div class="tl-stepper" data-stepper' + (id ? ' data-for="' + id + '"' : '') + '><button type="button" data-step="-1" aria-label="Fewer">' + NS.icon('minus') + '</button><output aria-live="polite">' + (v || 1) + '</output><button type="button" data-step="1" aria-label="More">' + NS.icon('plus') + '</button></div>'; };
  NS.scrollBadge = function (text) {
    return '<button class="tl-scroll" type="button" aria-label="Scroll to the shop"><svg viewBox="0 0 100 100"><defs><path id="tl-scroll-path" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs><circle cx="50" cy="50" r="48" fill="none" stroke="var(--line-strong)"/><text><textPath href="#tl-scroll-path">' + esc(text || 'Scroll · Scroll · Scroll · ') + '</textPath></text></svg><span class="tl-scroll__dot"></span></button>';
  };
  NS.runeMenuHTML = function (current) {
    var n = NS.nav.length;
    return '<div class="tl-rune-menu" id="tl-rune-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>' +
      '<div class="tl-rune-menu__bar"><img src="' + NS.asset('logo-wordmark-reverse') + '" alt="Terra &amp; Lore"><button class="tl-btn tl-btn--ghost tl-btn--sm tl-rune-menu__close" type="button" data-menu-close>Close ' + NS.key('Esc') + '</button></div>' +
      '<div class="tl-rune-menu__stage"><div class="tl-ring"><div class="tl-ring__orbit"></div>' +
      NS.nav.map(function (d, i) { return '<button class="tl-ring__node' + (d.key === current ? ' is-current' : '') + '" type="button" style="--a:' + Math.round(i * 360 / n) + 'deg;--i:' + i + '" data-dest="' + d.key + '"><span class="tl-ring__stone"><span class="tl-ring__glyph" aria-hidden="true">' + d.glyph + '</span></span><span class="tl-ring__label">' + esc(d.label) + '</span></button>'; }).join('') +
      '<div class="tl-ring__centre"><div data-ring-centre><h2 class="tl-ring__title">' + esc(NS.nav[0].title) + '</h2><p class="tl-ring__lore">' + esc(NS.nav[0].lore) + '</p><span class="tl-ring__hint">' + NS.key('←') + NS.key('→') + ' turn · ' + NS.key('↵') + ' go</span></div></div>' +
      '</div></div>' +
      '<div class="tl-rune-menu__foot"><span>Terra &amp; Lore · Tbilisi</span><span><a href="#">EN</a> · <a href="#">ქართ</a></span><span>Handmade, numbered, shipped with its lore card</span></div></div>';
  };
  NS.hotbarHTML = function (current) {
    var slots = [['shop', 'shop', 'Shop'], ['lore', 'lore', 'Lore'], null, ['bag', 'bag', 'Bag'], ['guild', 'user', 'Me']];
    return '<nav class="tl-hotbar" aria-label="Quick bar">' + slots.map(function (s) {
      if (!s) return '<div class="tl-orb-wrap"><button class="tl-orb" type="button" data-wheel-toggle aria-expanded="false" aria-label="Open the menu"><img src="' + NS.asset('logo-mark-ink') + '" alt=""></button></div>';
      return '<button class="tl-slot' + (s[0] === current ? ' is-active' : '') + '" type="button" data-dest="' + s[0] + '"' + (s[0] === 'bag' ? ' data-open-bag' : '') + '>' + NS.icon(s[1]) + '<span>' + s[2] + '</span>' + (s[0] === 'bag' ? '<span class="tl-slot__count" data-bag-count hidden>0</span>' : '') + '</button>';
    }).join('') + '</nav>' +
    '<div class="tl-wheel" id="tl-wheel" aria-hidden="true"><div class="tl-wheel__scrim" data-wheel-close></div><p class="tl-wheel__lore" data-wheel-lore>' + esc(NS.nav[0].lore) + '</p><div class="tl-wheel__hub">' +
      NS.nav.map(function (d, i) { var a = [-72, -45, -18, 18, 45, 72][i]; var ic = { shop: 'shop', drops: 'flame', lore: 'lore', custom: 'hammer', guild: 'user', contact: 'send' }[d.key]; return '<button class="tl-wheel__node' + (d.key === current ? ' is-current' : '') + '" type="button" style="--a:' + a + 'deg;--i:' + i + '" data-dest="' + d.key + '"><span class="tl-wheel__disc">' + NS.icon(ic) + '</span><span>' + esc(d.label) + '</span></button>'; }).join('') +
    '</div></div>';
  };
  NS.footerHTML = function () {
    var cols = [['Shop', ['All pieces', 'Drops', 'Custom orders', 'Gift cards']], ['Lore', ['The book', 'Drop 001', 'Drop 002', 'The guild']], ['Help', ['Delivery in Georgia', 'Worldwide shipping', 'Care', 'Returns']]];
    return '<footer class="tl-footer"><div class="tl-wrap">' +
      '<div class="tl-footer__call"><div><h2>Join the guild</h2><p>One raven per drop. New figures, the secret design, nothing else.</p></div><form class="tl-footer__form" data-guild><label class="tl-sr" for="tl-guild-email">Email</label><input class="tl-input" id="tl-guild-email" type="email" placeholder="you@realm.ge" autocomplete="email"><button class="tl-btn tl-btn--primary" type="submit">Join</button></form></div>' +
      '<div class="tl-footer__cols"><div class="tl-footer__brand"><img src="' + NS.asset('logo-stacked-reverse') + '" alt="Terra &amp; Lore"><p>Lore from earth. Handmade clay figures and charms, numbered, from Tbilisi.</p><p class="tl-footer__ka">ლეგენდები მიწიდან · ხელნაკეთი თიხის ფიგურები თბილისიდან</p></div>' +
      cols.map(function (c) { return '<div class="tl-footer__col"><h3>' + c[0] + '</h3>' + c[1].map(function (l) { return '<a href="#">' + l + '</a>'; }).join('') + '</div>'; }).join('') + '</div>' +
      '<div class="tl-footer__legal"><span>© 2026 Terra &amp; Lore · Tima &amp; Lika · Tbilisi</span><span class="tl-rune" aria-hidden="true">ႪႤႢႤႬႣႤႡႨ ႫႨႼႨႣႠႬ</span><span><a href="#">Instagram</a> · <a href="#">Facebook</a> · <a href="#">Privacy</a></span></div>' +
      '</div></footer>';
  };

  /* ---- behaviours ---- */
  var bag = {};
  NS.bag = bag;
  function bagCount() { var n = 0; for (var k in bag) n += bag[k]; return n; }
  function updateBagUI(root) {
    var n = bagCount();
    (root || document).querySelectorAll('[data-bag-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    var list = document.querySelector('[data-bag-list]');
    if (list) {
      var ids = Object.keys(bag), sum = 0;
      list.innerHTML = ids.length ? ids.map(function (id) { var it = NS.item(id); sum += it.price * bag[id]; return NS.bagRow(it, bag[id]); }).join('') : '<p class="tl-field__hint" style="padding:24px 0">Your bag is empty. The shop is one rune away.</p>';
      var s = document.querySelector('[data-bag-sum]'); if (s) s.textContent = NS.price(sum);
      var t = document.querySelector('[data-bag-title-count]'); if (t) t.textContent = n + (n === 1 ? ' piece' : ' pieces');
    }
  }
  NS.addToBag = function (id, root) {
    var it = NS.item(id); if (!it || it.tag === 'sold') return;
    bag[id] = (bag[id] || 0) + 1; updateBagUI(root);
    NS.showToast(it);
    document.dispatchEvent(new CustomEvent('tl:bag', { detail: { id: id, count: bagCount() } }));
  };
  NS.showToast = function (it, kicker) {
    var layer = document.querySelector('.tl-toast-layer'); if (!layer) { layer = document.createElement('div'); layer.className = 'tl-toast-layer'; document.body.appendChild(layer); }
    var wrap = document.createElement('div'); wrap.innerHTML = NS.toast(it, kicker); var el = wrap.firstChild; layer.appendChild(el);
    while (layer.children.length > 3) layer.firstChild.remove();
    setTimeout(function () { el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, 300); }, 3600);
  };
  NS.openBag = function (open) {
    var d = document.querySelector('.tl-drawer'), s = document.querySelector('.tl-drawer__scrim'); if (!d) return;
    d.classList.toggle('is-open', open !== false); if (s) s.classList.toggle('is-open', open !== false);
    d.setAttribute('aria-hidden', open === false ? 'true' : 'false');
    if (open !== false) { updateBagUI(); var f = d.querySelector('button'); if (f) f.focus(); }
  };
  NS.openMenu = function (open) {
    var m = document.getElementById('tl-rune-menu'); if (!m) return;
    if (open === false) { m.classList.remove('is-open'); setTimeout(function () { m.hidden = true; }, 280); document.body.style.overflow = ''; return; }
    m.hidden = false; requestAnimationFrame(function () { m.classList.add('is-open'); }); document.body.style.overflow = 'hidden';
    var hot = m.querySelector('.tl-ring__node.is-current') || m.querySelector('.tl-ring__node'); if (hot) { setHot(hot); hot.focus({ preventScroll: true }); }
  };
  function setHot(node) {
    var m = node.closest('.tl-rune-menu'), d = NS.nav.filter(function (x) { return x.key === node.dataset.dest; })[0];
    m.querySelectorAll('.tl-ring__node').forEach(function (n) { n.classList.toggle('is-hot', n === node); });
    var c = m.querySelector('[data-ring-centre]'); if (c && d) { var h = c.querySelector('.tl-ring__title'), p = c.querySelector('.tl-ring__lore'); if (h.textContent !== d.title) { h.textContent = d.title; p.textContent = d.lore; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; } }
  }
  NS.openWheel = function (open) {
    var w = document.getElementById('tl-wheel'), orb = document.querySelector('[data-wheel-toggle]'); if (!w) return;
    var on = open !== false; w.classList.toggle('is-open', on); w.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (orb) { orb.classList.toggle('is-open', on); orb.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  };
  NS.typewrite = function (el, text, done) {
    el.innerHTML = '';
    if (reduce()) { el.textContent = text; if (done) done(); return; }
    var i = 0, caret = document.createElement('span'); caret.className = 'tl-caret'; el.appendChild(caret);
    var node = document.createTextNode(''); el.insertBefore(node, caret);
    var timer = setInterval(function () { node.data = text.slice(0, ++i); if (i >= text.length) { clearInterval(timer); setTimeout(function () { caret.remove(); if (done) done(); }, 400); } }, 22);
    return function () { clearInterval(timer); node.data = text; caret.remove(); };
  };
  NS.countdown = function (el, target) {
    var units = el.querySelectorAll('[data-unit]');
    function tick() {
      var ms = Math.max(0, target - Date.now()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      var v = { d: d, h: h, m: m, s: s };
      units.forEach(function (u) { u.textContent = String(v[u.dataset.unit]).padStart(2, '0'); });
    }
    tick(); return setInterval(tick, 1000);
  };
  NS.tooltips = function (root) {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var layer = document.createElement('div'); layer.className = 'tl-tip-layer'; layer.hidden = true; document.body.appendChild(layer);
    var cur = null;
    function show(card, ev) { var it = NS.item(card.dataset.item); if (!it) return; if (cur !== card) { layer.innerHTML = NS.tooltip(it); cur = card; } layer.hidden = false; move(ev); }
    function move(ev) { var w = layer.offsetWidth, h = layer.offsetHeight, x = ev.clientX + 18, y = ev.clientY + 18; if (x + w > innerWidth - 12) x = ev.clientX - w - 18; if (y + h > innerHeight - 12) y = innerHeight - h - 12; layer.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    (root || document).addEventListener('pointerover', function (e) { var c = e.target.closest('.tl-card'); if (c) show(c, e); });
    (root || document).addEventListener('pointermove', function (e) { if (!layer.hidden && e.target.closest('.tl-card')) move(e); else if (!layer.hidden) { layer.hidden = true; cur = null; } });
    (root || document).addEventListener('pointerout', function (e) { if (e.target.closest('.tl-card') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tl-card'))) { layer.hidden = true; cur = null; } });
  };
  NS.bind = function (root) {
    root = root || document;
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-add],[data-step],[data-remove],[data-open-bag],[data-close-bag],[data-menu-open],[data-menu-close],[data-dest],[data-wheel-toggle],[data-wheel-close],[data-tab],[data-option],[data-view],[data-stage]');
      if (!t) return;
      if (t.dataset.add != null) { NS.addToBag(t.dataset.add, root); return; }
      if (t.dataset.step != null) { var st = t.closest('[data-stepper]'), out = st.querySelector('output'), v = Math.max(1, Math.min(9, +out.textContent + +t.dataset.step)); out.textContent = v; if (st.dataset.for && bag[st.dataset.for]) { bag[st.dataset.for] = v; updateBagUI(root); } return; }
      if (t.dataset.remove != null) { delete bag[t.dataset.remove]; updateBagUI(root); return; }
      if (t.hasAttribute('data-open-bag')) { NS.openBag(true); e.preventDefault(); return; }
      if (t.hasAttribute('data-close-bag')) { NS.openBag(false); return; }
      if (t.hasAttribute('data-menu-open')) { NS.openMenu(true); return; }
      if (t.hasAttribute('data-menu-close')) { NS.openMenu(false); return; }
      if (t.hasAttribute('data-wheel-toggle')) { NS.openWheel(!t.classList.contains('is-open')); return; }
      if (t.hasAttribute('data-wheel-close')) { NS.openWheel(false); return; }
      if (t.dataset.dest != null) { if (t.dataset.dest === 'bag') return; NS.openMenu(false); NS.openWheel(false); root.querySelectorAll('[data-dest]').forEach(function (n) { n.classList.toggle('is-current', n.dataset.dest === t.dataset.dest); if (n.classList.contains('tl-slot')) n.classList.toggle('is-active', n.dataset.dest === t.dataset.dest); }); document.dispatchEvent(new CustomEvent('tl:navigate', { detail: t.dataset.dest })); return; }
      if (t.dataset.tab != null) { var tabs = t.closest('.tl-tabs'); tabs.querySelectorAll('.tl-tab').forEach(function (b) { b.setAttribute('aria-selected', b === t ? 'true' : 'false'); }); var host = tabs.parentElement; host.querySelectorAll('.tl-tabpanel').forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; }); return; }
      if (t.dataset.option != null) { t.parentElement.querySelectorAll('.tl-option').forEach(function (o) { o.setAttribute('aria-checked', o === t ? 'true' : 'false'); }); return; }
      if (t.dataset.view != null) { t.parentElement.querySelectorAll('.tl-view').forEach(function (v) { v.setAttribute('aria-pressed', v === t ? 'true' : 'false'); }); document.dispatchEvent(new CustomEvent('tl:view', { detail: t.dataset.view })); return; }
    });
    root.addEventListener('pointerover', function (e) { var n = e.target.closest('.tl-ring__node'); if (n) setHot(n); var w = e.target.closest('.tl-wheel__node'); if (w) { var l = document.querySelector('[data-wheel-lore]'), d = NS.nav.filter(function (x) { return x.key === w.dataset.dest; })[0]; if (l && d) l.textContent = d.lore; } });
    root.addEventListener('focusin', function (e) { var n = e.target.closest('.tl-ring__node'); if (n) setHot(n); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { NS.openMenu(false); NS.openBag(false); NS.openWheel(false); }
      var m = e.target.closest('.tl-rune-menu'); if (m && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { var nodes = Array.prototype.slice.call(m.querySelectorAll('.tl-ring__node')), i = nodes.indexOf(m.querySelector('.tl-ring__node.is-hot')); var nx = nodes[(i + (e.key === 'ArrowRight' ? 1 : nodes.length - 1)) % nodes.length]; nx.focus(); setHot(nx); e.preventDefault(); }
      if (!e.target.closest('input,textarea,select') && !e.metaKey && !e.ctrlKey) { if (e.key === 'm' || e.key === 'M') { var mm = document.getElementById('tl-rune-menu'); if (mm) NS.openMenu(!mm.classList.contains('is-open')); } if (e.key === 'b' || e.key === 'B') { var dd = document.querySelector('.tl-drawer'); if (dd) NS.openBag(!dd.classList.contains('is-open')); } }
    });
    root.addEventListener('submit', function (e) { var f = e.target.closest('[data-guild]'); if (f) { e.preventDefault(); var b = f.querySelector('button'); b.textContent = 'Joined'; b.disabled = true; } });
    var header = root.querySelector('.tl-header');
    if (header) { var onScroll = function () { header.classList.toggle('is-scrolled', (window.scrollY || root.scrollTop || 0) > 24); var rail = root.querySelector('.tl-rail__fill'); if (rail) { var max = document.documentElement.scrollHeight - innerHeight; rail.style.top = (max > 0 ? Math.min(72, window.scrollY / max * 72) : 0) + '%'; } }; window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
    var sb = root.querySelector('.tl-scroll'); if (sb) sb.addEventListener('click', function () { var s = document.getElementById('shop'); if (s) s.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' }); });
    updateBagUI(root);
  };
})(window.TerraLoreRealm);
