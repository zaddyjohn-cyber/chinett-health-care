/* ============================================================
   CHINETT — 3D hero background (network / particle sphere)
   Requires THREE (loaded via CDN before this file). index.html only.
   ============================================================ */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  // Respect reduced-motion: render a single static frame, no animation loop.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var host = canvas.parentElement; // .hero
  var THREE = window.THREE;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 18;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    // No WebGL — leave the CSS navy gradient as the background.
    canvas.style.display = 'none';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  function resize() {
    var w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---- soft round sprite for glowing dots ----
  function makeSprite() {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    var t = new THREE.Texture(c); t.needsUpdate = true; return t;
  }
  var sprite = makeSprite();

  var group = new THREE.Group();
  // Slightly right of centre on wide screens, centred on narrow ones.
  group.position.x = (host.clientWidth > 800) ? 1.2 : 0;
  scene.add(group);

  // ---- distribute points on a sphere (fibonacci) with slight noise ----
  var N = 460, R = 7.6;
  var pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var rad = Math.sqrt(1 - y * y);
    var theta = golden * i;
    var jitter = 0.9 + Math.random() * 0.2;
    var px = Math.cos(theta) * rad * R * jitter;
    var py = y * R * jitter;
    var pz = Math.sin(theta) * rad * R * jitter;
    pts.push(new THREE.Vector3(px, py, pz));
  }

  // ---- split into cool nodes and orange embers ----
  var teal = new THREE.Color(0x1fb6b6);
  var blue = new THREE.Color(0x2e97d8);
  var orange = new THREE.Color(0xF47A1F);

  var coolPos = [], coolCol = [], emberPos = [], isEmber = [];
  for (i = 0; i < pts.length; i++) {
    var ember = Math.random() < 0.16;
    isEmber.push(ember);
    if (ember) {
      emberPos.push(pts[i].x, pts[i].y, pts[i].z);
    } else {
      coolPos.push(pts[i].x, pts[i].y, pts[i].z);
      var mix = (pts[i].y / R) * 0.5 + 0.5;
      var col = teal.clone().lerp(blue, mix);
      coolCol.push(col.r, col.g, col.b);
    }
  }

  // cool node points
  var cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(coolPos, 3));
  cg.setAttribute('color', new THREE.Float32BufferAttribute(coolCol, 3));
  var cm = new THREE.PointsMaterial({
    size: 0.5, map: sprite, vertexColors: true, transparent: true,
    opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  group.add(new THREE.Points(cg, cm));

  // ember points (orange glow)
  var eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.Float32BufferAttribute(emberPos, 3));
  var em = new THREE.PointsMaterial({
    size: 1.15, map: sprite, color: orange, transparent: true,
    opacity: 1.0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  group.add(new THREE.Points(eg, em));

  // ---- connecting filaments between nearby points ----
  var linePos = [], lineCol = [], threshold = 2.5, maxPerNode = 4;
  for (i = 0; i < pts.length; i++) {
    var connections = 0;
    for (var j = i + 1; j < pts.length; j++) {
      if (connections >= maxPerNode) break;
      var d = pts[i].distanceTo(pts[j]);
      if (d < threshold) {
        connections++;
        linePos.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        var warm = isEmber[i] || isEmber[j];
        var lc = warm ? orange.clone().lerp(teal, 0.5) : teal.clone().lerp(blue, 0.5);
        lineCol.push(lc.r, lc.g, lc.b, lc.r, lc.g, lc.b);
      }
    }
  }
  var lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  lg.setAttribute('color', new THREE.Float32BufferAttribute(lineCol, 3));
  var lm = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.22,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  group.add(new THREE.LineSegments(lg, lm));

  // ---- faint outer dust ----
  var dustPos = [];
  for (i = 0; i < 140; i++) {
    var rr = R * (1.3 + Math.random() * 0.9);
    var a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
    dustPos.push(rr * Math.sin(b) * Math.cos(a), rr * Math.cos(b), rr * Math.sin(b) * Math.sin(a));
  }
  var dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
  var dm = new THREE.PointsMaterial({
    size: 0.28, map: sprite, color: 0x8fb9c9, transparent: true,
    opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  group.add(new THREE.Points(dg, dm));

  // ---- animate ----
  resize();
  window.addEventListener('resize', resize, { passive: true });

  group.rotation.x = -0.15;
  if (reduceMotion) {
    renderer.render(scene, camera);
    return;
  }
  function tick() {
    group.rotation.y += 0.0016;
    group.rotation.x = -0.12 + Math.sin(Date.now() * 0.0001) * 0.14;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
