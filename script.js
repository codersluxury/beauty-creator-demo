(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  const navLinks = navigation.querySelectorAll('a');
  const year = document.querySelector('#copyright-year');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('#lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  let previewTrigger = null;
  let previousBodyOverflow = '';

  document.documentElement.classList.add('js-enabled');
  year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    navigation.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isExpanded));
    menuButton.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
    navigation.classList.toggle('is-open', !isExpanded);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  document.querySelectorAll('.portfolio-carousel').forEach((carousel) => {
    let startX = 0;
    let startScrollLeft = 0;
    let isDragging = false;
    let ignoreClickUntil = 0;
    let activePointerId = null;

    carousel.addEventListener('wheel', (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const canScroll = event.deltaY > 0
        ? carousel.scrollLeft < maxScroll
        : carousel.scrollLeft > 0;

      if (canScroll) {
        event.preventDefault();
        carousel.scrollBy({ left: event.deltaY, behavior: 'auto' });
      }
    }, { passive: false });

    carousel.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      startX = event.clientX;
      startScrollLeft = carousel.scrollLeft;
      isDragging = false;
      activePointerId = event.pointerId;
    });

    document.addEventListener('pointermove', (event) => {
      if (event.pointerId !== activePointerId || event.buttons !== 1) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        isDragging = true;
        carousel.classList.add('is-dragging');
        carousel.scrollLeft = startScrollLeft - distance;
      }
    });

    const endDrag = (event) => {
      if (event.pointerId !== activePointerId) return;
      if (isDragging) ignoreClickUntil = performance.now() + 200;
      isDragging = false;
      activePointerId = null;
      carousel.classList.remove('is-dragging');
    };

    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
    carousel.addEventListener('click', (event) => {
      if (performance.now() < ignoreClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const trigger = event.target.closest('.portfolio-image');
      if (!trigger) return;

      const thumbnail = trigger.querySelector('img');
      const fullSizeSource = new URL(thumbnail.currentSrc || thumbnail.src);
      if (fullSizeSource.hostname === 'images.unsplash.com') {
        fullSizeSource.searchParams.set('w', '2400');
        fullSizeSource.searchParams.set('q', '90');
      }

      previewTrigger = trigger;
      lightboxImage.src = fullSizeSource.href;
      lightboxImage.alt = thumbnail.alt;
      lightboxCaption.textContent = thumbnail.alt;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.showModal();
      lightboxClose.focus();
    });
  });

  const closeLightbox = () => {
    if (lightbox.open) lightbox.close();
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('close', () => {
    document.body.style.overflow = previousBodyOverflow;
    if (previewTrigger) previewTrigger.focus();
    previewTrigger = null;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }
})();