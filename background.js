import antigravity from "./antigravity.js";

const host = document.getElementById("bg-field");

/**
 * The camera shows a fixed world height (~31.5 units at fov 35, z 50), so the
 * visible area scales with aspect ratio alone. A fixed particle count would make
 * the field sparse on a wide monitor and unreadably dense on a phone, so the
 * count is derived from that area to hold density constant.
 */
function countForViewport() {
  const worldHeight = 2 * Math.tan((35 * Math.PI) / 180 / 2) * 50;
  const area = worldHeight * worldHeight * (window.innerWidth / window.innerHeight);
  return Math.round(Math.min(500, Math.max(130, area * 0.26)));
}

if (host) {
  const narrow = window.innerWidth < 700;

  antigravity(host, {
    count: countForViewport(),
    magnetRadius: 7,
    ringRadius: 8,
    waveSpeed: 0.4,
    waveAmplitude: 1,
    particleSize: narrow ? 1.1 : 1.4,
    lerpSpeed: 0.05,
    color: "#bcd8f5",
    opacity: narrow ? 0.4 : 0.5,
    autoAnimate: true,
    particleVariance: 1,
    depthFactor: 1.2,
    fieldStrength: 10,
  });
}
