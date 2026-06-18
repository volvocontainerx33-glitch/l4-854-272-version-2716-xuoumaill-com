document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
      restartHero();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(active - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(active + 1);
      restartHero();
    });
  }

  showSlide(0);
  restartHero();

  var filterRow = document.querySelector("[data-filter-row]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".home-movie-card"));

  if (filterRow && cards.length) {
    filterRow.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) {
        return;
      }
      var filter = button.getAttribute("data-filter");
      filterRow.querySelectorAll("[data-filter]").forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  }

  var searchForm = document.querySelector("[data-search-form]");
  var searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById("searchResults");
  var searchTitle = document.getElementById("searchTitle");
  var resultCount = document.getElementById("resultCount");

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\" data-category=\"" + escapeHtml(item.categoryId) + "\">" +
      "<a class=\"movie-poster\" href=\"" + escapeHtml(item.href) + "\">" +
        "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-type\">" + escapeHtml(item.type) + "</span>" +
        "<span class=\"poster-duration\">" + escapeHtml(item.duration) + "</span>" +
      "</a>" +
      "<div class=\"movie-info\">" +
        "<a class=\"movie-title\" href=\"" + escapeHtml(item.href) + "\">" + escapeHtml(item.title) + "</a>" +
        "<div class=\"movie-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.rating) + " 分</span></div>" +
        "<p>" + escapeHtml(item.oneLine) + "</p>" +
        "<div class=\"movie-tags\"><a href=\"./category-" + escapeHtml(item.categoryId) + ".html\">" + escapeHtml(item.category) + "</a>" + tags + "</div>" +
      "</div>" +
    "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function doSearch(term) {
    if (!searchResults || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var query = String(term || "").trim().toLowerCase();
    var data = window.MOVIE_SEARCH_DATA;
    var matched = data.filter(function (item) {
      if (!query) {
        return true;
      }
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    var limited = matched.slice(0, 120);
    searchResults.innerHTML = limited.map(movieCard).join("");
    if (searchTitle) {
      searchTitle.textContent = query ? "“" + term + "”的搜索结果" : "推荐内容";
    }
    if (resultCount) {
      resultCount.textContent = "共 " + matched.length + " 部";
    }
  }

  if (searchResults && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (searchInput) {
      searchInput.value = q;
    }
    doSearch(q);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      doSearch(searchInput ? searchInput.value : "");
    });
  }
});
