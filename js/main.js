/* ════════════════════════════════════════════════════════════════════
   AURONEXTA main.js — Professional Build
   Auto read-time (10–18 min range), full-screen whitepaper modal,
   GitHub API loader, overview preview (no scroll), team profiles,
   testimonials wheel, FAB radial menu, contact form.
══════════════════════════════════════════════════════════════════ */
(function () {
"use strict";

var CFG = SITE_JSON;

/* ── DOM helpers ── */
function $(s, c) { return (c || document).querySelector(s); }
function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
function el(t, cls, html) {
  var e = document.createElement(t);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}
function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
function fmtName(n) { return n.replace(/[_-]+/g, ' ').trim().split(/\s+/).map(cap).join(' '); }
function fmtClass(n) { return n.replace(/[_-]+/g, ' + ').trim().toUpperCase(); }

/* ── Auto read-time: 225 wpm, clamped to 10–18 min range ── */
function readTime(text) {
  var words = String(text).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().split(/\s+/).length;
  var mins = Math.max(10, Math.min(18, Math.ceil(words / 225)));
  return mins + ' min';
}

function colorFor(cls) {
  var k = Object.keys(CFG.classColors);
  for (var i = 0; i < k.length; i++) {
    if (cls.toUpperCase().indexOf(k[i]) > -1) return CFG.classColors[k[i]];
  }
  var h = 0;
  for (var j = 0; j < cls.length; j++) h = (h * 31 + cls.charCodeAt(j)) % 360;
  return 'hsl(' + h + ',80%,45%)';
}

function initials(t) {
  return t.split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 3).toUpperCase();
}

function avatarSVG(text, bg, w, h) {
  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (w || 400) + '" height="' + (h || 300) + '">' +
    '<rect width="100%" height="100%" fill="' + bg + '"/>' +
    '<circle cx="50%" cy="42%" r="56" fill="rgba(255,255,255,.92)"/>' +
    '<text x="50%" y="42%" dy=".35em" font-family="system-ui,Arial" font-size="44" font-weight="700" text-anchor="middle" fill="' + bg + '">' + esc(text) + '</text>' +
    '<rect y="78%" width="100%" height="22%" fill="rgba(0,0,0,.22)"/></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
}

/* ══ Markdown renderer ══ */
function inline(md) {
  return esc(md)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function mdToHtml(md) {
  var lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  var out = [], para = [], list = null, code = null;
  function fP() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
  function fL() { if (list) { out.push('</' + list + '>'); list = null; } }
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];
    if (code !== null) {
      if (/^```/.test(ln)) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
      else code.push(ln);
      continue;
    }
    if (/^```/.test(ln)) { fP(); fL(); code = []; continue; }
    var h = /^(#{1,6})\s+(.*)$/.exec(ln);
    if (h) { fP(); fL(); out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'); continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(ln)) { fP(); fL(); out.push('<hr>'); continue; }
    var q = /^>\s?(.*)$/.exec(ln);
    if (q) { fP(); fL(); out.push('<blockquote>' + inline(q[1]) + '</blockquote>'); continue; }
    var ul = /^\s*[-*]\s+(.*)$/.exec(ln);
    if (ul) { fP(); if (list !== 'ul') { fL(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(ul[1]) + '</li>'); continue; }
    var ol = /^\s*\d+\.\s+(.*)$/.exec(ln);
    if (ol) { fP(); if (list !== 'ol') { fL(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(ol[1]) + '</li>'); continue; }
    if (/^\s*$/.test(ln)) { fP(); fL(); continue; }
    para.push(ln);
  }
  if (code !== null) out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
  fP(); fL();
  return out.join('\n');
}

/* ══ GitHub API ══ */
function ghEnabled() {
  return CFG.github && CFG.github.owner && CFG.github.repo && CFG.github.owner.indexOf('YOUR') === -1;
}
function ghApi(p) {
  return 'https://api.github.com/repos/' + CFG.github.owner + '/' + CFG.github.repo + '/contents/' + p + '?ref=' + CFG.github.branch;
}
function ghJson(u) {
  return fetch(u, { headers: { 'Accept': 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw new Error('GH ' + r.status); return r.json(); });
}

/* ── GitHub Projects Loader ──
   projects/CLASS_NAME/Project_Name/
     whitepaper.md, whitepaper_banner.png, whitepaper_poster.png
*/
function loadProjects() {
  if (!ghEnabled()) return Promise.resolve(hydrateDemoProjects());
  return ghJson(ghApi(CFG.github.projectsPath)).then(function (classes) {
    return Promise.all(classes.filter(function (d) { return d.type === 'dir'; }).map(function (c) {
      return ghJson(ghApi(CFG.github.projectsPath + '/' + c.name)).then(function (items) {
        return Promise.all(items.filter(function (d) { return d.type === 'dir'; }).map(function (p) {
          return ghJson(ghApi(p.path)).then(function (files) {
            var poster = null, banner = null, md = null;
            files.forEach(function (f) {
              if (/^whitepaper_poster\.png$/i.test(f.name)) poster = f.download_url;
              else if (/^whitepaper_banner\.png$/i.test(f.name)) banner = f.download_url;
              if (/^whitepaper\.md$/i.test(f.name)) md = f.download_url;
            });
            return { title: fmtName(p.name), cls: fmtClass(c.name), cover: banner || poster, mdUrl: md, slug: p.path };
          });
        }));
      });
    }));
  }).then(function (arr) {
    var flat = []; arr.forEach(function (a) { flat = flat.concat(a); });
    return flat.length ? flat : hydrateDemoProjects();
  }).catch(function (e) { console.warn('[AuroNexta] projects fallback →', e); return hydrateDemoProjects(); });
}

function hydrateDemoProjects() {
  return CFG.demoProjects.map(function (p) {
    return { title: p.title, cls: fmtClass(p.cls), cover: avatarSVG(initials(p.title), colorFor(p.cls)),
             mdText: p.md, mdUrl: null, slug: p.title, desc: p.desc };
  });
}

/* ── GitHub Team / Profile Loader ──
   web/profiles/
     NN_FirstName_LastName_Designation.png
     NN_FirstName_LastName_Designation_profile.md
*/
function parseMember(base) {
  var cleaned = base.replace(/^\d+[_\s]/, '');
  var parts = cleaned.split(/[_\-]+/).filter(Boolean);
  if (!parts.length) return { name: fmtName(base), desig: 'Team Member' };
  var first = parts[0];
  var last = parts.length >= 3 ? parts[1] : '';
  var desig = parts.length >= 3 ? parts.slice(2).join(' ') : (parts[1] || 'Team Member');
  var name = cap(first);
  if (last) name += ' ' + (last.length <= 2 ? last.toUpperCase() + '.' : cap(last));
  return { name: name, desig: desig.replace(/\b\w/g, function (m) { return m.toUpperCase(); }) };
}

function loadTeam() {
  if (!ghEnabled()) return Promise.resolve(hydrateDemoTeam());
  return ghJson(ghApi(CFG.github.profilePath)).then(function (files) {
    var imgs = files.filter(function (f) { return /\d+_.+\.png$/i.test(f.name); });
    var members = imgs.map(function (f) {
      var base = f.name.replace(/\.[^.]+$/, '');
      var md = null;
      files.forEach(function (m) { if (m.name === base + '_profile.md') md = m.download_url; });
      var info = parseMember(base);
      return { base: base, name: info.name, desig: info.desig, photo: f.download_url, mdUrl: md, bg: colorFor(info.desig || base) };
    });
    members.sort(function (a, b) { return (parseInt(a.base.match(/^\d+/)) || 0) - (parseInt(b.base.match(/^\d+/)) || 0); });
    return members.length ? members : hydrateDemoTeam();
  }).catch(function (e) { console.warn('[AuroNexta] team fallback →', e); return hydrateDemoTeam(); });
}

function hydrateDemoTeam() {
  return CFG.demoTeam.map(function (m) {
    var info = parseMember(m.base);
    return { base: m.base, name: info.name, desig: info.desig,
             photo: avatarSVG(initials(info.name), m.bg, 300, 300),
             mdText: m.md, mdUrl: null, bg: m.bg };
  });
}

function fetchMd(item) {
  if (item.mdText) return Promise.resolve(item.mdText);
  if (item.mdUrl) return fetch(item.mdUrl).then(function (r) { return r.text(); });
  return Promise.resolve('# ' + esc(item.title || item.name) + '\n\nWhitepaper coming soon.');
}

/* ══ Logo ══ */
var LOGO_IMG = 'AuroNexta_new_logo.png';

/* ══ Header / Footer ══ */
var HEADER_HTML =
  '<header class="site-head">' +
  '<div class="announce">🤖 Agentic Chat Bot is live — automated bookings, 24/7.</div>' +
  '<div class="head-card">' +
  '<div class="head-inner">' +
  '<div class="head-phones">' +
  '<span>📞 +44 123456789</span>' +
  '<a href="index.html" class="logo-link"><img src="' + LOGO_IMG + '" alt="AuroNexta" class="logo-img"></a>' +
  '<span>📞 +91 123456789</span>' +
  '</div>' +
  '<div class="head-actions"><button class="menu-toggle" aria-label="Menu">☰</button></div>' +
  '</div>' +
  '<nav class="nav"></nav>' +
  '</div>' +
  '</header>';

function buildHeader() {
  return HEADER_HTML;
}

/* Inject nav links after DOM ready */
function initNav() {
  var nav = $('.nav');
  if (!nav) return;
  var links = [
    { t: 'Home',     h: 'index.html#top' },
    { t: 'Projects', h: 'index.html#projects' },
    { t: 'About Us', h: 'index.html#about' },
    { t: 'Contact',  h: 'index.html#contact' },
    { t: 'Services', h: 'index.html#services' }
  ];
  links.forEach(function (l) {
    var a = document.createElement('a');
    a.href = l.h; a.textContent = l.t;
    nav.appendChild(a);
  });
}

var FOOTER_HTML =
  '<footer class="site-foot">' +
  '<div>' +
  '<div class="foot-grid">' +
  '<div class="foot-brand">' +
  '<div class="foot-logo"><img src="' + LOGO_IMG + '" alt="AuroNexta" class="logo-img"></div>' +
  '<p><strong>AuroNexta — United Kingdom.</strong> Registered in England &amp; Wales. Agentic automation, AI/ML engineering and full-stack software for European clients with round-the-clock support.</p>' +
  '<p><strong>AuroNexta — India.</strong> R&amp;D hub for robotics, drones and AR. Powers our global delivery and 24-hour engineering coverage.</p>' +
  '</div>' +
  '<div class="foot-col"><h4>Project Works</h4><p>United Kingdom</p><p><strong>+44 123456789</strong></p></div>' +
  '<div class="foot-col"><h4>Services</h4><p>India</p><p><strong>+91 123456789</strong></p></div>' +
  '</div>' +
  '<div class="foot-bar">' +
  '<span><a href="index.html">Terms &amp; Conditions</a> · <a href="index.html">Privacy</a></span>' +
  '<span>© 2026 AuroNexta</span>' +
  '<span>Designed &amp; Developed by VAMSI</span>' +
  '</div></div></footer>';

/* ══ Auto timer (pause on hover/offscreen) ══ */
function autoTimer(region, ms, fn) {
  var t = null, inView = true, hovered = false;
  function start() { if (t || hovered || !inView) return; t = setInterval(fn, ms); }
  function stop() { if (t) { clearInterval(t); t = null; } }
  region.addEventListener('mouseenter', function () { hovered = true; stop(); });
  region.addEventListener('mouseleave', function () { hovered = false; start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; inView ? start() : stop(); }, { threshold: .12 }).observe(region);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  start();
}

/* ═══════════════════════════════════════════════════════════════
   ORBIT ENGINE — professional, responsive
   ═══════════════════════════════════════════════════════════════ */
function initOrbit() {
  var stage = $('#orbitStage');
  if (!stage) return;

  var allHubs = ['web', 'dev', 'ai'];
  var nextHub = { web: 'dev', dev: 'ai', ai: 'web' };
  var icons = CFG.orbit.icons.map(function (c, i) {
    var e = el('div', 'o-icon', c.icon);
    e.style.background = c.bg;
    stage.appendChild(e);
    return { cfg: c, el: e, hub: c.hub, angle: c.phase, rOff: 0, rTarget: 0, x: 0, y: 0, i: i, transferTimer: 0, transferThreshold: 2.5, transitioning: false };
  });

  allHubs.forEach(function (h) {
    for (var r = 0; r < 2; r++) {
      var ring = el('div', 'o-ring');
      ring.dataset.hub = h; ring.dataset.r = r;
      stage.appendChild(ring);
    }
  });

  var hubs = {};
  $$('.hub', stage).forEach(function (h) { hubs[h.dataset.hub] = h; });
  var scale = 1, centers = {};

  function measure() {
    scale = Math.max(.45, Math.min(1, stage.clientWidth / 960));
    centers = {};
    Object.keys(hubs).forEach(function (k) {
      var rc = hubs[k].getBoundingClientRect(), s = stage.getBoundingClientRect();
      centers[k] = { x: rc.left - s.left + rc.width / 2, y: rc.top - s.top + rc.height / 2 };
    });
    $$('.o-ring', stage).forEach(function (ring) {
      var c = centers[ring.dataset.hub];
      if (!c) return;
      var base = (ring.dataset.r === '0' ? 170 : 210);
      var w = base * 2 * scale, ht = base * 1.18 * scale;
      ring.style.width = w + 'px'; ring.style.height = ht + 'px';
      ring.style.left = (c.x - w / 2) + 'px'; ring.style.top = (c.y - ht / 2) + 'px';
      var tiltDeg = ring.dataset.hub === 'web' ? -18 : ring.dataset.hub === 'dev' ? 8 : 16;
      ring.style.transform = 'rotate(' + tiltDeg + 'deg)';
    });
  }

  measure();
  window.addEventListener('resize', measure);

  var perHub = {};
  icons.forEach(function (ic) { perHub[ic.hub] = (perHub[ic.hub] || 0) + 1; });

  function isInOverlap(ic, otherHubKey) {
    var myCenter = centers[ic.hub], otherCenter = centers[otherHubKey];
    if (!myCenter || !otherCenter) return false;
    var dx = ic.x - otherCenter.x, dy = ic.y - otherCenter.y;
    return Math.sqrt(dx * dx + dy * dy) < ((ic.cfg.b + 60) * scale);
  }

  var last = null;
  function tick(ts) {
    if (last === null) last = ts;
    var dt = Math.min(.05, (ts - last) / 1000);
    last = ts;
    var minD = 46 * scale;

    icons.forEach(function (ic) {
      var tilt = ic.hub === 'web' ? -18 : ic.hub === 'dev' ? 8 : 16;
      var slow = 1 / Math.sqrt(perHub[ic.hub] || 1);
      ic.angle += ic.cfg.speed * slow * dt * (1 + ic.rOff / 220);
      var a = (ic.cfg.a + ic.rOff) * scale, b = (ic.cfg.b + ic.rOff) * scale;
      var t = tilt * Math.PI / 180;
      var c = centers[ic.hub];
      if (!c) return;
      var ex = a * Math.cos(ic.angle), ey = b * Math.sin(ic.angle);
      ic.x = c.x + ex * Math.cos(t) - ey * Math.sin(t);
      ic.y = c.y + ex * Math.sin(t) + ey * Math.cos(t);

      var targetHub = nextHub[ic.hub];
      if (isInOverlap(ic, targetHub)) {
        ic.transferTimer += dt;
        var pulse = 1 + .15 * Math.sin(ic.transferTimer * 6);
        ic.el.style.transform = 'translate3d(' + (ic.x - 24) + 'px,' + (ic.y - 24) + 'px,0) scale(' + pulse + ')';
        if (ic.transferTimer >= ic.transferThreshold && !ic.transitioning) {
          ic.transitioning = true; ic.hub = targetHub;
          perHub[ic.hub] = (perHub[ic.hub] || 0) + 1;
          ic.transferTimer = 0;
          setTimeout(function () { ic.transitioning = false; }, 800);
        }
      } else {
        ic.transferTimer = Math.max(0, ic.transferTimer - dt * 2);
      }
    });

    for (var i = 0; i < icons.length; i++) {
      for (var j = i + 1; j < icons.length; j++) {
        if (icons[i].hub !== icons[j].hub) continue;
        var dx = icons[i].x - icons[j].x, dy = icons[i].y - icons[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < minD) { icons[i].rTarget = Math.min(42, icons[i].rTarget + 26 * dt * 10); icons[j].rTarget = Math.max(-26, icons[j].rTarget - 26 * dt * 10); }
      }
    }

    icons.forEach(function (ic) {
      ic.rTarget += (0 - ic.rTarget) * .08;
      ic.rOff += (ic.rTarget - ic.rOff) * .06;
      if (ic.transferTimer < .3) {
        ic.el.style.transform = 'translate3d(' + (ic.x - 24) + 'px,' + (ic.y - 24) + 'px,0)';
      }
    });
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    var running = false;
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !running) { running = true; last = null; requestAnimationFrame(tick); }
      else if (!en[0].isIntersecting) running = false;
    }, { threshold: .05 }).observe(stage);
  } else { requestAnimationFrame(tick); }
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW — click shows in left preview box ONLY (no scroll)
   ═══════════════════════════════════════════════════════════════ */
function initOverview(projects) {
  var region = $('#overview');
  if (!region) return;
  var track = $('#ovTrack'), list = $('#ovList'), prev = $('#ovPreview');
  var items = projects.slice(0, 8);
  if (!items.length) return;

  function makeItem(p, i) {
    var d = el('div', 'ov-item');
    d.innerHTML = '<div class="ov-thumb"><img alt="" src="' + (p.cover || avatarSVG(initials(p.title), colorFor(p.cls))) + '"></div>' +
      '<div class="ov-info"><span class="ov-badge" style="--c:' + colorFor(p.cls) + '">' + esc(p.cls) + '</span><strong>' + esc(p.title) + '</strong></div>';
    d.addEventListener('click', function () { show(i); });
    d.style.cursor = 'pointer';
    return d;
  }

  track.innerHTML = '';
  items.forEach(function (p, i) { track.appendChild(makeItem(p, i)); });

  var VISIBLE = window.innerWidth < 640 ? 3 : 4;
  items.slice(0, VISIBLE).forEach(function (p, i) { track.appendChild(makeItem(p, i + items.length)); });

  function ih() { return track.children[0] ? track.children[0].getBoundingClientRect().height + 16 : 72; }
  function setListH() { list.style.height = (VISIBLE * ih() - 16) + 'px'; }
  setListH();

  var idx = 0;
  function setY(anim) {
    track.style.transition = anim ? 'transform .5s ease' : 'none';
    track.style.transform = 'translateY(' + (-idx * ih()) + 'px)';
  }

  function show(i) {
    var p = items[((i % items.length) + items.length) % items.length];
    prev.classList.add('swap');
    setTimeout(function () {
      $('#ovImg').src = p.cover || avatarSVG(initials(p.title), colorFor(p.cls));
      $('#ovTitle').textContent = p.title;
      $('#ovDesc').textContent = p.desc || 'Click to view whitepaper';
      prev.classList.remove('swap');
    }, 220);
    var allItems = $$('.ov-item', track);
    var modI = i % items.length;
    allItems.forEach(function (n, k) {
      n.classList.toggle('active', k % (items.length + VISIBLE) === modI || k === modI);
    });
  }

  function step() { idx++; setY(true); if (idx >= items.length) { setTimeout(function () { idx = 0; setY(false); }, 560); } show(idx); }
  show(0); setY(false);
  window.addEventListener('resize', function () { setListH(); setY(false); });
  autoTimer(region, 4000, step);
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS GRID
   ═══════════════════════════════════════════════════════════════ */
function renderProjects(projects, limit) {
  var grid = $('#projGrid');
  if (!grid) return;
  grid.innerHTML = '';
  var shown = limit ? projects.slice(0, limit) : projects;
  shown.forEach(function (p, i) {
    var c = el('article', 'p-card');
    c.dataset.title = p.title;
    c.style.animationDelay = (i * .06) + 's';
    c.innerHTML =
      '<div class="p-media"><img loading="lazy" alt="' + esc(p.title) + '" src="' + (p.cover || avatarSVG(initials(p.title), colorFor(p.cls))) + '"></div>' +
      '<span class="p-badge" style="--c:' + colorFor(p.cls) + '">' + esc(p.cls) + '</span>' +
      '<div class="p-info"><h3>' + esc(p.title) + '</h3>' + (p.desc ? '<p>' + esc(p.desc) + '</p>' : '') + '</div>';
    c.addEventListener('click', function () { openWhitepaper(p); });
    grid.appendChild(c);
  });
  var vm = $('#viewMoreWrap');
  if (vm) vm.classList.toggle('hidden', !limit || projects.length <= limit);
}

/* ── Cache for computed read-times ── */
var readTimeCache = {};

/* ══ FULL-SCREEN whitepaper modal ══ */
function openWhitepaper(p) {
  var m = $('#wpModal');
  if (!m) return;
  $('#wpTitle').textContent = p.title;
  var b = $('#wpCls');
  b.textContent = p.cls;
  b.style.setProperty('--c', colorFor(p.cls));
  $('#wpBody').innerHTML = '<div class="wp-loading"><div class="wp-spinner"></div><p>Loading whitepaper…</p></div>';
  $('#wpMeta').innerHTML = 'AuroNexta Whitepaper · ' + esc(p.cls) + ' · <span class="read-time" aria-label="Estimated reading time">estimating…</span>';
  openModal(m);
  m.classList.add('wp-fullscreen');
  fetchMd(p).then(function (md) {
    var html = mdToHtml(md);
    $('#wpBody').innerHTML = html;
    var rt = readTime(md);
    readTimeCache[p.slug] = rt;
    $('#wpMeta').innerHTML = 'AuroNexta Whitepaper · ' + esc(p.cls) + ' · <span class="read-time" aria-label="Estimated reading time">' + rt + ' read</span>';
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEAM marquee + INLINE full-profile modal
   ═══════════════════════════════════════════════════════════════ */
function renderTeam(team) {
  var track = $('#teamTrack');
  if (!track) return;

  function half() {
    var h = el('div', 'team-half');
    team.forEach(function (m) {
      var c = el('div', 't-member');
      c.innerHTML =
        '<div class="t-photo"><img loading="lazy" alt="' + esc(m.name) + '" src="' + m.photo + '"></div>' +
        '<div class="t-bar" style="--c:' + m.bg + '"><div class="t-name">' + esc(m.name) + '</div><span class="t-desig">' + esc(m.desig) + '</span></div>';
      c.addEventListener('click', function () { openMember(m); });
      h.appendChild(c);
    });
    return h;
  }

  track.innerHTML = '';
  track.appendChild(half());
  track.appendChild(half());

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { track.classList.toggle('paused', !en[0].isIntersecting); }, { threshold: .05 }).observe(track);
  }
}

function openMember(m) {
  var modal = $('#tmModal');
  if (!modal) return;
  $('#tmImg').src = m.photo;
  $('#tmName').textContent = m.name;
  $('#tmDesig').textContent = m.desig;
  $('#tmBody').innerHTML = '<div class="wp-loading"><div class="wp-spinner"></div><p>Loading profile…</p></div>';
  var linkedinEl = $('#tmLinkedin');
  if (linkedinEl) {
    var info = parseMember(m.base);
    var slug = info.name.toLowerCase().replace(/\s+/g, '-');
    linkedinEl.href = 'https://www.linkedin.com/in/' + slug + '-' + info.desig.toLowerCase().replace(/\s+/g, '-') + '-auronexta';
    linkedinEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> View LinkedIn Profile';
  }
  openModal(modal);
  modal.classList.add('tm-fullscreen');
  fetchMd(m).then(function (md) { $('#tmBody').innerHTML = mdToHtml(md); });
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS wheel — full 360° circle, unified card size
   ═══════════════════════════════════════════════════════════════ */
function initTestimonials() {
  var region = $('.t-region');
  if (!region) return;
  var wheel = $('#tWheel');
  var data = CFG.demoTestimonials;
  if (!data || !data.length) return;

  var spacing = 24;
  var needed = Math.ceil(360 / spacing);
  var filled = [];
  while (filled.length < needed) filled = filled.concat(data);
  filled = filled.slice(0, needed);

  var R = window.innerWidth < 600 ? 400 : window.innerWidth < 900 ? 480 : 580, rot = 0;
  wheel.innerHTML = '';
  var cards = filled.map(function (t, i) {
    var c = el('div', 't-card');
    c.innerHTML =
      '<div class="t-avatar"><img loading="lazy" alt="" src="' + avatarSVG(initials(t.name), t.bg, 80, 80) + '"></div>' +
      '<div class="t-msg"><p>' + esc(t.msg) + '</p><strong>' + esc(t.name) + '</strong></div>';
    wheel.appendChild(c);
    return c;
  });

  function norm(a) { a = ((a % 360) + 540) % 360 - 180; return a; }
  function layout() {
    cards.forEach(function (c, i) {
      var a = i * spacing + rot;
      c.style.transform = 'rotate(' + a + 'deg) translateY(-' + R + 'px)';
      c.classList.toggle('dim', Math.abs(norm(a)) > spacing);
    });
  }
  layout();
  window.addEventListener('resize', function () { R = window.innerWidth < 600 ? 360 : window.innerWidth < 900 ? 440 : 520; layout(); });
  autoTimer(region, 5000, function () { rot -= spacing; layout(); });
}

/* ══ Modals ══ */
function openModal(m) { m.hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal(m) { m.hidden = true; document.body.style.overflow = ''; m.classList.remove('wp-fullscreen', 'tm-fullscreen'); }

$$('.modal').forEach(function (m) {
  $$('[data-close]', m).forEach(function (x) {
    x.addEventListener('click', function () { closeModal(m); });
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    $$('.modal').forEach(function (m) { closeModal(m); });
    closeFab();
  }
});

/* ══ FAB radial menu ══ */
var fabEl = $('#fab');
var fabIcons = ['↑', '⚡', '◉', 'ℹ', '◆', '👥', '★', '✉'];

function buildFab() {
  if (!fabEl) return;
  fabEl.innerHTML = '';
  var x = el('button', 'fab-center', '✕');
  x.addEventListener('click', closeFab);
  fabEl.appendChild(x);

  var links = CFG.fab.links, n = links.length;
  links.forEach(function (l, i) {
    var a = el('a', 'fab-btn');
    a.href = l.href;
    a.innerHTML = '<span class="fab-icon">' + (fabIcons[i] || '●') + '</span><span class="fab-label">' + l.label + '</span>';
    var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    a.style.setProperty('--tx', Math.cos(ang) * CFG.fab.radius + 'px');
    a.style.setProperty('--ty', Math.sin(ang) * CFG.fab.radius + 'px');
    a.addEventListener('click', function (e) { e.preventDefault(); closeFab(); var t = l.href.split('#')[1]; var el2 = t && document.getElementById(t); if (el2) el2.scrollIntoView({ behavior: 'smooth' }); else window.location = l.href; });
    fabEl.appendChild(a);
  });
}

function openFab(x, y) {
  if (!fabEl) return;
  var r = CFG.fab.radius + 70;
  x = Math.max(r, Math.min(window.innerWidth - r, x));
  y = Math.max(r, Math.min(window.innerHeight - r, y));
  fabEl.style.left = x + 'px'; fabEl.style.top = y + 'px';
  fabEl.hidden = false;
  requestAnimationFrame(function () { fabEl.classList.add('open'); });
}

function closeFab() {
  if (!fabEl) return;
  fabEl.classList.remove('open');
  setTimeout(function () { fabEl.hidden = true; }, 220);
}

document.addEventListener('contextmenu', function (e) {
  if (window.getSelection && window.getSelection().toString()) return;
  if (e.target.closest('a,button,input,textarea,select,label,form,.modal,.fab,img,video')) return;
  e.preventDefault(); buildFab(); openFab(e.clientX, e.clientY);
});

document.addEventListener('click', function (e) {
  if (!fabEl.hidden && !e.target.closest('.fab')) closeFab();
});

/* ══ Contact form ══ */
function initContact() {
  var f = $('#contactForm');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var st = $('#formStatus');
    st.className = ''; st.textContent = '';
    if (f.company.value) { st.textContent = 'Spam trapped.'; return; }
    var d = { name: f.name.value.trim(), email: f.email.value.trim(), subject: f.subject.value.trim(), message: f.message.value.trim() };
    if (!d.name || !d.subject || !d.message) { st.className = 'err'; st.textContent = 'Please fill all fields.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { st.className = 'err'; st.textContent = 'Please enter a valid email address.'; return; }
    st.textContent = 'Sending…';
    fetch('mail/send.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok) { st.className = 'ok'; st.textContent = '✅ Message sent! We reply within 24 hours.'; f.reset(); }
        else { st.className = 'err'; st.textContent = '⚠️ ' + (j.error || 'Send failed.'); }
      })
      .catch(function () { st.className = 'err'; st.textContent = '⚠️ Mail service unreachable.'; });
  });
}

/* ══ Scroll reveal ══ */
function initReveal() {
  $$('.card, .about-card, .sec-pill, .p-card, .t-member').forEach(function (e) { e.classList.add('reveal'); });
  if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .08 });
  $$('.reveal').forEach(function (e) { io.observe(e); });
}

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  var page = document.body.dataset.page;

  $$('[data-include="header"]').forEach(function (n) { n.outerHTML = buildHeader(); });
  $$('[data-include="footer"]').forEach(function (n) { n.outerHTML = FOOTER_HTML; });

  initNav();

  /* Menu toggle */
  var toggle = $('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var nav = $('.nav');
      if (nav) nav.classList.toggle('nav-open');
      toggle.textContent = nav && nav.classList.contains('nav-open') ? '✕' : '☰';
    });
  }

  initReveal();
  if (page === 'index') { initOrbit(); initTestimonials(); initContact(); }

  loadProjects().then(function (projects) {
    if (page === 'index') { renderProjects(projects, 6); initOverview(projects); }
    else renderProjects(projects, 0);
  });

  if (page === 'index') loadTeam().then(renderTeam);
});

})();
