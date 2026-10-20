'use strict';

const progressBar = document.querySelector('.scroll-progress span');
const revealItems = document.querySelectorAll('.reveal');
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const resumeToggle = document.querySelector('.resume-toggle');
const resumeLinks = document.querySelector('#resume-links');

document.querySelectorAll('[data-slideshow]').forEach((slideshow) => {
  const slides = [...slideshow.querySelectorAll('[data-slide]')];
  const dots = [...slideshow.querySelectorAll('[data-slide-to]')];
  const count = slideshow.querySelector('[data-slide-count]');
  if (slides.length < 2) return;

  let activeIndex = 0;
  let timer;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (count) count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  const stopAutoplay = () => window.clearInterval(timer);
  const startAutoplay = () => {
    stopAutoplay();
    if (reducedMotion || document.hidden) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  };

  slideshow.querySelector('[data-slide-prev]')?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    startAutoplay();
  });
  slideshow.querySelector('[data-slide-next]')?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    startAutoplay();
  });
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    startAutoplay();
  }));

  slideshow.addEventListener('mouseenter', stopAutoplay);
  slideshow.addEventListener('mouseleave', startAutoplay);
  document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startAutoplay();
    else stopAutoplay();
  });
  visibilityObserver.observe(slideshow);
});

resumeToggle?.addEventListener('click', () => {
  const isExpanded = resumeToggle.getAttribute('aria-expanded') === 'true';
  resumeToggle.setAttribute('aria-expanded', String(!isExpanded));
  resumeLinks.hidden = isExpanded;
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  });
});

revealItems.forEach((item) => {
  if (item.dataset.delay) item.style.setProperty('--delay', `${item.dataset.delay}ms`);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

revealItems.forEach((item) => revealObserver.observe(item));

let scrollTicking = false;
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollProgress);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollProgress();

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const sectionId = entry.target.id;
    navLinks.forEach((link) => {
      if (link.hash === `#${sectionId}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
