/**
 * VIREXA FINANCE — Master Application Coordinator
 * Scroll interactions, mobile drawer, animated counters, FAQ accordion,
 * pricing toggles, currency converter, modals, and toasts.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Global Toast Notification System ---
    const toastContainer = document.getElementById('toastContainer');

    window.showToast = function (message, duration = 3500) {
      if (!toastContainer) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
      `;
      toastContainer.appendChild(toast);

      // Trigger transition
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, duration);
    };

    // --- 2. Sticky Header Scroll Effect ---
    const siteHeader = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });

    // --- 3. Mobile Navigation Drawer ---
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileMenu() {
      mobileMenuDrawer.classList.add('open');
      mobileDrawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileMenuDrawer.classList.remove('open');
      mobileDrawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', openMobileMenu);
    }
    if (mobileDrawerOverlay) {
      mobileDrawerOverlay.addEventListener('click', closeMobileMenu);
    }
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // --- 4. Animated Counters on Scroll ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
      statNumbers.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1800;
        let startTime = null;

        function updateCounter(currentTime) {
          if (!startTime) startTime = currentTime;
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentVal = target * easeOutCubic;

          el.textContent = `${prefix}${currentVal.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          })}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = `${prefix}${target.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            })}${suffix}`;
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }

    const trustSection = document.getElementById('trustSection');
    if (trustSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            startCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      statsObserver.observe(trustSection);
    }

    // --- 5. Scroll Reveal Elements ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 6. Pricing Monthly / Yearly Switcher ---
    const pricingSwitch = document.getElementById('pricingSwitch');
    const planPrices = document.querySelectorAll('.plan-price-val');
    const planPeriods = document.querySelectorAll('.plan-period-val');
    let isYearlyBilling = false;

    if (pricingSwitch) {
      pricingSwitch.addEventListener('click', () => {
        isYearlyBilling = !isYearlyBilling;
        pricingSwitch.classList.toggle('active', isYearlyBilling);
        pricingSwitch.setAttribute('aria-checked', isYearlyBilling.toString());

        planPrices.forEach(priceEl => {
          const monthly = parseFloat(priceEl.getAttribute('data-monthly'));
          const yearly = parseFloat(priceEl.getAttribute('data-yearly'));
          priceEl.textContent = isYearlyBilling ? yearly : monthly;
        });

        planPeriods.forEach(periodEl => {
          periodEl.textContent = isYearlyBilling ? '/mo (billed annually)' : '/month';
        });

        window.showToast(isYearlyBilling ? 'Annual 20% savings applied' : 'Monthly billing selected');
      });
    }

    // --- 7. FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const btn = otherItem.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // --- 8. Currency Calculator ---
    const currencyAmountInput = document.getElementById('currencyAmountInput');
    const currencySourceSelect = document.getElementById('currencySourceSelect');
    const currencyTargetSelect = document.getElementById('currencyTargetSelect');
    const convertedResultDisplay = document.getElementById('convertedResultDisplay');

    // Base rates relative to 1 USD
    const exchangeRates = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      AED: 3.67,
      JPY: 154.20
    };

    function calculateExchange() {
      if (!currencyAmountInput || !convertedResultDisplay) return;
      const amount = parseFloat(currencyAmountInput.value) || 0;
      const src = currencySourceSelect.value;
      const tgt = currencyTargetSelect.value;

      // Convert src to USD first, then to target
      const inUSD = amount / exchangeRates[src];
      const result = inUSD * exchangeRates[tgt];

      convertedResultDisplay.textContent = `${result.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} ${tgt}`;
    }

    if (currencyAmountInput && currencySourceSelect && currencyTargetSelect) {
      currencyAmountInput.addEventListener('input', calculateExchange);
      currencySourceSelect.addEventListener('change', calculateExchange);
      currencyTargetSelect.addEventListener('change', calculateExchange);
      calculateExchange();
    }

    // --- 9. Modal Windows Controller ---
    const modalOverlay = document.getElementById('modalOverlay');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const openLoginButtons = document.querySelectorAll('.btn-open-login');
    const openSignupButtons = document.querySelectorAll('.btn-open-signup');
    const closeButtons = document.querySelectorAll('.modal-close-btn');

    function openModal(modal) {
      if (!modalOverlay || !modal) return;
      // Close all active modals first
      document.querySelectorAll('.modal-content-box').forEach(b => b.style.display = 'none');
      modal.style.display = 'block';
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modalOverlay) return;
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    openLoginButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileMenu();
        openModal(loginModal);
      });
    });

    openSignupButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobileMenu();
        openModal(signupModal);
      });
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Modal Form Submissions Simulation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        window.showToast('Welcome back! Secure session initialized.');
      });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        window.showToast('Account successfully created! Verification email dispatched.');
      });
    }

    // --- 10. Newsletter Form Validation ---
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        if (emailInput && emailInput.value.trim()) {
          window.showToast('Thank you for subscribing to Virexa Intelligence.');
          emailInput.value = '';
        }
      });
    }

    // --- 11. Interactive Security Cipher Demo ---
    const cipherDisplay = document.getElementById('cipherStream');
    if (cipherDisplay) {
      const chars = '0123456789ABCDEF!@#$%^&*()<>{}[]~';
      setInterval(() => {
        let str = '';
        for (let i = 0; i < 28; i++) {
          str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        cipherDisplay.textContent = str;
      }, 120);
    }
  });
})();
