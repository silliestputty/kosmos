// KOSMOS design bureau: concept vehicles, drawn with the same part shapes as the craft-file models.
// Each part: [title, system, stage, [x, y, z] metres, quaternion, shape, radius, height, centreOffset]
(function () {
  var X90 = [0.7071, 0, 0, 0.7071], Z90 = [0, 0, 0.7071, 0.7071];
  function P(title, sys, stage, pos, rot, shape, r, h) { return [title, sys, stage || null, pos, rot || [0, 0, 0, 1], shape, r, h, 0]; }
  function ring(n, rad, fn) { for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + Math.PI / n; fn(Math.cos(a) * rad, Math.sin(a) * rad, a); } }
  function yaw(a) { return [0, Math.sin(-a / 2), 0, Math.cos(-a / 2)]; }

  // Jinwu: KOSMOS medium reusable launcher. 1.875 m methalox, one Iguanodon below, one Harrier above.
  function jinwu() {
    var a = [], B = 'Jinwu booster', U = 'Upper stage', F = 'Payload';
    a.push(P('MR-4 Iguanodon methalox engine', 'Engines', B, [0, 0.9, 0], null, 'cone', 0.82, 1.8));
    a.push(P('Thrust skirt', 'Structure', B, [0, 2.3, 0], null, 'cyl', 0.94, 1.0));
    a.push(P('Booster methalox tanks, 22 m', 'Tanks', B, [0, 13.8, 0], null, 'cyl', 0.94, 22));
    ring(4, 1.0, function (x, z, ang) {
      a.push(P('Landing leg', 'Landing gear', B, [x, 4.6, z], yaw(ang), 'leg', 0.12, 6.0));
      a.push(P('Grid fin', 'Aero', B, [x * 1.08, 24.0, z * 1.08], yaw(ang), 'fin', 0.8, 1.0));
    });
    a.push(P('Interstage', 'Couplings', B, [0, 25.9, 0], null, 'cyl', 0.94, 2.4));
    a.push(P('MU-11 Harrier vacuum engine', 'Engines', U, [0, 26.0, 0], null, 'cone', 0.75, 2.0));
    a.push(P('Upper methalox tanks, 6 m', 'Tanks', U, [0, 30.1, 0], null, 'cyl', 0.94, 6));
    a.push(P('Upper stage avionics', 'Command', U, [0, 33.4, 0], null, 'cyl', 0.94, 0.5));
    a.push(P('Fairing, 1.875 m', 'Payload', F, [0, 36.4, 0], null, 'cyl', 0.97, 5.5));
    a.push(P('Fairing nose', 'Payload', F, [0, 40.6, 0], null, 'pod', 0.97, 3.0));
    return a;
  }

  // Samovar: three-crew ship in three modules, orbital module, descent capsule and service module.
  function samovar() {
    var a = [], O = 'Orbital module', D = 'Descent capsule', S = 'Service module';
    a.push(P('Service module: Hawk engines and tanks', 'Tanks', S, [0, 0.9, 0], null, 'cyl', 0.94, 1.8));
    ring(2, 0.45, function (x, z) { a.push(P('Hawk engine', 'Engines', S, [x, -0.25, z], null, 'cone', 0.22, 0.6)); });
    [-1, 1].forEach(function (s) { a.push(P('Solar wing', 'Power', S, [s * 2.9, 1.2, 0], null, 'wing', 1.9, 0.9)); });
    ring(4, 1.0, function (x, z, ang) { a.push(P('RCS quad', 'Control', S, [x, 1.6, z], yaw(ang), 'box', 0.12, 0.25)); });
    a.push(P('Heat shield', 'Thermal', D, [0, 1.95, 0], null, 'disc', 0.85, 0.15));
    a.push(P('KV-3 descent capsule, crew 3', 'Command', D, [0, 2.7, 0], null, 'pod', 0.85, 1.4));
    a.push(P('Parachute', 'Utility', D, [0, 3.45, 0], null, 'cyl', 0.25, 0.2));
    a.push(P('Orbital module', 'Habitat', O, [0, 4.25, 0], null, 'sphere', 0.8, 1.6));
    a.push(P('Docking probe', 'Couplings', O, [0, 5.2, 0], null, 'cyl', 0.35, 0.4));
    a.push(P('Rendezvous antenna', 'Comms', O, [0.6, 4.9, 0], null, 'cyl', 0.03, 0.9));
    return a;
  }

  // Bidon: propellant tanker that tops up the depot. Rides a Jinwu with the fairing left off.
  function bidon() {
    var a = [], S = 'Tanker';
    a.push(P('MU-11 Harrier engine', 'Engines', S, [0, 0, 0], null, 'cone', 0.75, 2.0));
    a.push(P('Thrust structure', 'Structure', S, [0, 1.4, 0], null, 'cyl', 0.94, 0.8));
    a.push(P('Methalox tanks, 9 m', 'Tanks', S, [0, 6.3, 0], null, 'cyl', 0.94, 9));
    a.push(P('Transfer manifold and avionics', 'Command', S, [0, 11.2, 0], null, 'cyl', 0.94, 0.8));
    a.push(P('Fuel-transfer docking port', 'Couplings', S, [0, 11.85, 0], null, 'cyl', 0.42, 0.4));
    a.push(P('Nose cone', 'Aero', S, [0, 12.7, 0], null, 'pod', 0.6, 1.0));
    [-1, 1].forEach(function (s) { a.push(P('Roll-out solar wing', 'Power', S, [s * 2.8, 10.4, 0], null, 'wing', 1.8, 1.0)); });
    ring(4, 1.0, function (x, z, ang) { a.push(P('RCS quad', 'Control', S, [x, 10.8, z], yaw(ang), 'box', 0.12, 0.26)); });
    return a;
  }

  // Ukhvat: orbital tug that moves modules and tankers about the station.
  function ukhvat() {
    var a = [], S = 'Tug';
    a.push(P('Methalox tank', 'Tanks', S, [0, 2, 0], null, 'cyl', 0.95, 2.6));
    a.push(P('Avionics ring', 'Command', S, [0, 3.6, 0], null, 'cyl', 0.95, 0.5));
    a.push(P('Grabber arm', 'Couplings', S, [0, 4.5, 0], null, 'dish', 0.6, 0.9));
    ring(4, 0.55, function (x, z) { a.push(P('Hawk engine', 'Engines', S, [x, 0.25, z], null, 'cone', 0.22, 0.75)); });
    a.push(P('Aft docking port', 'Couplings', S, [0, 0.55, 0], null, 'cyl', 0.42, 0.3));
    [-1, 1].forEach(function (s) { a.push(P('Solar panel', 'Power', S, [s * 2.2, 2.2, 0], null, 'wing', 1.2, 0.8)); });
    ring(4, 1.0, function (x, z, ang) { a.push(P('RCS quad', 'Control', S, [x, 3.3, z], yaw(ang), 'box', 0.12, 0.26)); });
    return a;
  }

  // Zhurong: Niven lander with a rover on its back.
  function zhurong() {
    var a = [], D = 'Descent stage', R = 'Rover';
    a.push(P('Descent stage', 'Structure', D, [0, 0, 0], null, 'oct', 2.0, 1.2));
    ring(4, 1.2, function (x, z) { a.push(P('Methalox tank', 'Tanks', D, [x, 0.1, z], null, 'sphere', 0.6, 1.2)); });
    ring(4, 2.3, function (x, z, ang) { a.push(P('Landing leg', 'Landing gear', D, [x, -1.0, z], yaw(ang), 'leg', 0.12, 2.6)); });
    a.push(P('Buzzard descent engine', 'Engines', D, [0, -1.1, 0], null, 'cone', 0.7, 1.4));
    a.push(P('Rover deck', 'Structure', R, [0, 0.75, 0], null, 'box', 0.95, 0.15));
    a.push(P('Rover body', 'Rover', R, [0, 1.15, 0], null, 'box', 0.7, 0.55));
    [-1, 1].forEach(function (s) { [-0.75, 0, 0.75].forEach(function (z) { a.push(P('Rover wheel', 'Rover', R, [s * 0.95, 1.0, z], Z90, 'cyl', 0.28, 0.22)); }); });
    a.push(P('Mast camera', 'Science', R, [0.35, 1.95, 0.35], null, 'cyl', 0.06, 1.0));
    a.push(P('High-gain dish', 'Comms', R, [-0.3, 1.7, -0.3], null, 'dish', 0.38, 0.25));
    [-1, 1].forEach(function (s) { a.push(P('Rover solar wing', 'Power', R, [s * 1.45, 1.45, 0], null, 'wing', 0.55, 1.3)); });
    return a;
  }

  // Pechka 2: tougher Vesta lander that lasts a full day on the surface.
  function pechka2() {
    var a = [], E = 'Entry shell, shown apart', L = 'Lander';
    a.push(P('Aeroshell, 3.2 m', 'Thermal', E, [4.2, 0.6, 0], [1, 0, 0, 0], 'cone', 1.6, 1.0));
    a.push(P('Backshell', 'Thermal', E, [4.2, 1.9, 0], null, 'cone', 1.5, 1.6));
    a.push(P('Parachute canister', 'Utility', E, [4.2, 2.9, 0], null, 'cyl', 0.35, 0.4));
    a.push(P('Pressure sphere, 1.8 m', 'Command', L, [0, 1.25, 0], null, 'sphere', 0.9, 1.8));
    a.push(P('Base ring', 'Structure', L, [0, 0.45, 0], null, 'oct', 0.95, 0.25));
    ring(3, 1.0, function (x, z, ang) { a.push(P('Radiator fin', 'Thermal', L, [x * 1.35, 1.25, z * 1.35], yaw(ang), 'fin', 0.8, 1.3)); });
    ring(3, 1.0, function (x, z, ang) { a.push(P('Crush-pad leg', 'Landing gear', L, [x * 1.05, 0.15, z * 1.05], yaw(ang), 'leg', 0.12, 0.9)); });
    a.push(P('Barometer, thermometer, seismometer', 'Science', L, [0.35, 2.15, 0.2], null, 'box', 0.15, 0.2));
    a.push(P('Surface camera', 'Utility', L, [-0.35, 2.1, 0.3], null, 'cyl', 0.12, 0.25));
    a.push(P('Relay antenna', 'Comms', L, [0, 2.6, -0.2], null, 'cyl', 0.04, 1.0));
    return a;
  }

  // Guanghan: the large replacement for Kir.
  function guanghan() {
    var a = [];
    // spine, along x
    a.push(P('Guanghan core habitat, crew 6', 'Habitat', 'Core', [0, 0, 0], Z90, 'cyl', 1.875, 14));
    a.push(P('Central node, six ports', 'Couplings', 'Core', [9, 0, 0], null, 'sphere', 1.9, 3.8));
    a.push(P('Cupola', 'Habitat', 'Core', [0, -2.1, 3.0], null, 'pod', 0.9, 1.0));
    a.push(P('Yutu laboratory', 'Science', 'Yutu lab', [9, 0, 8.2], X90, 'cyl', 1.875, 11));
    a.push(P('Wu Gang workshop and arm base', 'Utility', 'Wu Gang workshop', [9, 0, -6.6], X90, 'cyl', 0.94, 8));
    a.push(P('Station arm, 15 m', 'Robotics', 'Wu Gang workshop', [9, 0.9, -12.5], Z90, 'box', 0.16, 15));
    a.push(P('Crew habitat A, crew 4', 'Habitat', 'Habitats', [17, 0, 0], Z90, 'cyl', 1.875, 10));
    a.push(P('Crew habitat B, crew 4', 'Habitat', 'Habitats', [-12, 0, 0], Z90, 'cyl', 1.875, 10));
    a.push(P('Forward docking hub', 'Couplings', 'Docking hub', [23.6, 0, 0], Z90, 'oct', 1.0, 3.2));
    a.push(P('Berth: Samovar', 'Couplings', 'Docking hub', [23.6, 1.3, 0], null, 'cyl', 0.42, 0.6));
    a.push(P('Berth: tanker', 'Couplings', 'Docking hub', [23.6, -1.3, 0], null, 'cyl', 0.42, 0.6));
    a.push(P('Samovar, docked', 'Visiting', 'Docking hub', [23.6, 2.6, 0], null, 'sphere', 0.8, 1.6));
    a.push(P('Liangcang depot, methalox', 'Tanks', 'Liangcang depot', [-24, 0, 0], Z90, 'cyl', 2.5, 14));
    a.push(P('Liangcang depot, hydrogen', 'Tanks', 'Liangcang depot', [-24, 0, 3.6], Z90, 'cyl', 0.94, 11));
    a.push(P('Liangcang depot, hydrogen', 'Tanks', 'Liangcang depot', [-24, 0, -3.6], Z90, 'cyl', 0.94, 11));
    a.push(P('Depot cross-feed truss', 'Structure', 'Liangcang depot', [-24, 0, 0], X90, 'box', 0.25, 8));
    a.push(P('Aft transfer port', 'Couplings', 'Liangcang depot', [-31.6, 0, 0], Z90, 'cyl', 1.0, 1.2));
    a.push(P('Ukhvat tug, parked', 'Visiting', 'Liangcang depot', [-24, 4.1, 0], null, 'cyl', 0.95, 3.2));
    // Guishu power truss, along z, above the node
    a.push(P('Guishu power truss, 64 m', 'Structure', 'Guishu truss', [9, 4.6, 0], X90, 'box', 0.4, 64));
    a.push(P('Truss mast', 'Structure', 'Guishu truss', [9, 2.9, 0], null, 'box', 0.35, 3.0));
    [-1, 1].forEach(function (s) {
      [12, 20, 28].forEach(function (d) {
        a.push(P('Solar wing, 14 m', 'Power', 'Guishu truss', [9, 4.6 + 7.5, s * d], [0, 0, 0.7071, 0.7071], 'wing', 7, 3.4));
        a.push(P('Solar wing, 14 m', 'Power', 'Guishu truss', [9, 4.6 - 7.5, s * d], [0, 0, 0.7071, 0.7071], 'wing', 7, 3.4));
      });
      a.push(P('Radiator array', 'Thermal', 'Guishu truss', [9 + 4.5, 4.6, s * 5.5], null, 'wing', 3.5, 4.5));
    });
    a.push(P('Relay mast and dish', 'Comms', 'Core', [-4, 3.4, 0], null, 'dish', 1.1, 0.4));
    return a;
  }

  window.KOSMOS_CONCEPTS = {
    jinwu: { title: 'Jinwu launcher', kind: 'Concept: medium launcher', build: jinwu },
    samovar: { title: 'Samovar crew ship', kind: 'Concept: crew transport', build: samovar },
    bidon: { title: 'Bidon tanker', kind: 'Concept: propellant tanker', build: bidon },
    ukhvat: { title: 'Ukhvat tug', kind: 'Concept: orbital tug', build: ukhvat },
    zhurong: { title: 'Zhurong lander and rover', kind: 'Concept: Niven lander', build: zhurong },
    pechka2: { title: 'Pechka 2', kind: 'Concept: Vesta lander', build: pechka2 },
    guanghan: { title: 'Guanghan station', kind: 'Concept: station replacing Kir', build: guanghan }
  };
})();
