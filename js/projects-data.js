// Shared by the in-page project window and the standalone fallback page.
// Add { src: 'assets/img/...', alt: 'What the screenshot shows' } entries to
// a project's screenshots array to extend its slider. An empty array hides it.
window.PortfolioProjects = [
  {
    id: 0,
    title: 'Circuit Race',
    category: 'Unity Game',
    image: 'assets/img/circuit_race.webp',
    imageAlt: 'Circuit Race — 3D lowpoly car racing game',
    screenshots: [
      { src: 'assets/img/car_race.png', alt: 'Circuit Race car selection screen with track settings and practice mode' }
    ],
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
    screenshots: [
      { src: 'assets/img/screenshots/tictactoe-game.jpg', alt: 'Tic Tac Toe board during a two-player match' },
      { src: 'assets/img/screenshots/tictactoe-result.jpg', alt: 'Tic Tac Toe winning row and updated leaderboard' }
    ],
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
    screenshots: [
      { src: 'assets/img/dinorun.png', alt: 'Dino Run dinosaur jumping over a rock in the forest level' }
    ],
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
    screenshots: [
      { src: 'assets/img/screenshots/hangman-categories.jpg', alt: 'Hangman category selection with fruits, animals and countries' },
      { src: 'assets/img/screenshots/hangman-game.jpg', alt: 'Hangman word guessing with letter controls and drawing progression' }
    ],
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
    screenshots: [
      { src: 'assets/img/domain_expansion.webp', alt: 'Domain Expansion home screen with Play and Score options' }
    ],
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
    screenshots: [
      { src: 'assets/img/parcel.png', alt: '3B Transport homepage showing parcel delivery, house shifting and storage services' }
    ],
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
