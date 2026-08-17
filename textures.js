/**
 * Minecraft-style block textures, generated at runtime.
 *
 * Minecraft textures are 16x16 pixels of hand-placed noise from a tiny palette.
 * Generating them here keeps the site asset-free (no image files to host) and
 * lets them scale up crisply with image-rendering: pixelated.
 */
(function () {
  function texture(palette, seed, size) {
    size = size || 16;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Seeded LCG so the texture is identical on every load and every page.
    let s = seed >>> 0;
    const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        ctx.fillStyle = palette[(rand() * palette.length) | 0];
        ctx.fillRect(x, y, 1, 1);
      }
    }
    return "url(" + canvas.toDataURL() + ")";
  }

  const root = document.documentElement;
  root.style.setProperty(
    "--tex-dirt",
    texture(["#8b6647", "#7d5a3c", "#946e4d", "#6f4f34", "#825e40", "#755539"], 9001)
  );
  root.style.setProperty(
    "--tex-stone",
    texture(["#7e7e7e", "#757575", "#888888", "#6e6e6e", "#818181"], 4242)
  );
  root.style.setProperty(
    "--tex-plank",
    texture(["#9c7f4e", "#a98a55", "#8f7446", "#b1915c"], 777)
  );
})();
