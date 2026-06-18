(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    show(0);
  }

  const scopes = Array.from(document.querySelectorAll('[data-card-scope]'));
  scopes.forEach(function (scope) {
    const input = scope.querySelector('[data-card-search]');
    const chips = Array.from(scope.querySelectorAll('[data-filter]'));
    const cards = Array.from(scope.querySelectorAll('.movie-card, .compact-card'));
    const empty = scope.querySelector('[data-no-results]');
    let activeFilter = 'all';

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const apply = function () {
      const keyword = normalize(input ? input.value : '');
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.year,
          card.dataset.region,
          card.dataset.keywords
        ].join(' '));
        const filterOk = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        const showCard = filterOk && keywordOk;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    if (input) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener('input', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.dataset.filter || 'all';
        apply();
      });
    });
    apply();
  });
})();
