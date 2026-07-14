(() => {
  const denseLayer = document.querySelector(".projects-space__stars--dense");
  const brightLayer = document.querySelector(".projects-space__stars--bright");
  if (!denseLayer || !brightLayer) return;

  let seed = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
    : (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  const random = () => {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clusterCenters = [
    [12, 9], [31, 18], [58, 12], [82, 25],
    [20, 38], [49, 46], [72, 57], [37, 68],
    [15, 78], [63, 84], [88, 91]
  ];
  const colors = ["#fff2d5", "#d8edff", "#f6c98e", "#e9eef8"];

  const createStar = (layer, bright = false) => {
    const star = document.createElement("span");
    const lowerRegion = random() < (bright ? 0.12 : 0.16);
    const clustered = !lowerRegion && random() < (bright ? 0.22 : 0.36);
    let x = random() * 100;
    const topWeighted = random() < (bright ? 0.58 : 0.64);
    let y = lowerRegion
      ? 70 + Math.pow(random(), 0.88) * 29.4
      : (topWeighted ? Math.pow(random(), bright ? 1.32 : 1.48) : random()) * 100;

    if (clustered) {
      const center = clusterCenters[Math.floor(random() * clusterCenters.length)];
      const scatterX = (random() + random() + random() - 1.5) * (bright ? 13 : 18);
      const scatterY = (random() + random() + random() - 1.5) * (bright ? 8 : 12);
      x = clamp(center[0] + scatterX, 0.4, 99.6);
      y = clamp(center[1] + scatterY, 0.3, 99.4);
    }

    const size = bright ? 1.4 + random() * 1.8 : 0.55 + random() * 1.15;
    const opacity = bright ? 0.55 + random() * 0.42 : 0.28 + random() * 0.65;
    const color = colors[Math.floor(random() * colors.length)];

    star.className = `projects-space__star${bright ? " projects-space__star--bright" : ""}`;
    star.style.left = `${x.toFixed(3)}%`;
    star.style.top = `${y.toFixed(3)}%`;
    star.style.width = `${size.toFixed(2)}px`;
    star.style.height = `${size.toFixed(2)}px`;
    star.style.opacity = opacity.toFixed(3);
    star.style.background = color;
    if (bright) star.style.boxShadow = `0 0 ${3 + random() * 6}px ${color}`;
    layer.appendChild(star);
  };

  const denseCount = 1120 + Math.floor(random() * 401);
  const brightCount = 112 + Math.floor(random() * 81);

  for (let index = 0; index < denseCount; index += 1) createStar(denseLayer);
  for (let index = 0; index < brightCount; index += 1) createStar(brightLayer, true);
})();
