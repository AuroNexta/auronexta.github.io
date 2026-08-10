/* ═══════════════════════════════════════════════════════════════════════
   AURONEXTA — GOLD VERSION TWO
   main.js
   ═══════════════════════════════════════════════════════════════════════ */
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

/* ── Auto read-time ── */
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

/* ── GitHub Projects Loader ── */
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

/* ── GitHub Team / Profile Loader ── */
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
  var members = Array.isArray(CFG.demoTeam[0]) ? CFG.demoTeam.flat() : CFG.demoTeam;
  return members.map(function (m) {
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
   STICKY HEADER — adds shadow on scroll
   ═══════════════════════════════════════════════════════════════ */
function initStickyHeader() {
  var header = $('#siteHeader');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  var toggle = $('#menuToggle');
  var nav = $('#mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    nav.classList.toggle('nav-open');
  });
  // Close menu on nav item click
  $$('.nav-item', nav).forEach(function (item) {
    item.addEventListener('click', function () {
      toggle.classList.remove('open');
      nav.classList.remove('nav-open');
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   HERO CAROUSEL
   ═══════════════════════════════════════════════════════════════ */
function initHeroCarousel() {
  var slides = $$('.hero-slide', $('#heroCarousel'));
  var dots = $$('.hero-dot', $('#heroCarousel'));
  if (!slides.length) return;

  var current = 0, total = slides.length, timer = null;

  function goTo(n) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = ((n % total) + total) % total;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  // Dots
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () { goTo(i); resetAuto(); });
  });

  // Arrows
  var prevBtn = $('.hero-prev', $('#heroCarousel'));
  var nextBtn = $('.hero-next', $('#heroCarousel'));
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }
  resetAuto();

  // Pause on hover
  var hero = $('#heroCarousel');
  hero.addEventListener('mouseenter', function () { clearInterval(timer); });
  hero.addEventListener('mouseleave', function () { resetAuto(); });
}

/* ═══════════════════════════════════════════════════════════════
   STATS COUNTER — animated count-up
   ═══════════════════════════════════════════════════════════════ */
function initStats() {
  var stats = $$('.stat-num');
  if (!stats.length) return;

  var done = false;
  function animate() {
    if (done) return;
    done = true;
    stats.forEach(function (s) {
      var target = parseInt(s.dataset.count) || 0;
      var duration = 2000;
      var start = 0, startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        s.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else s.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  if ('IntersectionObserver' in window) {
    var section = $('#stats');
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { animate(); }
    }, { threshold: .3 }).observe(section);
  } else { animate(); }
}

/* ═══════════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ═══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  var btn = $('#backToTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════════════════
   ACTIVE NAV ON SCROLL
   ═══════════════════════════════════════════════════════════════ */
function initActiveNav() {
  var navItems = $$('.nav-item');
  var sections = [];
  navItems.forEach(function (item) {
    var href = item.getAttribute('href');
    if (href && href.indexOf('#') > -1) {
      var id = href.split('#')[1];
      var sec = document.getElementById(id);
      if (sec) sections.push({ id: id, el: sec, nav: item });
    }
  });

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY + 120;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollY) {
        navItems.forEach(function (n) { n.classList.remove('active'); });
        sections[i].nav.classList.add('active');
        break;
      }
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW — click shows in left preview
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
      '<div class="ov-info"><span class="ov-badge" style="background:' + colorFor(p.cls) + '">' + esc(p.cls) + '</span><strong>' + esc(p.title) + '</strong></div>';
    d.addEventListener('click', function () { show(i); });
    return d;
  }

  track.innerHTML = '';
  var all = [];
  items.forEach(function (p, i) { var node = makeItem(p, i); track.appendChild(node); all.push(node); });
  // duplicate first 2 items for seamless infinite loop
  items.slice(0, 2).forEach(function (p, i) { var node = makeItem(p, i); track.appendChild(node); all.push(node); });

  function ih() { return track.children[0] ? track.children[0].getBoundingClientRect().height + 10 : 72; }

  var idx = 0;
  function setY(anim) {
    track.style.transition = anim ? 'transform .6s ease' : 'none';
    track.style.transform = 'translateY(' + (-idx * ih()) + 'px)';
  }

  function show(i) {
    var modI = i % items.length;
    var p = items[modI];
    prev.classList.add('swap');
    setTimeout(function () {
      $('#ovImg').src = p.cover || avatarSVG(initials(p.title), colorFor(p.cls));
      $('#ovTitle').textContent = p.title;
      $('#ovDesc').textContent = p.desc || 'Click to view whitepaper';
      var badge = $('#ovBadge');
      badge.textContent = p.cls;
      badge.style.background = colorFor(p.cls);
      var readBtn = $('#ovRead');
      readBtn.href = '#';
      readBtn.onclick = function (e) { e.preventDefault(); openWhitepaper(p); };
      prev.classList.remove('swap');
    }, 220);
    $$('.ov-item', track).forEach(function (n, k) {
      n.classList.toggle('active', k % items.length === modI);
    });
  }

  function step() {
    idx++;
    setY(true);
    show(idx);
    if (idx >= items.length) {
      setTimeout(function () {
        idx = 0;
        setY(false);
      }, 650);
    }
  }

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
      '<span class="p-badge" style="background:' + colorFor(p.cls) + '">' + esc(p.cls) + '</span>' +
      '<div class="p-info"><h3>' + esc(p.title) + '</h3>' + (p.desc ? '<p>' + esc(p.desc) + '</p>' : '') + '</div>';
    c.addEventListener('click', function () { openWhitepaper(p); });
    grid.appendChild(c);
  });
  var vm = $('#viewMoreWrap');
  if (vm) vm.classList.toggle('hidden', !limit || projects.length <= limit);
}

/* ══ FULL-SCREEN whitepaper modal ══ */
function openWhitepaper(p) {
  var m = $('#wpModal');
  if (!m) return;
  $('#wpTitle').textContent = p.title;
  var b = $('#wpCls');
  b.textContent = p.cls;
  b.style.background = colorFor(p.cls);
  $('#wpBody').innerHTML = '<div class="wp-loading"><div class="wp-spinner"></div><p>Loading whitepaper…</p></div>';
  $('#wpMeta').innerHTML = 'AuroNexta Whitepaper · ' + esc(p.cls) + ' · <span class="read-time" aria-label="Estimated reading time">estimating…</span>';
  openModal(m);
  m.classList.add('wp-fullscreen');
  fetchMd(p).then(function (md) {
    var html = mdToHtml(md);
    $('#wpBody').innerHTML = html;
    var rt = readTime(md);
    $('#wpMeta').innerHTML = 'AuroNexta Whitepaper · ' + esc(p.cls) + ' · <span class="read-time" aria-label="Estimated reading time">' + rt + ' read</span>';
  });
}

/* ═══════════════════════════════════════════════════════════════
   TEAM marquee + modal
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
        '<div class="t-bar"><div class="t-name">' + esc(m.name) + '</div><span class="t-desig">' + esc(m.desig) + '</span></div>';
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
    linkedinEl.textContent = 'View LinkedIn Profile →';
  }
  openModal(modal);
  modal.classList.add('tm-fullscreen');
  fetchMd(m).then(function (md) { $('#tmBody').innerHTML = mdToHtml(md); });
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS wheel — full 360° circle
   ═══════════════════════════════════════════════════════════════ */
function initTestimonials() {
  var region = $('.t-region');
  if (!region) return;
  var wheel = $('#tWheel');
  var data = CFG.demoTestimonials;
  if (!data || !data.length) return;

  var spacing = 45;
  var needed = Math.ceil(360 / spacing);
  var filled = [];
  while (filled.length < needed) filled = filled.concat(data);
  filled = filled.slice(0, needed);

  var R = window.innerWidth < 600 ? 530 : window.innerWidth < 900 ? 590 : 680, rot = 0;
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
  window.addEventListener('resize', function () { R = window.innerWidth < 600 ? 490 : window.innerWidth < 900 ? 550 : 640; layout(); });
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
var fabEl = null;
var fabIcons = ['↑', '⚡', '◉', 'ℹ', '◆', '👥', '★', '✉'];

function buildFab() {
  fabEl = $('#fab');
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
  if (fabEl && !fabEl.hidden && !e.target.closest('.fab')) closeFab();
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

/* ══ Smooth scroll for anchor links ══ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ══ Scroll reveal ══ */
function initReveal() {
  $$('.reveal').forEach(function (e) { e.classList.add('reveal'); });
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

  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initBackToTop();
  initReveal();

  if (page === 'index') {
    initHeroCarousel();
    initStats();
    initTestimonials();
    initContact();
  }

  loadProjects().then(function (projects) {
    if (page === 'index') { renderProjects(projects, 6); initOverview(projects); }
    else renderProjects(projects, 0);
  });

  if (page === 'index') loadTeam().then(renderTeam);
});

})();
