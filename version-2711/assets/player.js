document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector("[data-player]");
  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-play-button]");
  if (!video) {
    return;
  }

  var source = video.getAttribute("data-src");
  var hls = null;
  var loaded = false;
  var pendingPlay = false;

  function loadSource() {
    if (loaded || !source) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          playVideo();
        }
      });
      return;
    }

    video.src = source;
  }

  function playVideo() {
    loadSource();
    pendingPlay = true;
    shell.classList.add("is-playing");

    if (video.readyState > 0) {
      video.play().catch(function () {
        shell.classList.remove("is-playing");
      });
      return;
    }

    video.addEventListener("loadedmetadata", function () {
      video.play().catch(function () {
        shell.classList.remove("is-playing");
      });
    }, { once: true });
  }

  if (button) {
    button.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    shell.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      shell.classList.remove("is-playing");
    }
  });
});
