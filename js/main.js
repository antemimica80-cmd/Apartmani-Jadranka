// Apartmani Jadranka — shared site behavior
// Mobile nav toggle, scroll effects, and scroll-reveal animations.

document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  initHeaderScroll();
  initScrollReveal();
  initWeatherBadge();
  initHostEmailForm();
});

function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var backdrop = document.querySelector('.nav-backdrop');
  if (!toggle || !links) return;

  function setOpen(isOpen) {
    links.classList.toggle('open', isOpen);
    if (backdrop) backdrop.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    document.documentElement.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(!links.classList.contains('open'));
  });

  if (backdrop) {
    backdrop.addEventListener('click', function () { setOpen(false); });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && links.classList.contains('open')) setOpen(false);
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
}

function initHeaderScroll() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function update() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initScrollReveal() {
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
}

// Mimice weather badge (hero) — live local time + current temperature,
// via Open-Meteo's free, key-free API. Fails silently (badge stays
// hidden) if the request doesn't succeed.
var WEATHER_ICONS = {
  clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M5 19l2.1-2.1M16.9 7.1L19 5"/></svg>',
  partly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.2" cy="8.2" r="3"/><path d="M8.2 3.4v1.5M3.4 8.2h1.5M5 5l1.1 1.1"/><path d="M8 19h9.3a3.3 3.3 0 0 0 .6-6.55A4.7 4.7 0 0 0 8.7 11 3.8 3.8 0 0 0 8 19z"/></svg>',
  cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 18h11a3.5 3.5 0 0 0 .6-6.95A5 5 0 0 0 7.6 10 4 4 0 0 0 6.5 18z"/></svg>',
  fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 14h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 6 4 4 0 0 0 6.5 14z"/><path d="M4 18h16M4 21h16"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 13h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 5 4 4 0 0 0 6.5 13z"/><path d="M8 17l-1.2 2.4M12.5 17l-1.2 2.4M17 17l-1.2 2.4"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 13h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 5 4 4 0 0 0 6.5 13z"/><path d="M8 17.5v3.4M8 17.5l-1.3 1.3M8 20.9l-1.3-1.3M8 17.5l1.3 1.3M8 20.9l1.3-1.3M16 17.5v3.4M16 17.5l-1.3 1.3M16 20.9l-1.3-1.3M16 17.5l1.3 1.3M16 20.9l1.3-1.3"/></svg>',
  storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12h11a3.5 3.5 0 0 0 .3-6.98A5 5 0 0 0 7.6 4 4 4 0 0 0 6.5 12z"/><path d="M13 13l-3 5h3l-2 4"/></svg>'
};

function weatherIconForCode(code) {
  if (code === 0) return WEATHER_ICONS.clear;
  if (code === 1 || code === 2) return WEATHER_ICONS.partly;
  if (code === 3) return WEATHER_ICONS.cloudy;
  if (code === 45 || code === 48) return WEATHER_ICONS.fog;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return WEATHER_ICONS.rain;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return WEATHER_ICONS.snow;
  if (code >= 95) return WEATHER_ICONS.storm;
  return WEATHER_ICONS.partly;
}

function initWeatherBadge() {
  var badge = document.getElementById('weather-badge');
  var iconEl = document.getElementById('weather-icon');
  var tempEl = document.getElementById('weather-temp');
  var timeEl = document.getElementById('weather-time');
  if (!badge || !iconEl || !tempEl || !timeEl) return;

  function updateClock() {
    var lang = (window.Jadranka && window.Jadranka.getLang()) || 'hr';
    timeEl.textContent = new Date().toLocaleTimeString(lang, {
      timeZone: 'Europe/Zagreb',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function fetchWeather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=43.404&longitude=16.813&current=temperature_2m,weather_code&timezone=Europe%2FZagreb')
      .then(function (res) {
        if (!res.ok) throw new Error('weather request failed');
        return res.json();
      })
      .then(function (data) {
        var current = data && data.current;
        if (!current || typeof current.temperature_2m !== 'number') return;
        tempEl.textContent = Math.round(current.temperature_2m) + '°C';
        iconEl.innerHTML = weatherIconForCode(current.weather_code);
        badge.style.display = '';
      })
      .catch(function () { /* keep the badge hidden if the request fails */ });
  }

  updateClock();
  fetchWeather();
  setInterval(updateClock, 30000);
  setInterval(fetchWeather, 15 * 60 * 1000);
}

// "Email" button in the Contact section — toggles a real contact form that
// posts to Formspree via fetch(), so the page never navigates away and the
// user's default mail app is never required.
function initHostEmailForm() {
  var toggle = document.getElementById('host-email-toggle');
  var form = document.getElementById('host-email-form');
  var status = document.getElementById('host-email-status');
  if (!toggle || !form || !status) return;

  toggle.addEventListener('click', function () {
    var isOpen = form.style.display !== 'none';
    if (isOpen) {
      form.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      form.style.display = '';
      toggle.setAttribute('aria-expanded', 'true');
      var nameInput = document.getElementById('host-email-name');
      if (nameInput) nameInput.focus();
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = window.Jadranka ? window.Jadranka.t : function (key) { return key; };

    status.textContent = t('contact.host_form_sending');
    status.className = 'form-status visible sending';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          status.textContent = t('contact.host_form_success');
          status.className = 'form-status visible success';
          form.reset();
        } else {
          status.textContent = t('contact.host_form_error');
          status.className = 'form-status visible error';
        }
      })
      .catch(function () {
        status.textContent = t('contact.host_form_error');
        status.className = 'form-status visible error';
      });
  });
}
