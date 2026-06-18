(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function buildCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card grid\">" +
      "<a class=\"card-cover\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"card-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }
    var input = panel.querySelector("[data-search-input]");
    var category = panel.querySelector("[data-category-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var count = panel.querySelector("[data-search-count]");
    var results = panel.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function getText(movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.category, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var filtered = window.SITE_MOVIES.filter(function (movie) {
        var matchesQuery = !query || getText(movie).indexOf(query) !== -1;
        var matchesCategory = !cat || movie.category === cat;
        var matchesYear = !selectedYear || movie.year === selectedYear;
        return matchesQuery && matchesCategory && matchesYear;
      });
      if (count) {
        count.textContent = "找到 " + filtered.length + " 条相关影片";
      }
      if (results) {
        results.innerHTML = filtered.slice(0, 240).map(buildCard).join("");
      }
    }

    [input, category, year].forEach(function (el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });
    render();
  }

  window.setupPlayer = function (sourceUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var trigger = document.querySelector("[data-player-trigger]");
      var shell = document.querySelector("[data-player-shell]");
      var started = false;
      var hlsInstance = null;

      if (!video || !trigger || !shell || !sourceUrl) {
        return;
      }

      function attachAndPlay() {
        if (!started) {
          started = true;
          shell.classList.add("is-playing");
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = sourceUrl;
          }
        }
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {});
        }
      }

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        attachAndPlay();
      });

      shell.addEventListener("click", function (event) {
        if (!started && event.target !== video) {
          attachAndPlay();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initSearch();
  });
})();
