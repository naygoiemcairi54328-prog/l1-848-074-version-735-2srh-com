(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(input, scope) {
    var keyword = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-wrap]')).forEach(function (wrap) {
    var input = wrap.querySelector('[data-local-filter]');
    var scope = wrap.parentElement || document;
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      filterCards(input, scope);
    });
  });

  var queryInput = document.querySelector('[data-query-input]');
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      queryInput.value = query;
      filterCards(queryInput, document);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-chip]')).forEach(function (chip) {
    chip.addEventListener('click', function () {
      var input = document.querySelector('[data-query-input]');
      if (input) {
        input.value = chip.getAttribute('data-search-chip') || '';
        filterCards(input, document);
        input.focus();
      }
    });
  });

  function loadPlayer(video) {
    var source = video.getAttribute('data-m3u8');
    if (!source) {
      return Promise.reject(new Error('empty source'));
    }
    if (video.getAttribute('data-ready') === '1') {
      return Promise.resolve();
    }
    video.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return Promise.resolve();
    }
    video.src = source;
    return Promise.resolve();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-play-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var shell = button.closest('.player-shell');
      var video = shell ? shell.querySelector('video[data-m3u8]') : null;
      if (!video) {
        return;
      }
      loadPlayer(video).then(function () {
        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }).catch(function () {
        button.textContent = '播放暂未成功';
      });
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('video[data-m3u8]')).forEach(function (video) {
    video.addEventListener('play', function () {
      loadPlayer(video).catch(function () {});
    }, { once: true });
  });
})();
