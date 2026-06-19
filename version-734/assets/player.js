(function () {
  "use strict";

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-play-button]");
    var playToggle = player.querySelector("[data-play-toggle]");
    var muteToggle = player.querySelector("[data-mute-toggle]");
    var fullscreenToggle = player.querySelector("[data-fullscreen-toggle]");
    var layer = player.querySelector("[data-player-layer]");
    var loading = player.querySelector("[data-player-loading]");
    var errorBox = player.querySelector("[data-player-error]");
    var source = player.getAttribute("data-hls-src");
    var hls = null;
    var hasLoaded = false;

    if (!video || !source) {
      return;
    }

    function setLoading(isLoading) {
      if (loading) {
        loading.hidden = !isLoading;
      }
    }

    function showError(message) {
      setLoading(false);

      if (errorBox) {
        errorBox.hidden = false;
        errorBox.textContent = message;
      }
    }

    function hideError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = "";
      }
    }

    function hideLayer() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    }

    function loadSource() {
      if (hasLoaded) {
        return Promise.resolve();
      }

      hasLoaded = true;
      setLoading(true);
      hideError();

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setLoading(false);
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError("播放源加载失败，请尝试备用播放源。");
          }
        });

        return Promise.resolve();
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setLoading(false);
        return Promise.resolve();
      }

      showError("当前浏览器不支持 HLS 播放，请尝试使用现代浏览器访问。");
      return Promise.reject(new Error("HLS is not supported"));
    }

    function play() {
      loadSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          hideLayer();
          setLoading(false);
        })
        .catch(function () {
          showError("播放未能自动开始，请再次点击播放按钮或使用备用播放源。");
        });
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }

    if (playToggle) {
      playToggle.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }

    if (muteToggle) {
      muteToggle.addEventListener("click", function () {
        video.muted = !video.muted;
        muteToggle.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullscreenToggle) {
      fullscreenToggle.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    video.addEventListener("play", hideLayer);
    video.addEventListener("waiting", function () {
      setLoading(true);
    });
    video.addEventListener("playing", function () {
      setLoading(false);
    });
    video.addEventListener("error", function () {
      showError("视频播放出错，请尝试备用播放源。");
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(setupPlayer);
  });
})();
