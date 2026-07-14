(function () {
  const HEADER_HTML = ({ active, isHome, contactOverride, hideNav }) => {
    const homeHref = isHome ? "#top" : "./index.html";
    const aboutHref = isHome ? "#about" : "./index.html";
    const projectHref = isHome ? "#selected" : "./projects.html";
    const contactHref = contactOverride || "#contact";

    const activeClass = (key) => (active === key ? " is-active" : "");
    const currentAttr = (key) => (active === key ? ' aria-current="page"' : "");

    return `
      <header class="site-header">
        <a class="site-header__logo" href="${homeHref}" aria-label="返回首页">
          <img src="./assets/site-logo.svg" alt="子远的设计空间" />
        </a>
        ${hideNav ? "" : `<nav class="site-header__nav" aria-label="主导航">
          <a class="site-header__link${activeClass("about")}" href="${aboutHref}"${currentAttr("about")}>ABOUT</a>
          <a class="site-header__link${activeClass("project")}" href="${projectHref}"${currentAttr("project")}>PROJECT</a>
          <a class="site-header__link${activeClass("contact")}" href="${contactHref}"${currentAttr("contact")}>CONTACT</a>
          <span class="site-header__nav-line" aria-hidden="true"></span>
        </nav>`}
      </header>
    `;
  };

  const getDocumentTop = (element) => {
    let top = 0;
    let node = element;

    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }

    return top;
  };

  const getVisualAnchorTop = (target, header) => {
    const targetTop = getDocumentTop(target);
    const headerOffset = header ? header.getBoundingClientRect().height + 12 : 0;

    if (target.id === "top" || target.id === "about" || target.id === "contact") {
      return targetTop;
    }

    if (target.id === "selected") {
      const paddingTop = parseFloat(window.getComputedStyle(target).paddingTop) || 0;
      return targetTop - headerOffset + Math.min(110, paddingTop * 0.75);
    }

    return targetTop - headerOffset;
  };

  let activeScrollFrame = 0;

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const animateScrollTo = (top) => {
    if (activeScrollFrame) {
      window.cancelAnimationFrame(activeScrollFrame);
      activeScrollFrame = 0;
    }

    const startTop = window.scrollY || window.pageYOffset;
    const distance = top - startTop;
    const duration = Math.min(1150, Math.max(720, Math.abs(distance) * 0.42));
    const startTime = window.performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(progress);

      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        activeScrollFrame = window.requestAnimationFrame(tick);
        return;
      }

      activeScrollFrame = 0;
    };

    activeScrollFrame = window.requestAnimationFrame(tick);
  };

  const scrollToTarget = (target, header) => {
    const top = Math.max(0, getVisualAnchorTop(target, header));

    animateScrollTo(top);
  };

  const getSamePageTarget = (link) => {
    const rawHref = link.getAttribute("href");
    if (!rawHref || !rawHref.startsWith("#")) return null;

    const target =
      rawHref === "#top" ? document.getElementById("top") : document.querySelector(rawHref);

    if (!target) return null;

    return { hash: rawHref, target };
  };

  const updateHash = (hash) => {
    if (window.history?.pushState) {
      window.history.pushState(null, "", hash);
    }
  };

  const bindSamePageAnchors = (header) => {
    header.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const match = getSamePageTarget(link);
      if (!match) return;

      event.preventDefault();
      scrollToTarget(match.target, header);
      updateHash(match.hash);
    });
  };

  let isDocumentAnchorBound = false;

  const bindDocumentAnchors = () => {
    if (isDocumentAnchorBound) return;
    isDocumentAnchorBound = true;

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;

      const link = event.target.closest('a[href^="#"]');
      if (!link || link.closest(".site-header")) return;

      const match = getSamePageTarget(link);
      if (!match) return;

      const header = document.querySelector(".site-header");
      event.preventDefault();
      scrollToTarget(match.target, header);
      updateHash(match.hash);
    });
  };

  const setNavLine = (nav, link) => {
    if (!nav.querySelector(".site-header__nav-line")) return;

    if (!link) {
      nav.style.setProperty("--site-header-line-opacity", "0");
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    nav.style.setProperty("--site-header-line-x", `${linkRect.left - navRect.left}px`);
    nav.style.setProperty("--site-header-line-width", `${linkRect.width}px`);
    nav.style.setProperty("--site-header-line-opacity", "1");
  };

  const bindNavLine = (header) => {
    const nav = header.querySelector(".site-header__nav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll(".site-header__link"));
    const getActiveLink = () => nav.querySelector(".site-header__link.is-active");
    const syncActiveLine = () => setNavLine(nav, getActiveLink());

    links.forEach((link) => {
      link.addEventListener("pointerenter", () => setNavLine(nav, link));
      link.addEventListener("focus", () => setNavLine(nav, link));
    });

    nav.addEventListener("pointerleave", syncActiveLine);
    nav.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        if (!nav.contains(document.activeElement)) syncActiveLine();
      });
    });

    window.addEventListener("resize", syncActiveLine, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(syncActiveLine).catch(syncActiveLine);
    }

    window.requestAnimationFrame(syncActiveLine);
  };

  const renderSiteHeaders = () => {
    document.querySelectorAll("[data-site-header]").forEach((target) => {
      const isHome = target.dataset.siteHeaderPage === "home";
      const active = target.dataset.siteHeaderActive || "";
      const contactOverride = target.dataset.siteHeaderContactHref || "";
      const hideNav = target.dataset.siteHeaderHideNav === "true";
      const wrapper = document.createElement("div");

      wrapper.innerHTML = HEADER_HTML({ active, isHome, contactOverride, hideNav }).trim();
      const header = wrapper.firstElementChild;
      target.replaceWith(header);
      bindSamePageAnchors(header);
      bindNavLine(header);
    });

    bindDocumentAnchors();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteHeaders, { once: true });
  } else {
    renderSiteHeaders();
  }
})();
