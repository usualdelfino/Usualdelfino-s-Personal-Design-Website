(function () {
  const CONTACT_FOOTER_HTML = `
    <section class="contact-section" id="contact">
      <div class="contact-section__bg" aria-hidden="true"></div>
      <div class="contact-section__content">
        <h2 class="section-title">
          <span>(3)</span>
          <strong>Contact</strong>
        </h2>
        <div class="contact-section__grid">
          <div class="contact-section__contact reveal-card">
            <p>Contact</p>
            <span class="contact-section__mail">usualdelfino@gmail.com</span>
            <span class="contact-section__phone">+86 15607199762</span>
            <img
              class="contact-section__wechat-qr"
              src="./assets/wechat-qr.jpg"
              alt="WeChat QR code"
            />
          </div>
          <div class="contact-section__links reveal-card">
            <p>Link</p>
            <a href="https://www.yuque.com/daiziyuan-kkexs" target="_blank" rel="noopener noreferrer">
              <span class="contact-section__brand-icon contact-section__brand-icon--yuque" aria-hidden="true">
                <svg viewBox="0 0 1024 1024" focusable="false">
                  <path d="M854.6 370.6c-9.9-39.4 9.9-102.2 73.4-124.4l-67.9-3.6s-25.7-90-143.6-98c-117.9-8.1-195-3-195-3s87.4 55.6 52.4 154.7c-25.6 52.5-65.8 95.6-108.8 144.7-1.3 1.3-2.5 2.6-3.5 3.7C319.4 605 96 860 96 860c245.9 64.4 410.7-6.3 508.2-91.1 20.5-0.2 35.9-0.3 46.3-0.3 135.8 0 250.6-117.6 245.9-248.4-3.2-89.9-31.9-110.2-41.8-149.6z" />
                </svg>
              </span>
              <span>语雀</span>
            </a>
            <a href="https://www.zcool.com.cn/u/18279744" target="_blank" rel="noopener noreferrer">
              <span class="contact-section__brand-icon contact-section__brand-icon--zcool" aria-hidden="true">
                <svg viewBox="0 0 1024 1024" focusable="false">
                  <path d="M915.662957 463.674598c-24.438149 13.546646-59.370434 20.283845-88.540878 23.607289 46.25728-39.321398 91.159896-84.097578 109.330464-140.451626 24.636833-76.439208 25.377383-147.315259 2.330023-222.995855-2.095215-6.701074-7.838992-11.650116-14.829062-12.571287-6.448203-1.137918-13.185402 1.860406-17.141023 7.477748-61.104404 87.023654-141.914663 142.54684-230.238795 158.947313 26.388866-53.102852 55.505124-113.051276 49.237543-175.709029a17.932147 17.932147 0 0 0-12.173919-15.22643c-1.535287-0.559928-3.576315-0.921172-5.725716-0.921172-5.02129 0-9.572963 2.05909-12.84222 5.382534-93.634417 95.350325-168.357716 115.47161-258.614503 117.024959-99.649128 1.697846-194.818831 47.648069-261.070961 126.074118-65.710264 77.739686-94.790397 178.002928-79.798776 275.105287 24.076905 156.237984 140.686434 273.172632 297.032791 297.863651 19.741979 3.106697 39.285273 4.641984 58.539572 4.641984 128.422204 0 243.659006-67.913852 309.513768-185.914169 7.513873-13.420211 19.83229-26.58755 33.812428-36.178576 63.578925-43.493765 109.565273-99.793625 136.640502-167.382357 3.756936-9.338155 6.484328-20.843773 8.904662-31.012789l1.860406-7.65837a17.901441 17.901441 0 0 0-6.430141-18.622123 18.036908 18.036908 0 0 0-11.036001-3.738874c-3.197008 0-6.213395 0.830861-8.832413 2.275836l0.072249-0.018062zM132.50426 582.848958c15.081933 47.449385 107.849364 63.326054 107.849364 63.326055-77.414566 83.212531-107.849364-63.326054-107.849364-63.326055z m223.971213 63.344117s189.2918-21.89138 264.701462-87.095903c0.018062 0-109.836206 250.468453-264.701462 87.095903z m0 0" />
                </svg>
              </span>
              <span>Zcool</span>
            </a>
            <a href="https://github.com/usualdelfino" target="_blank" rel="noopener noreferrer">
              <span class="contact-section__brand-icon contact-section__brand-icon--github" aria-hidden="true"></span>
              <span>Github</span>
            </a>
            <a href="https://www.instagram.com/usualdelfino_uxuidesign/" target="_blank" rel="noopener noreferrer">
              <span class="contact-section__brand-icon contact-section__brand-icon--instagram" aria-hidden="true"></span>
              <span>Instagram</span>
            </a>
            <a href="https://x.com/UsualDelfino" target="_blank" rel="noopener noreferrer">
              <span class="contact-section__brand-icon contact-section__brand-icon--x" aria-hidden="true"></span>
              <span>X(Twitter)</span>
            </a>
          </div>
        </div>
        <p
          class="contact-section__type"
          data-contact-title="ZIYUAN’S DESIGN SPACE"
          aria-label="ZIYUAN’S DESIGN SPACE"
        >
          ZIYUAN’S DESIGN SPACE
        </p>
      </div>
    </section>
  `;

  const splitContactTitle = (title) => {
    if (!title || title.classList.contains("is-split")) return;

    const chars = Array.from(title.dataset.contactTitle || title.textContent.trim());
    let visibleIndex = 0;
    title.textContent = "";

    chars.forEach((char, index) => {
      const wrap = document.createElement("span");
      const inner = document.createElement("span");
      const isSpace = char === " ";

      if (!isSpace) visibleIndex += 1;

      wrap.className =
        "contact-title__char-wrap" +
        (isSpace ? " contact-title__space" : "") +
        (!isSpace
          ? ` contact-title__char-wrap--${visibleIndex % 2 === 0 ? "even" : "odd"}`
          : "");
      wrap.setAttribute("aria-hidden", "true");
      inner.className = "contact-title__char";
      inner.textContent = isSpace ? "\u00a0" : char;
      inner.style.setProperty("--i", index);
      wrap.appendChild(inner);
      title.appendChild(wrap);
    });

    title.classList.add("is-split");
  };

  const setupReveal = (section) => {
    const targets = section.querySelectorAll(".reveal-card, [data-contact-title]");

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
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((target) => observer.observe(target));
  };

  const setupTitleFallback = (title) => {
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

  const renderContactFooters = () => {
    document.querySelectorAll("[data-contact-footer]").forEach((target) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = CONTACT_FOOTER_HTML.trim();
      target.replaceWith(wrapper.firstElementChild);
    });

    document.querySelectorAll(".contact-section").forEach((section) => {
      if (section.dataset.contactFooterReady === "true") return;
      section.dataset.contactFooterReady = "true";
      const title = section.querySelector("[data-contact-title]");
      splitContactTitle(title);
      setupReveal(section);
      if (title) setupTitleFallback(title);
    });
  };

  if (document.readyState === "loading") {
    renderContactFooters();
    document.addEventListener("DOMContentLoaded", renderContactFooters, { once: true });
  } else {
    renderContactFooters();
  }
})();
