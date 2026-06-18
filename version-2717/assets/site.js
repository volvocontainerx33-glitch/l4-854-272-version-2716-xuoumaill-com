const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('is-open');
  });
}

const backTop = document.querySelector('[data-back-top]');

if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('is-visible', window.scrollY > 480);
  });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }

  heroIndex = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === heroIndex);
  });

  heroDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === heroIndex);
  });
}

function startHeroCarousel() {
  if (heroSlides.length < 2) {
    return;
  }

  heroTimer = window.setInterval(() => {
    showHeroSlide(heroIndex + 1);
  }, 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    window.clearInterval(heroTimer);
    showHeroSlide(index);
    startHeroCarousel();
  });
});

startHeroCarousel();

const filters = Array.from(document.querySelectorAll('.catalog-filter'));

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase();
}

filters.forEach((panel) => {
  const section = panel.closest('section') || document;
  const cards = Array.from(section.querySelectorAll('.movie-card'));
  const input = panel.querySelector('[data-search-input]');
  const count = panel.querySelector('[data-visible-count]');
  const buttons = Array.from(panel.querySelectorAll('[data-filter-value]'));
  const selects = Array.from(panel.querySelectorAll('[data-select-filter]'));
  let activeButton = 'all';

  const params = new URLSearchParams(window.location.search);
  const queryValue = params.get('q');

  if (input && queryValue) {
    input.value = queryValue;
  }

  function applyFilter() {
    const keyword = normalizeText(input ? input.value : '');
    const selectValues = {};

    selects.forEach((select) => {
      selectValues[select.dataset.selectFilter] = select.value;
    });

    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalizeText([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year,
        card.dataset.type,
        card.dataset.category,
        card.textContent
      ].join(' '));

      const matchesKeyword = !keyword || haystack.includes(keyword);
      const matchesButton = activeButton === 'all' || haystack.includes(normalizeText(activeButton));
      const matchesSelects = Object.entries(selectValues).every(([key, value]) => {
        return value === 'all' || normalizeText(card.dataset[key]) === normalizeText(value);
      });
      const isVisible = matchesKeyword && matchesButton && matchesSelects;

      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = visible;
    }
  }

  if (input) {
    input.addEventListener('input', applyFilter);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      activeButton = button.dataset.filterValue;
      applyFilter();
    });
  });

  selects.forEach((select) => {
    select.addEventListener('change', applyFilter);
  });

  applyFilter();
});

async function setupPlayer(wrapper) {
  const video = wrapper.querySelector('video');
  const button = wrapper.querySelector('[data-play-button]');
  const streamUrl = wrapper.dataset.m3u8;
  let initialized = false;

  async function initialize() {
    if (!video || !streamUrl || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    try {
      const module = await import('./hls-vendor-dru42stk.js');
      const Hls = module.H;

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }
    } catch (error) {
      initialized = false;
    }

    video.src = streamUrl;
  }

  async function play() {
    await initialize();

    if (button) {
      button.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (button) {
        button.classList.remove('is-hidden');
      }
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (!initialized) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }
}

Array.from(document.querySelectorAll('[data-player]')).forEach((wrapper) => {
  setupPlayer(wrapper);
});
