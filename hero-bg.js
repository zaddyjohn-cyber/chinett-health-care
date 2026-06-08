/* ============================================================
   CHINETT — hero: rotating 3D sphere of diverse nurse photos.
   Pure Canvas 2D (no WebGL) so it renders everywhere. index.html only.
   ------------------------------------------------------------
   To use your OWN nurse photos, just replace the URLs in NURSE_PHOTOS
   below (square images work best). Local paths like
   'assets/images/nurse1.jpg' also work.
   ============================================================ */
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var host = canvas.parentElement; // .hero-orb
  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  // ---- real nurse/clinician photos, self-hosted (free Unsplash license) ----
  // Stored locally in assets/images/. Swap for your own staff photos any time.
  var NURSE_PHOTOS = [
    'assets/images/photo-1.jpg',
    'assets/images/photo-2.jpg',
    'assets/images/photo-3.jpg',
    'assets/images/photo-4.jpg',
    'assets/images/photo-5.jpg',
    'assets/images/photo-6.jpg',
    'assets/images/photo-7.jpg',
    'assets/images/photo-8.jpg',
    'assets/images/photo-9.jpg',
    'assets/images/photo-10.jpg'
  ];

  var imgs = NURSE_PHOTOS.map(function (u) {
    var im = new Image();
    im.src = u;
    return im;
  });

  // ---- sizing: square canvas driven by container width ----
  var W = 0, H = 0, CX, CY, R, focal, tile;
  function measure() {
    var w = host.clientWidth || 420;
    if (w === W) return;
    W = H = w;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(w * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W * 0.5; CY = H * 0.5;
    R = W * 0.36;
    focal = R * 3.6;
    tile = W * 0.2;
  }

  // ---- nodes on a sphere (fibonacci), each carries a photo ----
  var M = 14;
  var nodes = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < M; i++) {
    var y = 1 - (i / (M - 1)) * 2;
    var rad = Math.sqrt(Math.max(0, 1 - y * y));
    var th = golden * i;
    nodes.push({ x: Math.cos(th) * rad, y: y, z: Math.sin(th) * rad, img: imgs[i % imgs.length] });
  }
  // faint connecting strands (each node to its 2 nearest)
  var pairs = [], seen = {};
  for (i = 0; i < M; i++) {
    var ds = [];
    for (var j = 0; j < M; j++) { if (j === i) continue;
      var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
      ds.push([dx * dx + dy * dy + dz * dz, j]);
    }
    ds.sort(function (a, b) { return a[0] - b[0]; });
    for (var n = 0; n < 2; n++) { var k = Math.min(i, ds[n][1]) + '_' + Math.max(i, ds[n][1]); if (!seen[k]) { seen[k] = 1; pairs.push([i, ds[n][1]]); } }
  }

  var rotY = 0, rotX = -0.12;
  function project(p) {
    var cy = Math.cos(rotY), sy = Math.sin(rotY);
    var x1 = p.x * cy - p.z * sy, z1 = p.x * sy + p.z * cy;
    var cx = Math.cos(rotX), sx = Math.sin(rotX);
    var y1 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
    var s = focal / (focal - z2 * R);
    return { x: CX + x1 * R * s, y: CY + y1 * R * s, z: z2, s: s };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawHalo() {
    var r = R * 2.0;
    var g = ctx.createRadialGradient(CX, CY, 0, CX, CY, r);
    g.addColorStop(0, 'rgba(18,22,28,0.18)');
    g.addColorStop(0.6, 'rgba(18,22,28,0.08)');
    g.addColorStop(1, 'rgba(18,22,28,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, r, 0, Math.PI * 2); ctx.fill();
  }

  var P = new Array(M);
  function frame() {
    measure();
    if (!W) { requestAnimationFrame(frame); return; }
    rotYv();
    for (var i = 0; i < M; i++) P[i] = project(nodes[i]);

    ctx.clearRect(0, 0, W, H);
    drawHalo();

    // faint strands (behind)
    ctx.lineWidth = 1;
    for (var p = 0; p < pairs.length; p++) {
      var a = P[pairs[p][0]], b = P[pairs[p][1]];
      var depth = ((a.z + b.z) / 2 + 1) / 2;
      ctx.strokeStyle = 'rgba(70,84,96,' + (0.10 + depth * 0.18).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // photo tiles, back-to-front
    var order = [];
    for (i = 0; i < M; i++) order.push(i);
    order.sort(function (u, v) { return P[u].z - P[v].z; });

    for (var o = 0; o < order.length; o++) {
      var idx = order[o], pp = P[idx], img = nodes[idx].img;
      var depth2 = (pp.z + 1) / 2;            // 0 back .. 1 front
      var size = tile * pp.s;
      var x = pp.x - size / 2, y = pp.y - size / 2;
      var alpha = 0.32 + depth2 * 0.68;

      ctx.save();
      ctx.globalAlpha = alpha;
      roundRect(x, y, size, size, size * 0.16);
      ctx.clip();
      if (img.complete && img.naturalWidth) {
        ctx.drawImage(img, x, y, size, size);
      } else {
        ctx.fillStyle = '#1C82C4';
        ctx.fillRect(x, y, size, size);
      }
      ctx.restore();

      // crisp light border
      ctx.save();
      ctx.globalAlpha = 0.25 + depth2 * 0.5;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      roundRect(x, y, size, size, size * 0.16);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }

  // rotation step — always animate (the rotating sphere is core content)
  function rotYv() { rotY += 0.0045; rotX = -0.12 + Math.sin(Date.now() * 0.0002) * 0.1; }

  measure();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  frame();
})();
