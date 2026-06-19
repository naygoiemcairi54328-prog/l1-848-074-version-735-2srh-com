(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    }

    function uniqueSorted(values) {
        return values.filter(Boolean).filter(function (value, index, array) {
            return array.indexOf(value) === index;
        }).sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select || select.options.length > 1) {
            return;
        }

        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";

        scopes.forEach(function (scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = scope.querySelector("[data-filter-input]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var regionSelect = scope.querySelector("[data-filter-region]");

            fillSelect(yearSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-year");
            })));
            fillSelect(typeSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-type");
            })));
            fillSelect(regionSelect, uniqueSorted(cards.map(function (card) {
                return card.getAttribute("data-region");
            })));

            if (input && queryValue) {
                input.value = queryValue;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-keywords"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedYear = !year || card.getAttribute("data-year") === year;
                    var matchedType = !type || card.getAttribute("data-type") === type;
                    var matchedRegion = !region || card.getAttribute("data-region") === region;

                    card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedType && matchedRegion));
                });
            }

            [input, yearSelect, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
