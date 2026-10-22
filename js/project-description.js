(() => {
  const projects = window.PortfolioProjects;

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
    : '';

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
