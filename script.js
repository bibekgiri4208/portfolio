// ============================================
// NAVIGATION AND HAMBURGER MENU
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.querySelector('.theme-toggle');
const navbar = document.querySelector('.navbar');

const updateNavbarAppearance = () => {
  if (!navbar) {
    return;
  }

  const lastScrollY = window.scrollY;
  const isDark = document.body.classList.contains('dark-mode');

  if (lastScrollY > 100) {
    navbar.style.background = isDark ? 'rgba(3, 7, 18, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.5)'
      : '0 8px 32px rgba(0, 0, 0, 0.12)';
  } else {
    navbar.style.background = isDark ? 'rgba(3, 7, 18, 0.88)' : 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = isDark
      ? '0 4px 16px rgba(0, 0, 0, 0.4)'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  }
};

// ============================================
// THEME TOGGLE (LIGHT/DARK)
// ============================================

const applyTheme = theme => {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  if (themeToggle) {
    themeToggle.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Enable light mode' : 'Enable dark mode'
    );
    themeToggle.setAttribute(
      'title',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  updateNavbarAppearance();
};

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu) {
      navMenu.classList.remove('active');
    }
    if (hamburger) {
      hamburger.classList.remove('active');
    }
  });
});

// ============================================
// PROJECTS SLIDER
// ============================================

const projectsTrack = document.querySelector('.projects-track');
const projectsWrapper = document.querySelector('.projects-track-wrapper');
const prevButton = document.querySelector('.slider-btn-prev');
const nextButton = document.querySelector('.slider-btn-next');
const dotsContainer = document.querySelector('.slider-dots');

if (projectsTrack && projectsWrapper && prevButton && nextButton && dotsContainer) {
  const cards = Array.from(projectsTrack.querySelectorAll('.project-card'));
  let currentPage = 0;
  let cardsPerView = 1;
  let totalPages = 1;
  let stepWidth = 0;

  const getGap = () => {
    const styles = window.getComputedStyle(projectsTrack);
    return parseFloat(styles.gap || styles.columnGap || '0') || 0;
  };

  const buildDots = () => {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentPage = i;
        updateSlider();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateControls = () => {
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= totalPages - 1;
  };

  const updateSlider = () => {
    const offset = currentPage * cardsPerView * stepWidth;
    projectsTrack.style.transform = `translateX(-${offset}px)`;
    updateControls();
  };

  const recalc = () => {
    if (!cards.length) {
      return;
    }

    stepWidth = cards[0].offsetWidth + getGap();
    cardsPerView = Math.max(1, Math.floor((projectsWrapper.clientWidth + getGap()) / stepWidth));
    totalPages = Math.max(1, Math.ceil(cards.length / cardsPerView));
    currentPage = Math.min(currentPage, totalPages - 1);
    buildDots();
    updateSlider();
  };

  prevButton.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage -= 1;
      updateSlider();
    }
  });

  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage += 1;
      updateSlider();
    }
  });

  window.addEventListener('resize', recalc);
  recalc();
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe skill cards, project cards, and stat cards
document.querySelectorAll('.skill-card, .project-card, .stat-card').forEach(el => {
  observer.observe(el);
});

// ============================================
// FORM SUBMISSION
// ============================================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show success state
    submitButton.innerHTML = '<i class="fas fa-check"></i><span>Message Sent!</span>';
    submitButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
    submitButton.disabled = true;
    
    // Reset form
    contactForm.reset();
    
    // Restore button after 3 seconds
    setTimeout(() => {
      submitButton.innerHTML = '<span>Send Message</span><i class="fas fa-paper-plane"></i>';
      submitButton.style.background = '';
      submitButton.disabled = false;
    }, 3000);
  });
}

// ============================================
// SMOOTH SCROLL BEHAVIOR
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// NAVBAR BACKGROUND ON SCROLL
// ============================================

window.addEventListener('scroll', () => {
  updateNavbarAppearance();
});

// ============================================
// PAGE LOAD ANIMATION
// ============================================

window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  
  // Trigger animations for elements already in view
  document.querySelectorAll('.skill-card, .project-card, .stat-card').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('animate-in');
    }
  });
});

// Set initial opacity
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease-in';
