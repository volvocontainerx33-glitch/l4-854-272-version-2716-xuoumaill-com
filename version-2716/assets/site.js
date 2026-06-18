const SELECTORS = {
  navToggle: '[data-nav-toggle]',
  navPanel: '[data-nav-panel]',
  heroSlider: '[data-hero-slider]',
  heroSlide: '[data-hero-slide]',
  heroDot: '[data-hero-dot]',
  searchForm: '[data-search-form]',
  pageSearch: '[data-page-search]',
  card: '[data-card]',
  resultCount: '[data-result-count]',
  filterChip: '[data-filter-chip]',
  player: '[data-player]',
  playButton: '[data-play-button]'
};

function setupMobileNavigation() {
  const toggle = document.querySelector(SELECTORS.navToggle);
  const panel = document.querySelector(SELECTORS.navPanel);

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const slider = document.querySelector(SELECTORS.heroSlider);

  if (!slider) {
    return;
  }

  const slides = [...slider.querySelectorAll(SELECTORS.heroSlide)];
  const dots = [...slider.querySelectorAll(SELECTORS.heroDot)];
  let activeIndex = 0;
  let timer = null;

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const nextIndex = Number(dot.dataset.heroDot || 0);
      showSlide(nextIndex);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
}

function setupSearchForms() {
  document.querySelectorAll(SELECTORS.searchForm).forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[type="search"]');
      const query = input ? input.value.trim() : '';
      const target = form.dataset.searchTarget || form.getAttribute('action') || 'search.html';

      if (!query) {
        return;
      }

      event.preventDefault();
      window.location.href = `${target}?q=${encodeURIComponent(query)}`;
    });
  });
}

function setupPageFiltering() {
  const searchInput = document.querySelector(SELECTORS.pageSearch);
  const cards = [...document.querySelectorAll(SELECTORS.card)];
  const resultCount = document.querySelector(SELECTORS.resultCount);
  const chips = [...document.querySelectorAll(SELECTORS.filterChip)];

  if (!searchInput || cards.length === 0) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (initialQuery) {
    searchInput.value = initialQuery;
  }

  function applyFilter(extraTerm = '') {
    const searchTerm = `${searchInput.value || ''} ${extraTerm || ''}`.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = `${card.dataset.title || ''} ${card.dataset.text || ''}`.toLowerCase();
      const visible = !searchTerm || text.includes(searchTerm);
      card.classList.toggle('is-hidden', !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = `共 ${visibleCount} 部影片`;
    }
  }

  searchInput.addEventListener('input', () => applyFilter());

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      applyFilter(chip.dataset.filterChip || '');
    });
  });

  applyFilter();
}

async function loadHls() {
  const module = await import('./hls-vendor-dru42stk.js');
  return module.H;
}

function setupPlayers() {
  document.querySelectorAll(SELECTORS.player).forEach((player) => {
    const video = player.querySelector('video');
    const playButton = player.querySelector(SELECTORS.playButton);
    const source = player.dataset.src;

    if (!video || !playButton || !source) {
      return;
    }

    async function play() {
      player.classList.add('is-playing');

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          await video.play();
          return;
        }

        const Hls = await loadHls();

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => undefined);
          });
          return;
        }

        video.src = source;
        await video.play();
      } catch (error) {
        player.classList.remove('is-playing');
        window.alert('播放器初始化失败，请尝试使用备用播放源。');
      }
    }

    playButton.addEventListener('click', play);
    video.addEventListener('play', () => player.classList.add('is-playing'));
  });
}

function setupScrollHeader() {
  const header = document.querySelector('.site-header');

  if (!header) {
    return;
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setupHeroSlider();
  setupSearchForms();
  setupPageFiltering();
  setupPlayers();
  setupScrollHeader();
});
