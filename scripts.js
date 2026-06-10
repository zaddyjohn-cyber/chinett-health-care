/* ============================================================
   CHINETT HEALTH CARE — SHARED SCRIPTS
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- 1. AOS scroll animations ---- */
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out-cubic' });
  }

  /* ---- 2. Navbar: transparent -> solid on scroll ---- */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- 3. Mobile nav toggle ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    const toggle = (open) => {
      hamburger.classList.toggle('open', open);
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    hamburger.addEventListener('click', () => toggle(!mobileNav.classList.contains('open')));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  }

  /* ---- 4. Animated stat counters (Intersection Observer) ---- */
  const stats = document.querySelectorAll('.stat-num[data-target]');
  if (stats.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const dur = 1800; const start = performance.now();
      const useComma = target >= 1000;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        let val = Math.floor(eased * target);
        el.textContent = (useComma ? val.toLocaleString() : val) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    stats.forEach(s => obs.observe(s));
  }

  /* ---- 5. Testimonial rotator ---- */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  if (slides.length) {
    let idx = 0; let timer;
    const show = (i) => {
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
      dots.forEach((d, n) => d.classList.toggle('active', n === i));
      idx = i;
    };
    const next = () => show((idx + 1) % slides.length);
    const start = () => { timer = setInterval(next, 5000); };
    const reset = () => { clearInterval(timer); start(); };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); reset(); }));
    show(0); start();
  }

  /* ---- 6. Scroll indicator click ---- */
  const indicator = document.querySelector('.scroll-indicator');
  if (indicator) {
    indicator.addEventListener('click', () => {
      const target = document.querySelector(indicator.dataset.target || '#stats');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---- 7. FAQ accordion ---- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close others
      faqItems.forEach(other => {
        other.classList.remove('open');
        const oa = other.querySelector('.faq-a');
        if (oa) oa.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- 8. Quick-care form (homepage) graceful handling ---- */
  const quickForm = document.querySelector('#quick-care-form');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = quickForm.querySelector('button[type="submit"]');
      btn.textContent = 'Request Sent ✓';
      btn.style.background = 'var(--color-success)';
      btn.style.borderColor = 'var(--color-success)';
      btn.style.color = '#fff';
      setTimeout(() => { quickForm.reset(); }, 400);
    });
  }

  /* ---- 9. Contact request form: validation + success state ---- */
  const careForm = document.querySelector('#care-form');
  if (careForm) {
    const success = document.querySelector('#form-success');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateField = (field) => {
      const input = field.querySelector('input, select, textarea');
      if (!input || !input.required) return true;
      let ok = input.value.trim() !== '';
      if (ok && input.type === 'email') ok = emailRe.test(input.value.trim());
      if (ok && input.type === 'checkbox') ok = input.checked;
      field.classList.toggle('error', !ok);
      return ok;
    };

    // live-clear errors as the user fixes them
    careForm.querySelectorAll('.form-field input, .form-field select, .form-field textarea').forEach(inp => {
      inp.addEventListener('input', () => {
        const f = inp.closest('.form-field');
        if (f && f.classList.contains('error')) validateField(f);
      });
    });

    const showSuccess = (name) => {
      if (!success) return;
      const nameSpan = success.querySelector('[data-name]');
      if (nameSpan) nameSpan.textContent = name;
      careForm.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    careForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      careForm.querySelectorAll('.form-field').forEach(f => { if (!validateField(f)) valid = false; });

      // consent checkbox
      const consent = careForm.querySelector('#consent');
      if (consent && !consent.checked) { valid = false; consent.closest('.form-consent').style.color = '#C0392B'; }
      else if (consent) { consent.closest('.form-consent').style.color = ''; }

      if (!valid) {
        const firstErr = careForm.querySelector('.form-field.error');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const val = (id) => (careForm.querySelector(id)?.value || '').trim();
      const name = val('#full-name').split(' ')[0] || 'there';

      const submitBtn = careForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      // Deliver the request to the inbox via FormSubmit (no backend / no signup).
      const payload = {
        _subject: 'New Care Request — Chinett HealthCare',
        Name: val('#full-name'),
        Phone: val('#phone'),
        Email: val('#email'),
        'Preferred Contact': val('#contact-method'),
        'Care Type': val('#care-type'),
        'Age Group': val('#age-group'),
        'Start Date': val('#start-date'),
        Duration: val('#duration'),
        Location: val('#location'),
        Notes: val('#notes'),
        'Heard About Us': val('#hear')
      };

      try {
        const res = await fetch('https://formsubmit.co/ajax/support@chinetthealthcare.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Request failed');
        showSuccess(name);
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        alert('Sorry, something went wrong sending your request. Please call (443) 563-7693 or email support@chinetthealthcare.com directly.');
      }
    });
  }

  /* ---- 10. Lazy-load the duo-band videos (all devices), when in view ---- */
  var duoBand = document.querySelector('.duo-band');
  if (duoBand) {
    var startVideos = function () {
      duoBand.querySelectorAll('.duo-video').forEach(function (v) {
        var s = v.querySelector('source[data-src]');
        if (s && !s.src) {
          s.src = s.getAttribute('data-src');
          v.load();
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      });
    };
    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { startVideos(); vio.disconnect(); }
        });
      }, { rootMargin: '300px' });
      vio.observe(duoBand);
    } else {
      startVideos();
    }
  }

});
