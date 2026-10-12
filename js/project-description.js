(() => {
  const projects = [
    {
      id: 0,
      title: 'Circuit Race',
      category: 'Unity Game',
      image: 'assets/img/circuit_race.webp',
      imageAlt: 'Circuit Race — 3D lowpoly car racing game',
      summary: 'A lowpoly racing game with drift-tuned handling, distinct cars, and tracks that reward precision and speed.',
      description: `Circuit Race is a 3D lowpoly car racing game built in Unity as a final-year academic project. The game features multiple car choices, each with distinct handling characteristics, drift-tuned physics, and a variety of racing tracks designed to test precision and speed.\n\nThe project focuses on delivering a polished gameplay experience with attention to visual detail — from lowpoly environment modeling in Blender to custom sound effects edited in Audacity. The handling model balances arcade accessibility with enough depth to reward skilled driving, making each race feel dynamic and replayable.`,
      tags: ['Unity', 'C#', 'Blender', 'Audacity'],
      features: [
        'Multiple car models with unique handling and drift physics',
        'Designed racing tracks with varied terrain and challenge levels',
        'Lowpoly 3D art style modeled and textured in Blender',
        'Custom sound effects and engine audio mixed in Audacity',
        'Polished UI with lap tracking, speedometer, and race timer',
        'Ongoing visual improvements for final-year project presentation'
      ],
      source: 'https://github.com/bibekgiri4208/Circuit-Race.git',
      demo: null
    },
    {
      id: 1,
      title: 'Tic Tac Toe',
      category: 'JavaScript Game',
      image: 'assets/img/tictactoe.webp',
      imageAlt: 'Tic Tac Toe — classic browser game with modern UI',
      summary: 'A familiar two-player game, reimagined for the browser with a clean interface and responsive gameplay.',
      description: `Tic Tac Toe is a reimagined version of the classic pencil-and-paper game, rebuilt for the browser with a clean, modern interface. The game supports two players taking turns on a 3x3 grid, with win detection and draw handling built in.\n\nThe focus was on creating a smooth, responsive experience that works across devices. The UI uses subtle animations for piece placement and win highlighting, making the gameplay feel polished without being distracting. It's a simple concept executed with care for the details.`,
      tags: ['HTML', 'CSS', 'JavaScript'],
      features: [
        'Two-player local gameplay with alternating turns',
        'Real-time win and draw detection',
        'Clean, responsive layout that works on mobile and desktop',
        'Subtle animations for piece placement and board feedback',
        'Score tracking across multiple rounds',
        'Minimal, distraction-free interface'
      ],
      source: 'https://github.com/bibekgiri4208/Tictactoe.git',
      demo: 'projects/tictactoe/index.html'
    },
    {
      id: 2,
      title: 'Dino Run',
      category: 'Godot Game',
      image: 'assets/img/dino_run.webp',
      imageAlt: 'Dino Run — 2D arcade runner in Godot',
      summary: 'A fast-paced 2D runner with layered parallax scenery, escalating difficulty, and a simple goal: keep going.',
      description: `Dino Run is a fast-paced 2D side-scrolling runner built with the Godot Engine. The game features a dinosaur character sprinting through a procedurally styled environment with parallax backgrounds that give a sense of depth and speed.\n\nThe core loop is simple — run as far as possible while avoiding obstacles. The difficulty ramps up over time, testing reflexes and timing. The parallax scrolling layers create a visually engaging backdrop without sacrificing performance, making it a solid example of lightweight arcade game design.`,
      tags: ['Godot Engine', 'GDScript'],
      features: [
        'Side-scrolling arcade runner with increasing difficulty',
        'Multi-layer parallax background for depth perception',
        'Lightweight pixel-art inspired visual style',
        'Responsive controls optimized for keyboard and touch',
        'Score tracking based on distance traveled',
        'Built entirely in Godot Engine using GDScript'
      ],
      source: 'https://github.com/bibekgiri4208/Dino-Game.git',
      demo: null
    },
    {
      id: 3,
      title: 'Hangman Game',
      category: 'JavaScript Game',
      image: 'assets/img/hangman.webp',
      imageAlt: 'Hangman — word guessing game in the browser',
      summary: 'A browser-based word guessing game with visual progression, keyboard controls, and a persistent scoreboard.',
      description: `Hangman is a browser-based word guessing game where players try to reveal a hidden word one letter at a time. Each incorrect guess brings the hangman figure closer to completion, adding tension with every wrong letter.\n\nThe game includes a curated word list across multiple categories, a visual hangman progression, and a scoreboard to track wins and losses. It was built to practice DOM manipulation and event-driven programming in vanilla JavaScript, with a clean UI that keeps the focus on the gameplay.`,
      tags: ['HTML', 'CSS', 'JavaScript'],
      features: [
        'Word guessing with visual hangman progression',
        'Multiple word categories and difficulty levels',
        'Keyboard-based letter input with visual feedback',
        'Win/loss tracking with persistent scoreboard',
        'Responsive design for desktop and mobile play',
        'Clean UI with smooth state transitions'
      ],
      source: 'https://github.com/bibekgiri4208/Hangman.git',
      demo: 'projects/hangman/index.html'
    },
    {
      id: 4,
      title: 'Domain Expansion',
      category: 'Web Game Collection',
      image: 'assets/img/domain_expansion.webp',
      imageAlt: 'Domain Expansion — collection of web-based games',
      summary: 'Five browser games under one roof, connected by shared scoring, persistent leaderboards, and a consistent interface.',
      description: `Domain Expansion is a collection of five browser-based games bundled into a single web application. It includes Hangman, Card Memory Match, Maze Runner, Number Guessing, and Tic Tac Toe — each built as a standalone game module with shared scoring infrastructure.\n\nThe project was designed as a full-stack exercise, combining a PHP backend for score persistence with a clean frontend built in HTML, CSS, and JavaScript. A leaderboard system tracks high scores across all games, adding a competitive layer to the collection. It's a practical demonstration of modular web development.`,
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
      features: [
        'Five distinct games in a single application',
        'Shared scoring and leaderboard system across all games',
        'PHP backend for persistent score storage and retrieval',
        'Card Memory Match with flip animations and timer',
        'Maze Runner with procedurally generated levels',
        'Number Guessing with hints and attempt tracking',
        'Unified navigation and consistent UI across all games'
      ],
      source: 'https://github.com/bibekgiri4208/Domain-Expansion',
      demo: null
    },
    {
      id: 5,
      title: '3B Transport',
      category: 'Web Application',
      image: 'assets/img/3b_transport.webp',
      imageAlt: '3B Transport — logistics web application',
      summary: 'A logistics platform connecting customers, riders, and administrators through parcel tracking and role-based dashboards.',
      description: `3B Transport is a full-featured logistics and parcel delivery web application built for a university project. It serves three user roles — customers, administrators, and riders — each with a dedicated dashboard tailored to their workflow.\n\nThe application includes real-time parcel tracking using Leaflet.js maps, a loyalty rewards program for repeat customers, and income visualization charts for riders. The admin dashboard provides oversight of all operations, from dispatch to delivery confirmation. It's a comprehensive demonstration of multi-role web application design.`,
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'Leaflet.js'],
      features: [
        'Three role-based dashboards: Customer, Admin, and Rider',
        'Real-time parcel tracking with interactive Leaflet.js map',
        'Loyalty rewards system with points and tier progression',
        'Rider income charts and delivery performance analytics',
        'Admin panel for dispatch management and delivery oversight',
        'Responsive design optimized for desktop and mobile use',
        'PHP backend with MySQL database integration'
      ],
      source: 'https://github.com/bibekgiri4208/3B-Transport.git',
      demo: 'http://3btransport.free.nf/'
    }
  ];

  // Match the homepage's scrolled navbar state without loading its page-specific animations.
  const navbar = document.querySelector('.navbar');
  const updateNavbar = () => navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
  let navbarUpdatePending = false;
  window.addEventListener('scroll', () => {
    if (navbarUpdatePending) return;
    navbarUpdatePending = true;
    window.requestAnimationFrame(() => {
      updateNavbar();
      navbarUpdatePending = false;
    });
  }, { passive: true });
  window.addEventListener('pageshow', updateNavbar);
  updateNavbar();

  const root = document.getElementById('pd-root');
  const rawId = new URLSearchParams(window.location.search).get('id');
  const id = rawId !== null && /^\d+$/.test(rawId) ? Number(rawId) : NaN;
  const projectIndex = projects.findIndex(project => project.id === id);
  const project = projects[projectIndex];

  document.title = project ? `${project.title} | Bibek Giri` : 'Project Not Found | Bibek Giri';
  if (!project) {
    root.innerHTML = `
      <div class="pd-not-found">
        <p class="pd-section-label">Nothing here just yet</p>
        <h1>Project not found.</h1>
        <p>This project may have moved, or the link might be incorrect. There’s plenty more to explore in my selected work.</p>
        <a href="index.html#projects" class="pd-btn pd-btn-primary" data-project-return>
          <i class="fas fa-arrow-left" aria-hidden="true"></i> Back to Projects
        </a>
      </div>`;
    return;
  }

  document.querySelector('meta[name="description"]').content = project.summary;
  const projectNumber = String(projectIndex + 1).padStart(2, '0');
  const sourceButton = project.source
    ? `<a href="${project.source}" class="pd-btn pd-btn-primary" target="_blank" rel="noopener noreferrer" aria-label="Source code for ${project.title} (opens in a new tab)">
        <i class="fab fa-github" aria-hidden="true"></i> Source Code
        <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
       </a>`
    : '';
  const demoButton = project.demo
    ? `<a href="${project.demo}" class="pd-btn pd-btn-secondary" target="_blank" rel="noopener noreferrer" aria-label="Live demo of ${project.title} (opens in a new tab)">
        <i class="fas fa-play" aria-hidden="true"></i> Live Demo
       </a>`
    : `<a href="under-development.html" class="pd-btn pd-btn-secondary">
        <i class="far fa-clock" aria-hidden="true"></i> Demo coming soon
       </a>`;

  const renderNeighbor = (neighbor, direction) => `
    <a href="project_description.html?id=${neighbor.id}" class="pd-neighbor" aria-label="${direction} project: ${neighbor.title}" data-page-transition data-project-preview="${neighbor.image}">
      <img src="${neighbor.image}" alt="" width="64" height="64" loading="lazy">
      <span class="pd-neighbor-copy">
        <span class="pd-neighbor-label">${direction} project</span>
        <strong>${neighbor.title}</strong>
      </span>
      <i class="fas fa-arrow-${direction === 'Previous' ? 'left' : 'right'}" aria-hidden="true"></i>
    </a>`;
  const previousProject = projects[(projectIndex - 1 + projects.length) % projects.length];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  root.innerHTML = `
    <div class="pd-shell">
      <section class="pd-hero" aria-labelledby="project-title">
        <div class="pd-info">
          <p class="pd-eyebrow">Selected work <span>/ ${projectNumber}</span></p>
          <span class="pd-category">${project.category}</span>
          <h1 class="pd-title" id="project-title">${project.title}</h1>
          <p class="pd-summary">${project.summary}</p>
          <div class="pd-actions">${sourceButton}${demoButton}</div>
        </div>
        <figure class="pd-preview">
          <div class="pd-preview-bar" aria-hidden="true">
            <span>Project preview</span><span>No. ${projectNumber}</span>
          </div>
          <div class="pd-preview-image">
            <img src="${project.image}" alt="${project.imageAlt}" fetchpriority="high">
          </div>
          <figcaption class="pd-preview-caption">
            <span>${project.title}</span><span>Project artwork</span>
          </figcaption>
        </figure>
      </section>

      <div class="pd-content">
        <section class="pd-overview" aria-labelledby="overview-title">
          <p class="pd-section-label">01 / The idea</p>
          <h2 class="pd-section-title" id="overview-title">About the project.</h2>
          ${project.description.split('\n\n').map(paragraph => `<p class="pd-description">${paragraph}</p>`).join('')}
        </section>
        <aside class="pd-sidebar" aria-labelledby="details-title">
          <h2 id="details-title">At a glance</h2>
          <dl class="pd-facts">
            <div><dt>Project type</dt><dd>${project.category}</dd></div>
            <div><dt>Live demo</dt><dd>${project.demo ? 'Available to explore' : 'Coming soon'}</dd></div>
          </dl>
          <div class="pd-stack">
            <h3>Built with</h3>
            <ul class="pd-tags" aria-label="Technologies used">
              ${project.tags.map(tag => `<li class="pd-tag">${tag}</li>`).join('')}
            </ul>
          </div>
        </aside>
      </div>

      <section class="pd-features" aria-labelledby="features-title">
        <p class="pd-section-label">02 / The details</p>
        <h2 class="pd-section-title" id="features-title">What’s inside.</h2>
        <ul class="pd-feature-list">
          ${project.features.map((feature, index) => `
            <li><span class="pd-feature-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${feature}</span></li>`).join('')}
        </ul>
      </section>

      <nav class="pd-project-navigation" aria-label="Explore other projects">
        <p>Keep exploring my work</p>
        <div class="pd-neighbors">
          ${renderNeighbor(previousProject, 'Previous')}
          ${renderNeighbor(nextProject, 'Next')}
        </div>
      </nav>
    </div>`;
})();
