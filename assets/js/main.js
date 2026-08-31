(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     Navigation: transparent -> defined on scroll, mobile toggle
     ------------------------------------------------------------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navMobilePanel = document.getElementById('navMobilePanel');

  function onScrollNav() {
    if (window.scrollY > 24) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (navToggle && navMobilePanel) {
    navToggle.addEventListener('click', function () {
      var open = navMobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navMobilePanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobilePanel.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMobilePanel.classList.contains('is-open')) {
        navMobilePanel.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------
     Reveal-on-scroll
     ------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* -------------------------------------------------------------
     Hero -> Experience continuity: subtle parallax fade as the
     visitor scrolls out of the hero (skipped under reduced motion)
     ------------------------------------------------------------- */
  var hero = document.getElementById('hero');
  var heroInner = hero ? hero.querySelector('.hero-inner') : null;

  if (hero && heroInner && !reducedMotion) {
    var ticking = false;
    function updateHeroParallax() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / (rect.height * 0.8), 0), 1);
      heroInner.style.opacity = String(1 - progress);
      heroInner.style.transform = 'translateY(' + (progress * 40) + 'px)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateHeroParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------------
     Service control ("Need something?")
     ------------------------------------------------------------- */
  var serviceControl = document.getElementById('serviceControl');
  var serviceToggle = document.getElementById('serviceToggle');
  var servicePanel = document.getElementById('servicePanel');
  var serviceToast = document.getElementById('serviceToast');
  var toastTimer = null;

  var serviceMessages = {
    water: 'Water is on the way.',
    server: 'Your server has been notified.',
    dessert: 'Dessert menu is on its way.',
    check: 'Check requested.'
  };

  function closeServicePanel() {
    if (!servicePanel) return;
    servicePanel.classList.remove('is-open');
    if (serviceToggle) serviceToggle.setAttribute('aria-expanded', 'false');
  }

  if (serviceToggle && servicePanel) {
    serviceToggle.addEventListener('click', function () {
      var open = servicePanel.classList.toggle('is-open');
      serviceToggle.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = servicePanel.querySelector('.service-option');
        if (first) first.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!serviceControl.contains(e.target)) closeServicePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && servicePanel.classList.contains('is-open')) {
        closeServicePanel();
        serviceToggle.focus();
      }
    });

    servicePanel.querySelectorAll('.service-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-service');
        var message = serviceMessages[key] || 'Request sent.';
        showToast(message);
        closeServicePanel();
      });
    });
  }

  function showToast(message) {
    if (!serviceToast) return;
    serviceToast.textContent = message;
    serviceToast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      serviceToast.classList.remove('is-visible');
    }, 2600);
  }

  /* Reveal the persistent service control once the visitor has
     entered the M3NUX experience (not during the hero arrival) */
  var experienceSection = document.getElementById('experience');
  if (experienceSection && serviceControl && 'IntersectionObserver' in window) {
    var serviceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        serviceControl.classList.toggle('is-active', entry.isIntersecting || entry.boundingClientRect.top < 0);
      });
    }, { threshold: 0, rootMargin: '0px 0px -60% 0px' });
    serviceObserver.observe(experienceSection);
  } else if (serviceControl) {
    serviceControl.classList.add('is-active');
  }

  /* -------------------------------------------------------------
     Experience cards — "What sounds good tonight?"
     ------------------------------------------------------------- */
  var experienceCards = document.querySelectorAll('.experience-card');
  var experienceStatus = document.getElementById('experienceStatus');

  experienceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var alreadySelected = card.classList.contains('is-selected');
      experienceCards.forEach(function (c) {
        c.classList.remove('is-selected');
        c.setAttribute('aria-pressed', 'false');
      });
      if (!alreadySelected) {
        card.classList.add('is-selected');
        card.setAttribute('aria-pressed', 'true');
        var name = card.querySelector('.card-name').textContent.trim();
        if (experienceStatus) {
          experienceStatus.textContent = 'Great choice — ' + name + '. Your table’s discovery experience continues here.';
          experienceStatus.classList.add('is-visible');
        }
      } else if (experienceStatus) {
        experienceStatus.classList.remove('is-visible');
      }
    });
  });

  /* -------------------------------------------------------------
     Legacy demo request form
     ------------------------------------------------------------- */
  window.handleSubmit = function () {
    var name = document.getElementById('name').value.trim();
    var restaurant = document.getElementById('restaurant').value.trim();
    var email = document.getElementById('email').value.trim();
    if (!name || !restaurant || !email) return;
    document.getElementById('formSection').style.display = 'none';
    var success = document.getElementById('successMsg');
    success.style.display = 'block';
    success.focus();
  };
})();
