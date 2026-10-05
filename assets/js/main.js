/* Concorde Sport — small progressive enhancements. The site works without JS. */
(function () {
  "use strict";

  var doc = document.documentElement;

  // Always open at the top (first section). A section link (#clubs…) is followed only when it comes
  // from one of our own pages (e.g. Privacy -> Clubs); a shared or pasted link with #clubs opens at the top.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var fromUs = document.referrer && document.referrer.indexOf(location.origin) === 0;
  if (location.hash && !fromUs) {
    history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
    window.addEventListener("load", function () { window.scrollTo(0, 0); });
  } else if (!location.hash) {
    window.scrollTo(0, 0);
  }
  doc.classList.add("js");

  // In-page links scroll smoothly without adding #section to the address, so a copied link stays clean.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

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

  // ----- Back to top: a small floating button once you've scrolled down -----
  var up = document.createElement("button");
  up.type = "button";
  up.className = "to-top";
  up.setAttribute("aria-label", "Back to top");
  up.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  up.addEventListener("click", function () {
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  });
  document.body.appendChild(up);
  var onUp = function () { up.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8); };
  onUp();
  window.addEventListener("scroll", onUp, { passive: true });

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
  // ----- Role tabs ("Everything. One app."): a tablist over a sliding track of panels -----
  var roles = document.querySelector("[data-roles]");
  if (roles) {
    var tabList = roles.querySelector("[data-role-tabs]");
    var track = roles.querySelector("[data-role-track]");
    var tabs = Array.prototype.slice.call(roles.querySelectorAll("[data-role-tab]"));
    var panels = Array.prototype.slice.call(roles.querySelectorAll("[data-role-panel]"));
    var active = 0, auto = null, autoDone = false, inView = false;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    tabList.setAttribute("role", "tablist");
    tabList.setAttribute("aria-label", "Who it's for");
    tabs.forEach(function (t) { t.setAttribute("role", "tab"); });
    panels.forEach(function (p, k) {
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", tabs[k].id);
    });

    var select = function (i, focus) {
      active = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        var on = k === active;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p, k) {
        var on = k === active;
        p.tabIndex = on ? 0 : -1;
        p.setAttribute("aria-hidden", String(!on));
        if (on) p.removeAttribute("inert"); else p.setAttribute("inert", "");
      });
      track.style.transform = "translateX(" + (-100 * active) + "%)";
      // Keep the selected pill visible in the scrollable tab row, without scrolling the page.
      var t = tabs[active];
      var left = t.getBoundingClientRect().left - tabList.getBoundingClientRect().left + tabList.scrollLeft;
      var right = left + t.offsetWidth;
      if (left < tabList.scrollLeft) tabList.scrollLeft = left - 6;
      else if (right > tabList.scrollLeft + tabList.clientWidth) tabList.scrollLeft = right - tabList.clientWidth + 6;
      if (focus) t.focus();
    };

    // Gentle autoplay: every 6s while the section is on screen, stops for good on the first interaction.
    var stopAuto = function () { autoDone = true; clearInterval(auto); auto = null; };
    var runAuto = function () {
      if (calm || autoDone || auto || !inView || document.hidden) return;
      auto = setInterval(function () { select(active + 1, false); }, 6000);
    };
    var pauseAuto = function () { clearInterval(auto); auto = null; };

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { stopAuto(); select(k, false); });
    });
    tabList.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = active + 1;
      else if (e.key === "ArrowLeft") next = active - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      stopAuto();
      select(next, true);
    });
    roles.addEventListener("focusin", stopAuto);
    roles.addEventListener("pointerdown", stopAuto);

    // Swipe left/right on the panels (vertical scrolling is left alone).
    var viewport = roles.querySelector(".role-viewport"), sx = null, sy = null;
    viewport.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; stopAuto(); }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1), false);
      sx = sy = null;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) runAuto(); else pauseAuto();
      }, { threshold: 0.4 }).observe(roles);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) pauseAuto(); else runAuto(); });

    select(0, false);
  }

  // ----- Store buttons: not live yet -----
  document.querySelectorAll('.store-btn[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  // ----- Current year in footer -----
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
