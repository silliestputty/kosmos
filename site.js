// Navigation (menu sheet on phones, hide on scroll down), reading progress,
// photograph drift, current-section highlight, roadmap contents.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  var navLinks = nav && nav.querySelector('nav');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---- Menu sheet ----
  if (nav && navLinks) {
    if (!navLinks.id) navLinks.id = 'site-nav';
    var btn = document.createElement('button');
    btn.className = 'menu-btn'; btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', navLinks.id);
    btn.innerHTML = '<span>Menu</span><i aria-hidden="true"></i>';
    nav.querySelector('.wrap').appendChild(btn);
    var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
    nav.appendChild(bar);

    function setMenu(open) {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.querySelector('span').textContent = open ? 'Close' : 'Menu';
      if (open) { var first = navLinks.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
    }
    btn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 1120px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  // ---- Scroll: nav state, progress, photograph drift ----
  var bands = Array.prototype.slice.call(document.querySelectorAll('.band'));
  var lastY = window.scrollY, ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var limit = hero ? hero.offsetHeight - 90 : 10;
    if (nav) {
      nav.classList.toggle('scrolled', y > limit || !hero);
      var menuOpen = document.body.classList.contains('menu-open');
      // Hide when reading downwards past the hero; any upward scroll brings it back.
      if (!menuOpen && Math.abs(y - lastY) > 6) nav.classList.toggle('hide', y > lastY && y > Math.max(limit, 240));
      var max = document.documentElement.scrollHeight - vh;
      var bar = nav.querySelector('.progress');
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    if (!reduce.matches) {
      if (hero) root.style.setProperty('--h', Math.min(1, Math.max(0, y / (hero.offsetHeight || 1))).toFixed(4));
      bands.forEach(function (b) {
        var r = b.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        // -1 as the photograph enters at the bottom, +1 as it leaves at the top
        var p = 1 - (r.top + r.height / 2) / (vh / 2 + r.height / 2);
        b.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(4));
      });
    }
    lastY = y;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  frame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // A link to a section on this page reveals the nav again once it lands.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && nav) setTimeout(function () { nav.classList.remove('hide'); }, 700);
  });

  // ---- Highlight the nav link for the section in view (homepage) ----
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav nav a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a || !e.isIntersecting) return;
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---- Roadmap: give each section an id and build the contents list ----
  var toc = document.querySelector('.toc ol');
  if (toc) {
    var heads = document.querySelectorAll('.doc-body h2');
    var tocLinks = [];
    Array.prototype.forEach.call(heads, function (h) {
      var id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      h.id = id;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + id; var label = h.textContent.replace(/^(Next up|Done): /, ''); a.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      li.appendChild(a); toc.appendChild(li); tocLinks.push([h, a]);
    });
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          tocLinks.forEach(function (p) { p[1].classList.toggle('on', p[0] === e.target); });
        });
      }, { rootMargin: '-15% 0px -75% 0px' });
      tocLinks.forEach(function (p) { io2.observe(p[0]); });
    }
  }
})();
