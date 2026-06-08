/* ============================================================
   CHINETT — hero background: tangled wire sphere with fiery core.
   Pure Canvas 2D (no WebGL) so it renders everywhere. index.html only.
   ============================================================ */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var host = canvas.parentElement; // .hero
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W, H, CX, CY, R, focal;
  function resize() {
    W = host.clientWidth; H = host.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W * (W > 800 ? 0.6 : 0.5);
    CY = H * 0.5;
    R = Math.min(W, H) * (W > 800 ? 0.42 : 0.42);
    focal = R * 3.4;
  }

  // ---- pre-rendered glow sprites (fast drawImage instead of per-frame gradients) ----
  function sprite(size, stops) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return c;
  }
  var emberSprite = sprite(64, [
    [0, 'rgba(255,250,235,1)'], [0.25, 'rgba(255,185,85,1)'],
    [0.55, 'rgba(245,120,28,0.6)'], [1, 'rgba(245,120,28,0)']
  ]);
  var coreSprite = sprite(320, [
    [0, 'rgba(255,248,228,1)'], [0.14, 'rgba(255,180,80,0.95)'],
    [0.38, 'rgba(240,110,25,0.55)'], [0.7, 'rgba(220,80,15,0.18)'], [1, 'rgba(220,80,15,0)']
  ]);

  // ---- build a tangled unit sphere ----
  var N = 360;
  var base = [];          // unit vectors {x,y,z}
  var ember = [];         // boolean per node
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var rad = Math.sqrt(Math.max(0, 1 - y * y));
    var th = golden * i;
    // jitter the radius so the mesh looks crumpled rather than a clean ball
    var jr = 0.82 + Math.random() * 0.30;
    base.push({ x: Math.cos(th) * rad * jr, y: y * jr, z: Math.sin(th) * rad * jr });
    ember.push(Math.random() < 0.22);
  }

  // ---- neighbour pairs (k nearest) + a few long tangling strands ----
  var pairs = [];
  var seen = {};
  function addPair(a, b) {
    var k = a < b ? a + '_' + b : b + '_' + a;
    if (seen[k]) return; seen[k] = 1; pairs.push([a, b]);
  }
  for (i = 0; i < N; i++) {
    var dists = [];
    for (var j = 0; j < N; j++) {
      if (j === i) continue;
      var dx = base[i].x - base[j].x, dy = base[i].y - base[j].y, dz = base[i].z - base[j].z;
      dists.push([dx * dx + dy * dy + dz * dz, j]);
    }
    dists.sort(function (p, q) { return p[0] - q[0]; });
    for (var n = 0; n < 4; n++) addPair(i, dists[n][1]);
  }
  for (i = 0; i < 55; i++) addPair((Math.random() * N) | 0, (Math.random() * N) | 0);

  // ---- math helpers ----
  var rotY = 0, rotX = -0.2;
  function project(p) {
    // rotate Y then X
    var cy = Math.cos(rotY), sy = Math.sin(rotY);
    var x1 = p.x * cy - p.z * sy;
    var z1 = p.x * sy + p.z * cy;
    var cx = Math.cos(rotX), sx = Math.sin(rotX);
    var y1 = p.y * cx - z1 * sx;
    var z2 = p.y * sx + z1 * cx;
    var zr = z2 * R;
    var s = focal / (focal - zr);
    return { x: CX + x1 * R * s, y: CY + y1 * R * s, z: z2, s: s };
  }

  var P = new Array(N);
  function compute() { for (var i = 0; i < N; i++) P[i] = project(base[i]); }

  function drawHalo() {
    // soft dark backdrop behind the orb so dark wires + additive fire both pop on the light bg
    var r = R * 1.9;
    var g = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
    g.addColorStop(0, 'rgba(22,24,28,0.55)');
    g.addColorStop(0.5, 'rgba(22,24,28,0.32)');
    g.addColorStop(1, 'rgba(22,24,28,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fill();
  }

  function drawLines(frontOnly) {
    for (var p = 0; p < pairs.length; p++) {
      var a = P[pairs[p][0]], b = P[pairs[p][1]];
      var za = a.z, zb = b.z, front = (za + zb) > 0;
      if (front !== frontOnly) continue;
      var depth = (za + zb) / 2;             // -1..1
      var alpha = front ? 0.75 : 0.38;
      alpha *= 0.7 + (depth + 1) * 0.18;
      ctx.lineWidth = front ? 1.4 : 1.0;
      ctx.strokeStyle = 'rgba(20,24,30,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function drawEmbers() {
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < N; i++) {
      if (!ember[i]) continue;
      var p = P[i];
      var depth = (p.z + 1) / 2;             // 0 back .. 1 front
      var size = (10 + depth * 16) * p.s;
      ctx.globalAlpha = 0.35 + depth * 0.55;
      ctx.drawImage(emberSprite, p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawCore(flick) {
    ctx.globalCompositeOperation = 'lighter';
    var r = R * 1.35;
    ctx.globalAlpha = Math.min(1, flick * 1.0);
    ctx.drawImage(coreSprite, CX - r, CY - r, r * 2, r * 2);
    // tight hot center
    var r2 = R * 0.55;
    ctx.globalAlpha = 1;
    ctx.drawImage(coreSprite, CX - r2, CY - r2, r2 * 2, r2 * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  var t = 0;
  function frame() {
    t += 1;
    rotY = t * 0.0022;
    rotX = -0.18 + Math.sin(t * 0.0014) * 0.12;
    compute();
    ctx.clearRect(0, 0, W, H);

    var flick = 0.85 + Math.sin(t * 0.07) * 0.07 + Math.sin(t * 0.21) * 0.03;

    drawHalo();         // dark backdrop so the orb stands out on light bg
    drawLines(false);   // back strands
    drawCore(flick);    // fire glows from inside
    drawLines(true);    // front strands occlude the glow -> caged fire
    drawEmbers();       // glowing embers / sparks on top

    if (!reduce) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', function () { resize(); if (reduce) { compute(); frame(); } }, { passive: true });
  frame();
})();
