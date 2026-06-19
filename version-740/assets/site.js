(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var searchInput = document.querySelector('[data-card-search]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortSelect = document.querySelector('[data-sort]');
    var grid = document.querySelector('[data-filter-grid]');

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterCards() {
        if (!grid) {
            return;
        }

        var query = normalize(searchInput ? searchInput.value : '');
        var typeValue = typeFilter ? typeFilter.value : 'all';
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year')
            ].join(' '));
            var typeMatch = typeValue === 'all' || card.getAttribute('data-type') === typeValue;
            var queryMatch = !query || text.indexOf(query) !== -1;

            card.classList.toggle('is-hidden', !(typeMatch && queryMatch));
        });
    }

    function sortCards() {
        if (!grid || !sortSelect) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var sortBy = sortSelect.value;

        cards.sort(function (a, b) {
            var ay = Number(a.getAttribute('data-year')) || 0;
            var by = Number(b.getAttribute('data-year')) || 0;
            var av = Number(a.getAttribute('data-views')) || 0;
            var bv = Number(b.getAttribute('data-views')) || 0;
            var ar = Number(a.getAttribute('data-rating')) || 0;
            var br = Number(b.getAttribute('data-rating')) || 0;

            if (sortBy === 'views') {
                return bv - av || by - ay;
            }

            if (sortBy === 'rating') {
                return br - ar || bv - av;
            }

            return by - ay || bv - av;
        });

        cards.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards();
            filterCards();
        });
    }

    sortCards();
    filterCards();
})();
