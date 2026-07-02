const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const isPageFlipIncoming = () =>
  Boolean(window.PageFlipTransition?.isIncoming?.());

const resetScrollOnRefresh = () => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);

  window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
  });
};

document.body.classList.add("is-lock");

const splitLoaderText = () => {
  const loaderText = document.querySelector("[data-loader-text]");
  if (!loaderText) return;

  const chars = Array.from(loaderText.dataset.loaderText || loaderText.textContent);
  loaderText.textContent = "";
  const center = (chars.length - 1) / 2;

  chars.forEach((char, index) => {
    const wrap = document.createElement("span");
    const inner = document.createElement("span");
    wrap.className = char === " " ? "loader__char-wrap loader__space" : "loader__char-wrap";
    inner.className = "loader__char";
    inner.textContent = char === " " ? "\u00a0" : char;
    inner.style.setProperty("--loader-char-delay", `${Math.abs(index - center) * 0.02}s`);
    wrap.appendChild(inner);
    loaderText.appendChild(wrap);
  });

  loaderText.classList.add("is-split");

  document.querySelectorAll(".loader__panel").forEach((panel) => {
    const lines = Array.from(panel.querySelectorAll("span"));
    const lineCenter = (lines.length - 1) / 2;
    lines.forEach((line, index) => {
      const centerDelay = Math.abs(index - lineCenter) * 0.03;
      const offsetDelay = index % 2 ? 0.08 : 0;
      line.style.setProperty("--loader-line-delay", `${centerDelay + offsetDelay}s`);
    });
  });
};

const splitTitle = () => {
  const title = document.querySelector("[data-split-title]");
  if (!title || title.classList.contains("is-split")) return;

  const chars = Array.from(title.textContent.trim());
  let visibleIndex = 0;
  title.textContent = "";

  chars.forEach((char, index) => {
    const wrap = document.createElement("span");
    const inner = document.createElement("span");
    const isSpace = char === " ";

    if (!isSpace) visibleIndex += 1;

    wrap.className =
      "char-wrap" +
      (isSpace ? " char-wrap--space" : "") +
      (!isSpace ? ` char-wrap--${visibleIndex % 2 === 0 ? "even" : "odd"}` : "");
    inner.className = "char";
    inner.textContent = isSpace ? "\u00a0" : char;
    inner.style.setProperty("--i", index);
    wrap.appendChild(inner);
    title.appendChild(wrap);
  });

  title.classList.add("is-split");
};

const splitContactTitle = () => {
  const title = document.querySelector("[data-contact-title]");
  if (!title || title.classList.contains("is-split")) return;

  const chars = Array.from(title.dataset.contactTitle || title.textContent.trim());
  title.textContent = "";

  chars.forEach((char, index) => {
    const wrap = document.createElement("span");
    const inner = document.createElement("span");
    wrap.className =
      char === " " ? "contact-title__char-wrap contact-title__space" : "contact-title__char-wrap";
    wrap.setAttribute("aria-hidden", "true");
    inner.className = "contact-title__char";
    inner.textContent = char === " " ? "\u00a0" : char;
    inner.style.setProperty("--i", index);
    wrap.appendChild(inner);
    title.appendChild(wrap);
  });

  title.classList.add("is-split");
};

const bindContactTitleReveal = () => {
  const title = document.querySelector("[data-contact-title]");
  if (!title) return;

  let isDone = false;

  const reveal = () => {
    if (isDone) return;

    const rect = title.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight * 1.05 && rect.bottom > 0;

    if (!isInView) return;

    isDone = true;
    title.classList.add("is-visible");
    window.removeEventListener("scroll", reveal);
    window.removeEventListener("resize", reveal);
  };

  window.addEventListener("scroll", reveal, { passive: true });
  window.addEventListener("resize", reveal, { passive: true });
  requestAnimationFrame(reveal);
  window.setTimeout(reveal, 320);
};

const runIntro = () => {
  if (isPageFlipIncoming()) {
    document.body.classList.add("is-ready", "is-loaded", "is-finished");
    document.body.classList.remove(
      "is-lock",
      "is-loading",
      "is-text-drift",
      "is-scan-armed"
    );
    return;
  }

  document.body.classList.add("is-ready");

  window.setTimeout(() => {
    document.body.classList.add("is-text-drift");
  }, 2150);

  window.setTimeout(() => {
    document.body.classList.add("is-scan-armed");
  }, 2345);

  window.setTimeout(() => {
    document.body.classList.add("is-loaded");
  }, 2380);

  window.setTimeout(() => {
    document.body.classList.add("is-finished");
    document.body.classList.remove("is-lock");
  }, 4050);
};

const observeReveals = () => {
  const targets = document.querySelectorAll(
    ".reveal, .reveal-lines, .reveal-card, [data-footer-title], [data-contact-title]"
  );

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((target) => observer.observe(target));
};

const bindParallax = () => {
  const heroMedia = document.querySelector(".hero__media");
  const archiveBg = document.querySelector(".archive__bg");

  if (prefersReducedMotion || (!heroMedia && !archiveBg)) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY || 0;

    if (heroMedia) {
      heroMedia.style.setProperty("--hero-scroll-y", `${y * 0.12}px`);
    }

    if (archiveBg) {
      const rect = archiveBg.parentElement.getBoundingClientRect();
      const offset = (window.innerHeight - rect.top) * 0.05;
      archiveBg.style.transform = `translateY(${offset}px) scale(1.04)`;
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
};

const initHeroCanvas = () => {
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || prefersReducedMotion) return;

  const media = canvas.closest(".hero__media");
  const hero = canvas.closest("[data-hero]");
  const image = media?.querySelector("img");
  const ctx = canvas.getContext("2d", { alpha: false });
  const buffer = document.createElement("canvas");
  const bufferCtx = buffer.getContext("2d", { alpha: false });

  if (!media || !hero || !image || !ctx || !bufferCtx) return;

  const state = {
    hover: 0,
    targetHover: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  };

  let width = 0;
  let height = 0;
  let raf = 0;
  let margin = 160;
  let isStarted = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const smoothstep = (value) => value * value * (3 - 2 * value);

  const drawCoverImage = () => {
    if (!width || !height || !image.naturalWidth) return;

    const bufferWidth = width + margin * 2;
    const bufferHeight = height + margin * 2;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const positionX = width < 900 ? 0.67 : 0.68;
    const positionY = 0.5;
    const scale = Math.max(bufferWidth / imageWidth, bufferHeight / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const x = (bufferWidth - drawWidth) * positionX;
    const y = (bufferHeight - drawHeight) * positionY;

    buffer.width = Math.max(1, Math.ceil(bufferWidth));
    buffer.height = Math.max(1, Math.ceil(bufferHeight));
    bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
    bufferCtx.imageSmoothingEnabled = true;
    bufferCtx.imageSmoothingQuality = "high";
    bufferCtx.fillStyle = "#000";
    bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
    bufferCtx.drawImage(image, x, y, drawWidth, drawHeight);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = canvas.clientWidth || rect.width;
    height = canvas.clientHeight || rect.height;
    margin = Math.max(120, Math.min(240, Math.round(Math.min(width, height) * 0.2)));
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawCoverImage();
  };

  const drawImageLayer = ({
    x = 0,
    y = 0,
    scale = 1,
    scaleX = 1,
    scaleY = 1,
    alpha = 1,
  } = {}) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2 + x, height / 2 + y);
    ctx.scale(scale * scaleX, scale * scaleY);
    ctx.drawImage(
      buffer,
      -buffer.width / 2,
      -buffer.height / 2,
      buffer.width,
      buffer.height
    );
    ctx.restore();
  };

  const drawLens = (time, baseX, baseY, baseScale) => {
    if (state.hover <= 0.01) return;

    const centerX = state.pointerX * width;
    const centerY = state.pointerY * height;
    const lensBase = Math.min(width, height);
    const lensRadiusX = clamp(lensBase * 0.15, 72, 180);
    const lensRadiusY = lensRadiusX * (width < 760 ? 0.66 : 0.52);
    const bandHeight = width < 760 ? 8 : 6;
    const lensScale = 1.022 + state.hover * 0.038;

    ctx.save();
    ctx.globalAlpha = state.hover * 0.78;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, lensRadiusX, lensRadiusY, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = `blur(${0.35 + state.hover * 0.85}px) saturate(1.025)`;

    for (let localY = -lensRadiusY; localY < lensRadiusY; localY += bandHeight) {
      const bandCenter = localY + bandHeight * 0.5;
      const normalizedY = bandCenter / lensRadiusY;
      const span = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
      const falloff = smoothstep(1 - Math.abs(normalizedY));
      const waveX =
        Math.sin(normalizedY * 5.8 + time * 1.08) * 5.5 * falloff * state.hover +
        (state.pointerX - 0.5) * 6 * falloff * state.hover;
      const waveY = Math.cos(normalizedY * 3.4 - time * 0.72) * 1.8 * falloff * state.hover;

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        centerX - lensRadiusX * span - 12,
        centerY + localY,
        lensRadiusX * span * 2 + 24,
        bandHeight + 1
      );
      ctx.clip();
      ctx.translate(centerX + waveX, centerY + waveY);
      ctx.scale(
        lensScale + falloff * 0.022 * state.hover,
        1.012 + falloff * 0.015 * state.hover
      );
      ctx.translate(-centerX, -centerY);
      drawImageLayer({ x: baseX, y: baseY, scale: baseScale });
      ctx.restore();
    }

    ctx.restore();
  };

  const draw = (now = 0) => {
    if (!width || !height) {
      raf = requestAnimationFrame(draw);
      return;
    }

    const time = now * 0.001;
    state.pointerX += (state.targetX - state.pointerX) * 0.12;
    state.pointerY += (state.targetY - state.pointerY) * 0.12;
    state.hover += (state.targetHover - state.hover) * 0.1;

    const autoStrength = 1 - state.hover * 0.74;
    const autoX =
      (Math.sin(time * 0.22) * 11 + Math.sin(time * 0.095 + 1.7) * 5) *
      autoStrength;
    const autoY = Math.sin(time * 0.16 + 0.9) * 3.5 * autoStrength;
    const autoScale = 1.022 + Math.sin(time * 0.18 + 0.4) * 0.012 * autoStrength;
    const parallaxX = (state.pointerX - 0.5) * 22 * state.hover;
    const parallaxY = (state.pointerY - 0.5) * 14 * state.hover;
    const baseX = autoX + parallaxX;
    const baseY = autoY + parallaxY;
    const baseScale = autoScale + state.hover * 0.004;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    drawImageLayer({ x: baseX, y: baseY, scale: baseScale });
    drawLens(time, baseX, baseY, baseScale);

    raf = requestAnimationFrame(draw);
  };

  const updatePointer = (event) => {
    const rect = hero.getBoundingClientRect();
    state.targetX = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    state.targetY = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
  };

  const start = () => {
    if (isStarted) return;
    isStarted = true;
    resize();
    draw(performance.now());
    media.classList.add("is-canvas-ready");
  };

  hero.addEventListener(
    "pointerenter",
    (event) => {
      state.targetHover = 1;
      updatePointer(event);
    },
    { passive: true }
  );

  hero.addEventListener("pointermove", updatePointer, { passive: true });
  hero.addEventListener(
    "pointerleave",
    () => {
      state.targetHover = 0;
      state.targetX = 0.5;
      state.targetY = 0.5;
    },
    { passive: true }
  );

  window.addEventListener(
    "mouseout",
    (event) => {
      if (event.relatedTarget) return;
      state.targetHover = 0;
      state.targetX = 0.5;
      state.targetY = 0.5;
    },
    { passive: true }
  );

  window.addEventListener(
    "blur",
    () => {
      state.targetHover = 0;
      state.targetX = 0.5;
      state.targetY = 0.5;
    },
    { passive: true }
  );

  window.addEventListener("resize", resize, { passive: true });

  if (image.complete && image.naturalWidth) {
    start();
  } else {
    image.addEventListener("load", start, { once: true });
  }

  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), {
    once: true,
  });
};

resetScrollOnRefresh();
splitLoaderText();
splitTitle();
splitContactTitle();
observeReveals();
bindContactTitleReveal();
bindParallax();
initHeroCanvas();
runIntro();
