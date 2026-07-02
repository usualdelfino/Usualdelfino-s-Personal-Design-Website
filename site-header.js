(function () {
  const HEADER_HTML = ({ active, isHome }) => {
    const homeHref = isHome ? "#top" : "./index.html";
    const aboutHref = isHome ? "#about" : "./index.html";
    const projectHref = isHome ? "#selected" : "./index.html#selected";
    const contactHref = "#contact";

    const activeClass = (key) => (active === key ? " is-active" : "");
    const currentAttr = (key) => (active === key ? ' aria-current="page"' : "");

    return `
      <header class="site-header">
        <a class="site-header__logo" href="${homeHref}" aria-label="返回首页">
          <img src="./assets/site-logo.svg" alt="子远的设计空间" />
        </a>
        <nav class="site-header__nav" aria-label="主导航">
          <a class="site-header__link${activeClass("about")}" href="${aboutHref}"${currentAttr("about")}>About,</a>
          <a class="site-header__link${activeClass("project")}" href="${projectHref}"${currentAttr("project")}>Project,</a>
          <a class="site-header__link${activeClass("contact")}" href="${contactHref}"${currentAttr("contact")}>Contact</a>
          <span class="site-header__nav-line" aria-hidden="true"></span>
        </nav>
      </header>
    `;
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const headerOffset = header.getBoundingClientRect().height + 12;

    if (target.id === "top" || target.id === "contact") return targetTop;

    if (target.id === "selected") {
      const paddingTop = parseFloat(window.getComputedStyle(target).paddingTop) || 0;
      return targetTop - headerOffset + Math.min(110, paddingTop * 0.75);
    }

    return targetTop - headerOffset;
  };

  const scrollToTarget = (target, header) => {
    const top = Math.max(0, getVisualAnchorTop(target, header));

    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const bindSamePageAnchors = (header) => {
    header.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href");
      const target = hash === "#top" ? document.getElementById("top") : document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target, header);

      if (window.history?.pushState) {
        window.history.pushState(null, "", hash);
      }
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
      const wrapper = document.createElement("div");

      wrapper.innerHTML = HEADER_HTML({ active, isHome }).trim();
      const header = wrapper.firstElementChild;
      target.replaceWith(header);
      bindSamePageAnchors(header);
      bindNavLine(header);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteHeaders, { once: true });
  } else {
    renderSiteHeaders();
  }
})();
