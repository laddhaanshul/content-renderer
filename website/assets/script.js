/**
 * content-renderer — Promotional Website Scripts
 * ================================================
 * Handles: navigation, scroll animations, tabs, copy-to-clipboard,
 *          dark mode toggle, counter animation, smooth scrolling.
 */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     1. DOM REFERENCES
     --------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const nav              = $('.nav');
  const navLinks         = $$('.nav__link');
  const hamburger        = $('.nav__hamburger');
  const mobileMenu       = $('.mobile-menu');
  const mobileMenuLinks  = $$('.mobile-menu__link');
  const themeToggle      = $('.nav__theme-toggle');
  const backToTopBtn     = $('.back-to-top');
  const toast            = $('.toast');

  const installTabs      = $$('.install__tab');
  const installPanels    = $$('.install__panel');
  const quickstartTabs   = $$('.quickstart__tab');
  const quickstartPanels = $$('.quickstart__panel');

  const statCounters     = $$('.stat__value[data-target]');

  /* ---------------------------------------------------------------
     2. NAVIGATION — Scroll effects & active link highlighting
     --------------------------------------------------------------- */
  function handleNavScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class for background blur
    if (scrollY > 50) {
      nav.classList.add('nav--scrolled');
      nav.classList.remove('nav--transparent');
    } else {
      nav.classList.remove('nav--scrolled');
      nav.classList.add('nav--transparent');
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 500) {
        backToTopBtn.classList.add('back-to-top--visible');
      } else {
        backToTopBtn.classList.remove('back-to-top--visible');
      }
    }

    // Active nav link based on scroll position
    highlightActiveLink();
  }

  function highlightActiveLink() {
    const sections = $$('section[id]');
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('nav__link--active');
      }
    });
  }

  /* ---------------------------------------------------------------
     3. MOBILE MENU
     --------------------------------------------------------------- */
  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.toggle('mobile-menu--active');
    hamburger.classList.toggle('nav__hamburger--active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('mobile-menu--active');
    hamburger.classList.remove('nav__hamburger--active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ---------------------------------------------------------------
     4. SMOOTH SCROLLING
     --------------------------------------------------------------- */
  function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const navHeight = nav ? nav.offsetHeight : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // Attach smooth scroll to all anchor links
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      closeMobileMenu();
      smoothScrollTo(href.substring(1));
    });
  });

  // Back to top
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------------
     5. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
     --------------------------------------------------------------- */
  function initScrollAnimations() {
    const animatedElements = $$('.animate-on-scroll');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements
      animatedElements.forEach(el => el.classList.add('animate-on-scroll--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll--visible');
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animatedElements.forEach(el => observer.observe(el));
  }

  /* ---------------------------------------------------------------
     6. COUNTER ANIMATION
     --------------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(easedProgress * target);

      el.textContent = prefix + formatNumber(currentValue) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = prefix + formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }

  function initCounterAnimations() {
    if (!statCounters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statCounters.forEach(counter => observer.observe(counter));
  }

  /* ---------------------------------------------------------------
     7. TAB SWITCHING — Installation & Quick Start
     --------------------------------------------------------------- */
  function initTabs(tabButtons, panels, panelAttr, activeClass) {
    tabButtons.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        // Deactivate all tabs
        tabButtons.forEach(t => t.classList.remove(activeClass));
        // Activate clicked tab
        tab.classList.add(activeClass);

        // Show target panel, hide others
        panels.forEach(panel => {
          if (panel.getAttribute(panelAttr) === target) {
            panel.classList.add(activeClass);
            panel.style.animation = 'none';
            // Trigger reflow for re-animation
            panel.offsetHeight;
            panel.style.animation = '';
          } else {
            panel.classList.remove(activeClass);
          }
        });
      });
    });
  }

  // Installation tabs
  if (installTabs.length && installPanels.length) {
    initTabs(installTabs, installPanels, 'data-install', 'install__panel--active');
  }

  // Quick start tabs
  if (quickstartTabs.length && quickstartPanels.length) {
    initTabs(quickstartTabs, quickstartPanels, 'data-panel', 'quickstart__panel--active');
  }

  /* ---------------------------------------------------------------
     8. COPY TO CLIPBOARD
     --------------------------------------------------------------- */
  function copyToClipboard(text, feedbackEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(feedbackEl);
      }).catch(() => {
        fallbackCopy(text, feedbackEl);
      });
    } else {
      fallbackCopy(text, feedbackEl);
    }
  }

  function fallbackCopy(text, feedbackEl) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(feedbackEl);
    } catch (err) {
      showToast('Failed to copy');
    }
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(el) {
    if (!el) return;
    const original = el.innerHTML;
    el.innerHTML = '&#10003; Copied!';
    el.classList.add('code-block__copy--copied');

    setTimeout(() => {
      el.innerHTML = original;
      el.classList.remove('code-block__copy--copied');
    }, 2000);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast--visible');
    setTimeout(() => toast.classList.remove('toast--visible'), 2500);
  }

  // Attach copy handlers to code blocks
  $$('.code-block__copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block');
      const codeEl = codeBlock ? codeBlock.querySelector('pre') : null;
      if (codeEl) {
        copyToClipboard(codeEl.textContent.trim(), btn);
      }
    });
  });

  // Attach copy handlers to install cards
  $$('.install-card__copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.install-card');
      const cmdEl = card ? card.querySelector('.install-card__cmd') : null;
      if (cmdEl) {
        const text = cmdEl.textContent.trim();
        copyToClipboard(text);
        showToast('Copied: ' + text);
      }
    });
  });

  /* ---------------------------------------------------------------
     9. DARK MODE TOGGLE
     --------------------------------------------------------------- */
  function getPreferredTheme() {
    const stored = localStorage.getItem('cr-theme');
    if (stored) return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cr-theme', theme);
    updateThemeIcon(theme);
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const sunIcon = themeToggle.querySelector('.icon-sun');
    const moonIcon = themeToggle.querySelector('.icon-moon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
      moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
    }
  }

  // Initialize theme
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for OS-level preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('cr-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ---------------------------------------------------------------
     10. KEYBOARD NAVIGATION
     --------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    // Escape closes mobile menu
    if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--active')) {
      closeMobileMenu();
    }
  });

  /* ---------------------------------------------------------------
     11. TYPING ANIMATION (Hero code preview)
     --------------------------------------------------------------- */
  function initTypingAnimation() {
    const typingEl = $('.hero__typing');
    if (!typingEl) return;

    const phrases = [
      '<ContentRenderer content={html} />',
      '<ContentRenderer content={json} />',
      '<ContentRenderer content={markdown} />',
      '<ContentRenderer content={xml} />',
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 60;
    const deleteSpeed = 30;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 500;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typingEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let nextDelay = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        nextDelay = pauseAfterType;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        nextDelay = pauseAfterDelete;
      }

      setTimeout(type, nextDelay);
    }

    // Start after a short delay
    setTimeout(type, 1000);
  }

  /* ---------------------------------------------------------------
     12. PARALLAX EFFECT (Subtle hero background movement)
     --------------------------------------------------------------- */
  function initParallax() {
    const hero = $('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroHeight = hero.offsetHeight;
      if (scrolled <= heroHeight) {
        const progress = scrolled / heroHeight;
        hero.style.setProperty('--scroll-progress', progress);
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     13. INITIALIZE EVERYTHING
     --------------------------------------------------------------- */
  function init() {
    // Scroll handler
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Run once on load

    // Scroll animations
    initScrollAnimations();

    // Counter animations
    initCounterAnimations();

    // Typing animation
    initTypingAnimation();

    // Parallax
    initParallax();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
