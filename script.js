const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const SYSTEM_INTRO_SESSION_KEY = "ziyuan-system-intro-seen";

const getNavigationType = () => {
  const [navigation] = performance.getEntriesByType?.("navigation") || [];
  if (navigation?.type) return navigation.type;

  if (performance.navigation?.type === 1) return "reload";
  if (performance.navigation?.type === 2) return "back_forward";
  return "navigate";
};

const isSameOriginReferrer = () => {
  if (!document.referrer) return false;

  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
};

const shouldHonorInitialHash = () =>
  Boolean(window.location.hash && isSameOriginReferrer());

const hasSeenSystemIntro = () => {
  try {
    return window.sessionStorage?.getItem(SYSTEM_INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
};

const markSystemIntroSeen = () => {
  try {
    window.sessionStorage?.setItem(SYSTEM_INTRO_SESSION_KEY, "true");
  } catch {
    // Storage can be unavailable in strict local-file privacy settings.
  }
};

const shouldPlaySystemIntro = () => {
  const navigationType = getNavigationType();
  if (navigationType === "reload") return true;
  if (navigationType === "back_forward") return false;
  if (isSameOriginReferrer()) return false;
  return !hasSeenSystemIntro();
};

const resetScrollOnRefresh = () => {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  if (!shouldHonorInitialHash()) {
    window.scrollTo(0, 0);
  }

  window.addEventListener("pageshow", () => {
    if (!shouldHonorInitialHash()) {
      window.scrollTo(0, 0);
    }
  });
};

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

const finishSystemIntroImmediately = () => {
  document.documentElement.dataset.systemIntro = "skipped";
  document.body.classList.add("is-ready", "is-loaded", "is-finished");
  document.body.classList.remove("is-lock", "is-loading", "is-text-drift", "is-scan-armed");
};

const runIntro = () => {
  if (!shouldPlaySystemIntro()) {
    markSystemIntroSeen();
    finishSystemIntroImmediately();
    return;
  }

  markSystemIntroSeen();
  document.documentElement.dataset.systemIntro = "tear";
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
    document.body.classList.remove("is-lock");
  }, 4050);
};

const jumpToInitialHash = () => {
  if (!shouldHonorInitialHash()) return;

  const id = window.location.hash.slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;

  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.getBoundingClientRect().height + 12 : 0;
  const paddingTop = parseFloat(window.getComputedStyle(target).paddingTop) || 0;
  const selectedOffset =
    id === "selected" ? Math.min(110, paddingTop * 0.75) : 0;

  window.scrollTo({
    left: 0,
    top: Math.max(0, target.offsetTop - headerOffset + selectedOffset),
    behavior: "auto",
  });
};

const observeReveals = () => {
  const targets = document.querySelectorAll(
    ".reveal, .reveal-lines, .reveal-card"
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

  if (prefersReducedMotion || !heroMedia) return;

  let ticking = false;

  const update = () => {
    const y = window.scrollY || 0;

    heroMedia.style.setProperty("--hero-scroll-y", `${y * 0.12}px`);

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

resetScrollOnRefresh();
splitLoaderText();
splitTitle();
observeReveals();
bindParallax();
runIntro();
jumpToInitialHash();
window.addEventListener("load", jumpToInitialHash, { once: true });
