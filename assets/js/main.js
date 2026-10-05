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
  // ----- "Everything. One app.": one member card, its content changes with the role you tap -----
  var idBox = document.querySelector("[data-id]");
  var idTabList = document.querySelector("[data-id-tabs]");
  if (idBox && idTabList) {
    var card = idBox.querySelector("[data-id-card]");
    var idTabs = Array.prototype.slice.call(idTabList.querySelectorAll("[data-id-tab]"));
    var faces = Array.prototype.slice.call(idBox.querySelectorAll("[data-id-face]"));
    var cur = -1, idAuto = null, idDone = false, idSeen = false;
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    idTabList.setAttribute("role", "tablist");
    idTabList.setAttribute("aria-label", "Who you are");
    idTabs.forEach(function (t, k) {
      t.setAttribute("role", "tab");
      faces[k].setAttribute("role", "tabpanel");
      faces[k].setAttribute("aria-labelledby", t.id);
    });
    // Dots under the card (tap one to jump), and the swipe hint on touch screens.
    var dotBox = idBox.querySelector("[data-id-dots]"), hint = idBox.querySelector("[data-id-hint]"), dots = [];
    faces.forEach(function (f, k) {
      var d = document.createElement("button");
      d.type = "button"; d.className = "id-dot"; d.tabIndex = -1;
      d.setAttribute("aria-label", idTabs[k].textContent.trim());
      d.addEventListener("click", function () { stop(); pick(k, false); });
      dotBox.appendChild(d); dots.push(d);
    });
    var hintDone = function () { if (hint) hint.classList.add("is-done"); try { localStorage.setItem("cs-swiped", "1"); } catch (e) {} };
    try { if (localStorage.getItem("cs-swiped") && hint) hint.style.display = "none"; } catch (e) {}
    var paint = function (i) {
      faces.forEach(function (f, k) { f.classList.toggle("is-active", k === i); });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", String(k === i)); });
      // The card takes the role's colour (players blue, parents green, coaches violet, clubs navy, women pink).
      card.setAttribute("data-role", faces[i].id.replace("id-", ""));
    };
    var pick = function (i, focus) {
      i = (i + idTabs.length) % idTabs.length;
      if (i === cur) return;
      var first = cur === -1;
      cur = i;
      idTabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      // Keep the chosen pill visible in the swipeable row (without scrolling the page).
      var tb = idTabs[i], left = tb.getBoundingClientRect().left - idTabList.getBoundingClientRect().left + idTabList.scrollLeft, right = left + tb.offsetWidth;
      if (left < idTabList.scrollLeft + 8) idTabList.scrollTo({ left: Math.max(0, left - 16), behavior: still ? "auto" : "smooth" });
      else if (right > idTabList.scrollLeft + idTabList.clientWidth - 8) idTabList.scrollTo({ left: right - idTabList.clientWidth + 16, behavior: still ? "auto" : "smooth" });
      if (focus) tb.focus();
      // The card stays still; the new role fades in where the old one was (CSS).
      paint(i);
    };
    var stop = function () { idDone = true; clearInterval(idAuto); idAuto = null; };
    var play = function () {
      if (still || idDone || idAuto || !idSeen || document.hidden) return;
      idAuto = setInterval(function () { pick(cur + 1, false); }, 5500);
    };
    idTabs.forEach(function (t, k) { t.addEventListener("click", function () { stop(); pick(k, false); }); });
    idTabList.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" || e.key === "ArrowDown" ? cur + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? cur - 1 : e.key === "Home" ? 0 : e.key === "End" ? idTabs.length - 1 : null;
      if (n === null) return;
      e.preventDefault(); stop(); pick(n, true);
    });
    // Swipe the card left/right on phones: it follows the finger a little, then springs back with the next role.
    var tx = null, ty = null, sideways = null;
    card.addEventListener("touchstart", function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; sideways = null; stop();
      card.classList.remove("is-snapping");
    }, { passive: true });
    card.addEventListener("touchmove", function (e) {
      if (tx === null) return;
      var dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
      if (sideways === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) sideways = Math.abs(dx) > Math.abs(dy);
      if (sideways && !still) card.style.transform = "translateX(" + dx * 0.35 + "px) rotate(" + dx * 0.02 + "deg)";
    }, { passive: true });
    card.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      card.classList.add("is-snapping");
      card.style.transform = "";
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { pick(cur + (dx < 0 ? 1 : -1), false); hintDone(); }
      tx = ty = sideways = null;
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        idSeen = en[0].isIntersecting;
        if (idSeen) play(); else { clearInterval(idAuto); idAuto = null; }
      }, { threshold: 0.4 }).observe(idBox);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) { clearInterval(idAuto); idAuto = null; } else play(); });
    pick(0, false);
  }
  // ----- Store buttons: not live yet -----
  document.querySelectorAll('.store-btn[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  // ----- Current year in footer -----
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
