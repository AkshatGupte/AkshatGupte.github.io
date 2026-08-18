/**
 * Minecraft-style UI sounds, synthesised at runtime.
 *
 * No audio files: every sound is built from a short oscillator blip plus a
 * band-passed noise transient, which is what gives the game's clicks their dry
 * wooden knock. Pitch is randomised a few percent per press, the same trick
 * Minecraft uses so a run of clicks never sounds mechanical.
 *
 * Nothing plays without a user gesture -- the AudioContext is only created on
 * the first press, which also satisfies browser autoplay policy.
 */
(function () {
  var KEY = "mc-sfx";
  var muted = localStorage.getItem(KEY) === "off";
  var ctx = null, master = null;

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
    return true;
  }

  function vary(f) { return f * (0.94 + Math.random() * 0.12); }

  /** Pitched body: a square wave that drops as it decays. */
  function blip(freq, dur, peak, type) {
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.55), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** The knock: filtered noise with a fast linear decay. */
  function knock(dur, freq, peak) {
    var n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 1.1;
    var g = ctx.createGain();
    g.gain.value = peak;
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start();
  }

  var SOUNDS = {
    // the plain UI click: short, dry, wooden
    click: function () { blip(vary(520), 0.055, 0.30); knock(0.035, vary(1700), 0.20); },
    // opening a GUI: lower and a touch longer, like a chest lid
    open:  function () { blip(vary(300), 0.10, 0.26); knock(0.06, vary(900), 0.22); },
    close: function () { blip(vary(210), 0.09, 0.22); knock(0.05, vary(700), 0.18); },
  };

  function play(name) {
    if (muted || !ensure()) return;
    if (ctx.state === "suspended") ctx.resume();
    try { (SOUNDS[name] || SOUNDS.click)(); } catch (e) { /* never break the page for a sound */ }
  }

  /* ------------------------------------------------------- what makes noise */
  var PRESSABLE = ".btn, .hotbar a, .nav-toggle, .feature-row, .logo, .project-card, .modal-close, .cell";

  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest && e.target.closest(PRESSABLE);
    if (!el) return;
    if (el.id === "sfx-toggle") return;
    if (el.classList.contains("modal-close")) return play("close");
    if (el.classList.contains("project-card")) return play("open");
    play("click");
  }, true);

  // keyboard-activated cards, and Escape closing the modal
  document.addEventListener("keydown", function (e) {
    var modal = document.getElementById("project-modal");
    if (e.key === "Escape" && modal && !modal.hidden) return play("close");
    if (e.key !== "Enter" && e.key !== " ") return;
    var a = document.activeElement;
    if (a && a.matches && a.matches(PRESSABLE)) {
      play(a.classList.contains("project-card") ? "open" : "click");
    }
  }, true);

  /* ------------------------------------------------------------- the toggle */
  var btn = document.createElement("button");
  btn.id = "sfx-toggle";
  btn.type = "button";
  function label() {
    btn.textContent = muted ? "SOUND: OFF" : "SOUND: ON";
    btn.setAttribute("aria-pressed", muted ? "false" : "true");
    btn.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
  }
  label();
  btn.addEventListener("click", function () {
    muted = !muted;
    localStorage.setItem(KEY, muted ? "off" : "on");
    label();
    if (!muted) play("click");   // confirm it is back
  });
  document.body.appendChild(btn);
})();
