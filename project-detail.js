const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo({ left: 0, top: 0, behavior: "auto" });

const getNavigationType = () => {
  const [navigation] = performance.getEntriesByType?.("navigation") || [];
  if (navigation?.type) return navigation.type;

  if (performance.navigation?.type === 1) return "reload";
  if (performance.navigation?.type === 2) return "back_forward";
  return "navigate";
};

const shouldPlayTearIntro = () => {
  const navigationType = getNavigationType();
  if (navigationType === "back_forward") return false;
  return true;
};

const isPageFlipIncoming = () =>
  Boolean(window.PageFlipTransition?.isIncoming?.());


// 图片替换入口：详情页通过 body[data-project] 选择对应素材集。
const PLACEHOLDER_IMAGE = "./assets/project-placeholder.svg";
const PROJECT_IMAGE_SETS = {
  "bi-agent": {
    folder: "assets/bi-agent/",
    slots: {
      hero: "./assets/bi-agent/bi-agent-hero.jpg",
      more01: "./assets/bi-agent/bi-agent-01.jpg",
      more02: "./assets/bi-agent/bi-agent-02.jpg",
      more03: "./assets/bi-agent/bi-agent-03.jpg",
      more04: "./assets/bi-agent/bi-agent-04.jpg",
      more05: "./assets/bi-agent/bi-agent-05.jpg",
      more06: "./assets/bi-agent/bi-agent-06.jpg",
      more07: "./assets/bi-agent/bi-agent-07.jpg",
      more08: "./assets/bi-agent/bi-agent-08.jpg",
      more09: "./assets/bi-agent/bi-agent-09.jpg",
      more10: "./assets/bi-agent/bi-agent-10.jpg",
    },
  },
  "open-bank": {
    folder: "assets/open-bank/",
    slots: Object.fromEntries(
      Array.from({ length: 28 }, (_, index) => {
        const slot = index === 0 ? "hero" : `more${String(index).padStart(2, "0")}`;
        return [slot, `./assets/open-bank/open-bank-${String(index).padStart(2, "0")}.jpg`];
      })
    ),
  },
};

const getProjectConfig = () => {
  const projectName = document.body.dataset.project || "bi-agent";
  return PROJECT_IMAGE_SETS[projectName] || PROJECT_IMAGE_SETS["bi-agent"];
};

const ANCHOR_SECTION_THEMES = {
  "open-bank-01": "dark",
  "open-bank-02": "light",
  "open-bank-03": "dark",
  "open-bank-04": "light",
  "open-bank-05": "light",
  "open-bank-06": "dark",
  "open-bank-07": "light",
  "open-bank-08": "light",
  "open-bank-09": "light",
  "open-bank-10": "light",
  "open-bank-11": "light",
  "open-bank-12": "light",
  "open-bank-13": "light",
  "open-bank-14": "light",
  "open-bank-15": "light",
  "open-bank-16": "light",
  "open-bank-17": "light",
  "open-bank-18": "light",
  "open-bank-19": "dark",
  "open-bank-20": "dark",
  "open-bank-21": "dark",
  "open-bank-22": "light",
  "open-bank-23": "light",
  "open-bank-24": "light",
  "open-bank-25": "light",
  "open-bank-26": "dark",
  "open-bank-27": "light",
};

const state = {
  smoothY: 0,
  targetY: 0,
  maxScroll: 0,
  headerHeight: 0,
  headerTicking: false,
  effectsTicking: false,
  raf: 0,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setupImageSlots = () => {
  const imageSlots = getProjectConfig().slots;

  document.querySelectorAll("[data-image-slot]").forEach((image) => {
    const slotName = image.dataset.imageSlot;
    const nextSrc = imageSlots[slotName] || PLACEHOLDER_IMAGE;
    image.src = nextSrc;
    image.dataset.placeholderActive = String(nextSrc === PLACEHOLDER_IMAGE);
    image.decoding = "async";
  });
};

const setupLoadingDelays = () => {
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

// 参考站交互：首屏 HELLO 入场与上下黑色分栏退场。
const runIntro = () => {
  if (isPageFlipIncoming() || !shouldPlayTearIntro()) {
    document.body.classList.add("is-ready", "is-loaded", "is-finished");
    document.body.classList.remove("is-lock", "is-loading", "is-text-drift", "is-scan-armed");
    return;
  }

  document.body.classList.add("is-lock", "is-ready");

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
    document.body.classList.remove("is-lock", "is-loading");
  }, 4050);
};

const setIndexedTransitions = () => {
  document.querySelectorAll("[data-footer-type] .show").forEach((span, index) => {
    span.style.setProperty("--footer-index", index);
  });
};

const splitNextTitle = () => {
  document.querySelectorAll("[data-next-title]").forEach((title) => {
    if (title.classList.contains("is-split")) return;

    const chars = Array.from(title.dataset.nextTitle || title.textContent.trim());
    let letterIndex = 0;
    title.textContent = "";

    chars.forEach((char, index) => {
      const wrap = document.createElement("span");
      const inner = document.createElement("span");
      const isSpace = char === " ";

      if (!isSpace) letterIndex += 1;

      wrap.className =
        "contact-title__char-wrap" +
        (isSpace ? " contact-title__space" : "") +
        (!isSpace
          ? ` p-single-next__char-wrap--${letterIndex % 2 === 0 ? "even" : "odd"}`
          : "");
      wrap.setAttribute("aria-hidden", "true");
      inner.className = "contact-title__char";
      inner.textContent = isSpace ? "\u00a0" : char;
      inner.style.setProperty("--i", index);
      wrap.appendChild(inner);
      title.appendChild(wrap);
    });

    title.classList.add("is-split");
  });
};

const anchorLinks = () => Array.from(document.querySelectorAll("[data-anchor-link]"));

const getRoot = () => document.querySelector("[data-smooth-root]");
const getHeader = () => document.querySelector(".site-header");

const resetScrollToTop = () => {
  state.targetY = 0;
  state.smoothY = 0;
  window.scrollTo({ left: 0, top: 0, behavior: "auto" });
  getRoot()?.style.setProperty("transform", "translate3d(0, 0, 0)");
  requestHeaderUpdate();
};

const getVisualScroll = () =>
  prefersReducedMotion || !document.body.classList.contains("is-smooth")
    ? window.scrollY || window.pageYOffset || 0
    : state.smoothY;

const updateHeaderMetrics = () => {
  const header = getHeader();
  if (!header) return 1;

  state.headerHeight = Math.max(1, header.getBoundingClientRect().height);
  document.documentElement.style.setProperty(
    "--header-height",
    `${state.headerHeight}px`
  );

  return state.headerHeight;
};

const getHeaderHeight = () => state.headerHeight || updateHeaderMetrics();

// 顶部 head 滚动交互：以实际 head 高度为阈值，线性淡出背景并在全透明时切换文字反色。
const updateHeaderState = () => {
  const header = getHeader();
  if (!header) return;

  const headerHeight = getHeaderHeight();
  const visualScroll = getVisualScroll();
  const normalizedScroll = visualScroll < 1 ? 0 : visualScroll;
  const progress = clamp(normalizedScroll / headerHeight, 0, 1);
  const alpha = 1 - progress;

  header.style.setProperty("--header-bg-alpha", alpha.toFixed(3));
  header.classList.toggle("is-header-transparent", progress >= 0.98);
  header.classList.toggle("is-header-solid", progress < 0.98);
};

const requestHeaderUpdate = () => {
  if (state.headerTicking) return;

  state.headerTicking = true;
  window.requestAnimationFrame(() => {
    updateHeaderState();
    state.headerTicking = false;
  });
};

const resizeSmoothScroll = () => {
  const root = getRoot();
  if (!root || prefersReducedMotion) return;

  document.body.classList.add("is-resizing");
  root.style.transform = "translate3d(0, 0, 0)";
  const height = root.scrollHeight;
  document.body.style.height = `${height}px`;
  state.maxScroll = Math.max(0, height - window.innerHeight);
  state.targetY = clamp(window.scrollY || 0, 0, state.maxScroll);
  state.smoothY = clamp(state.smoothY, 0, state.maxScroll);

  window.requestAnimationFrame(() => {
    document.body.classList.remove("is-resizing");
  });
};

// 参考站交互：Lenis 式平滑滚动，这里用原生 RAF 插值复刻柔和滚动惯性。
const setupSmoothScroll = () => {
  const root = getRoot();
  if (!root || prefersReducedMotion) {
    document.body.classList.add("is-reduced-motion");
    return;
  }

  document.body.classList.add("is-smooth");
  resizeSmoothScroll();

  const tick = () => {
    state.targetY = clamp(window.scrollY || 0, 0, state.maxScroll);
    const distance = state.targetY - state.smoothY;
    state.smoothY += distance * 0.095;

    if (Math.abs(distance) < 0.08) {
      state.smoothY = state.targetY;
    }

    // Keep the scroller on whole CSS pixels. Fractional transforms can make
    // Chrome resample large portfolio screenshots and soften small text.
    const roundedY = Math.round(state.smoothY);
    root.style.transform = `translate3d(0, ${-roundedY}px, 0)`;
    updateScrollDrivenEffects();
    state.raf = window.requestAnimationFrame(tick);
  };

  state.raf = window.requestAnimationFrame(tick);

  window.addEventListener("resize", resizeSmoothScroll, { passive: true });
  window.addEventListener("load", resizeSmoothScroll, { once: true });
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", resizeSmoothScroll, { once: true });
  });
};

const setupHeaderScroll = () => {
  updateHeaderMetrics();
  updateHeaderState();

  window.addEventListener(
    "resize",
    () => {
      updateHeaderMetrics();
      requestHeaderUpdate();
    },
    { passive: true }
  );

  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
};

const isElementInRange = (element, startRatio = 0.8) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * startRatio && rect.bottom > 0;
};

const parseRgb = (color) => {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;

  const [r, g, b, a = 1] = match[1]
    .split(",")
    .map((value) => Number.parseFloat(value));
  if ([r, g, b].some((value) => Number.isNaN(value)) || a < 0.05) return null;

  return { r, g, b };
};

const getLuminance = ({ r, g, b }) => {
  const toLinear = (value) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const getImageLuminanceAtPoint = (image, x, y) => {
  if (!image.complete || !image.naturalWidth || !image.naturalHeight) return null;

  const rect = image.getBoundingClientRect();
  const style = window.getComputedStyle(image);
  const scale =
    style.objectFit === "cover"
      ? Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
      : Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const renderedLeft = rect.left + (rect.width - renderedWidth) / 2;
  const renderedTop = rect.top + (rect.height - renderedHeight) / 2;

  if (
    x < renderedLeft ||
    x > renderedLeft + renderedWidth ||
    y < renderedTop ||
    y > renderedTop + renderedHeight
  ) {
    return null;
  }

  const sx = clamp(
    Math.round(((x - renderedLeft) / renderedWidth) * image.naturalWidth),
    0,
    image.naturalWidth - 1
  );
  const sy = clamp(
    Math.round(((y - renderedTop) / renderedHeight) * image.naturalHeight),
    0,
    image.naturalHeight - 1
  );
  const canvas = getImageLuminanceAtPoint.canvas || document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  getImageLuminanceAtPoint.canvas = canvas;
  canvas.width = 1;
  canvas.height = 1;

  try {
    context.clearRect(0, 0, 1, 1);
    context.drawImage(image, sx, sy, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return getLuminance({ r, g, b });
  } catch {
    return null;
  }
};

const getBackgroundLuminanceAtPoint = (nav, x, y) => {
  const previousVisibility = nav.style.visibility;
  nav.style.visibility = "hidden";
  const element = document.elementFromPoint(x, y);
  nav.style.visibility = previousVisibility;

  if (!element) return null;

  const image =
    element.tagName === "IMG"
      ? element
      : element.closest(".p-single-images__item")?.querySelector("img");
  const imageLuminance = image ? getImageLuminanceAtPoint(image, x, y) : null;
  if (imageLuminance !== null) return imageLuminance;

  let current = element;
  while (current && current !== document.documentElement) {
    const color = parseRgb(window.getComputedStyle(current).backgroundColor);
    if (color) return getLuminance(color);
    current = current.parentElement;
  }

  return getLuminance(
    parseRgb(window.getComputedStyle(document.body).backgroundColor) || {
      r: 221,
      g: 221,
      b: 221,
    }
  );
};

const getAnchorThemeAtPoint = (nav, x, y) => {
  const previousVisibility = nav.style.visibility;
  nav.style.visibility = "hidden";
  const element = document.elementFromPoint(x, y);
  nav.style.visibility = previousVisibility;

  const section = element?.closest?.(".p-single-images__item, .p-single-mv");
  if (!section) return null;

  return section.dataset.anchorTheme || ANCHOR_SECTION_THEMES[section.id] || null;
};

// 参考站交互：首屏背景随滚动向下缓慢位移。
const updateHeroParallax = () => {
  const image = document.querySelector(".p-single-mv__background img");
  if (!image || prefersReducedMotion) return;

  const scrollY = getVisualScroll();
  const y = clamp(scrollY * 0.3, 0, window.innerHeight * 0.3);
  image.style.setProperty("--single-mv-y", `${y}px`);
};

const markImageRevealComplete = (item) => {
  if (item.dataset.revealComplete === "true") return;
  item.dataset.revealComplete = "true";

  const finish = () => item.classList.add("is-reveal-complete");

  item.addEventListener(
    "transitionend",
    (event) => {
      if (event.propertyName.includes("clip-path")) {
        finish();
      }
    },
    { once: true }
  );

  window.setTimeout(finish, IMAGE_REVEAL_DURATION_MS + 220);
};

// 参考站交互：作品图进入视口时由上至下 clip-path 揭示。
const updateImageReveals = () => {
  return;

  if (getVisualScroll() < IMAGE_REVEAL_MIN_SCROLL) return;

  document.querySelectorAll(".p-single-images__item").forEach((item) => {
    if (item.classList.contains("is-revealed")) return;
    if (isElementInRange(item, IMAGE_REVEAL_TRIGGER_RATIO)) {
      item.classList.add("is-revealed");
      markImageRevealComplete(item);
    }
  });
};

// 参考站交互：View Next 字母错位滑入。
const updateNextReveal = () => {
  const next = document.querySelector(".p-single-next");
  if (!next || next.classList.contains("is-visible")) return;
  if (isElementInRange(next, 0.8)) next.classList.add("is-visible");
};

// 参考站交互：页脚大字逐字回位。
const updateFooterReveal = () => {
  const footerType = document.querySelector("[data-footer-type]");
  if (!footerType || footerType.classList.contains("is-visible")) return;
  if (isElementInRange(document.querySelector(".l-footer"), 0.5)) {
    footerType.classList.add("is-visible");
  }
};

const updateAnchorActive = () => {
  const links = anchorLinks();
  if (!links.length) return;

  let activeId = links[0].dataset.anchorLink;
  const scrollPoint = getVisualScroll() + getHeaderHeight() + window.innerHeight * 0.5;

  links.forEach((link) => {
    const id = link.dataset.anchorLink;
    const section = document.getElementById(id);
    if (!section) return;

    if (section.offsetTop <= scrollPoint) {
      activeId = id;
    }
  });

  links.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.anchorLink === activeId);
  });
};

const updateAnchorVisibility = () => {
  const nav = document.querySelector("[data-anchor-nav]");
  const images = document.querySelector(".p-single-images");
  if (!nav || !images) return;

  const showFrom = images.offsetTop - window.innerHeight * 0.25;
  const contact = document.getElementById("contact");
  const visualScroll = getVisualScroll();
  const hideOnContact =
    contact && visualScroll + window.innerHeight * 0.35 >= contact.offsetTop;

  nav.classList.toggle("is-hidden-before-images", visualScroll < showFrom);
  nav.classList.toggle("is-hidden-on-contact", Boolean(hideOnContact));
  nav.classList.add("is-anchor-ready");
};

const updateAnchorContrast = () => {
  const nav = document.querySelector("[data-anchor-nav]");
  const rail = nav?.querySelector(".c-anchor-nav__rail");
  if (
    !nav ||
    !rail ||
    nav.classList.contains("is-hidden-before-images") ||
    nav.classList.contains("is-hidden-on-contact")
  ) {
    return;
  }

  const rect = rail.getBoundingClientRect();
  const x = clamp(rect.left + rect.width / 2, 0, window.innerWidth - 1);
  const centerY = rect.top + rect.height / 2;
  const sampleOffsets = [-30, -14, 14, 30];
  const themeSamples = sampleOffsets
    .map((offset) =>
      getAnchorThemeAtPoint(nav, x, clamp(centerY + offset, 0, window.innerHeight - 1))
    )
    .filter(Boolean);
  const darkThemeVotes = themeSamples.filter((theme) => theme === "dark").length;
  const lightThemeVotes = themeSamples.filter((theme) => theme === "light").length;
  const hasThemeVote = darkThemeVotes + lightThemeVotes > 0;
  const luminanceSamples = hasThemeVote
    ? []
    : sampleOffsets
        .map((offset) =>
          getBackgroundLuminanceAtPoint(
            nav,
            x,
            clamp(centerY + offset, 0, window.innerHeight - 1)
          )
        )
        .filter((value) => value !== null);
  const darkLuminanceVotes = luminanceSamples.filter((value) => value < 0.42).length;
  const isDark = hasThemeVote
    ? darkThemeVotes >= lightThemeVotes
    : luminanceSamples.length > 0 &&
      darkLuminanceVotes >= Math.ceil(luminanceSamples.length / 2);

  nav.classList.toggle("is-on-dark", isDark);
  nav.classList.toggle("is-on-light", !isDark);
};

const updateScrollDrivenEffects = () => {
  updateHeaderState();
  updateHeroParallax();
  updateNextReveal();
  updateFooterReveal();
  updateAnchorVisibility();
  updateAnchorContrast();
  updateAnchorActive();
};

const requestScrollDrivenEffectsUpdate = () => {
  if (state.effectsTicking) return;

  state.effectsTicking = true;
  window.requestAnimationFrame(() => {
    updateScrollDrivenEffects();
    state.effectsTicking = false;
  });
};

const setupScrollDrivenEffects = () => {
  window.addEventListener("scroll", requestScrollDrivenEffectsUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestScrollDrivenEffectsUpdate, {
    passive: true,
  });

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", requestScrollDrivenEffectsUpdate, {
      once: true,
    });
  });
};

const setupAnchorNav = () => {
  anchorLinks().forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const id = link.dataset.anchorLink;
      const target = document.getElementById(id);
      if (!target) return;

      const headerOffset = getHeaderHeight() + 12;
      const top = Math.max(0, target.offsetTop - headerOffset);
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });
};

// 参考站交互：View Next 区域鼠标移动时生成虚线方框光标残影。
const setupNextMouseTrail = () => {
  if (window.matchMedia("(hover: none)").matches) return;

  const next = document.querySelector(".p-single-next");
  if (!next) return;

  const minDistance = 60;
  const last = { x: 0, y: 0 };

  next.addEventListener(
    "pointermove",
    (event) => {
      const rect = next.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (Math.abs(x - last.x) <= minDistance && Math.abs(y - last.y) <= minDistance) {
        return;
      }

      const point = document.createElement("div");
      point.className = "mouse-point";
      point.style.transform = `translate(${x}px, ${y}px) scale(0)`;
      next.appendChild(point);
      last.x = x;
      last.y = y;

      const enter = point.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(0)` },
          { transform: `translate(${x}px, ${y}px) scale(1)` },
        ],
        { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
      );

      enter.finished
        .then(() =>
          point.animate(
            [
              { opacity: 1, transform: `translate(${x}px, ${y}px) scale(1)` },
              { opacity: 0, transform: `translate(${x}px, ${y}px) scale(0)` },
            ],
            {
              duration: 330,
              easing: "cubic-bezier(0.64, 0, 0.78, 0)",
              fill: "forwards",
            }
          ).finished
        )
        .finally(() => point.remove());
    },
    { passive: true }
  );
};

const validateRequiredChanges = () => {
  const allImages = Array.from(document.querySelectorAll("img"));
  const projectFolder = getProjectConfig().folder;
  const result = {
    previewCardRemoved: !document.querySelector(".p-single-mv__card"),
    detailScopeRestored:
      document.querySelector(".p-single-detail")?.textContent.includes("写在最前") &&
      document.querySelector(".p-single-scope")?.textContent.includes("负责内容"),
    projectImagesApplied: allImages.every((image) => {
      const src = image.getAttribute("src") || "";
      const objectFit = window.getComputedStyle(image).objectFit;
      return src.includes(projectFolder) && objectFit === "contain";
    }),
  };

  const passed = Object.values(result).every(Boolean);
  document.documentElement.dataset.requirementCheck = passed ? "passed" : "failed";

  if (passed) {
    console.info("[Requirement Check] Passed", result);
  } else {
    console.error("[Requirement Check] Failed", result);
  }

  return result;
};

const init = () => {
  resetScrollToTop();
  setupImageSlots();
  setupLoadingDelays();
  splitNextTitle();
  setIndexedTransitions();
  setupSmoothScroll();
  setupHeaderScroll();
  setupScrollDrivenEffects();
  setupAnchorNav();
  setupNextMouseTrail();
  updateScrollDrivenEffects();
  runIntro();

  window.setTimeout(() => {
    updateScrollDrivenEffects();
    validateRequiredChanges();
  }, prefersReducedMotion ? 160 : 3200);
};

window.addEventListener("DOMContentLoaded", init, { once: true });
window.addEventListener("pageshow", resetScrollToTop);
window.addEventListener("load", resetScrollToTop, { once: true });
window.addEventListener("pagehide", () => {
  if (state.raf) window.cancelAnimationFrame(state.raf);
});
