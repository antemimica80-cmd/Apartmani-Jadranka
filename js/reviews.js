// Apartmani Jadranka — rotating guest reviews (real Airbnb reviews).
//
// Builds a horizontally-scrollable track of review cards from the REVIEWS
// list below (the list is duplicated once so the auto-scroll can loop
// seamlessly). It auto-advances on its own, but the track is a real
// scroll container — visitors can drag it (mouse), swipe it (touch), or
// use a trackpad/wheel to move through it manually, faster than the
// automatic pace, at any time. Each card's quote text lives in
// js/i18n.js under `<key>.quote` so it stays translatable the same way
// as everything else on the site. Long quotes are clamped with CSS; a
// "Read more" button (shown only when the text actually overflows)
// opens the full review in a modal.

(function () {
  var REVIEWS = [
    { name: 'Cindy', key: 'reviews.1' },
    { name: 'Ellen', key: 'reviews.2' },
    { name: 'Bjørnar', key: 'reviews.3' },
    { name: 'Chantal', key: 'reviews.4' },
    { name: 'Janos', key: 'reviews.5' },
    { name: 'Ingrid', key: 'reviews.6' },
    { name: 'Anna', key: 'reviews.7' },
    { name: 'Antun', key: 'reviews.8' },
    { name: 'Ildi', key: 'reviews.9' },
    { name: 'Kevin', key: 'reviews.10' },
    { name: 'Laura', key: 'reviews.11' }
  ];

  var AUTO_SPEED_PX_PER_SEC = 34;
  var RESUME_DELAY_MS = 1500;
  var DRAG_THRESHOLD_PX = 5;

  var modal, modalQuote, modalAuthor;

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="modal-dialog review-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="review-modal-author">' +
        '<button type="button" class="modal-close" aria-label="Close">&times;</button>' +
        '<div class="review-stars" aria-hidden="true">★★★★★</div>' +
        '<blockquote class="review-quote review-modal-quote"></blockquote>' +
        '<p class="review-author"></p>' +
      '</div>';
    document.body.appendChild(modal);
    modalQuote = modal.querySelector('.review-modal-quote');
    modalAuthor = modal.querySelector('.review-author');

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function openModal(review, t) {
    ensureModal();
    modalQuote.textContent = t(review.key + '.quote');
    modalAuthor.textContent = '— ' + review.name;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  function buildCard(review, t) {
    var card = document.createElement('article');
    card.className = 'review-card';
    card.tabIndex = 0;

    var stars = document.createElement('div');
    stars.className = 'review-stars';
    stars.setAttribute('aria-hidden', 'true');
    stars.textContent = '★★★★★';
    card.appendChild(stars);

    var quote = document.createElement('blockquote');
    quote.className = 'review-quote';
    quote.textContent = t(review.key + '.quote');
    card.appendChild(quote);

    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'review-more';
    more.textContent = t('reviews.read_more');
    more.hidden = true;
    card.appendChild(more);

    var author = document.createElement('p');
    author.className = 'review-author';
    author.textContent = '— ' + review.name;
    card.appendChild(author);

    function open() { openModal(review, t); }
    more.addEventListener('click', function (e) { e.stopPropagation(); open(); });
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    return { card: card, quoteEl: quote, moreEl: more };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.querySelector('.reviews-track-wrap');
    var track = document.getElementById('reviews-track');
    if (!wrap || !track) return;
    var t = window.Jadranka ? window.Jadranka.t : function (k) { return k; };

    var cards = [];
    [0, 1].forEach(function () {
      REVIEWS.forEach(function (review) {
        var built = buildCard(review, t);
        track.appendChild(built.card);
        cards.push(built);
      });
    });

    function checkOverflow() {
      cards.forEach(function (c) {
        c.moreEl.hidden = c.quoteEl.scrollHeight <= c.quoteEl.clientHeight + 2;
      });
    }
    // Fonts/layout need time to settle before measuring clamped height —
    // a single short delay isn't reliable, so check several times as the
    // page finishes loading, plus on resize.
    [100, 400, 1000].forEach(function (ms) { setTimeout(checkOverflow, ms); });
    window.addEventListener('load', checkOverflow);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(checkOverflow); });
    }
    window.addEventListener('resize', checkOverflow);

    document.addEventListener('jadranka:languagechange', function () {
      cards.forEach(function (c, i) {
        c.quoteEl.textContent = t(REVIEWS[i % REVIEWS.length].key + '.quote');
      });
      var moreLabel = t('reviews.read_more');
      cards.forEach(function (c) { c.moreEl.textContent = moreLabel; });
      checkOverflow();
    });

    // --- Auto-scroll, pausable and manually overridable ---
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paused = false;
    var resumeTimer = null;
    var lastFrameTime = null;
    var loopWidth = track.scrollWidth / 2;
    window.addEventListener('resize', function () { loopWidth = track.scrollWidth / 2; });

    function wrapScroll() {
      if (loopWidth <= 0) return;
      if (wrap.scrollLeft >= loopWidth) wrap.scrollLeft -= loopWidth;
      else if (wrap.scrollLeft < 0) wrap.scrollLeft += loopWidth;
    }

    function tick(now) {
      if (!paused && !reducedMotion) {
        if (lastFrameTime !== null) {
          var deltaSec = (now - lastFrameTime) / 1000;
          wrap.scrollLeft += AUTO_SPEED_PX_PER_SEC * deltaSec;
          wrapScroll();
        }
        lastFrameTime = now;
      } else {
        lastFrameTime = null;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function pauseAuto() {
      paused = true;
      if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    }
    function scheduleResume() {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; }, RESUME_DELAY_MS);
    }

    // Hovering (mouse) pauses immediately and resumes on mouse-leave, like before.
    wrap.addEventListener('mouseenter', pauseAuto);
    wrap.addEventListener('mouseleave', function () { paused = false; });
    wrap.addEventListener('focusin', pauseAuto);
    wrap.addEventListener('focusout', scheduleResume);

    // A manual wheel/trackpad scroll pauses auto-advance for a bit so the
    // visitor's own scroll isn't immediately fought or undone.
    wrap.addEventListener('wheel', function () { pauseAuto(); scheduleResume(); }, { passive: true });

    // Also keep the loop wrap-around correct when the visitor scrolls the
    // track manually (touch swipe, trackpad, or the drag handler below).
    wrap.addEventListener('scroll', wrapScroll, { passive: true });

    // Click-and-drag support for desktop mice (touch already scrolls
    // natively). Dragging counts as "manual", not a card click.
    var dragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    var draggedPastThreshold = false;

    wrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      draggedPastThreshold = false;
      dragStartX = e.clientX;
      dragStartScroll = wrap.scrollLeft;
      pauseAuto();
    });

    wrap.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (!draggedPastThreshold && Math.abs(dx) > DRAG_THRESHOLD_PX) {
        draggedPastThreshold = true;
        wrap.classList.add('dragging');
        wrap.setPointerCapture(e.pointerId);
      }
      if (draggedPastThreshold) {
        wrap.scrollLeft = dragStartScroll - dx;
        wrapScroll();
      }
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove('dragging');
      if (draggedPastThreshold) {
        scheduleResume();
        // Suppress the click that follows a real drag, so releasing the
        // mouse over a card doesn't also open its modal.
        var suppress = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
        wrap.addEventListener('click', suppress, { capture: true, once: true });
        setTimeout(function () { wrap.removeEventListener('click', suppress, { capture: true }); }, 0);
      } else {
        paused = false;
      }
      draggedPastThreshold = false;
    }
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);

    // A touch swipe (native scrolling) should also pause-then-resume.
    wrap.addEventListener('touchstart', pauseAuto, { passive: true });
    wrap.addEventListener('touchend', scheduleResume, { passive: true });
  });
})();
