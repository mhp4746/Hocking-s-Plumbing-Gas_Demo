/* Hockings Plumbing & Gas — concept site interactions */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const closeNav = () => {
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
  };
  navToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("open");
    mobileNav.setAttribute("aria-hidden", String(!open));
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- scroll reveal + stagger ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  // assign stagger delays inside grids
  document.querySelectorAll(".card-grid, .review-grid, .steps").forEach((grid) => {
    grid.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--reveal-delay", (i % 6) * 0.07 + "s");
    });
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  };

  if (prefersReduced || !("IntersectionObserver" in window)) {
    counters.forEach((el) => {
      const d = parseInt(el.dataset.decimals || "0", 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(d) + (el.dataset.suffix || "");
    });
  } else {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- quote form (demo) ---------- */
  const form = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      ["name", "phone"].forEach((id) => {
        const field = form.querySelector("#" + id);
        if (!field.value.trim()) {
          field.classList.add("invalid");
          valid = false;
        } else {
          field.classList.remove("invalid");
        }
      });
      if (!valid) {
        form.querySelector(".invalid").focus();
        return;
      }
      success.hidden = false;
      form.querySelectorAll("input, select, textarea, button[type=submit]").forEach((el) => {
        if (el.type !== "submit") el.disabled = true;
        else el.style.display = "none";
      });
      success.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    });
    form.querySelectorAll("input").forEach((f) =>
      f.addEventListener("input", () => f.classList.remove("invalid"))
    );
  }

  /* ---------- hero video (mobile-safe autoplay; poster shows if blocked) ---------- */
  const heroVideo = document.querySelector(".hero-video");
  const heroMedia = heroVideo && heroVideo.closest(".hero-media");
  if (heroVideo && heroMedia) {
    heroVideo.muted = true; // required for autoplay on iOS/Android
    // only reveal the video once it is ACTUALLY playing — otherwise the poster stays
    heroVideo.addEventListener("playing", () => heroMedia.classList.add("has-video"), { once: true });
    const tryPlay = () => { const p = heroVideo.play(); if (p && p.catch) p.catch(() => {}); };
    if (heroVideo.readyState >= 2) tryPlay();
    else heroVideo.addEventListener("loadeddata", tryPlay, { once: true });
    // iOS often needs a gesture — kick it off on the first tap/scroll
    ["touchstart", "click", "scroll"].forEach((evt) =>
      window.addEventListener(evt, tryPlay, { once: true, passive: true })
    );
  }

  /* ---------- photo frames: reveal real photos, keep placeholder until then ---------- */
  document.querySelectorAll(".photo-frame img.photo").forEach((img) => {
    const frame = img.closest(".photo-frame");
    const ready = () => frame && frame.classList.add("photo-ready");
    if (img.complete && img.naturalWidth > 0) ready();
    else img.addEventListener("load", ready);
  });

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
