(function() {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function() {
            mobileMenu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
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
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll("[data-search-input]").forEach(function(input) {
        var target = input.getAttribute("data-search-input") || "body";
        var scope = document.querySelector(target) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

        input.addEventListener("input", function() {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                var haystack = card.getAttribute("data-search") || card.textContent.toLowerCase();
                card.classList.toggle("hidden-card", keyword.length > 0 && haystack.indexOf(keyword) === -1);
            });
        });
    });
})();
