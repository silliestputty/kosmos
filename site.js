// Nav background after the hero, current-section highlight, roadmap contents.
(function () {
  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var limit = hero ? hero.offsetHeight - 90 : 10;
    nav.classList.toggle('scrolled', window.scrollY > limit || !hero);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Highlight the nav link for the section in view (homepage).
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav nav a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // Roadmap: give each section an id and build the contents list.
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
