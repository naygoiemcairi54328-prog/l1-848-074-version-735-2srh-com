(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function() {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var scope = document.querySelector("[data-search-scope]");
        if (!scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var keywordInput = panel ? panel.querySelector("[data-filter-keyword]") : null;
        var yearSelect = panel ? panel.querySelector("[data-filter-year]") : null;
        var typeSelect = panel ? panel.querySelector("[data-filter-type]") : null;
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function text(card) {
            return [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-tags") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || ""
            ].join(" ").toLowerCase();
        }

        function apply() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;
            cards.forEach(function(card) {
                var ok = true;
                if (keyword && text(card).indexOf(keyword) === -1) {
                    ok = false;
                }
                if (year && (card.getAttribute("data-year") || "").indexOf(year) === -1) {
                    ok = false;
                }
                if (type && (card.getAttribute("data-type") || "") !== type) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            var empty = document.querySelector("[data-empty-state]");
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function(player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-start]");
            var source = player.getAttribute("data-video-src");
            var attached = false;
            var hls = null;

            if (!video || !button || !source) {
                return;
            }

            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function(event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    });
                } else {
                    video.src = source;
                }
            }

            function play() {
                attachSource();
                player.classList.add("is-playing");
                var request = video.play();
                if (request && request.catch) {
                    request.catch(function() {
                        player.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("play", function() {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function() {
                if (!video.ended) {
                    player.classList.add("is-playing");
                }
            });
            window.addEventListener("beforeunload", function() {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function() {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
