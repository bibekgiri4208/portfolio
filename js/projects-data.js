// Shared by the in-page project window and the standalone fallback page.
// Add { src: 'assets/img/...', alt: 'What the screenshot shows' } entries to
// a project's screenshots array to extend its slider. An empty array hides it.
window.PortfolioProjects = [
  {
    id: 0,
    title: 'Cube Dash',
    category: 'Unity Game',
    image: 'assets/projects_img/cube_dash_img/Cube_Dash_Icon.webp',
    imageAlt: 'Cube Dash game icon with a red cube, traffic, and collectible coins',
    screenshots: [
      { src: 'assets/projects_img/cube_dash_img/cd_1.webp', alt: 'Main menu' },
      { src: 'assets/projects_img/cube_dash_img/cd_2.webp', alt: 'Beach map gameplay' },
      { src: 'assets/projects_img/cube_dash_img/cd_3.webp', alt: 'Skins shop' },
      { src: 'assets/projects_img/cube_dash_img/cd_4.webp', alt: 'Map selection menu' }
    ],
    summary: 'A colorful 3D arcade runner with traffic to dodge, coins to collect, unlockable skins, and six environments to explore.',
    description: `Cube Dash is a 3D arcade runner built in Unity. Guide a cube along roads filled with traffic and obstacles, collect coins, and push for a new best score. Power-ups such as the coin magnet, Rampage truck, Flight, Shield, etc add another layer to each run.\n\nThe game features six environment choices: City, Jungle, Dynamic, Desert, Beach, and Country Side, alongside a coin-based skin shop. Colorful lowpoly scenery, cherry blossom backdrops, and bold pink-and-red menus give the game a playful visual identity.`,
    tags: ['Unity', 'C#'],
    features: [
      '3D arcade running with traffic and road obstacles to dodge',
      'Collectible coins and power-ups',
      'Six environment choices: City, Jungle, Dynamic, Desert, Beach, and Country Side',
      'Coin-based skin shop with vehicles to unlock and equip',
      'In-game distance, score, and best-score displays',
      'Colorful lowpoly environments with bold pink-and-red menus'
    ],
    source: null,
    demo: null,
    windowsDownload: 'https://github.com/bibekgiri4208/Cube-Dash/releases/download/v.1.0/CubeDash_Installer.exe'
  },
  {
    id: 1,
    title: 'Chasing Horizon',
    category: 'Unity Game',
    image: 'assets/projects_img/chasing_horizon_img/Chasing_Horizon_icon.webp',
    imageAlt: 'Chasing Horizon — JDM-themed racing game icon',
    screenshots: [],
    summary: 'A JDM-themed racing game built in Unity, bringing together drifting, car racing, and multiplayer competition.',
    description: `Chasing Horizon is a car racing game built in Unity, inspired by JDM car culture. JDM-themed cars take center stage in an experience that brings together racing and drifting.\n\nMultiplayer adds a competitive dimension, letting players race against one another. From chasing a win to sliding through corners, Chasing Horizon celebrates the thrill of driving and the style of JDM cars.`,
    tags: ['Unity', 'C#'],
    features: [
      'JDM-themed cars inspired by Japanese car culture',
      'Car racing focused on speed and competition',
      'Drifting gameplay for sliding through corners',
      'Multiplayer racing against other players',
      'Built in Unity using C#'
    ],
    source: null,
    demo: null
  },
  {
    id: 2,
    title: 'Dino Rush',
    category: 'Unity Game',
    image: 'assets/projects_img/dino_rush_img/Dino_Rush_icon.webp',
    imageAlt: 'Dino Rush — A Journey Home game icon',
    screenshots: [
      { src: 'assets/projects_img/dino_rush_img/dr_1.webp', alt: 'Main menu' },
      { src: 'assets/projects_img/dino_rush_img/dr_2.webp', alt: 'Gacha shop: Mystery eggs' },
      { src: 'assets/projects_img/dino_rush_img/dr_3.webp', alt: 'Dino trail cosmetics' },
      { src: 'assets/projects_img/dino_rush_img/dr_4.webp', alt: 'Dino rush maps' },
      { src: 'assets/projects_img/dino_rush_img/dr_5.webp', alt: 'Gameplay in Forest map' }
    ],
    summary: 'A pixel-art 2D runner with five scenic trails, collectible eggs, unlockable dinosaurs, and customizable trail effects.',
    description: `Dino Rush: A Journey Home is a 2D side-scrolling runner built with Unity. Guide a dinosaur past obstacles, collect eggs, and chase a new best score through layered pixel-art scenery. Five maps: Forest, Desert, Jungle, Rural, and Snow Mountain offer distinct backdrops for each run.\n\nCollected eggs feed into a shop where mystery eggs award fragments toward unlocking dinosaur characters. Cosmetic trails such as Frost, Blossom, and Cosmic let players personalize their runs, while mission progress, life hearts, and score displays keep the action easy to follow.`,
    tags: ['Unity', 'C#'],
    features: [
      '2D side-scrolling running with obstacles and collectible eggs',
      'Five maps: Forest, Desert, Jungle, Rural, and Snow Mountain',
      'Layered pixel-art scenery and nature-themed menus',
      'Mystery eggs and character fragments to unlock dinosaurs',
      'Customizable cosmetic trails including Frost, Blossom, Cosmic, etc',
      'Various Slash attack animation such as Fire, Lightning, Water',
      'Mission progress, life hearts, and current and best-score displays',
      'Built in Unity using C#'
    ],
    source: null,
    demo: null,
    androidDownload: 'https://github.com/bibekgiri4208/Dino-Rush/releases/download/v.1.0/Dino.Rush.apk'
  },
  {
    id: 3,
    title: 'Death Derby',
    category: 'Unity Game',
    image: 'assets/projects_img/death_derby_img/Death_Derby_icon.webp',
    imageAlt: 'Death Derby — desert vehicle combat and zombie survival game icon',
    screenshots: [
      { src: 'assets/projects_img/death_derby_img/dd_1.webp', alt: 'Main menu showcasing the Bone Shaker vehicle outside a desert motel' },
      { src: 'assets/projects_img/death_derby_img/dd_2.webp', alt: 'Single-player zombie survival with a combat truck in a desert town' },
      { src: 'assets/projects_img/death_derby_img/dd_3.webp', alt: 'A hot rod driving through a desert arena with ramps and obstacles' }
    ],
    summary: 'A Unity vehicle combat game with single-player zombie survival and local split-screen battles in a desert wasteland.',
    description: `Death Derby is a vehicle combat and zombie survival game built in Unity. Take control of a combat-focused vehicle and face the undead in a desert wasteland. Single-player mode focuses on surviving zombies, bringing vehicular combat into a hostile, open desert setting.\n\nLocal split-screen multiplayer lets players battle head-to-head in the zombie-infested wasteland on the same screen. A variety of combat-focused vehicles gives players different rides to take into the action, from hot rods to heavy trucks.`,
    tags: ['Unity', 'C#'],
    features: [
      'Vehicle combat in a zombie-infested desert wasteland',
      'Single-player mode focused on zombie survival',
      'Local split-screen multiplayer for head-to-head vehicle battles',
      'A variety of combat-focused vehicles, including hot rods and heavy trucks',
      'Desert environments with abandoned buildings, ramps, and obstacles',
      'Built in Unity using C#'
    ],
    source: null,
    demo: null
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
