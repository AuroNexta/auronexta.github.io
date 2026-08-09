/* ═══════════════════════════════════════════════════════════════
   AURONEXTA main.js — v2 with interlinked orbit, clickable overview,
   full-screen whitepaper, inline team profiles.
════════════════════════════════════════════════════════════════ */
(function () {
"use strict";

var CFG = SITE_JSON;

/* ---------- DOM helpers ---------- */
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
    '<circle cx="50%" cy="42%" r="56" fill="rgba(255,255,255,.9)"/>' +
    '<text x="50%" y="42%" dy=".35em" font-family="Arial" font-size="44" font-weight="700" text-anchor="middle" fill="' + bg + '">' + esc(text) + '</text>' +
    '<rect y="78%" width="100%" height="22%" fill="rgba(0,0,0,.28)"/></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
}

/* ---------- Markdown renderer ---------- */
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

/* ---------- GitHub loader ---------- */
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

function loadProjects() {
  if (!ghEnabled()) return Promise.resolve(hydrateDemoProjects());
  return ghJson(ghApi(CFG.github.projectsPath)).then(function (classes) {
    var dirs = classes.filter(function (d) { return d.type === 'dir'; });
    return Promise.all(dirs.map(function (c) {
      return ghJson(ghApi(CFG.github.projectsPath + '/' + c.name)).then(function (items) {
        return Promise.all(items.filter(function (d) { return d.type === 'dir'; }).map(function (p) {
          return ghJson(ghApi(p.path)).then(function (files) {
            var img = null, md = null;
            files.forEach(function (f) {
              if (/\.(png|jpe?g|svg|webp|gif)$/i.test(f.name)) img = f.download_url;
              if (/^whitepaper\.md$/i.test(f.name)) md = f.download_url;
            });
            return { title: fmtName(p.name), cls: fmtClass(c.name), cover: img, mdUrl: md, slug: p.path };
          });
        }));
      });
    }));
  }).then(function (arr) {
    var flat = [];
    arr.forEach(function (a) { flat = flat.concat(a); });
    return flat.length ? flat : hydrateDemoProjects();
  }).catch(function (e) {
    console.warn('[AuroNexta] projects fallback →', e);
    return hydrateDemoProjects();
  });
}

function hydrateDemoProjects() {
  return CFG.demoProjects.map(function (p) {
    return { title: p.title, cls: fmtClass(p.cls), cover: avatarSVG(initials(p.title), colorFor(p.cls)),
             mdText: p.md, mdUrl: null, slug: p.title, desc: p.desc };
  });
}

function parseMember(base) {
  var parts = base.split(/[_\-\s]+/).filter(Boolean);
  var first = parts[0] || '', last = '', desig = '';
  if (parts.length === 2) { desig = parts[1]; }
  else if (parts.length >= 3) { last = parts[1]; desig = parts.slice(2).join(' '); }
  var name = cap(first) + (last ? (last.length === 1 ? ' ' + last.toUpperCase() + '.' : ' ' + cap(last)) : '');
  return { name: name, desig: desig.replace(/\b\w/g, function (m) { return m.toUpperCase(); }) };
}

function loadTeam() {
  if (!ghEnabled()) return Promise.resolve(hydrateDemoTeam());
  return ghJson(ghApi(CFG.github.profilePath)).then(function (files) {
    var imgs = files.filter(function (f) { return /\.(png|jpe?g|webp)$/i.test(f.name); });
    var members = imgs.map(function (f) {
      var base = f.name.replace(/\.[^.]+$/, '');
      var md = null;
      files.forEach(function (m) { if (m.name === base + '.md') md = m.download_url; });
      var info = parseMember(base);
      return { base: base, name: info.name, desig: info.desig, photo: f.download_url, mdUrl: md, bg: colorFor(info.desig || base) };
    });
    return members.length ? members : hydrateDemoTeam();
  }).catch(function (e) {
    console.warn('[AuroNexta] team fallback →', e);
    return hydrateDemoTeam();
  });
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

/* ---------- shared header / footer ---------- */
var LOGO_IMG = 'AuroNexta_new_logo.png';
var LOGO_HTML = '<a href="index.html" class="logo-link"><img src="' + LOGO_IMG + '" alt="AuroNexta" class="logo-img"></a>';

var HEADER_HTML =
  '<div class="head-card">' +
  '<div class="announce">🤖 Agentic Chat Bot is live — automated bookings, 24/7.</div>' +
  '<div class="head-inner">' +
  '<div class="head-phones"><span>📞 +44 123456789</span><span>📞 +91 123456789</span></div>' +
  '<div class="logo">' + LOGO_HTML + '</div>' +
  '<div class="head-actions"><button class="menu-toggle" aria-label="Menu">☰</button></div>' +
  '</div>' +
  '<nav class="nav" aria-label="Primary">' +
  '<a href="index.html#top">Home</a>' +
  '<a href="index.html#projects">Projects</a>' +
  '<a href="index.html#about">About Us</a>' +
  '<a href="index.html#contact">Contact Us</a>' +
  '<a href="index.html#services">Services</a>' +
  '</nav></div>';

function buildHeader() {
  var page = document.body.dataset.page;
  var backBtn = (page !== 'index') ? '<a href="index.html" class="back-home">← Back to Home</a>' : '';
  return backBtn + HEADER_HTML;
}

var FOOTER_HTML =
  '<footer id="footer"><div class="foot-card"><div class="foot-grid">' +
  '<div class="foot-brand">' +
  '<div class="logo" style="text-align:left;margin-bottom:8px"><img src="' + LOGO_IMG + '" alt="AuroNexta" class="logo-img" style="max-height:40px"></div>' +
  '<p><strong>AuroNexta — United Kingdom.</strong> Registered in England &amp; Wales. We deliver agentic automation, AI/ML engineering and full-stack software to clients across Europe, with support that follows the sun.</p>' +
  '<p><strong>AuroNexta — India.</strong> Our R&amp;D hub for robotics, drones and AR. The India lab powers our global delivery network and round-the-clock engineering coverage.</p>' +
  '</div>' +
  '<div class="foot-col"><h4>Project Works</h4><p>AuroNexta · United Kingdom</p><p><strong>+44 123456789</strong></p></div>' +
  '<div class="foot-col"><h4>Services</h4><p>AuroNexta · India</p><p><strong>+91 123456789</strong></p></div>' +
  '</div>' +
  '<div class="foot-bar">' +
  '<span><a href="index.html">Terms &amp; Conditions</a> | <a href="index.html">Privacy</a></span>' +
  '<span>© 2026 AuroNexta</span>' +
  '<span>Designed &amp; Developed by VAMSI</span>' +
  '</div></div></footer>';

/* ---------- auto timer ---------- */
function autoTimer(region, ms, fn) {
  var t = null, inView = true, hovered = false;
  function start() { if (t || hovered || !inView) return; t = setInterval(fn, ms); }
  function stop() { if (t) { clearInterval(t); t = null; } }
  region.addEventListener('mouseenter', function () { hovered = true; stop(); });
  region.addEventListener('mouseleave', function () { hovered = false; start(); });
  region.addEventListener('focusin', function () { hovered = true; stop(); });
  region.addEventListener('focusout', function () { hovered = false; start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      inView ? start() : stop();
    }, { threshold: .12 }).observe(region);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  start();
}

/* ═══════════════════════════════════════════════════════════════
   ORBIT ENGINE v2 — INTERLINKED: icons transfer between hubs
   when they enter overlap regions between adjacent orbits.
   ═══════════════════════════════════════════════════════════════ */
function initOrbit() {
  var stage = $('#orbitStage');
  if (!stage) return;

  var allHubs = ['web', 'dev', 'ai'];
  var hubOrder = { web: 0, dev: 1, ai: 2 };
  var nextHub = { web: 'dev', dev: 'ai', ai: 'web' };

  // Icons with cross-hub capability
  var icons = CFG.orbit.icons.map(function (c, i) {
    var e = el('div', 'o-icon', c.icon);
    e.style.background = c.bg;
    stage.appendChild(e);
    return {
      cfg: c,
      el: e,
      hub: c.hub,                          // current hub
      angle: c.phase,
      rOff: 0, rTarget: 0,
      x: 0, y: 0, i: i,
      transferTimer: 0,                     // time spent in overlap
      transferThreshold: 2.5,               // seconds before transfer
      transitioning: false
    };
  });

  // Dashed decorative rings (2 per hub)
  allHubs.forEach(function (h) {
    for (var r = 0; r < 2; r++) {
      var ring = el('div', 'o-ring');
      ring.dataset.hub = h;
      ring.dataset.r = r;
      stage.appendChild(ring);
    }
  });

  var hubs = {};
  $$('.hub', stage).forEach(function (h) { hubs[h.dataset.hub] = h; });
  var scale = 1, centers = {};

  function measure() {
    scale = Math.max(.5, Math.min(1, stage.clientWidth / 1000));
    centers = {};
    Object.keys(hubs).forEach(function (k) {
      var r = hubs[k].getBoundingClientRect(), s = stage.getBoundingClientRect();
      centers[k] = { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
    });
    $$('.o-ring', stage).forEach(function (ring) {
      var c = centers[ring.dataset.hub];
      if (!c) return;
      var base = (ring.dataset.r === '0' ? 170 : 210);
      var w = base * 2 * scale, ht = base * 1.18 * scale;
      ring.style.width = w + 'px';
      ring.style.height = ht + 'px';
      ring.style.left = (c.x - w / 2) + 'px';
      ring.style.top = (c.y - ht / 2) + 'px';
      var tiltDeg = ring.dataset.hub === 'web' ? -18 : ring.dataset.hub === 'dev' ? 8 : 16;
      ring.style.transform = 'rotate(' + tiltDeg + 'deg)';
    });
  }

  measure();
  window.addEventListener('resize', measure);

  var perHub = {};
  icons.forEach(function (ic) { perHub[ic.hub] = (perHub[ic.hub] || 0) + 1; });

  // Overlap detection: icon is in overlap zone when distance to adjacent hub center
  // is less than the overlap radius (sum of their ellipse minor axes / 2)
  function isInOverlap(ic, otherHubKey) {
    var myCenter = centers[ic.hub];
    var otherCenter = centers[otherHubKey];
    if (!myCenter || !otherCenter) return false;
    var dx = ic.x - otherCenter.x, dy = ic.y - otherCenter.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var overlapRadius = ((ic.cfg.b + 60) * scale); // ~overlap zone
    return dist < overlapRadius;
  }

  var last = null;
  function tick(ts) {
    if (last === null) last = ts;
    var dt = Math.min(.05, (ts - last) / 1000);
    last = ts;
    var minD = 46 * scale;

    icons.forEach(function (ic) {
      var hubCfg = CFG.orbit.hubs[ic.hub];
      var tilt = ic.cfg.tilt;
      var aVal = ic.cfg.a, bVal = ic.cfg.b;
      // Use current hub's tilt
      tilt = ic.hub === 'web' ? -18 : ic.hub === 'dev' ? 8 : 16;

      var slow = 1 / Math.sqrt(perHub[ic.hub] || 1);
      ic.angle += ic.cfg.speed * slow * dt * (1 + ic.rOff / 220);

      var a = (aVal + ic.rOff) * scale;
      var b = (bVal + ic.rOff) * scale;
      var t = tilt * Math.PI / 180;
      var c = centers[ic.hub];
      if (!c) return;

      var ex = a * Math.cos(ic.angle), ey = b * Math.sin(ic.angle);
      ic.x = c.x + ex * Math.cos(t) - ey * Math.sin(t);
      ic.y = c.y + ex * Math.sin(t) + ey * Math.cos(t);

      // Overlap transfer logic
      var targetHub = nextHub[ic.hub];
      if (isInOverlap(ic, targetHub)) {
        ic.transferTimer += dt;
        // Visual indicator: pulse the icon
        var pulse = 1 + 0.15 * Math.sin(ic.transferTimer * 6);
        ic.el.style.transform = 'translate3d(' + (ic.x - 20) + 'px,' + (ic.y - 20) + 'px,0) scale(' + pulse + ')';

        if (ic.transferTimer >= ic.transferThreshold && !ic.transitioning) {
          // TRANSFER: switch hub
          ic.transitioning = true;
          ic.hub = targetHub;
          perHub[ic.hub] = (perHub[ic.hub] || 0) + 1;
          // Re-set angle for new hub to avoid jump
          ic.angle = ic.angle; // keep momentum
          ic.transferTimer = 0;
          ic.el.style.background = CFG.orbit.icons[ic.i].bg; // restore bg
          setTimeout(function () { ic.transitioning = false; }, 800);
        }
      } else {
        ic.transferTimer = Math.max(0, ic.transferTimer - dt * 2);
      }
    });

    // Collision avoidance within same hub
    for (var i = 0; i < icons.length; i++) {
      for (var j = i + 1; j < icons.length; j++) {
        if (icons[i].hub !== icons[j].hub) continue;
        var A = icons[i], B = icons[j];
        var dx = A.x - B.x, dy = A.y - B.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < minD) {
          A.rTarget = Math.min(42, A.rTarget + 26 * dt * 10);
          B.rTarget = Math.max(-26, B.rTarget - 26 * dt * 10);
        }
      }
    }

    icons.forEach(function (ic) {
      if (ic.rTarget > 0) ic.rTarget = Math.max(0, ic.rTarget - 14 * dt * 10);
      if (ic.rTarget < 0) ic.rTarget = Math.min(0, ic.rTarget + 14 * dt * 10);
      ic.rOff += (ic.rTarget - ic.rOff) * .06;
      if (ic.transferTimer < 0.3) {
        ic.el.style.transform = 'translate3d(' + (ic.x - 20) + 'px,' + (ic.y - 20) + 'px,0)';
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
  } else {
    requestAnimationFrame(tick);
  }
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW v2 — click scrolls to matching project card
   ═══════════════════════════════════════════════════════════════ */
function initOverview(projects) {
  var region = $('#overview');
  if (!region) return;
  var track = $('#ovTrack'), list = $('#ovList'), prev = $('#ovPreview');
  var items = projects.slice(0, 8);
  if (!items.length) return;

  function makeItem(p, i) {
    var d = el('div', 'ov-item');
    d.innerHTML = '<div class="th"><img alt="" src="' + (p.cover || avatarSVG(initials(p.title), colorFor(p.cls))) + '"></div>' +
      '<div><b>' + esc(p.title) + '</b><small>' + esc(p.cls) + '</small></div>';
    d.dataset.i = i % items.length;
    // Click → scroll to matching project card
    d.addEventListener('click', function () {
      var idx = parseInt(d.dataset.i);
      var projCards = $$('.p-card');
      for (var c = 0; c < projCards.length; c++) {
        var cardTitle = projCards[c].querySelector('strong');
        if (cardTitle && cardTitle.textContent.indexOf(p.title) > -1) {
          projCards[c].scrollIntoView({ behavior: 'smooth', block: 'center' });
          projCards[c].style.transition = 'box-shadow .3s';
          projCards[c].style.boxShadow = '0 0 0 3px ' + colorFor(p.cls) + ', ' + projCards[c].style.boxShadow;
          setTimeout(function (card) { card.style.boxShadow = ''; }, 2500, projCards[c]);
          return;
        }
      }
      // If not on this page, go to projects section
      var projectsSec = $('#projects');
      if (projectsSec) projectsSec.scrollIntoView({ behavior: 'smooth' });
    });
    d.style.cursor = 'pointer';
    return d;
  }

  track.innerHTML = '';
  items.forEach(function (p, i) { track.appendChild(makeItem(p, i)); });

  var VISIBLE = window.innerWidth < 640 ? 3 : 5;
  items.slice(0, VISIBLE).forEach(function (p, i) { track.appendChild(makeItem(p, i + items.length)); });

  function ih() { return track.children[0] ? track.children[0].getBoundingClientRect().height + 14 : 86; }
  function setListH() { list.style.height = (VISIBLE * ih() - 14) + 'px'; }
  setListH();

  var idx = 0;
  function setY(anim) {
    track.style.transition = anim ? 'transform .6s ease' : 'none';
    track.style.transform = 'translateY(' + (-idx * ih()) + 'px)';
  }

  function show(i) {
    var p = items[((i % items.length) + items.length) % items.length];
    prev.classList.add('swap');
    setTimeout(function () {
      $('#ovImg').src = p.cover || avatarSVG(initials(p.title), colorFor(p.cls));
      $('#ovTitle').textContent = p.title;
      $('#ovDesc').textContent = p.desc || 'Click to see this project →';
      var b = $('#ovCls');
      b.textContent = p.cls;
      b.style.setProperty('--c', colorFor(p.cls));
      prev.classList.remove('swap');
    }, 250);
    $$('.ov-item', track).forEach(function (n, k) {
      n.classList.toggle('active', k === (i % items.length));
    });
  }

  function step() {
    idx++;
    setY(true);
    if (idx >= items.length) {
      setTimeout(function () { idx = 0; setY(false); }, 640);
    }
    show(idx);
  }

  show(0);
  setY(false);
  window.addEventListener('resize', function () { setListH(); setY(false); });
  autoTimer(region, 3500, step);
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS GRID + FULL-SCREEN whitepaper modal (v2)
   Badge left-aligned, professional layout
   ═══════════════════════════════════════════════════════════════ */
function renderProjects(projects, limit) {
  var grid = $('#projGrid');
  if (!grid) return;
  grid.innerHTML = '';
  var shown = limit ? projects.slice(0, limit) : projects;
  shown.forEach(function (p, i) {
    var c = el('article', 'p-card');
    c.dataset.title = p.title;
    c.style.animationDelay = (i * .07) + 's';
    c.innerHTML = '<div class="p-media"><img loading="lazy" alt="' + esc(p.title) + '" src="' + (p.cover || avatarSVG(initials(p.title), colorFor(p.cls))) + '"></div>' +
      '<span class="p-badge" style="--c:' + colorFor(p.cls) + '">' + esc(p.cls) + '</span>' +
      '<div class="p-bar"><strong>' + esc(p.title) + '</strong><span class="rt">5min ⛶</span></div>';
    c.addEventListener('click', function () { openWhitepaper(p); });
    grid.appendChild(c);
  });
  var vm = $('#viewMoreWrap');
  if (vm) vm.classList.toggle('hidden', !limit || projects.length <= limit);
}

/* Full-screen whitepaper modal */
function openWhitepaper(p) {
  var m = $('#wpModal');
  if (!m) return;
  // Badge LEFT-aligned (before title), close button far RIGHT
  $('#wpTitle').textContent = p.title;
  var b = $('#wpCls');
  b.textContent = p.cls;
  b.style.setProperty('--c', colorFor(p.cls));
  b.classList.add('wp-badge-left');
  $('#wpMeta').textContent = 'AuroNexta Whitepaper · class: ' + p.cls + ' · estimated read: 5 min';
  $('#wpBody').innerHTML = '<div class="wp-loading"><div class="wp-spinner"></div><p>Loading whitepaper…</p></div>';
  openModal(m);
  m.classList.add('wp-fullscreen');
  fetchMd(p).then(function (md) { $('#wpBody').innerHTML = mdToHtml(md); });
}

/* ═══════════════════════════════════════════════════════════════
   TEAM marquee + INLINE full-profile modal (v2)
   No separate page — shows full resume inline with LinkedIn
   ═══════════════════════════════════════════════════════════════ */
function renderTeam(team) {
  var track = $('#teamTrack');
  if (!track) return;

  function half() {
    var h = el('div', 'team-half');
    team.forEach(function (m) {
      var c = el('div', 't-member');
      c.innerHTML = '<div class="t-photo"><img loading="lazy" alt="' + esc(m.name) + '" src="' + m.photo + '"></div>' +
        '<div class="t-bar" style="--c:' + m.bg + '"><b>' + esc(m.name) + '</b><small>' + esc(m.desig) + '</small></div>';
      c.addEventListener('click', function () { openMember(m); });
      h.appendChild(c);
    });
    return h;
  }

  track.innerHTML = '';
  track.appendChild(half());
  track.appendChild(half());

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      track.classList.toggle('paused', !en[0].isIntersecting);
    }, { threshold: .05 }).observe(track);
  }
}

/* Inline full-profile modal — replaces mini modal + resume page */
function openMember(m) {
  var modal = $('#tmModal');
  if (!modal) return;

  var info = parseMember(m.base);
  $('#tmImg').src = m.photo;
  $('#tmName').textContent = m.name;
  $('#tmDesig').textContent = m.desig;
  $('#tmBody').innerHTML = '<div class="wp-loading"><div class="wp-spinner"></div><p>Loading profile…</p></div>';
  // LinkedIn button
  var linkedinEl = $('#tmLinkedin');
  if (linkedinEl) {
    linkedinEl.href = linkedinUrl(m.base);
    linkedinEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> View LinkedIn Profile';
  }
  // Remove "View Full Resume" button since we show everything inline
  var resumeLink = $('#tmResume');
  if (resumeLink) resumeLink.classList.add('hidden');

  openModal(modal);
  modal.classList.add('tm-fullscreen');
  fetchMd(m).then(function (md) { $('#tmBody').innerHTML = mdToHtml(md); });
}

/* Build LinkedIn URL from base name */
function linkedinUrl(base) {
  var info = parseMember(base);
  var slug = info.name.toLowerCase().replace(/\s+/g, '-');
  return 'https://www.linkedin.com/in/' + slug + '-' + info.desig.toLowerCase().replace(/\s+/g, '-') + '-auronexta';
}

/* ---------- TESTIMONIALS wheel ---------- */
function initTestimonials() {
  var region = $('.t-region');
  if (!region) return;
  var wheel = $('#tWheel');
  var data = CFG.demoTestimonials;
  if (!data || !data.length) return;
  // Fill full 360° circle — repeat testimonials until we cover 360°
  var spacing = 24; // degrees between cards
  var needed = Math.ceil(360 / spacing); // 15 cards for full circle
  var filled = [];
  while (filled.length < needed) {
    filled = filled.concat(data);
  }
  filled = filled.slice(0, needed);
  var N = filled.length, R = window.innerWidth < 600 ? 380 : 460, rot = 0;
  wheel.innerHTML = '';
  var cards = filled.map(function (t, i) {
    var c = el('div', 't-card');
    c.innerHTML = '<div class="t-media"><img loading="lazy" alt="' + esc(t.name) + '" src="' + avatarSVG(initials(t.name), t.bg) + '"></div>' +
      '<div class="t-msg"><strong>' + esc(t.name) + '</strong><br>' + esc(t.msg) + '</div>';
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
  window.addEventListener('resize', function () { R = window.innerWidth < 600 ? 380 : 460; layout(); });
  autoTimer(region, 5000, function () { rot -= spacing; layout(); });
}

/* ---------- MODALS ---------- */
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

/* ---------- FAB radial menu ---------- */
var fabEl = $('#fab');
function buildFab() {
  if (!fabEl) return;
  fabEl.innerHTML = '';
  var x = el('button', 'fab-center', '✕');
  x.addEventListener('click', closeFab);
  fabEl.appendChild(x);
  var links = CFG.fab.links, n = links.length;
  var colors = ['#c4009c', '#c96a00', '#7a00d6', '#009a2d', '#c40000', '#0063d1', '#00c395', '#3a2dbb'];
  links.forEach(function (l, i) {
    var a = el('a', 'fab-btn', l.label);
    a.href = l.href;
    var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    a.style.setProperty('--tx', Math.cos(ang) * CFG.fab.radius + 'px');
    a.style.setProperty('--ty', Math.sin(ang) * CFG.fab.radius + 'px');
    a.style.background = colors[i % 8];
    a.addEventListener('click', function (e) { e.preventDefault(); closeFab(); });
    fabEl.appendChild(a);
  });
}
function openFab(x, y) {
  if (!fabEl) return;
  var r = CFG.fab.radius + 60;
  x = Math.max(r, Math.min(window.innerWidth - r, x));
  y = Math.max(r, Math.min(window.innerHeight - r, y));
  fabEl.style.left = x + 'px';
  fabEl.style.top = y + 'px';
  fabEl.hidden = false;
  requestAnimationFrame(function () { fabEl.classList.add('open'); });
}
function closeFab() {
  if (!fabEl) return;
  fabEl.classList.remove('open');
  setTimeout(function () { fabEl.hidden = true; }, 200);
}
document.addEventListener('contextmenu', function (e) {
  if (window.getSelection && window.getSelection().toString()) return;
  if (e.target.closest('a,button,input,textarea,select,label,form,.modal,.fab,img,video')) return;
  e.preventDefault();
  buildFab();
  openFab(e.clientX, e.clientY);
});
document.addEventListener('click', function (e) {
  if (!fabEl.hidden && !e.target.closest('.fab')) closeFab();
});

/* ---------- CONTACT form ---------- */
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

/* ---------- scroll reveal ---------- */
function initReveal() {
  $$('.card, .about-card, .sec-pill').forEach(function (e) { e.classList.add('reveal'); });
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
    });
  }, { threshold: .1 });
  $$('.reveal').forEach(function (e) { io.observe(e); });
}

/* ---------- BOOT ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var page = document.body.dataset.page;
  $$('[data-include="header"]').forEach(function (n) { n.outerHTML = buildHeader(); });
  $$('[data-include="footer"]').forEach(function (n) { n.outerHTML = FOOTER_HTML; });
  // Menu toggle: show/hide nav on mobile
  var toggle = $('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var nav = $('.nav');
      if (nav) nav.classList.toggle('nav-open');
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
