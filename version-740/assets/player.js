(function () {
    var players = document.querySelectorAll('[data-player]');

    Array.prototype.forEach.call(players, function (wrapper) {
        var video = wrapper.querySelector('video');
        var source = video ? video.querySelector('source') : null;
        var layer = wrapper.querySelector('.play-layer');
        var src = source ? source.getAttribute('src') : '';
        var loaded = false;
        var hls = null;

        if (!video || !src) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = src;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                return;
            }

            video.src = src;
        }

        function startVideo() {
            attachSource();
            wrapper.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', startVideo);
        }

        video.addEventListener('click', function () {
            if (!loaded) {
                startVideo();
            }
        });

        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
