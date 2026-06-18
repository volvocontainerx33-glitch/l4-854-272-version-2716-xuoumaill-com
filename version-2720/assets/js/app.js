(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearchForms() {
    Array.prototype.forEach.call(document.querySelectorAll(".site-search-form"), function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var url = "./search.html";
        if (q) {
          url += "?q=" + encodeURIComponent(q);
        }
        window.location.href = url;
      });
    });
  }

  function setupFilters() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter-root]"), function (root) {
      var input = root.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(root.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var empty = root.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var initialQ = params.get("q");

      if (input && initialQ) {
        input.value = initialQ;
      }

      function apply() {
        var q = normalize(input ? input.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var ok = true;
          var haystack = normalize(card.getAttribute("data-search") || card.textContent);
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter");
            var val = normalize(select.value);
            if (val && normalize(card.getAttribute("data-" + key)) !== val) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function setupPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (shell) {
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector(".player-start");
      if (!video) {
        return;
      }
      var src = video.getAttribute("data-src");
      var hls = null;

      function attach() {
        if (!src || video.getAttribute("data-ready") === "1") {
          return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else {
          video.src = src;
        }
      }

      attach();

      function play() {
        attach();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
