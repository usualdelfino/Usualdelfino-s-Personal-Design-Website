(function () {
  const STORAGE_KEY = "ziyuan-page-flip-transition";
  const HISTORY_SOURCE_KEY = "ziyuan-page-flip-history-source";
  const WINDOW_NAME_PREFIX = "ziyuan-page-flip:";
  const TRACKED_ROUTES = new Set(["index.html", "open-bank.html", "bi-agent.html"]);
  const PROJECT_ROUTES = new Set(["open-bank.html", "bi-agent.html"]);
  const DURATION_MS = 1200;
  const PREVIEW_READY_TIMEOUT_MS = 1400;
  const PREVIEW_FAILSAFE_TIMEOUT_MS = 2600;
  const ARRIVAL_STABLE_TIMEOUT_MS = 650;
  const MODE_PREVIEW = "preview";
  const MODE_ARRIVE = "arrive";
  const MODE_HISTORY = "history";
  const HISTORY_LOADING_CLASS = "is-page-flip-history-loading";
  const HISTORY_COVER_CLASS = "page-flip-history-cover";
  let isNavigating = false;
  let historyFlipPromise = null;

  const parseState = (raw) => {
    if (!raw) return null;

    try {
      const state = JSON.parse(raw);
      const age = Date.now() - Number(state.time || 0);
      return age <= 12000 ? state : null;
    } catch {
      return null;
    }
  };

  const readHistorySource = () => {
    try {
      const state = parseState(window.sessionStorage.getItem(HISTORY_SOURCE_KEY));
      if (!state) {
        window.sessionStorage.removeItem(HISTORY_SOURCE_KEY);
      }

      return state;
    } catch {
      return null;
    }
  };

  const writeHistorySource = () => {
    try {
      window.sessionStorage.setItem(
        HISTORY_SOURCE_KEY,
        JSON.stringify({
          source: window.location.href,
          scrollX: window.scrollX || window.pageXOffset || 0,
          scrollY: window.scrollY || window.pageYOffset || 0,
          time: Date.now(),
        })
      );
    } catch {
      // Ignore storage failures; history navigation can still fall back cleanly.
    }
  };

  const readWindowNameState = () => {
    if (!window.name.startsWith(WINDOW_NAME_PREFIX)) return null;
    return parseState(window.name.slice(WINDOW_NAME_PREFIX.length));
  };

  const writeWindowNameState = (state) => {
    window.name = `${WINDOW_NAME_PREFIX}${JSON.stringify(state)}`;
  };

  const clearWindowNameState = () => {
    if (window.name.startsWith(WINDOW_NAME_PREFIX)) {
      window.name = "";
    }
  };

  const readTransitionState = () => {
    try {
      const state = parseState(window.sessionStorage.getItem(STORAGE_KEY));
      if (!state) {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }

      return state || readWindowNameState();
    } catch {
      return readWindowNameState();
    }
  };

  const createTransitionState = (url, mode) => ({
    source: window.location.href,
    target: url.href,
    time: Date.now(),
    mode,
  });

  const writeTransitionState = (url, mode) => {
    const state = {
      source: window.location.href,
      target: url.href,
      time: Date.now(),
      mode,
    };

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The transition still works on the leaving page if storage is unavailable.
    }

    writeWindowNameState(state);
  };

  const clearTransitionState = () => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }

    clearWindowNameState();
  };

  const waitForFrames = (count = 2) =>
    new Promise((resolve) => {
      const step = (remaining) => {
        if (remaining <= 0) {
          resolve();
          return;
        }

        window.requestAnimationFrame(() => step(remaining - 1));
      };

      step(count);
    });

  const whenBodyReady = (callback) => {
    if (document.body) {
      callback();
      return;
    }

    window.requestAnimationFrame(() => whenBodyReady(callback));
  };

  const waitUntil = (predicate, timeout = ARRIVAL_STABLE_TIMEOUT_MS) =>
    new Promise((resolve) => {
      const startedAt = Date.now();

      const tick = () => {
        let passed = false;

        try {
          passed = Boolean(predicate());
        } catch {
          passed = false;
        }

        if (passed || Date.now() - startedAt >= timeout) {
          resolve(passed);
          return;
        }

        window.requestAnimationFrame(tick);
      };

      tick();
    });

  const waitForImageReady = (image, timeout = 900) =>
    new Promise((resolve) => {
      if (!image || image.complete) {
        resolve();
        return;
      }

      let isDone = false;
      const finish = () => {
        if (isDone) return;
        isDone = true;
        image.removeEventListener("load", finish);
        image.removeEventListener("error", finish);
        resolve();
      };

      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      window.setTimeout(finish, timeout);
    });

  const waitForMediaReady = (media, timeout = 900) =>
    new Promise((resolve) => {
      if (!media) {
        resolve();
        return;
      }

      const tagName = media.tagName?.toLowerCase();
      if (tagName !== "video") {
        waitForImageReady(media, timeout).then(resolve);
        return;
      }

      if (media.readyState >= 2) {
        resolve();
        return;
      }

      let isDone = false;
      const finish = () => {
        if (isDone) return;
        isDone = true;
        media.removeEventListener("loadeddata", finish);
        media.removeEventListener("canplay", finish);
        media.removeEventListener("error", finish);
        resolve();
      };

      media.addEventListener("loadeddata", finish, { once: true });
      media.addEventListener("canplay", finish, { once: true });
      media.addEventListener("error", finish, { once: true });
      window.setTimeout(finish, timeout);
    });

  const waitForFontsReady = (doc, timeout = 600) => {
    if (!doc.fonts?.ready) return Promise.resolve();

    return Promise.race([
      doc.fonts.ready.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, timeout)),
    ]);
  };

  const waitForDocumentStable = async (
    doc = document,
    timeout = ARRIVAL_STABLE_TIMEOUT_MS,
    { waitForCanvas = true } = {}
  ) => {
    const startedAt = Date.now();
    const timeLeft = () => Math.max(120, timeout - (Date.now() - startedAt));

    await waitUntil(() => {
      const body = doc.body;
      return (
        !body ||
        body.classList.contains("is-finished") ||
        body.classList.contains("is-loaded")
      );
    }, timeLeft());

    const firstScreenMedia = doc.querySelector(
      ".p-single-mv__background img, .hero__media img, .hero__media video"
    );
    await waitForMediaReady(firstScreenMedia, Math.min(900, timeLeft()));

    const heroMedia = doc.querySelector(".hero__media");
    if (waitForCanvas && heroMedia?.querySelector(".hero__canvas")) {
      await waitUntil(
        () => heroMedia.classList.contains("is-canvas-ready"),
        Math.min(900, timeLeft())
      );
    }

    await waitForFrames(2);
  };

  const forcePreviewFinalState = (doc) => {
    const body = doc.body;
    if (!body) return;

    doc.documentElement.classList.add("is-page-flip-incoming", "is-page-flip-arriving");
    body.classList.add("is-ready", "is-loaded", "is-finished");
    body.classList.remove("is-lock", "is-loading", "is-text-drift", "is-scan-armed");
  };

  const getNavigationType = () => {
    try {
      const [navigation] = window.performance?.getEntriesByType?.("navigation") || [];
      if (navigation?.type) return navigation.type;

      if (window.performance?.navigation?.type === 1) return "reload";
      if (window.performance?.navigation?.type === 2) return "back_forward";
    } catch {
      // Fall through to a normal navigation.
    }

    return "navigate";
  };

  const routeNameFromPath = (path) => {
    const parts = path.split("/").filter(Boolean);
    const fileName = (parts[parts.length - 1] || "index.html").toLowerCase();
    return fileName.includes(".") ? fileName : "index.html";
  };

  const routeNameFromUrl = (url) => {
    return routeNameFromPath(url.pathname);
  };

  const getPageFallbackVisualByRoute = (routeName) => {
    if (routeName === "open-bank.html") {
      return {
        color: "#dddddd",
        image: 'url("./assets/open-bank/open-bank-00.jpg")',
        position: "center",
        size: "contain",
      };
    }

    if (routeName === "bi-agent.html") {
      return {
        color: "#dddddd",
        image: 'url("./assets/bi-agent/bi-agent-hero.jpg")',
        position: "center",
        size: "contain",
      };
    }

    return {
      color: "#050505",
      image: 'url("./assets/hero-black-hole.png")',
      position: "68% center",
      size: "cover",
    };
  };

  const getPageFallbackVisual = (url) => {
    return getPageFallbackVisualByRoute(routeNameFromUrl(url));
  };

  const historyState =
    getNavigationType() === "back_forward"
      ? {
          source: readHistorySource()?.source || "history",
          target: window.location.href,
          time: Date.now(),
          mode: MODE_HISTORY,
        }
      : null;

  const incomingState = readTransitionState() || historyState;
  const currentRouteName = routeNameFromPath(window.location.pathname);
  const isArrivingPage =
    incomingState?.mode === MODE_PREVIEW || incomingState?.mode === MODE_ARRIVE;
  const isHistoryPage = incomingState?.mode === MODE_HISTORY;
  const isHomePreviewPage =
    currentRouteName === "index.html" && incomingState?.mode === MODE_PREVIEW;
  const isHomeArrivingPage =
    currentRouteName === "index.html" && incomingState?.mode === MODE_ARRIVE;
  const shouldRevealCurrentPage =
    incomingState &&
    incomingState.mode !== MODE_PREVIEW &&
    incomingState.mode !== MODE_ARRIVE &&
    incomingState.mode !== MODE_HISTORY;

  if (incomingState) {
    document.documentElement.classList.add("is-page-flip-incoming");
  }

  if (isArrivingPage) {
    document.documentElement.classList.add("is-page-flip-arriving");
  }

  if (isHomePreviewPage) {
    document.documentElement.classList.add("is-page-flip-home-preview");
  }

  if (isHomeArrivingPage) {
    document.documentElement.classList.add("is-page-flip-home-arrive");
  }

  if (isHistoryPage) {
    document.documentElement.classList.add(HISTORY_LOADING_CLASS);
  }

  if (shouldRevealCurrentPage) {
    document.documentElement.classList.add("is-page-flip-pending");
  }

  window.PageFlipTransition = {
    isIncoming: () => Boolean(incomingState),
    mode: () => incomingState?.mode || "",
  };

  const releaseArrivingFrameLock = () => {
    if (!isArrivingPage) return;

    waitForDocumentStable(document, ARRIVAL_STABLE_TIMEOUT_MS, {
      waitForCanvas: false,
    }).finally(() => {
      document.documentElement.classList.remove("is-page-flip-arriving");
    });
  };

  const isSameOriginUrl = (url) => {
    if (url.protocol === "file:" && window.location.protocol === "file:") {
      return true;
    }

    return url.origin === window.location.origin;
  };

  const shouldUsePageFlip = (url) => {
    if (!isSameOriginUrl(url)) return false;

    const currentRoute = routeNameFromUrl(new URL(window.location.href));
    const nextRoute = routeNameFromUrl(url);
    if (currentRoute === nextRoute) return false;
    if (!TRACKED_ROUTES.has(currentRoute) || !TRACKED_ROUTES.has(nextRoute)) return false;

    const isCurrentProject = PROJECT_ROUTES.has(currentRoute);
    const isNextProject = PROJECT_ROUTES.has(nextRoute);
    const isCurrentHome = currentRoute === "index.html";
    const isNextHome = nextRoute === "index.html";

    return (
      (isCurrentHome && isNextProject) ||
      (isCurrentProject && isNextHome) ||
      (isCurrentProject && isNextProject)
    );
  };

  const applyPageFallbackVisual = (element, url) => {
    const fallback = getPageFallbackVisual(url);
    element.style.backgroundColor = fallback.color;
    element.style.backgroundImage = fallback.image;
    element.style.backgroundPosition = fallback.position;
    element.style.backgroundRepeat = "no-repeat";
    element.style.backgroundSize = fallback.size;
  };

  const applyInitialHistoryBackground = () => {
    if (!isHistoryPage) return;

    let fallback = getPageFallbackVisualByRoute(currentRouteName);

    try {
      const sourceUrl = new URL(readHistorySource()?.source || "");
      if (shouldUsePageFlip(sourceUrl)) {
        fallback = getPageFallbackVisual(sourceUrl);
      }
    } catch {
      // Fall back to the restored page visual if there is no usable source route.
    }

    const root = document.documentElement;
    root.style.backgroundColor = fallback.color;
    root.style.backgroundImage = fallback.image;
    root.style.backgroundPosition = fallback.position;
    root.style.backgroundRepeat = "no-repeat";
    root.style.backgroundSize = fallback.size;
  };

  const clearInitialHistoryBackground = () => {
    const root = document.documentElement;
    root.style.removeProperty("background-color");
    root.style.removeProperty("background-image");
    root.style.removeProperty("background-position");
    root.style.removeProperty("background-repeat");
    root.style.removeProperty("background-size");
  };

  applyInitialHistoryBackground();

  const removeElements = (elements) => {
    elements.forEach((element) => {
      if (element?.isConnected) element.remove();
    });
  };

  const getPageFlipLayers = () =>
    Array.from(
      document.querySelectorAll(
        ".page-flip-preview, .page-flip-history-frame, .page-flip-history-cover"
      )
    );

  const ensureHistoryCover = (url = null) => {
    let fallbackUrl = url;

    if (!fallbackUrl) {
      try {
        fallbackUrl = new URL(window.location.href);
      } catch {
        fallbackUrl = null;
      }
    }

    let cover = document.querySelector(`.${HISTORY_COVER_CLASS}`);
    if (!cover) {
      cover = document.createElement("div");
      cover.className = HISTORY_COVER_CLASS;
      cover.setAttribute("aria-hidden", "true");
      document.body.appendChild(cover);
    }

    if (fallbackUrl) {
      applyPageFallbackVisual(cover, fallbackUrl);
    }

    return cover;
  };

  const getPreviewFirstScreenMedia = (doc, routeName) => {
    if (routeName === "index.html") {
      return doc.querySelector(".hero__media img, .hero__media video");
    }

    return doc.querySelector(".p-single-mv__background img");
  };

  const isPreviewRouteReady = (doc, routeName) => {
    if (!doc?.body || doc.readyState === "loading") return false;
    if (!doc.querySelector(".site-header")) return false;

    if (routeName === "index.html") {
      const title = doc.querySelector(".hero__title");
      const media = doc.querySelector(".hero__media");
      const heroVisual = media?.querySelector("img, video");

      return (
        Boolean(doc.querySelector(".hero")) &&
        Boolean(title?.classList.contains("is-split")) &&
        title.querySelectorAll(".char").length > 0 &&
        Boolean(doc.querySelector(".hero__kicker")) &&
        Boolean(doc.querySelector(".hero__subtitle")) &&
        Boolean(heroVisual) &&
        (!media.querySelector(".hero__canvas") || media.classList.contains("is-canvas-ready"))
      );
    }

    if (PROJECT_ROUTES.has(routeName)) {
      return (
        Boolean(doc.querySelector(".smooth-root")) &&
        Boolean(doc.querySelector(".p-single-mv")) &&
        Boolean(doc.querySelector(".p-single-mv__background img")) &&
        Boolean(doc.querySelector(".p-single-detail")) &&
        Boolean(doc.querySelector(".p-single-scope"))
      );
    }

    return true;
  };

  const getNavigableUrl = (link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return null;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
    if (link.hasAttribute("download")) return null;

    const target = (link.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") return null;

    try {
      const url = new URL(href, window.location.href);
      if (url.href === window.location.href) return null;
      return url;
    } catch {
      return null;
    }
  };

  const waitForPreviewLayoutReady = async (iframe, url) => {
    const previewDocument = iframe.contentDocument;
    if (!previewDocument?.body) return false;

    forcePreviewFinalState(previewDocument);

    const routeName = routeNameFromUrl(url);
    const isRouteReady = await waitUntil(
      () => isPreviewRouteReady(previewDocument, routeName),
      PREVIEW_READY_TIMEOUT_MS
    );

    if (!isRouteReady) return false;

    await waitForDocumentStable(previewDocument, PREVIEW_READY_TIMEOUT_MS, {
      waitForCanvas: routeName === "index.html",
    });

    await waitForMediaReady(
      getPreviewFirstScreenMedia(previewDocument, routeName),
      PREVIEW_READY_TIMEOUT_MS
    );
    await waitForFontsReady(previewDocument);
    await waitForFrames(2);

    return isPreviewRouteReady(previewDocument, routeName);
  };

  const waitForPreviewReady = (iframe, url) =>
    new Promise((resolve) => {
      let isDone = false;
      let failsafeTimer = 0;

      const finish = () => {
        if (isDone) return;
        isDone = true;
        window.clearTimeout(failsafeTimer);
        resolve();
      };

      const checkReadyState = async () => {
        if (isDone) return;

        try {
          if (await waitForPreviewLayoutReady(iframe, url)) {
            finish();
            return;
          }
        } catch {
          // The iframe is same-origin for site routes; this is just a guard.
        }

        window.requestAnimationFrame(checkReadyState);
      };

      iframe.addEventListener(
        "load",
        () => {
          window.requestAnimationFrame(checkReadyState);
        },
        { once: true }
      );
      failsafeTimer = window.setTimeout(async () => {
        if (isDone) return;

        try {
          const previewDocument = iframe.contentDocument;
          if (previewDocument?.body && previewDocument.readyState !== "loading") {
            forcePreviewFinalState(previewDocument);
            await waitForFrames(2);
          }
        } catch {
          // The normal readiness path is preferred; this only prevents a dead wait.
        }

        finish();
      }, PREVIEW_FAILSAFE_TIMEOUT_MS);
      window.requestAnimationFrame(checkReadyState);
    });

  const startPreviewMotion = (iframe, url) => {
    if (routeNameFromUrl(url) !== "index.html") return;

    try {
      iframe.contentDocument?.documentElement.classList.add(
        "is-page-flip-home-preview-active"
      );
    } catch {
      // Same-origin previews should be accessible; if not, the transition still runs.
    }
  };

  const createPreview = (url) => {
    const preview = document.createElement("div");
    const iframe = document.createElement("iframe");

    preview.className = "page-flip-preview";
    preview.setAttribute("aria-hidden", "true");
    applyPageFallbackVisual(preview, url);
    applyPageFallbackVisual(iframe, url);
    iframe.name = `${WINDOW_NAME_PREFIX}${JSON.stringify(
      createTransitionState(url, MODE_PREVIEW)
    )}`;
    iframe.src = url.href;

    preview.appendChild(iframe);
    document.body.appendChild(preview);

    return { iframe, preview };
  };

  const createHistoryFrame = (url, className, sourceState = null) => {
    const layer = document.createElement("div");
    const iframe = document.createElement("iframe");

    layer.className = className;
    layer.setAttribute("aria-hidden", "true");
    applyPageFallbackVisual(layer, url);
    applyPageFallbackVisual(iframe, url);
    iframe.name = `${WINDOW_NAME_PREFIX}${JSON.stringify(
      createTransitionState(url, MODE_PREVIEW)
    )}`;

    if (sourceState) {
      iframe.addEventListener(
        "load",
        () => {
          try {
            iframe.contentWindow?.scrollTo({
              left: Number(sourceState.scrollX || 0),
              top: Number(sourceState.scrollY || 0),
              behavior: "auto",
            });
          } catch {
            // Same-origin local pages should allow this; keep the frame if not.
          }
        },
        { once: true }
      );
    }

    iframe.src = url.href;
    layer.appendChild(iframe);
    document.body.appendChild(layer);

    return { iframe, layer };
  };

  const navigateWithFlip = async (url) => {
    if (isNavigating) return;
    isNavigating = true;

    document.body.classList.add("is-page-flip-navigating");
    const { iframe, preview } = createPreview(url);
    let didNavigate = false;

    const finish = () => {
      if (didNavigate) return;
      didNavigate = true;
      preview.classList.add("is-committing");
      writeTransitionState(url, MODE_ARRIVE);
      window.location.assign(url.href);
    };

    await waitForPreviewReady(iframe, url);
    preview.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, DURATION_MS + 180);
    window.requestAnimationFrame(() => {
      startPreviewMotion(iframe, url);
      preview.classList.add("is-active");
    });
  };

  const bindRouteLinks = () => {
    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a[href]");
      if (!link) return;

      const url = getNavigableUrl(link);
      if (!url || !shouldUsePageFlip(url)) return;

      event.preventDefault();
      navigateWithFlip(url);
    });
  };

  const playFlipReveal = () => {
    document.documentElement.classList.add("is-page-flip-pending");
    document.body.classList.remove("is-page-flip-enter");

    const finish = () => {
      document.documentElement.classList.remove("is-page-flip-pending");
      document.body.classList.remove("is-page-flip-enter");
    };

    document.body.addEventListener("animationend", finish, { once: true });
    window.setTimeout(finish, DURATION_MS + 220);
    window.requestAnimationFrame(() => {
      document.body.classList.add("is-page-flip-enter");
    });
  };

  const playHistoryFlipReveal = (parkedLayers = []) => {
    if (historyFlipPromise) return historyFlipPromise;

    historyFlipPromise = new Promise((resolve) => {
      whenBodyReady(async () => {
        const releaseWithoutReveal = () => {
          document.documentElement.classList.remove(HISTORY_LOADING_CLASS);
          clearInitialHistoryBackground();
          document.body.classList.remove("is-page-flip-navigating");
          removeElements(parkedLayers);
          document.querySelector(`.${HISTORY_COVER_CLASS}`)?.remove();
          resolve();
        };

        const sourceState = readHistorySource();
        if (!sourceState?.source) {
          releaseWithoutReveal();
          return;
        }

        let sourceUrl;
        let currentUrl;

        try {
          sourceUrl = new URL(sourceState.source);
          currentUrl = new URL(window.location.href);
        } catch {
          releaseWithoutReveal();
          return;
        }

        if (sourceUrl.href === currentUrl.href || !shouldUsePageFlip(sourceUrl)) {
          releaseWithoutReveal();
          return;
        }

        ensureHistoryCover(sourceUrl);
        document.documentElement.classList.remove("is-page-flip-pending");
        document.documentElement.classList.add(HISTORY_LOADING_CLASS);
        document.body.classList.remove("is-page-flip-enter");
        document.body.classList.add("is-page-flip-navigating");

        const backdrop = createHistoryFrame(
          sourceUrl,
          "page-flip-history-frame page-flip-history-frame--backdrop",
          sourceState
        );
        const reveal = createHistoryFrame(
          currentUrl,
          "page-flip-history-frame page-flip-history-frame--reveal"
        );

        let isDone = false;
        const finish = () => {
          if (isDone) return;
          isDone = true;
          document.documentElement.classList.remove(HISTORY_LOADING_CLASS);
          clearInitialHistoryBackground();
          document.body.classList.remove("is-page-flip-navigating");
          backdrop.layer.remove();
          reveal.layer.remove();
          removeElements(parkedLayers);
          document.querySelector(`.${HISTORY_COVER_CLASS}`)?.remove();
          resolve();
        };

        await Promise.all([
          waitForPreviewReady(backdrop.iframe, sourceUrl),
          waitForPreviewReady(reveal.iframe, currentUrl),
        ]);

        try {
          forcePreviewFinalState(backdrop.iframe.contentDocument);
          forcePreviewFinalState(reveal.iframe.contentDocument);
        } catch {
          // Keep going; the frames use background fallbacks if a document is unavailable.
        }

        backdrop.layer.classList.add("is-ready");
        reveal.layer.classList.add("is-ready");
        startPreviewMotion(reveal.iframe, currentUrl);
        removeElements(parkedLayers);
        document.querySelector(`.${HISTORY_COVER_CLASS}`)?.remove();
        reveal.layer.addEventListener("animationend", finish, { once: true });
        window.setTimeout(finish, DURATION_MS + 220);
        window.requestAnimationFrame(() => {
          reveal.layer.classList.add("is-active");
        });
      });
    }).finally(() => {
      historyFlipPromise = null;
    });

    return historyFlipPromise;
  };

  const playIncomingFlip = () => {
    if (!incomingState) return;
    if (incomingState.mode !== MODE_PREVIEW) {
      clearTransitionState();
    }

    if (!shouldRevealCurrentPage) return;

    playFlipReveal();
  };

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;

    isNavigating = false;
    const parkedLayers = getPageFlipLayers();
    document.documentElement.classList.add(HISTORY_LOADING_CLASS);
    playHistoryFlipReveal(parkedLayers);
  });

  window.addEventListener("pagehide", (event) => {
    if (incomingState?.mode === MODE_PREVIEW) return;
    writeHistorySource();

    if (!event.persisted) return;

    document.documentElement.classList.add(HISTORY_LOADING_CLASS);
    whenBodyReady(() => {
      ensureHistoryCover(new URL(window.location.href));
    });
  });

  if (isHistoryPage) {
    playHistoryFlipReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        bindRouteLinks();
        playIncomingFlip();
        releaseArrivingFrameLock();
      },
      { once: true }
    );
  } else {
    bindRouteLinks();
    playIncomingFlip();
    releaseArrivingFrameLock();
  }
})();
