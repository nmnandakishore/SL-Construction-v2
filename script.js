document.addEventListener('DOMContentLoaded', function () {

  // ===== HERO HEIGHT (diagonal bottom-right aligns with viewport bottom-right) =====
  var hero = document.querySelector('.hero');
  var nav = document.querySelector('.site-header');

  function setHeroHeight() {
    if (!hero) return;
    var vh = window.innerHeight;
    var navH = nav ? nav.offsetHeight : 0;
    // clip-path bottom-right is at 85% of hero height
    // we want that point to be at viewport bottom
    // 0.85 * heroHeight = vh → heroHeight = vh / 0.85
    var heroH = Math.ceil(vh / 0.85);
    hero.style.minHeight = heroH + 'px';
    hero.style.height = heroH + 'px';
  }

  setHeroHeight();
  window.addEventListener('resize', setHeroHeight);

  // ===== NAV TOGGLE =====
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  var navOverlay = document.querySelector('.nav-overlay');

  function toggleNav(open) {
    var isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('open', isOpen);
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () { toggleNav(); });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', function () { toggleNav(false); });
  }

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () { toggleNav(false); });
  });

  // ===== SMOOTH SCROLL (anchor offset) =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navHeight = document.querySelector('.site-header').offsetHeight;
      var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  // ===== LIGHTBOX =====
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var galleryItems = document.querySelectorAll('.gallery-item');
  var currentIndex = 0;
  var galleryImages = [];

  galleryItems.forEach(function (item, i) {
    var img = item.querySelector('img');
    if (img) {
      galleryImages.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') });
      item.addEventListener('click', function () {
        openLightbox(i);
      });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    }
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function updateLightboxImage() {
    var img = galleryImages[currentIndex];
    if (img) {
      lightboxImg.setAttribute('src', img.src);
      lightboxImg.setAttribute('alt', img.alt);
    }
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // ===== CONTACT FORM → GOOGLE SHEETS =====
  var form = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var submitBtn = document.getElementById('formSubmit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('formName').value.trim();
      var phone = document.getElementById('formPhone').value.trim();
      var email = document.getElementById('formEmail').value.trim();
      var message = document.getElementById('formMessage').value.trim();

      if (!name || !phone || !message) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Please fill in Name, Phone, and Message.';
        return;
      }

      var date = new Date();
      var dateStr = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      var payload = {
        Date: dateStr,
        Name: name,
        Phone: phone,
        Email: email,
        Message: message
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>Sending...';
      formStatus.className = 'form-status';
      formStatus.textContent = '';

      // Google Sheets web app URL — replace with your deployed URL
      var GAS_WEB_APP_URL = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE';

      fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function () {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you! We\'ll get back to you shortly.';
        form.reset();
      })
      .catch(function () {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you! We\'ll get back to you shortly.';
        form.reset();
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
    });
  }

  // ===== SERVICES TAB SWITCHING =====
  var serviceTabs = document.querySelectorAll('.service-tab');
  var serviceImg = document.getElementById('serviceImg');
  var serviceCaption = document.getElementById('serviceCaption');

  var serviceData = [
    { img: 'assets/images/project-sl-residency-3d-render.jpg', caption: 'Residential Building Construction — Quality homes built with engineering precision and attention to detail.' },
    { img: 'assets/images/hero-building-exterior.jpg', caption: 'Commercial Building Construction — Functional and durable commercial spaces for businesses and institutions.' },
    { img: 'assets/images/project-villa-exterior-red-roof.jpg', caption: 'Villa Projects — Modern villa designs tailored to your lifestyle and preferences.' },
    { img: 'assets/images/construction-site-in-progress.jpg', caption: 'RCC Structural Works — Reinforced cement concrete structures designed by qualified engineers.' },
    { img: 'assets/images/interior-tv-unit-closeup.jpg', caption: 'Waterproofing Works — Expert waterproofing solutions using proven techniques for lasting protection.' },
    { img: 'assets/images/interior-living-room-tv-unit-wide.jpg', caption: 'Renovation & Remodeling — Transform existing spaces with quality renovation and remodeling services.' }
  ];

  serviceTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      serviceTabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var idx = parseInt(tab.getAttribute('data-service'), 10);
      var data = serviceData[idx];
      if (data) {
        serviceImg.setAttribute('src', data.img);
        serviceImg.setAttribute('alt', data.caption);
        serviceCaption.textContent = data.caption;
      }
    });
  });
});
