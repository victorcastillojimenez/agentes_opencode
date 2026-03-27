/**
 * Navigation Module
 * Handles SPA navigation and section switching
 */

const Navigation = {
    currentSection: 'home',
    
    /**
     * Initialize navigation
     */
    init() {
        this.setupNavLinks();
        this.setupMobileMenu();
        
        // Load initial section based on URL hash
        this.handleHashChange();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleHashChange());
    },
    
    /**
     * Setup navigation link click handlers
     */
    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const section = link.dataset.section;
                if (section) {
                    this.navigateTo(section);
                }
            });
        });
    },
    
    /**
     * Setup mobile hamburger menu
     */
    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });
        }
    },
    
    /**
     * Navigate to a section
     */
    navigateTo(section) {
        if (section === this.currentSection) return;
        
        // Update URL hash
        window.location.hash = section;
    },
    
    /**
     * Handle hash change
     */
    async handleHashChange() {
        const hash = window.location.hash.slice(1) || 'home';
        
        // Map hash to section
        const sectionMap = {
            'home': 'home',
            'peliculas': 'movies',
            'series': 'series',
            'mi-lista': 'mylist',
            'my-list': 'mylist'
        };
        
        const section = sectionMap[hash] || 'home';
        
        await this.showSection(section);
    },
    
    /**
     * Show a specific section
     */
    async showSection(section) {
        // Update active nav link
        this.updateActiveNavLink(section);
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });
        
        // Show target section with animation
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Small delay for animation
            await new Promise(resolve => setTimeout(resolve, 50));
            targetSection.classList.add('active');
            
            // Load section data if needed
            await this.loadSectionData(section);
        }
        
        this.currentSection = section;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    /**
     * Update active navigation link
     */
    updateActiveNavLink(section) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkSection = link.dataset.section;
            if (linkSection === section || 
                (section === 'mylist' && linkSection === 'mi-lista')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    /**
     * Load data for specific section
     */
    async loadSectionData(section) {
        switch (section) {
            case 'movies':
                await this.loadMoviesSection();
                break;
            case 'series':
                await this.loadSeriesSection();
                break;
            case 'mylist':
                await this.loadMyListSection();
                break;
            case 'home':
            default:
                // Home section loads automatically via search
                break;
        }
    },
    
    /**
     * Load movies section
     */
    async loadMoviesSection() {
        const container = document.getElementById('movies-grid');
        const loading = document.getElementById('movies-loading');
        const header = document.getElementById('movies-header');
        
        if (!container) return;
        
        // Check if already loaded
        if (container.children.length > 0) return;
        
        loading.style.display = 'flex';
        header.style.display = 'flex';
        
        try {
            const movies = await API.getPopularMovies();
            App.displayMovies(movies, container);
        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar películas</p>
                </div>
            `;
        } finally {
            loading.style.display = 'none';
        }
    },
    
    /**
     * Load series section
     */
    async loadSeriesSection() {
        const container = document.getElementById('series-grid');
        const loading = document.getElementById('series-loading');
        const header = document.getElementById('series-header');
        
        if (!container) return;
        
        // Check if already loaded
        if (container.children.length > 0) return;
        
        loading.style.display = 'flex';
        header.style.display = 'flex';
        
        try {
            const series = await API.getSeries();
            App.displayMovies(series, container);
        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar series</p>
                </div>
            `;
        } finally {
            loading.style.display = 'none';
        }
    },
    
    /**
     * Load my list section
     */
    async loadMyListSection() {
        const container = document.getElementById('mylist-grid');
        const loading = document.getElementById('mylist-loading');
        const header = document.getElementById('mylist-header');
        const emptyState = document.getElementById('mylist-empty');
        
        if (!container) return;
        
        loading.style.display = 'flex';
        header.style.display = 'flex';
        emptyState.style.display = 'none';
        
        try {
            const list = Storage.getList();
            
            if (list.length === 0) {
                container.innerHTML = '';
                emptyState.style.display = 'flex';
            } else {
                App.displayMovies(list, container, true);
            }
            
            // Update count
            const countEl = document.getElementById('mylist-count');
            if (countEl) {
                countEl.textContent = `${list.length} ${list.length === 1 ? 'título' : 'títulos'}`;
            }
        } finally {
            loading.style.display = 'none';
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}