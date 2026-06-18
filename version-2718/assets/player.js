function initMoviePlayer(streamUrl) {
    var video = document.getElementById("videoPlayer");
    var cover = document.getElementById("playerCover");
    var started = false;

    if (!video || !cover || !streamUrl) {
        return;
    }

    function playVideo() {
        if (started) {
            video.play();
            return;
        }
        started = true;
        cover.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.play();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.play().catch(function() {});
            return;
        }

        video.src = streamUrl;
        video.play();
    }

    cover.addEventListener("click", playVideo);
    video.addEventListener("click", function() {
        if (!started || video.paused) {
            playVideo();
        }
    });
}
