/**
 * Minecraft landscape backdrop.
 *
 * Drawn into a low-resolution buffer (1 scene pixel = SCALE css pixels) and
 * scaled up with image-rendering: pixelated, so everything is made of real
 * chunky pixels.
 *
 * Layers, back to front: banded sky, stars, sun or moon, fat cloud slabs,
 * three parallax hill ranges with grass tops and trees. The hills never change,
 * so they are baked once into an offscreen buffer and blitted each frame; only
 * the clouds drift and the stars twinkle.
 *
 * The palette follows the visitor's own clock -- dawn, day, sunset, night --
 * so the site is never the same colour twice in one day. Add ?sky=sunset to
 * the URL to force one.
 */
(function () {
  var canvas = document.getElementById("bg-scene");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var SCALE = 4;
  var W = 0, H = 0;
  var stars = [], clouds = [], sky = null, terrainBuf = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var seed = 20260818;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  /* ------------------------------------------------------------- palettes */
  var PALETTES = {
    day: {
      sky: ["#3f6fc4", "#4d80d6", "#5d90e2", "#6d9fec", "#7eaef3", "#93bef8", "#a9cffb"],
      body: "sun", bodyColor: "#ffef8f",
      cloud: "rgba(255,255,255,1)", stars: 0,
      far:  { top: "#6386b4", body: "#54759f" },
      mid:  { top: "#57a03f", body: "#7a5636" },
      near: { top: "#3f7a2e", body: "#513a24" },
      leaf: "#4e9438", trunk: "#5c4327",
    },
    sunset: {
      sky: ["#241a4a", "#3d2358", "#5e2f5c", "#8c4152", "#bd6144", "#e08b45", "#f2b45e"],
      body: "sun", bodyColor: "#ffd77a",
      cloud: "rgba(255,214,176,0.82)", stars: 0.35,
      far:  { top: "#5a4468", body: "#463553" },
      mid:  { top: "#3f6234", body: "#4b382a" },
      near: { top: "#2a4524", body: "#33271b" },
      leaf: "#37662c", trunk: "#3d2e1d",
    },
    night: {
      sky: ["#05081a", "#080d24", "#0c132f", "#10193c", "#151f49", "#1a2657", "#202e66"],
      body: "moon", bodyColor: "#e6e8f2",
      cloud: "rgba(176,192,226,0.32)", stars: 1,
      far:  { top: "#243052", body: "#1b2540" },
      mid:  { top: "#1f4028", body: "#241d15" },
      near: { top: "#14291a", body: "#18120e" },
      leaf: "#1b3a22", trunk: "#1d1710",
    },
    dawn: {
      sky: ["#141c46", "#28275c", "#4a3670", "#7b4a76", "#b06a6e", "#e0a06d", "#f6cf95"],
      body: "sun", bodyColor: "#fff2c4",
      cloud: "rgba(255,228,204,0.78)", stars: 0.45,
      far:  { top: "#5b5480", body: "#453f66" },
      mid:  { top: "#4a7238", body: "#54402c" },
      near: { top: "#335128", body: "#382a1e" },
      leaf: "#3f7530", trunk: "#463322",
    },
  };

  function pickPalette() {
    var forced = (location.search.match(/[?&]sky=(\w+)/) || [])[1];
    if (forced && PALETTES[forced]) return PALETTES[forced];
    var h = new Date().getHours();
    if (h >= 5 && h < 8) return PALETTES.dawn;
    if (h >= 8 && h < 17) return PALETTES.day;
    if (h >= 17 && h < 20) return PALETTES.sunset;
    return PALETTES.night;
  }

  /* ---------------------------------------------------------------- build */
  function build() {
    W = Math.max(1, Math.ceil(window.innerWidth / SCALE));
    H = Math.max(1, Math.ceil(window.innerHeight / SCALE));
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    sky = pickPalette();
    seed = 20260818;

    stars = [];
    if (sky.stars > 0) {
      var n = Math.round((W * H) / 900);
      for (var i = 0; i < n; i++)
        stars.push({
          x: (rand() * W) | 0,
          y: (rand() * H * 0.5) | 0,
          phase: rand() * Math.PI * 2,
          bright: (0.4 + rand() * 0.6) * sky.stars,
        });
    }

    // Minecraft clouds are big, flat, opaque slabs sitting at one altitude.
    clouds = [];
    function band(count, top, span, wLo, wHi, hLo, hHi, sLo, sHi, aMul) {
      for (var i = 0; i < count; i++)
        clouds.push({
          x: rand() * (W + 120) - 60,
          y: Math.round(top + rand() * span),
          w: wLo + ((rand() * (wHi - wLo)) | 0),
          h: hLo + ((rand() * (hHi - hLo)) | 0),
          speed: sLo + rand() * (sHi - sLo),
          alpha: aMul,
          step: 1 + ((rand() * 3) | 0),   // the stepped notch that makes it read as a cloud
        });
    }
    band(5, H * 0.10, H * 0.05, 34, 76, 3, 5, 0.35, 0.6, 0.62);   // far, hazier
    band(7, H * 0.20, H * 0.09, 46, 104, 5, 9, 0.7, 1.25, 1);     // main cloud deck

    buildTerrain();
  }

  /** One hill range: a random walk of column heights, grass cap over body. */
  function ridge(t, baseline, amp, rough, layer, treeChance, sky) {
    var h = baseline, top = [];
    for (var x = 0; x < W; x++) {
      if (x % rough === 0) h += ((rand() * 3) | 0) - 1;
      if (h < baseline - amp) h = baseline - amp;
      if (h > baseline + amp) h = baseline + amp;
      top.push(Math.round(h));
    }
    for (var x2 = 0; x2 < W; x2++) {
      var y = top[x2];
      t.fillStyle = layer.body;
      t.fillRect(x2, y, 1, H - y);
      t.fillStyle = layer.top;
      t.fillRect(x2, y, 1, 2);
    }
    // trees, planted on the ridge line
    if (!treeChance) return;
    for (var x3 = 3; x3 < W - 3; x3++) {
      if (rand() > treeChance) continue;
      var ty = top[x3], th = 4 + ((rand() * 3) | 0);
      t.fillStyle = sky.trunk;
      t.fillRect(x3, ty - th, 2, th);
      t.fillStyle = sky.leaf;
      t.fillRect(x3 - 3, ty - th - 4, 8, 4);
      t.fillRect(x3 - 2, ty - th - 6, 6, 2);
      x3 += 7;
    }
  }

  function buildTerrain() {
    terrainBuf = document.createElement("canvas");
    terrainBuf.width = W;
    terrainBuf.height = H;
    var t = terrainBuf.getContext("2d");
    ridge(t, H * 0.66, H * 0.05, 7, sky.far, 0, sky);
    ridge(t, H * 0.79, H * 0.05, 5, sky.mid, 0.05, sky);
    ridge(t, H * 0.91, H * 0.04, 4, sky.near, 0.07, sky);
  }

  /* ----------------------------------------------------------------- draw */
  function draw(now) {
    var bands = sky.sky.length;
    for (var i = 0; i < bands; i++) {
      var y0 = Math.floor((H * i) / bands);
      var y1 = Math.floor((H * (i + 1)) / bands);
      ctx.fillStyle = sky.sky[i];
      ctx.fillRect(0, y0, W, y1 - y0);
    }

    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var tw = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(now * 0.0016 + st.phase);
      ctx.fillStyle = "rgba(255,255,255," + (st.bright * tw).toFixed(3) + ")";
      ctx.fillRect(st.x, st.y, 1, 1);
    }

    // sun or moon: a plain square, as the game draws it
    var size = Math.max(10, Math.round(W / 46));
    var bx = Math.round(W * 0.74), by = Math.round(H * 0.15);
    ctx.fillStyle = sky.bodyColor;
    ctx.fillRect(bx, by, size, size);
    if (sky.body === "moon") {
      ctx.fillStyle = "rgba(150,158,190,0.85)";
      ctx.fillRect(bx + ((size * 0.2) | 0), by + ((size * 0.25) | 0), 2, 2);
      ctx.fillRect(bx + ((size * 0.6) | 0), by + ((size * 0.55) | 0), 3, 2);
    }

    for (var c = 0; c < clouds.length; c++) {
      var cl = clouds[c];
      ctx.fillStyle = sky.cloud.replace(/[\d.]+\)$/, function (a) {
        return (parseFloat(a) * cl.alpha).toFixed(3) + ")";
      });
      var x = Math.round(cl.x), y = Math.round(cl.y);
      ctx.fillRect(x, y, cl.w, cl.h);
      ctx.fillRect(x + cl.step * 4, y - 2, cl.w - cl.step * 8, 2);   // stepped top
      ctx.fillRect(x + cl.step * 2, y + cl.h, cl.w - cl.step * 5, 2); // stepped base
      if (x + cl.w > W) ctx.fillRect(x - W - 60, y, cl.w, cl.h);
    }

    ctx.drawImage(terrainBuf, 0, 0);
  }

  /* ----------------------------------------------------------------- loop */
  var last = 0, frame = null;
  function update(dt) {
    for (var c = 0; c < clouds.length; c++) {
      var cl = clouds[c];
      cl.x += cl.speed * dt * 0.006;
      if (cl.x > W + 60) cl.x = -cl.w - 60;
    }
  }
  function loop(now) {
    frame = window.requestAnimationFrame(loop);
    var dt = last ? Math.min(now - last, 100) : 16;
    last = now;
    update(dt);
    draw(now);
  }
  function start() { if (frame === null && !reduceMotion) { last = 0; frame = window.requestAnimationFrame(loop); } }
  function stop() { if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; } }

  var rt = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () { build(); draw(performance.now()); }, 150);
  });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  build();
  draw(performance.now());
  start();
})();
