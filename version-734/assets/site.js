(function () {
  "use strict";

  function setupMobileMenu() {
    var button = document.querySelector(".js-menu-button");
    var panel = document.querySelector(".js-mobile-panel");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("menu-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startTimer();
      });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    showSlide(0);
    startTimer();
  }

  function setupLibraryFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-library-filter]"));

    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var count = panel.querySelector("[data-result-count]");
      var queryInput = panel.querySelector('[data-filter-field="query"]');
      var typeSelect = panel.querySelector('[data-filter-field="type"]');
      var yearSelect = panel.querySelector('[data-filter-field="year"]');
      var categorySelect = panel.querySelector('[data-filter-field="category"]');
      var searchParams = new URLSearchParams(window.location.search);
      var urlQuery = searchParams.get("q");

      if (queryInput && urlQuery) {
        queryInput.value = urlQuery;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var query = normalize(queryInput ? queryInput.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var category = normalize(categorySelect ? categorySelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" "));

          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
          var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
          var matchesCategory = !category || haystack.indexOf(category) !== -1;

          var shouldShow = matchesQuery && matchesType && matchesYear && matchesCategory;
          card.classList.toggle("is-hidden", !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [queryInput, typeSelect, yearSelect, categorySelect].forEach(function (field) {
        if (!field) {
          return;
        }

        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      });

      applyFilters();
    });
  }

  function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".js-header-search"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');

        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupLibraryFilters();
    setupHeaderSearch();
  });
})();
