(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('.back-top');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 360) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var carousel = document.querySelector('[data-carousel="hero"]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var activeIndex = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            activeIndex = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === activeIndex);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.card-search-input'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
    var selectedFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyCardFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid'));
        var query = normalize(filterInputs.map(function (input) {
            return input.value;
        }).filter(Boolean).join(' '));
        var filter = normalize(selectedFilter);

        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .rank-row'));

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var region = normalize(card.getAttribute('data-region'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = filter === 'all' || text.indexOf(filter) !== -1 || region === filter || type === filter || year === filter;
                card.classList.toggle('is-hidden-by-filter', !(matchesQuery && matchesFilter));
            });
        });
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', applyCardFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            selectedFilter = button.getAttribute('data-card-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('is-selected', item === button);
            });

            applyCardFilters();
        });
    });

    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('q');
    var siteSearch = document.getElementById('siteSearch');

    if (initialQuery && siteSearch) {
        siteSearch.value = initialQuery;
        applyCardFilters();
    }
})();
