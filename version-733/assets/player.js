(function () {
    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function bindPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var message = box.querySelector('[data-player-message]');
        var source = box.getAttribute('data-src');
        var isReady = false;
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function attachNative() {
            video.src = source;
            isReady = true;
            return Promise.resolve();
        }

        function attachHls() {
            return loadHls().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    isReady = true;
                    return;
                }

                return attachNative();
            });
        }

        function prepare() {
            if (isReady) {
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                return attachNative();
            }

            return attachHls();
        }

        function play() {
            setMessage('');

            prepare().then(function () {
                return video.play();
            }).then(function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            }).catch(function () {
                setMessage('当前播放暂不可用，请稍后重试');
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
    });
})();
