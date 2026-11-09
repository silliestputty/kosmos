// KOSMOS blueprints: wireframe models built from the craft files' real part positions.
// Each part is drawn as a simple shape sized from its attachment nodes; hover or tap a part to identify it.
(function () {
  var stage = document.getElementById('bp-stage');
  if (!stage || !window.THREE) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- concept models (no craft file yet) ----------
  function P(title, group, pos, rot, shape, r, h) { return [title, group, null, pos, rot || [0, 0, 0, 1], shape, r, h, 0]; }
  var CON = window.KOSMOS_CONCEPTS || {};
  function C(k) { return CON[k] ? CON[k].build : function () { return []; }; }
  function superheavy2() {
    var a = [];
    a.push(P('Booster tank, 12 m section', 'Tanks', [0, 6, 0], null, 'cyl', 3.75, 12));
    a.push(P('Booster tank, 12 m section', 'Tanks', [0, 18, 0], null, 'cyl', 3.75, 12));
    a.push(P('Booster tank, 12 m section', 'Tanks', [0, 30, 0], null, 'cyl', 3.75, 12));
    a.push(P('Hot-staging interstage', 'Couplings', [0, 37, 0], null, 'cyl', 3.75, 2));
    a.push(P('Upper stage tank', 'Tanks', [0, 44, 0], null, 'cyl', 3.75, 12));
    a.push(P('Payload fairing', 'Payload', [0, 54, 0], null, 'pod', 3.75, 8));
    for (var i = 0; i < 13; i++) {
      var ring = i === 0 ? 0 : i < 5 ? 1.6 : 3.0, k = i === 0 ? 0 : i < 5 ? i : i - 5, n = i < 5 ? 4 : 8;
      var ang = k / n * Math.PI * 2;
      a.push(P('Methalox booster engine', 'Engines', [Math.cos(ang) * ring, -0.9, Math.sin(ang) * ring], null, 'cone', 0.55, 1.8));
    }
    [0, 1, 2, 3].forEach(function (k) {
      var ang = k * Math.PI / 2 + Math.PI / 4;
      a.push(P('Grid fin', 'Aero', [Math.cos(ang) * 4.1, 34.5, Math.sin(ang) * 4.1], null, 'fin', 1.2, 1.8));
      a.push(P('Landing leg', 'Landing gear', [Math.cos(ang) * 3.9, 1.5, Math.sin(ang) * 3.9], null, 'leg', 0.15, 5));
    });
    a.push(P('Upper stage vacuum engine', 'Engines', [0, 37.6, 0], null, 'cone', 1.2, 2.2));
    return a;
  }

  var catalog = [
    { key: 'tianwen', section: 'Flown' },
    { key: 'kir', section: 'Flown' },
    { key: 'pechka', section: 'Flown' },
    { key: 'iotan', section: 'Flown' },
    { key: 'sirius', section: 'Flown' },
    { key: 'jinwu', section: 'Launchers', concept: C('jinwu'), title: 'Jinwu launcher' },
    { key: 'superheavy', section: 'Launchers' },
    { key: 'superheavy2', section: 'Launchers', concept: superheavy2, title: 'Super Heavy, Block 2' },
    { key: 'samovar', section: 'Spacecraft', concept: C('samovar'), title: 'Samovar crew ship' },
    { key: 'bidon', section: 'Spacecraft', concept: C('bidon'), title: 'Bidon tanker' },
    { key: 'ukhvat', section: 'Spacecraft', concept: C('ukhvat'), title: 'Ukhvat tug' },
    { key: 'zhurong', section: 'Landers', concept: C('zhurong'), title: 'Zhurong lander and rover' },
    { key: 'pechka2', section: 'Landers', concept: C('pechka2'), title: 'Pechka 2' },
    { key: 'guanghan', section: 'Stations', concept: C('guanghan'), title: 'Guanghan station' },
    { key: 'fuelmod', section: 'Stations' },
    { key: 'kriroda', section: 'Stations' },
    { key: 'odin', section: 'Stations' }
  ];

  var KIND = { pechka: 'Flown to Vesta', iotan: 'Flown to Iota', sirius: 'Flown', kir: 'In orbit', tianwen: 'Flown', superheavy: 'In development', fuelmod: 'Ready to fly', kriroda: 'Flown, docked at Kir', odin: 'Flown, docked at Kir' };

  // ---------- three.js scene ----------
  var W = stage.clientWidth, H = stage.clientHeight;
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  stage.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 5000);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.6;

  var COL = { line: 0xb9bec6, dim: 0x3a3f46, hot: 0xd3232a, sel: 0xe0b24f };
  var grid = null, root = null, meshes = [], parts = [], hovered = null, pinned = null, groupOn = null;

  function geo(shape, r, h) {
    switch (shape) {
      case 'cone': return new THREE.CylinderGeometry(r * 0.45, r, h, 20, 1, true);
      case 'pod': return new THREE.CylinderGeometry(r * 0.42, r, h, 24);
      case 'disc': return new THREE.CylinderGeometry(r, r, Math.max(h, 0.12), 28);
      case 'panel': return new THREE.BoxGeometry(Math.max(r * 1.6, 0.4), Math.max(h, 0.3), 0.04);
      case 'wing': return new THREE.BoxGeometry(r * 2, 0.05, h);
      case 'leg': return new THREE.BoxGeometry(0.12, Math.max(h, 0.6), 0.12);
      case 'fin': return new THREE.BoxGeometry(0.06, h, r);
      case 'dish': return new THREE.CylinderGeometry(r, r * 0.15, Math.max(h * 0.6, 0.12), 20, 1, true);
      case 'box': return new THREE.BoxGeometry(r * 2, Math.max(h, 0.08), r * 2);
      case 'sphere': return new THREE.SphereGeometry(r, 16, 12);
      case 'oct': return new THREE.CylinderGeometry(r, r, h, 8);
      default: return new THREE.CylinderGeometry(r, r, Math.max(h, 0.05), 24);
    }
  }

  // Wireframe edges: round parts get a few meridians so they read as volumes, not just rings.
  function edgeGeo(shape, r, h) {
    var seg = r > 1.5 ? 12 : 8;
    switch (shape) {
      case 'cyl': return new THREE.EdgesGeometry(new THREE.CylinderGeometry(r, r, Math.max(h, 0.05), seg, h > r * 2.2 ? 2 : 1), 1);
      case 'cone': return new THREE.EdgesGeometry(new THREE.CylinderGeometry(r * 0.45, r, h, seg, 1, true), 1);
      case 'pod': return new THREE.EdgesGeometry(new THREE.CylinderGeometry(r * 0.42, r, h, seg), 1);
      case 'dish': return new THREE.EdgesGeometry(new THREE.CylinderGeometry(r, r * 0.15, Math.max(h * 0.6, 0.12), seg, 1, true), 1);
      case 'sphere': return new THREE.WireframeGeometry(new THREE.SphereGeometry(r, 8, 5));
      default: return new THREE.EdgesGeometry(geo(shape, r, h), 24);
    }
  }

  function build(def) {
    if (root) { scene.remove(root); root.traverse(function (o) { if (o.geometry) o.geometry.dispose(); }); }
    root = new THREE.Group(); meshes = []; parts = def.parts; hovered = pinned = groupOn = null;
    def.parts.forEach(function (p, i) {
      var g = geo(p[5], p[6], p[7]);
      g.translate(0, p[8] || 0, 0);
      var fill = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x9aa3ad, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide }));
      var eg = edgeGeo(p[5], p[6], p[7]); eg.translate(0, p[8] || 0, 0);
      var edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: COL.line, transparent: true, opacity: 0.55 }));
      var holder = new THREE.Group();
      holder.add(fill); holder.add(edges);
      var pos = p[3], q = p[4];
      holder.position.set(pos[0], pos[1], -pos[2]);            // KSP is left-handed: mirror z
      holder.quaternion.set(-q[0], -q[1], q[2], q[3]);
      fill.userData.idx = i; fill.userData.edges = edges;
      meshes.push(fill); root.add(holder);
    });
    var box = new THREE.Box3().setFromObject(root), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    root.position.sub(c);
    scene.add(root);
    if (grid) scene.remove(grid);
    var span = Math.max(size.x, size.z, size.y) * 1.6;
    grid = new THREE.GridHelper(span, 24, 0x2a2f35, 0x15181b);
    grid.position.y = -size.y / 2 - 0.05; scene.add(grid);
    // Fit both the height and the width into the view, then look from slightly above.
    var t = Math.tan(camera.fov * Math.PI / 360), wide = Math.max(size.x, size.z);
    var dist = Math.max(size.y / 2 / t, wide / 2 / (t * camera.aspect)) * 1.25 + wide / 2;
    var tall = size.y > wide * 2.5;
    camera.position.set(dist * (tall ? 0.6 : 0.55), dist * (tall ? 0.12 : 0.36), dist * (tall ? 0.8 : 0.76));
    camera.near = dist / 200; camera.far = dist * 20; camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0); controls.update();
    readout(def, size);
    groupsUI(def);
    paint();
  }

  function paint() {
    meshes.forEach(function (m) {
      var i = m.userData.idx, p = parts[i], e = m.userData.edges;
      var inGroup = groupOn && (p[1] === groupOn || p[2] === groupOn);
      var active = i === hovered || i === pinned;
      var c = active ? COL.sel : inGroup ? COL.hot : (groupOn ? COL.dim : COL.line);
      e.material.color.setHex(c);
      e.material.opacity = active || inGroup ? 1 : groupOn ? 0.35 : 0.55;
      m.material.opacity = active ? 0.22 : inGroup ? 0.12 : 0.035;
      m.material.color.setHex(active ? COL.sel : inGroup ? COL.hot : 0x9aa3ad);
    });
    var tip = document.getElementById('bp-part');
    var i = hovered != null ? hovered : pinned;
    if (i != null) {
      var p = parts[i];
      tip.innerHTML = '<strong></strong><span></span>';
      tip.firstChild.textContent = p[0];
      tip.lastChild.textContent = (p[2] ? p[2] + ', ' : '') + p[1].toLowerCase();
    } else {
      tip.innerHTML = '<span>Hover or tap a part to identify it.</span>';
    }
  }

  function readout(def, size) {
    document.getElementById('bp-title').textContent = def.title;
    document.getElementById('bp-kind').textContent = def.kind;
    var dims = document.getElementById('bp-dims');
    dims.innerHTML = '';
    [['Parts', def.parts.length], ['Height', size.y.toFixed(1) + ' m'], ['Width', Math.max(size.x, size.z).toFixed(1) + ' m']].forEach(function (d) {
      var div = document.createElement('div'); var dt = document.createElement('dt'); var dd = document.createElement('dd');
      dt.textContent = d[0]; dd.textContent = d[1]; div.appendChild(dt); div.appendChild(dd); dims.appendChild(div);
    });
  }

  function groupsUI(def) {
    var box = document.getElementById('bp-groups'); box.innerHTML = '';
    var counts = {}, order = [];
    def.parts.forEach(function (p) { [p[2], p[1]].forEach(function (g) { if (!g) return; if (!(g in counts)) { counts[g] = 0; order.push(g); } counts[g]++; }); });
    var stages = order.filter(function (g) { return def.parts.some(function (p) { return p[2] === g; }); });
    var cats = order.filter(function (g) { return stages.indexOf(g) < 0; }).sort(function (a, b) { return counts[b] - counts[a]; });
    function btn(g) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', 'false');
      b.textContent = g + ' '; var s = document.createElement('span'); s.textContent = counts[g]; b.appendChild(s);
      b.addEventListener('click', function () {
        groupOn = groupOn === g ? null : g;
        Array.prototype.forEach.call(box.querySelectorAll('.chip'), function (x) { x.setAttribute('aria-pressed', String(x === b && groupOn === g)); });
        paint();
      });
      box.appendChild(b);
    }
    if (stages.length) { var h = document.createElement('p'); h.textContent = 'Stages'; box.appendChild(h); stages.forEach(btn); }
    var h2 = document.createElement('p'); h2.textContent = 'Systems'; box.appendChild(h2); cats.forEach(btn);
  }

  // Picking
  var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), downAt = null;
  function pick(ev) {
    var r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    var hit = ray.intersectObjects(meshes, false)[0];
    return hit ? hit.object.userData.idx : null;
  }
  renderer.domElement.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse') { var i = pick(ev); if (i !== hovered) { hovered = i; paint(); } } });
  renderer.domElement.addEventListener('pointerleave', function () { hovered = null; paint(); });
  renderer.domElement.addEventListener('pointerdown', function (ev) { downAt = [ev.clientX, ev.clientY]; });
  renderer.domElement.addEventListener('pointerup', function (ev) {
    if (!downAt || Math.abs(ev.clientX - downAt[0]) + Math.abs(ev.clientY - downAt[1]) > 6) return;
    var i = pick(ev); pinned = i === pinned ? null : i; controls.autoRotate = false; paint();
  });
  controls.addEventListener('start', function () { controls.autoRotate = false; });

  // Model menu
  var data = {};
  var menu = document.getElementById('bp-menu');
  function select(key) {
    var item = catalog.filter(function (c) { return c.key === key; })[0];
    var def = item.concept ? { title: item.title, kind: (CON[key] && CON[key].kind) || 'Concept', parts: item.concept() } : { title: data[key].title, kind: KIND[key] || data[key].kind, parts: data[key].parts };
    build(def);
    Array.prototype.forEach.call(menu.querySelectorAll('button'), function (b) { b.setAttribute('aria-current', String(b.dataset.key === key)); });
    if (history.replaceState) history.replaceState(null, '', '#' + key);
  }
  function menuUI() {
    var last = null;
    catalog.forEach(function (c) {
      if (c.section !== last) { var h = document.createElement('p'); h.textContent = c.section; menu.appendChild(h); last = c.section; }
      var b = document.createElement('button'); b.type = 'button'; b.dataset.key = c.key;
      b.textContent = c.concept ? c.title : (data[c.key] ? data[c.key].title : c.key);
      if (c.concept) { var s = document.createElement('span'); s.textContent = 'Concept'; b.appendChild(s); }
      b.addEventListener('click', function () { select(c.key); stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); });
      menu.appendChild(b);
    });
  }

  fetch('assets/models.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d; menuUI();
    var start = (location.hash || '').slice(1);
    select(catalog.some(function (c) { return c.key === start; }) ? start : 'tianwen');
  }).catch(function () {
    document.getElementById('bp-part').textContent = 'The models could not load. Refresh the page to try again.';
  });

  document.getElementById('bp-reset').addEventListener('click', function () {
    pinned = null; groupOn = null; controls.autoRotate = !reduce;
    var key = (location.hash || '#tianwen').slice(1); select(key);
  });

  function resize() { W = stage.clientWidth; H = stage.clientHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); }
  window.addEventListener('resize', resize);
  (function loop() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); })();
})();
