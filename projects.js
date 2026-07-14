(() => {
  const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
  const isReload = navigationEntry?.type === "reload";

  const resetReloadScroll = () => {
    if (!isReload) return;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousScrollBehavior;
  };

  if (isReload) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    resetReloadScroll();
  }

  const buttons = [...document.querySelectorAll("[data-filter]")];
  const projects = [...document.querySelectorAll(".project-row")];
  const resultCount = document.querySelector("[data-result-count]");
  const archiveList = document.querySelector(".archive-list");
  let filterSequence = 0;
  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.classList.contains("is-active")) return;

      const filter = button.dataset.filter;
      const sequence = ++filterSequence;
      const nextProjects = projects.filter((project) =>
        filter === "all" || project.dataset.category === filter
      );

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      if (resultCount) resultCount.textContent = String(nextProjects.length).padStart(2, "0");
      archiveList?.setAttribute("aria-busy", "true");

      projects.forEach((project) => {
        project.classList.remove("is-filter-entering", "is-filter-leaving");
      });

      projects.filter((project) => !project.hidden).forEach((project) => {
        project.classList.add("is-filter-leaving");
      });

      await wait(200);
      if (sequence !== filterSequence) return;

      projects.forEach((project) => {
        const show = nextProjects.includes(project);
        project.hidden = !show;
        project.classList.remove("is-filter-leaving");
      });

      nextProjects.forEach((project, index) => {
        project.style.setProperty("--filter-order", String(index));
        project.classList.add("is-filter-entering");
      });

      await wait(580 + Math.max(0, nextProjects.length - 1) * 55);
      if (sequence !== filterSequence) return;

      nextProjects.forEach((project) => project.classList.remove("is-filter-entering"));
      archiveList?.removeAttribute("aria-busy");
    });
  });

  const footerTitle = document.querySelector("[data-archive-title]");
  if (footerTitle) {
    // Start only when the former divider position has moved well into the
    // viewport. Triggering at the bottom edge played most of the animation
    // while the letters were still below the fold.
    const FOOTER_TRIGGER_RATIO = 0.68;
    const chars = Array.from(footerTitle.dataset.archiveTitle || footerTitle.textContent.trim());
    const fragment = document.createDocumentFragment();
    let visibleIndex = 0;
    chars.forEach((char, index) => {
      const wrap = document.createElement("span");
      const inner = document.createElement("span");
      const isSpace = char === " ";
      if (!isSpace) visibleIndex += 1;
      wrap.className = "archive-title__char-wrap" +
        (isSpace ? " archive-title__space" : "") +
        (!isSpace ? ` archive-title__char-wrap--${visibleIndex % 2 === 0 ? "even" : "odd"}` : "");
      wrap.setAttribute("aria-hidden", "true");
      inner.className = "archive-title__char";
      inner.textContent = isSpace ? "\u00a0" : char;
      inner.style.setProperty("--i", index);
      wrap.appendChild(inner);
      fragment.appendChild(wrap);
    });
    // Build the split title off-DOM first. If initialization ever fails, the
    // original unsplit text remains visible instead of leaving an empty footer.
    footerTitle.replaceChildren(fragment);
    footerTitle.setAttribute("aria-label", footerTitle.dataset.archiveTitle || chars.join(""));
    footerTitle.classList.add("is-split");

    let footerObserver;
    let completionTimer;
    let footerRevealed = false;
    const lastAnimatedChar = [...footerTitle.querySelectorAll(".archive-title__char")].at(-1);

    const completeFooterTitle = () => {
      window.clearTimeout(completionTimer);
      footerTitle.classList.remove("is-visible");
      footerTitle.classList.add("is-complete");
    };

    const revealFooterTitle = () => {
      if (footerRevealed) return;
      footerRevealed = true;
      footerObserver?.disconnect();
      window.removeEventListener("scroll", checkFooterVisibility);
      window.removeEventListener("resize", checkFooterVisibility);

      // This entrance is an intentional part of the project archive experience.
      // Always run it when the footer enters view; the timer still guarantees the
      // final frame if the browser pauses or drops animation events.
      footerTitle.classList.add("is-visible");
      completionTimer = window.setTimeout(completeFooterTitle, 2800);
    };
    const footer = footerTitle.closest(".archive-footer") || footerTitle;
    const footerTriggerTarget = projects.at(-1) || footer;

    function checkFooterVisibility() {
      const rect = footerTriggerTarget.getBoundingClientRect();
      if (rect.top <= window.innerHeight * FOOTER_TRIGGER_RATIO && rect.bottom > 0) {
        revealFooterTitle();
      }
    }

    const armFooterAnimation = () => {
      window.clearTimeout(completionTimer);
      footerObserver?.disconnect();
      footerRevealed = false;
      footerTitle.classList.remove("is-visible", "is-complete");

      // Restart cleanly when this page is restored from the back-forward cache.
      void footerTitle.offsetWidth;

      if ("IntersectionObserver" in window) {
        const footerTriggerInset = Math.round(window.innerHeight * (1 - FOOTER_TRIGGER_RATIO));
        footerObserver = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) revealFooterTitle();
        }, { rootMargin: `0px 0px -${footerTriggerInset}px 0px`, threshold: 0 });
        footerObserver.observe(footerTriggerTarget);
      }

      // Keep a scroll check as a deterministic fallback for browsers that delay
      // or skip an IntersectionObserver notification during page restoration.
      window.addEventListener("scroll", checkFooterVisibility, { passive: true });
      window.addEventListener("resize", checkFooterVisibility, { passive: true });
      requestAnimationFrame(checkFooterVisibility);
    };

    lastAnimatedChar?.addEventListener("animationend", completeFooterTitle);
    footerTitle.addEventListener("animationcancel", completeFooterTitle);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && footerRevealed && footerTitle.classList.contains("is-visible")) {
        completeFooterTitle();
      }
    });
    // Arm immediately so the observer is never missing, including in browsers
    // that delay or omit lifecycle callbacks in background tabs.
    armFooterAnimation();

    // A back-forward-cache restore reuses the existing DOM and animation state,
    // while a reload can briefly restore the old scroll position before
    // pageshow. Reset and re-arm both cases after that lifecycle settles.
    window.addEventListener("pageshow", (event) => {
      if (isReload) resetReloadScroll();
      if (event.persisted || isReload) armFooterAnimation();
    });
  }
})();
