(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("active", itemIndex === index);
        });
      }

      function start() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector("[data-filter-search]");
      var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
      var empty = panel.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var selected = {};
        selects.forEach(function (select) {
          selected[select.getAttribute("data-filter-field")] = normalize(select.value);
        });

        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = !keyword || haystack.indexOf(keyword) !== -1;

          Object.keys(selected).forEach(function (field) {
            var value = selected[field];
            if (value && normalize(card.getAttribute("data-" + field)) !== value) {
              ok = false;
            }
          });

          card.classList.toggle("hidden-card", !ok);
          if (ok) visible += 1;
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) input.addEventListener("input", applyFilter);
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });
    });
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var button = document.querySelector("[data-play-button]");
    if (!video || !source) return;

    var loaded = false;
    var hlsInstance = null;

    function load() {
      if (loaded) return;
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      if (button) button.classList.add("hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) button.classList.add("hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
