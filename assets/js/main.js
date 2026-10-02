/* Concorde Sport — small progressive enhancements. The site works without JS. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  // ----- Mobile menu -----
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeMenu() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      nav.classList.toggle("is-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960) closeMenu();
    });
  }

  // ----- Header shadow on scroll -----
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ----- Reveal on scroll (CSS only animates when prefers-reduced-motion is not set) -----
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // ----- Hero rotator: the text and the phone screen change every 4.5s; buttons stay put -----
  var texts = document.querySelectorAll(".rot-item");
  var shots = document.querySelectorAll(".shot");
  var dots = document.querySelectorAll(".hero-dot");
  var chips = document.querySelectorAll(".float-chip[data-slide]");
  if (texts.length > 1) {
    var current = 0, timer = null;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var show = function (i) {
      current = (i + texts.length) % texts.length;
      texts.forEach(function (el, k) {
        el.classList.toggle("is-active", k === current);
        el.setAttribute("aria-hidden", String(k !== current));
      });
      shots.forEach(function (el, k) { el.classList.toggle("is-active", k === current); });
      chips.forEach(function (el) { el.classList.toggle("is-active", Number(el.getAttribute("data-slide")) === current); });
      dots.forEach(function (d, k) {
        d.classList.toggle("is-active", k === current);
        d.setAttribute("aria-selected", String(k === current));
      });
    };
    var start = function () { if (!still && !timer) timer = setInterval(function () { show(current + 1); }, 4500); };
    var restart = function () { clearInterval(timer); timer = null; start(); };
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); restart(); }); });
    // Swipe left/right on the phone.
    var phone = document.querySelector(".shot-screen"), x0 = null;
    if (phone) {
      phone.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      phone.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); restart(); }
        x0 = null;
      });
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) { clearInterval(timer); timer = null; } else start(); });
    start();
  }
  // ----- Current year in footer -----
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
