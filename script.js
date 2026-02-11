// ============================================
// NAVIGATION AND HAMBURGER MENU
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

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

const navbar = document.querySelector('.navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  
  if (lastScrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  }
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