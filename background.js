import dither from "./dither.js";

const host = document.getElementById("bg-field");

if (host) {
  dither(host, {
    waveSpeed: 0.04,
    waveFrequency: 3,
    waveAmplitude: 0.3,
    waveColor: [0.45, 0.28, 0.72], // purple, mixed up from black by the shader
    colorNum: 4,
    pixelSize: 3,
    enableMouseInteraction: true,
    mouseRadius: 0.4,
  });
}
