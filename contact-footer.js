(function () {
  const CONTACT_FOOTER_HTML = `
    <section class="contact-section" id="contact">
      <div class="contact-section__bg" aria-hidden="true"></div>
      <div class="contact-section__content">
        <div class="contact-section__layout">
          <header class="contact-section__intro reveal-card">
            <p class="contact-section__number">04</p>
            <p class="contact-section__kicker">CONTACT</p>
            <h2 class="contact-section__heading">
              <span>&#26399;&#24453;&#19982;&#20320;&#21512;&#20316;</span>
              <span class="title-flare title-flare--gold contact-section__flare" aria-hidden="true">
                <span class="title-flare__halo"></span>
                <span class="title-flare__ray title-flare__ray--h"></span>
                <span class="title-flare__ray title-flare__ray--v"></span>
                <span class="title-flare__ray title-flare__ray--d1"></span>
                <span class="title-flare__ray title-flare__ray--d2"></span>
                <span class="title-flare__core"></span>
                <span class="title-flare__orb"></span>
              </span>
            </h2>
            <p class="contact-section__lead">&#22914;&#26524;&#20320;&#26377;&#39033;&#30446;&#24819;&#27861;&#65292;&#25110;&#24819;&#32842;&#32842;&#35774;&#35745;&#65292;&#27426;&#36814;&#38543;&#26102;&#32852;&#31995;&#25105;&#12290;</p>
          </header>

          <div class="contact-section__grid">
            <address class="contact-section__contact reveal-card" aria-label="Contact details">
              <p class="contact-section__group-label">DIRECT CONTACT</p>
              <dl class="contact-section__methods">
                <div class="contact-section__method contact-section__method--email">
                  <dt>
                    <span class="contact-section__method-icon contact-section__method-icon--email" aria-hidden="true"></span>
                    <span>Email</span>
                  </dt>
                  <dd><a href="mailto:usualdelfino@gmail.com">usualdelfino@gmail.com</a></dd>
                </div>
                <div class="contact-section__method contact-section__method--phone">
                  <dt>
                    <span class="contact-section__method-icon contact-section__method-icon--phone" aria-hidden="true"></span>
                    <span>Phone</span>
                  </dt>
                  <dd><a href="tel:+8615607199762">+86 15607199762</a></dd>
                </div>
                <div class="contact-section__method contact-section__method--location">
                  <dt>
                    <span class="contact-section__method-icon contact-section__method-icon--location" aria-hidden="true"></span>
                    <span>Location</span>
                  </dt>
                  <dd>&#19978;&#28023;&#65292;&#20013;&#22269;</dd>
                </div>
                <div class="contact-section__method contact-section__method--wechat">
                  <dt>
                    <span class="contact-section__method-icon contact-section__method-icon--wechat" aria-hidden="true"></span>
                    <span>Wechat</span>
                  </dt>
                  <dd>
                    <img class="contact-section__wechat-qr" src="./assets/wechat-qr.webp" alt="WeChat QR code" />
                  </dd>
                </div>
              </dl>
            </address>

            <nav class="contact-section__links reveal-card" aria-label="Social links">
              <p class="contact-section__group-label">SOCIAL PROFILES</p>
              <a href="https://www.yuque.com/daiziyuan-kkexs" target="_blank" rel="noopener noreferrer">
                <span class="contact-section__brand-icon contact-section__brand-icon--yuque" aria-hidden="true">
                  <svg viewBox="0 0 1024 1024" focusable="false">
                    <path d="M854.6 370.6c-9.9-39.4 9.9-102.2 73.4-124.4l-67.9-3.6s-25.7-90-143.6-98c-117.9-8.1-195-3-195-3s87.4 55.6 52.4 154.7c-25.6 52.5-65.8 95.6-108.8 144.7-1.3 1.3-2.5 2.6-3.5 3.7C319.4 605 96 860 96 860c245.9 64.4 410.7-6.3 508.2-91.1 20.5-0.2 35.9-0.3 46.3-0.3 135.8 0 250.6-117.6 245.9-248.4-3.2-89.9-31.9-110.2-41.8-149.6z" />
                  </svg>
                </span>
                <span>&#35821;&#38592;</span>
              </a>
              <a href="https://www.zcool.com.cn/u/18279744" target="_blank" rel="noopener noreferrer">
                <span class="contact-section__brand-icon contact-section__brand-icon--zcool" aria-hidden="true">
                  <svg viewBox="0 0 1069 1024" focusable="false">
                    <path d="M1065 435c-21 12-94 35-132 29 107-131 138-372 111-410-56 66-226 171-357 194 31-26 51-216-1-248-25 102-172 165-265 186-28 6-56 12-84 20C223 240 113 303 51 407c-89 151-55 352 56 482 108 127 302 166 457 110C630 975 690 934 736 881c24-27 45-58 62-90 9-17 16-34 23-51 2-7 13-51 17-53 163-56 250-228 227-252zM54 613c9 27 119 67 137 63C126 791 30 642 54 613z m455 99c-62 31-156 41-195-32 54 0 216-46 278-98 52-44-12 94-83 130z" />
                  </svg>
                </span>
                <span>站酷</span>
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
            </nav>
          </div>
        </div>
        <p
          class="contact-section__type"
          data-contact-title="ZIYUAN&#8217;S DESIGN SPACE"
          aria-label="ZIYUAN&#8217;S DESIGN SPACE"
        >
          ZIYUAN&#8217;S DESIGN SPACE
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
    document.addEventListener("DOMContentLoaded", renderContactFooters, { once: true });
  } else {
    renderContactFooters();
  }
})();
