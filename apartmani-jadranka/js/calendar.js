// Apartmani Jadranka — availability calendar & seasonal pricing.
//
// Shared by both unit pages (stan.html, istok.html) — each page's <body
// data-unit="stan|istok"> tells this script which apartment it's rendering
// for, which availability JSON to load, and which pricing table to use.
//
// Blocked dates come from ../data/availability-<unit>.json, which is
// refreshed daily by the "Sync Airbnb Calendars" GitHub Actions workflow
// (see .github/workflows/sync-airbnb-calendar.yml). This file only reads it.
//
// PRICING: Airbnb does not expose per-date rates via iCal, so seasonal prices
// are defined manually below. Edit PRICING_CONFIG_BY_UNIT to match real rates
// — ranges use "MM-DD" (month-day) and are matched against every year. Stan
// and Istok have separate rate cards (Stan runs slightly higher).

(function () {
  // Month-day ranges (inclusive), matched against every year — must stay
  // contiguous and cover the full year (no gaps/overlaps). Real rate cards
  // from the owner. Winter (Nov–Mar) is a long-stay/off-season rate, hence
  // the 28-night minimum.
  var PRICING_CONFIG_BY_UNIT = {
    stan: {
      currency: '€',
      seasons: [
        { key: 'winter', start: '01-01', end: '03-31', price: 50, minNights: 28 },
        { key: 'spring', start: '04-01', end: '05-31', price: 115, minNights: 3 },
        { key: 'early-summer', start: '06-01', end: '06-15', price: 145, minNights: 3 },
        { key: 'pre-high', start: '06-16', end: '06-30', price: 165, minNights: 5 },
        { key: 'high', start: '07-01', end: '08-31', price: 210, minNights: 7 },
        { key: 'post-high', start: '09-01', end: '09-15', price: 165, minNights: 5 },
        { key: 'late-summer', start: '09-16', end: '09-30', price: 145, minNights: 3 },
        { key: 'autumn', start: '10-01', end: '10-31', price: 115, minNights: 3 },
        { key: 'winter', start: '11-01', end: '12-31', price: 50, minNights: 28 }
      ],
      defaultPrice: 50,
      defaultMinNights: 28
    },
    istok: {
      currency: '€',
      seasons: [
        { key: 'winter', start: '01-01', end: '03-31', price: 50, minNights: 28 },
        { key: 'spring', start: '04-01', end: '05-31', price: 110, minNights: 3 },
        { key: 'early-summer', start: '06-01', end: '06-15', price: 140, minNights: 3 },
        { key: 'pre-high', start: '06-16', end: '06-30', price: 160, minNights: 5 },
        { key: 'high', start: '07-01', end: '08-31', price: 205, minNights: 7 },
        { key: 'post-high', start: '09-01', end: '09-15', price: 160, minNights: 5 },
        { key: 'late-summer', start: '09-16', end: '09-30', price: 140, minNights: 3 },
        { key: 'autumn', start: '10-01', end: '10-31', price: 100, minNights: 3 },
        { key: 'winter', start: '11-01', end: '12-31', price: 50, minNights: 28 }
      ],
      defaultPrice: 50,
      defaultMinNights: 28
    }
  };

  var state = {
    unit: 'stan',
    pricing: PRICING_CONFIG_BY_UNIT.stan,
    viewYear: null,
    viewMonth: null, // 0-11
    blocked: new Set(),
    lastUpdated: null,
    checkin: null,
    checkout: null
  };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }

  function seasonForDate(date) {
    var mmdd = pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    for (var i = 0; i < state.pricing.seasons.length; i++) {
      var s = state.pricing.seasons[i];
      if (mmdd >= s.start && mmdd <= s.end) return s;
    }
    return null;
  }

  function priceForDate(date) {
    var s = seasonForDate(date);
    return s ? s.price : state.pricing.defaultPrice;
  }

  function minNightsForDate(date) {
    var s = seasonForDate(date);
    return s ? s.minNights : state.pricing.defaultMinNights;
  }

  function isPast(date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function isBlocked(date) {
    return state.blocked.has(toISO(date));
  }

  function hasBlockedInRange(start, end) {
    var d = new Date(start);
    d.setDate(d.getDate() + 1);
    while (d < end) {
      if (isBlocked(d)) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }

  function loadAvailability() {
    var path = '../data/availability-' + state.unit + '.json';
    return fetch(path, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error(path + ' not found');
        return res.json();
      })
      .then(function (data) {
        state.blocked = new Set(data.blocked || []);
        state.lastUpdated = data.lastUpdated || null;
      })
      .catch(function (err) {
        state.blocked = new Set();
        state.lastUpdated = null;
        console.warn('Could not load ' + path + ' — showing calendar with no blocked dates.', err);
      });
  }

  var DATE_LOCALE_BY_LANG = { hr: 'hr-HR', en: 'en-GB', de: 'de-DE', pl: 'pl-PL', cs: 'cs-CZ' };

  function fmtDate(date) {
    var lang = window.Jadranka ? window.Jadranka.getLang() : 'hr';
    return date.toLocaleDateString(DATE_LOCALE_BY_LANG[lang] || 'hr-HR');
  }

  function render() {
    renderCalendar();
    renderSummary();
  }

  // Renders one month's grid into the given elements. Shared by the two
  // side-by-side months (Airbnb-style) so a check-in near a month's end and
  // a check-out early the next month are both visible at once, with no
  // navigation required in between.
  function renderMonthGrid(year, month, monthLabelEl, weekdaysEl, daysEl) {
    var t = window.Jadranka.t;
    if (!monthLabelEl) return;

    monthLabelEl.textContent = t('calendar.month.' + month) + ' ' + year;

    weekdaysEl.innerHTML = '';
    for (var w = 0; w < 7; w++) {
      var wd = document.createElement('span');
      wd.textContent = t('calendar.weekday.' + w);
      weekdaysEl.appendChild(wd);
    }

    daysEl.innerHTML = '';
    var firstOfMonth = new Date(year, month, 1);
    var startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    for (var i = 0; i < startOffset; i++) {
      var empty = document.createElement('span');
      empty.className = 'calendar-day empty';
      daysEl.appendChild(empty);
    }

    var _loop = function (day) {
      var date = new Date(year, month, day);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';

      var numEl = document.createElement('span');
      numEl.className = 'day-num';
      numEl.textContent = day;
      btn.appendChild(numEl);

      var past = isPast(date);
      var blocked = isBlocked(date);

      if (!past && !blocked) {
        var priceEl = document.createElement('span');
        priceEl.className = 'day-price';
        priceEl.textContent = state.pricing.currency + priceForDate(date);
        btn.appendChild(priceEl);
      }

      if (past || blocked) {
        btn.classList.add('unavailable');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () { handleDayClick(date); });
      }

      if (state.checkin && toISO(date) === toISO(state.checkin)) btn.classList.add('selected');
      if (state.checkout && toISO(date) === toISO(state.checkout)) btn.classList.add('selected');
      if (state.checkin && state.checkout && date > state.checkin && date < state.checkout) btn.classList.add('in-range');

      daysEl.appendChild(btn);
    };

    for (var day = 1; day <= daysInMonth; day++) _loop(day);
  }

  function renderCalendar() {
    var t = window.Jadranka.t;
    var updatedEl = document.getElementById('calendar-updated');

    var nextMonth = state.viewMonth + 1;
    var nextYear = state.viewYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }

    renderMonthGrid(
      state.viewYear, state.viewMonth,
      document.getElementById('calendar-month-label'),
      document.getElementById('calendar-weekdays'),
      document.getElementById('calendar-days')
    );
    renderMonthGrid(
      nextYear, nextMonth,
      document.getElementById('calendar-month-label-2'),
      document.getElementById('calendar-weekdays-2'),
      document.getElementById('calendar-days-2')
    );

    if (updatedEl) {
      if (state.lastUpdated) {
        updatedEl.textContent = t('calendar.avail.updated') + ' ' + fmtDate(new Date(state.lastUpdated));
        updatedEl.style.display = '';
      } else {
        updatedEl.style.display = 'none';
      }
    }
  }

  function handleDayClick(date) {
    if (!state.checkin || state.checkout) {
      state.checkin = date;
      state.checkout = null;
    } else if (date <= state.checkin) {
      state.checkin = date;
      state.checkout = null;
    } else {
      state.checkout = date;
    }
    render();
  }

  function renderSummary() {
    var t = window.Jadranka.t;
    var content = document.getElementById('booking-summary-content');
    var clearBtn = document.getElementById('booking-clear');
    var form = document.getElementById('availability-inquiry-form');
    if (!content) return;

    if (!state.checkin) {
      content.innerHTML = '<p class="booking-prompt">' + t('calendar.avail.prompt_checkin') + '</p>';
      clearBtn.style.display = 'none';
      form.style.display = 'none';
      return;
    }

    if (!state.checkout) {
      content.innerHTML = '<p class="booking-prompt">' + t('calendar.avail.prompt_checkout') + '</p>';
      clearBtn.style.display = '';
      form.style.display = 'none';
      return;
    }

    if (hasBlockedInRange(state.checkin, state.checkout)) {
      content.innerHTML = '<p class="booking-prompt unavailable-msg">' + t('calendar.avail.unavailable_msg') + '</p>';
      clearBtn.style.display = '';
      form.style.display = 'none';
      return;
    }

    var nights = Math.round((state.checkout - state.checkin) / 86400000);

    // Minimum stay is governed by the check-in date's season.
    var required = minNightsForDate(state.checkin);
    if (nights < required) {
      content.innerHTML = '<p class="booking-prompt unavailable-msg">' + t('calendar.avail.min_nights_msg', { min: required }) + '</p>';
      clearBtn.style.display = '';
      form.style.display = 'none';
      return;
    }

    var total = 0;
    var d = new Date(state.checkin);
    for (var i = 0; i < nights; i++) {
      total += priceForDate(d);
      d.setDate(d.getDate() + 1);
    }
    var avgPerNight = Math.round(total / nights);

    content.innerHTML =
      '<div class="booking-dates">' + fmtDate(state.checkin) + ' &rarr; ' + fmtDate(state.checkout) + '</div>' +
      '<div class="booking-line"><span>' + nights + ' ' + t('calendar.avail.nights') + '</span></div>' +
      '<div class="booking-line"><span>' + t('calendar.avail.price_per_night') + '</span><span>' + state.pricing.currency + avgPerNight + '</span></div>' +
      '<div class="booking-line total"><span>' + t('calendar.avail.total') + '</span><span>' + state.pricing.currency + total + '</span></div>';
    clearBtn.style.display = '';

    // Reveal the inquiry form and stash the computed values for submit —
    // the form's own fields are left untouched so in-progress typing
    // survives further calendar clicks.
    form.style.display = '';
    form.dataset.checkinDisplay = fmtDate(state.checkin);
    form.dataset.checkoutDisplay = fmtDate(state.checkout);
    form.dataset.nights = nights;
    form.dataset.total = total;
  }

  function initInquiryForm() {
    var form = document.getElementById('availability-inquiry-form');
    var status = document.getElementById('availability-form-status');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = window.Jadranka.t;

      var name = form.elements['name'].value.trim();
      var email = form.elements['email'].value.trim();
      var phone = form.elements['phone'].value.trim();
      var adults = form.elements['adults'].value || '1';
      var children = form.elements['children'].value || '0';
      var message = form.elements['message'].value.trim();

      if (!name || !email || !phone) {
        status.textContent = t('calendar.avail.form_error');
        status.className = 'form-status visible error';
        return;
      }

      var checkin = form.dataset.checkinDisplay;
      var checkout = form.dataset.checkoutDisplay;
      var nights = form.dataset.nights;
      var total = form.dataset.total;

      var subject = t('calendar.avail.email_subject', { unit: t(state.unit + '.display_name'), checkin: checkin, checkout: checkout });

      var bodyLines = [
        t('calendar.avail.email_label_name') + ': ' + name,
        t('calendar.avail.email_label_email') + ': ' + email,
        t('calendar.avail.email_label_phone') + ': ' + phone,
        t('calendar.avail.email_label_checkin') + ': ' + checkin,
        t('calendar.avail.email_label_checkout') + ': ' + checkout,
        t('calendar.avail.email_label_nights') + ': ' + nights,
        t('calendar.avail.email_label_adults') + ': ' + adults,
        t('calendar.avail.email_label_children') + ': ' + children,
        t('calendar.avail.email_label_total') + ': ' + state.pricing.currency + total,
        '',
        t('calendar.avail.email_label_message') + ':',
        message || '-'
      ];

      var mailto = 'mailto:antemimica80@gmail.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = mailto;

      status.textContent = '';
      status.className = 'form-status';
    });
  }

  // Adults + children steppers on the inquiry form, capped at 4 guests
  // total. Adults always keeps at least 1; children's max shrinks as
  // adults grows (e.g. 4 adults -> 0 children allowed, 2 adults -> up to
  // 2 children), so the combined total can never exceed MAX_GUESTS.
  function initGuestSteppers() {
    var MAX_GUESTS = 4;
    var adultsInput = document.getElementById('avail-adults');
    var childrenInput = document.getElementById('avail-children');
    if (!adultsInput || !childrenInput) return;

    var steppers = document.querySelectorAll('[data-stepper]');

    function clamp() {
      var adults = Math.max(1, Math.min(MAX_GUESTS, parseInt(adultsInput.value, 10) || 1));
      var maxChildren = MAX_GUESTS - adults;
      var children = Math.max(0, Math.min(maxChildren, parseInt(childrenInput.value, 10) || 0));

      adultsInput.value = adults;
      childrenInput.value = children;

      for (var i = 0; i < steppers.length; i++) {
        var wrap = steppers[i];
        var isChildren = wrap.dataset.stepper === 'children';
        var min = isChildren ? 0 : 1;
        var max = isChildren ? maxChildren : MAX_GUESTS;
        var value = isChildren ? children : adults;
        wrap.querySelector('[data-step="-1"]').disabled = value <= min;
        wrap.querySelector('[data-step="1"]').disabled = value >= max;
      }
    }

    steppers.forEach(function (wrap) {
      var input = wrap.querySelector('input');
      wrap.querySelectorAll('.stepper-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          input.value = (parseInt(input.value, 10) || 0) + parseInt(btn.dataset.step, 10);
          clamp();
        });
      });
    });

    clamp();
  }

  function init() {
    var prevBtn = document.getElementById('calendar-prev');
    var nextBtn = document.getElementById('calendar-next');
    var clearBtn = document.getElementById('booking-clear');
    if (!prevBtn) return; // calendar not present on this page

    state.unit = document.body.dataset.unit || 'stan';
    state.pricing = PRICING_CONFIG_BY_UNIT[state.unit] || PRICING_CONFIG_BY_UNIT.stan;

    var today = new Date();
    state.viewYear = today.getFullYear();
    state.viewMonth = today.getMonth();

    prevBtn.addEventListener('click', function () {
      state.viewMonth--;
      if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
      render();
    });
    nextBtn.addEventListener('click', function () {
      state.viewMonth++;
      if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
      render();
    });
    clearBtn.addEventListener('click', function () {
      state.checkin = null;
      state.checkout = null;
      render();
    });

    document.addEventListener('jadranka:languagechange', render);

    initInquiryForm();
    initGuestSteppers();
    loadAvailability().then(render);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
