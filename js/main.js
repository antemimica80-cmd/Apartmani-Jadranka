// Apartmani Jadranka — shared site behavior
// Mobile nav toggle, scroll effects, and scroll-reveal animations.

document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  initHeaderScroll();
  initScrollReveal();
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
