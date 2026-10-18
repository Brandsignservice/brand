/* ==========================================================================
   BRAND SIGN — site behaviour
   - sticky header state
   - mobile navigation
   - scroll reveal
   - portfolio filtering
   - animated stats
   - contact form validation (front-end only, ready for a form endpoint)
   - replaceable project images: swaps in the real file when it exists
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- header */
  var header = doc.getElementById("site-header");
  var scrollTop = doc.querySelector(".scroll-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 12);
    if (scrollTop) {
      var visible = y > 600;
      scrollTop.hidden = false;
      scrollTop.classList.toggle("is-visible", visible);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (scrollTop) {
    scrollTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------- mobile nav */
  var burger = doc.querySelector(".burger");
  var mobileNav = doc.getElementById("mobile-nav");

  function setMenu(open) {
    if (!burger || !mobileNav) return;
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    doc.body.style.overflow = open ? "hidden" : "";
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* -------------------------------------------------------------- reveal */
  var revealables = doc.querySelectorAll(".reveal");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var delay = entry.target.getAttribute("data-delay");
            if (delay) entry.target.style.setProperty("--d", delay);
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------- replaceable project images */
  // Each <img data-ph> sits on top of a designed placeholder frame. If the
  // real file has not been added yet, the frame stays visible.
  doc.querySelectorAll("img[data-ph]").forEach(function (img) {
    var hide = function () { img.classList.add("is-missing"); };
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener("error", hide);
  });

  /* ------------------------------------------------------------ filters */
  var filterButtons = doc.querySelectorAll(".filter");
  var works = doc.querySelectorAll("#work-grid .work");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-filter");
      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
      works.forEach(function (work) {
        var cat = work.getAttribute("data-category");
        var show = value === "all" || cat === value;
        work.classList.toggle("is-hidden", !show);
        if (show) {
          work.classList.remove("is-in");
          // Re-trigger the reveal for items that just appeared.
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { work.classList.add("is-in"); });
          });
        }
      });
    });
  });

  /* -------------------------------------------------------------- stats */
  var statNumbers = doc.querySelectorAll("[data-count]");
  if (statNumbers.length && !reduceMotion && "IntersectionObserver" in window) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          statObserver.unobserve(el);
          var target = parseFloat(el.getAttribute("data-count")) || 0;
          var suffix = el.getAttribute("data-suffix") || "";
          var prefix = el.getAttribute("data-prefix") || "";
          var start = performance.now();
          var duration = 1200;

          function frame(now) {
            var p = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach(function (el) { statObserver.observe(el); });
  }

  /* ------------------------------------------------------ contact form */
  var form = doc.getElementById("contact-form");
  var status = doc.getElementById("form-status");

  function setError(field, message) {
    var wrap = field.closest(".field");
    var slot = doc.querySelector('[data-error-for="' + field.id + '"]');
    if (wrap) wrap.classList.toggle("is-invalid", Boolean(message));
    if (slot) slot.textContent = message || "";
  }

  function validateField(field) {
    var value = (field.value || "").trim();
    if (field.hasAttribute("required") && !value) {
      setError(field, "This field is required.");
      return false;
    }
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(field, "Please enter a valid email address.");
      return false;
    }
    setError(field, "");
    return true;
  }

  if (form) {
    form.addEventListener(
      "input",
      function (e) {
        if (e.target.matches("input, textarea, select")) validateField(e.target);
      },
      true
    );

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll("input, textarea, select");
      var valid = true;
      var firstInvalid = null;

      fields.forEach(function (field) {
        if (!validateField(field)) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!valid) {
        if (status) {
          status.textContent = "Please complete the highlighted fields before sending.";
          status.classList.add("is-visible", "is-error");
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });

      // Placeholder submit — replace with your form endpoint (Formspree,
      // Netlify Forms, your own API) or a mailto: fallback.
      var subject = "New project brief — " + (data.name || "Brand Sign enquiry");
      var body =
        "Name: " + (data.name || "") + "\n" +
        "Email: " + (data.email || "") + "\n" +
        "Brand / page: " + (data.brand || "—") + "\n" +
        "Service: " + (data.service || "—") + "\n" +
        "Budget: " + (data.budget || "—") + "\n\n" +
        (data.message || "");

      if (status) {
        status.textContent =
          "Thank you — your brief is ready to send. We reply to every enquiry within 24 hours.";
        status.classList.add("is-visible");
        status.classList.remove("is-error");
      }
      form.reset();

      if (form.dataset.endpoint) {
        fetch(form.dataset.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).catch(function () {
          if (status) {
            status.textContent = "Something went wrong. Please email services.brandsign@gmail.com.";
            status.classList.add("is-error");
          }
        });
      } else {
        // No endpoint configured: hand the brief to the visitor's mail client.
        window.location.href = "mailto:services.brandsign@gmail.com?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      }
    });
  }

  /* --------------------------------------------------------------- year */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
