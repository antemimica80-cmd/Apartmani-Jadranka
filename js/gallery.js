// Apartmani Jadranka — Airbnb-style gallery preview + lightbox.
//
// The full set of photos for a unit lives in the static `.gallery-grid`
// markup (see pages/stan.html / pages/istok.html) — that grid is the single
// source of truth for image URLs and labels, and stays visible as a no-JS
// fallback. On load, this script reads it, builds a compact 5-photo preview
// (1 large + 4 small, marked via the `gallery-featured` class — see the
// comment above the gallery grid in each unit page for how to change which
// photos are featured), hides the full grid, and wires up a full-screen
// lightbox so every photo in the grid can be browsed with prev/next
// controls, arrow keys, or a swipe.

(function () {
  var lightboxEl, imageEl, captionEl, counterEl;
  var currentPhotos = [];
  var currentIndex = 0;

  function readPhotos(grid) {
    return Array.prototype.map.call(grid.querySelectorAll('.gallery-item'), function (el) {
      var span = el.querySelector('span');
      return {
        bg: getComputedStyle(el).backgroundImage,
        label: span ? span.textContent : '',
        i18nKey: span ? span.getAttribute('data-i18n') : null,
        featured: el.classList.contains('gallery-featured')
      };
    });
  }

  function buildPreview(grid, photos) {
    var featured = photos.filter(function (p) { return p.featured; }).slice(0, 5);
    photos.forEach(function (p) {
      if (featured.length < 5 && featured.indexOf(p) === -1) featured.push(p);
    });

    var preview = document.createElement('div');
    preview.className = 'gallery-preview';

    featured.forEach(function (photo) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gallery-preview-tile';
      tile.style.backgroundImage = photo.bg;
      // No visible caption on the preview tile (matches Airbnb) — the label
      // is still exposed to screen readers via aria-label (kept in sync with
      // the language toggle via data-i18n-aria-label), and shown once a
      // visitor opens the lightbox.
      tile.setAttribute('aria-label', photo.label);
      if (photo.i18nKey) tile.setAttribute('data-i18n-aria-label', photo.i18nKey);

      var photoIndex = photos.indexOf(photo);
      tile.addEventListener('click', function () { openLightbox(photos, photoIndex); });

      preview.appendChild(tile);
    });

    // The "show all photos" button needs to be reachable regardless of
    // viewport: on desktop only the last (small) tile is visible next to the
    // hero tile, but on mobile only the first (hero) tile shows at all — so
    // add it to both; CSS picks which one is actually displayed per breakpoint.
    [preview.firstElementChild, preview.lastElementChild].forEach(function (tile) {
      if (!tile) return;
      var showAll = document.createElement('span');
      showAll.className = 'gallery-show-all';
      showAll.setAttribute('data-i18n', 'gallery.show_all');
      showAll.textContent = window.Jadranka ? window.Jadranka.t('gallery.show_all') : 'Show all photos';
      showAll.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox(photos, 0);
      });
      tile.appendChild(showAll);
    });

    grid.classList.add('gallery-grid-hidden');
    grid.setAttribute('aria-hidden', 'true');
    grid.parentNode.insertBefore(preview, grid);
  }

  function ensureLightbox() {
    if (lightboxEl) return;

    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous">&larr;</button>' +
      '<div class="lightbox-stage">' +
        '<div class="lightbox-image"></div>' +
        '<div class="lightbox-caption"></div>' +
        '<div class="lightbox-counter"></div>' +
      '</div>' +
      '<button type="button" class="lightbox-next" aria-label="Next">&rarr;</button>';
    document.body.appendChild(lightboxEl);

    imageEl = lightboxEl.querySelector('.lightbox-image');
    captionEl = lightboxEl.querySelector('.lightbox-caption');
    counterEl = lightboxEl.querySelector('.lightbox-counter');

    lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox-prev').addEventListener('click', function () { step(-1); });
    lightboxEl.querySelector('.lightbox-next').addEventListener('click', function () { step(1); });
    lightboxEl.addEventListener('click', function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightboxEl.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    var touchStartX = null;
    lightboxEl.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightboxEl.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1);
      touchStartX = null;
    }, { passive: true });
  }

  function render() {
    var photo = currentPhotos[currentIndex];
    imageEl.style.backgroundImage = photo.bg;
    captionEl.textContent = photo.label;
    counterEl.textContent = (currentIndex + 1) + ' / ' + currentPhotos.length;
  }

  function step(delta) {
    currentIndex = (currentIndex + delta + currentPhotos.length) % currentPhotos.length;
    render();
  }

  function openLightbox(photos, index) {
    ensureLightbox();
    currentPhotos = photos;
    currentIndex = index;
    render();
    lightboxEl.classList.add('open');
    document.body.classList.add('lightbox-locked');
    document.documentElement.classList.add('lightbox-locked');
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('open');
    document.body.classList.remove('lightbox-locked');
    document.documentElement.classList.remove('lightbox-locked');
  }

  document.addEventListener('jadranka:languagechange', function () {
    currentPhotos.forEach(function (p) {
      if (p.i18nKey && window.Jadranka) p.label = window.Jadranka.t(p.i18nKey);
    });
    if (lightboxEl && lightboxEl.classList.contains('open')) render();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    var photos = readPhotos(grid);
    if (!photos.length) return;
    buildPreview(grid, photos);
  });
})();
