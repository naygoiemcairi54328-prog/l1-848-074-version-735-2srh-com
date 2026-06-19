(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot) {
                var target = Number(dot.getAttribute('data-hero-dot'));
                dot.classList.toggle('is-active', target === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupCardTools() {
        var list = document.querySelector('[data-card-list]');
        var search = document.querySelector('[data-card-search]');
        var sort = document.querySelector('[data-card-sort]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var defaultOrder = cards.slice();

        function cardText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applySearch() {
            var keyword = search ? search.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
                card.classList.toggle('is-filter-hidden', !matched);
            });
        }

        function applySort() {
            var value = sort ? sort.value : 'default';
            var ordered = defaultOrder.slice();

            if (value === 'year') {
                ordered.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }

            if (value === 'rating') {
                ordered.sort(function (a, b) {
                    return b.textContent.length - a.textContent.length;
                });
            }

            if (value === 'title') {
                ordered.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                });
            }

            ordered.forEach(function (card) {
                list.appendChild(card);
            });

            applySearch();
        }

        if (search) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query) {
                search.value = query;
            }

            search.addEventListener('input', applySearch);
        }

        if (sort) {
            sort.addEventListener('change', applySort);
        }

        applySearch();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupCardTools();
    });
})();
