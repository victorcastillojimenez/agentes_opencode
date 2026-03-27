/**
 * Cinematic Search - Main Application Module
 */

// Application State
const App = {
    currentSearchTerm: '',
    debounceTimer: null,
    
    /**
     * Initialize the application
     */
    init() {
        this.initElements();
        this.setupEventListeners();
        this.setupPopularSearches();
        this.updateListBadge();
        
        console.log('🎬 Cinematic Search initialized');
    },
    
    /**
     * Initialize DOM elements
     */
    initElements() {
        this.elements = {
            // Search
            searchForm: document.getElementById('search-form'),
            searchInput: document.getElementById('search-input'),
            
            // Home results
            homeResults: document.getElementById('home-results'),
            homeLoading: document.getElementById('home-loading'),
            homeHeader: document.getElementById('home-header'),
            
            // Toast
            toastContainer: document.getElementById('toast-container'),
            
            // Popular tags
            popularTags: document.querySelectorAll('.popular-tag')
        };
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search form
        this.elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });
        
        // Debounced input
        this.elements.searchInput.addEventListener('input', () => {
            this.debouncedSearch();
        });
        
        // Retry button
        const retryBtn = document.getElementById('home-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retrySearch());
        }
    },
    
    /**
     * Setup popular search tags
     */
    setupPopularSearches() {
        this.elements.popularTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.dataset.query;
                this.elements.searchInput.value = query;
                this.navigateToHome();
                this.performSearch(query);
            });
        });
    },
    
    /**
     * Navigate to home section
     */
    navigateToHome() {
        Navigation.navigateTo('home');
    },
    
    /**
     * Handle search submit
     */
    handleSearch() {
        const query = this.elements.searchInput.value.trim();
        
        if (!query) {
            this.showToast('Ingresa un término de búsqueda', 'error');
            return;
        }
        
        // Navigate to home if not already there
        this.navigateToHome();
        
        this.performSearch(query);
    },
    
    /**
     * Debounced search
     */
    debouncedSearch() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const query = this.elements.searchInput.value.trim();
            if (query.length >= 2) {
                this.navigateToHome();
                this.performSearch(query);
            }
        }, 300);
    },
    
    /**
     * Perform search
     */
    async performSearch(query) {
        if (query === this.currentSearchTerm) return;
        
        this.currentSearchTerm = query;
        this.showHomeLoading();
        
        try {
            const movies = await API.searchMovies(query);
            this.displayHomeResults(movies);
        } catch (error) {
            this.showHomeError(error.message);
        }
    },
    
    /**
     * Retry last search
     */
    retrySearch() {
        if (this.currentSearchTerm) {
            this.performSearch(this.currentSearchTerm);
        }
    },
    
    /**
     * Show home loading state
     */
    showHomeLoading() {
        this.hideAllHomeStates();
        
        if (this.elements.homeLoading) {
            this.elements.homeLoading.style.display = 'flex';
        }
        
        if (this.elements.homeHeader) {
            this.elements.homeHeader.classList.add('visible');
            const countEl = this.elements.homeHeader.querySelector('#home-count');
            if (countEl) {
                countEl.textContent = 'Buscando...';
            }
        }
    },
    
    /**
     * Show home results
     */
    displayHomeResults(movies) {
        this.hideAllHomeStates();
        
        const container = this.elements.homeResults;
        if (!container) return;
        
        if (!movies || movies.length === 0) {
            this.showHomeEmpty();
            return;
        }
        
        // Update count
        if (this.elements.homeHeader) {
            this.elements.homeHeader.classList.add('visible');
            const count = this.elements.homeHeader.querySelector('#home-count');
            if (count) {
                count.textContent = `${movies.length} resultado${movies.length !== 1 ? 's' : ''}`;
            }
        }
        
        this.displayMovies(movies, container);
    },
    
    /**
     * Show home error state
     */
    showHomeError(message) {
        this.hideAllHomeStates();
        
        const container = this.elements.homeResults;
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-content">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 class="error-title">Ups! Algo salió mal</h3>
                <p class="error-message">${this.escapeHtml(message)}</p>
                <button class="retry-btn" id="home-retry">Intentar de nuevo</button>
            </div>
        `;
        
        // Re-attach retry listener
        const retryBtn = document.getElementById('home-retry');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retrySearch());
        }
        
        this.showToast('Error al buscar películas', 'error');
    },
    
    /**
     * Show home empty state
     */
    showHomeEmpty() {
        this.hideAllHomeStates();
        
        const container = this.elements.homeResults;
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-content">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 class="empty-title">No encontramos resultados</h3>
                <p class="empty-message">Intenta con otra búsqueda o explora nuestras sugerencias</p>
            </div>
        `;
    },
    
    /**
     * Hide all home states
     */
    hideAllHomeStates() {
        if (this.elements.homeLoading) {
            this.elements.homeLoading.style.display = 'none';
        }
        
        const errorContent = document.querySelector('#home-results .error-content');
        const emptyContent = document.querySelector('#home-results .empty-content');
        
        if (errorContent) errorContent.remove();
        if (emptyContent) emptyContent.remove();
    },
    
    /**
     * Display movies in a container
     */
    displayMovies(movies, container, isMyList = false) {
        container.innerHTML = '';
        
        movies.forEach((movie, index) => {
            const card = this.createMovieCard(movie, index, isMyList);
            container.appendChild(card);
        });
    },
    
    /**
     * Create a movie card element
     */
    createMovieCard(movie, index, isMyList = false) {
        const card = document.createElement('article');
        card.className = 'movie-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.dataset.movieId = movie.id || index;
        
        const imageUrl = movie.image_url || movie.image || 'https://via.placeholder.com/400x600/1a1a2e/e94560?text=Sin+Imagen';
        const title = this.escapeHtml(movie.title || 'Título desconocido');
        const year = movie.year || 'N/A';
        const genre = movie.genre || 'N/A';
        const description = movie.description || 'Sin descripción disponible.';
        const stars = movie.stars || 'No disponible';
        
        const isInList = Storage.isInList(movie.id || title);
        
        card.innerHTML = `
            <div class="movie-card__image-container">
                <img 
                    src="${imageUrl}" 
                    alt="${title}" 
                    class="movie-card__image"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/400x600/1a1a2e/e94560?text=Sin+Imagen'"
                >
                <div class="movie-card__overlay"></div>
                ${!isMyList ? `
                    <button class="movie-card__add-btn ${isInList ? 'added' : ''}" 
                            data-movie='${JSON.stringify(movie).replace(/'/g, "&#39;")}'
                            title="${isInList ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}">
                        <svg viewBox="0 0 24 24" fill="${isInList ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            ${isInList 
                                ? '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'
                                : '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'
                            }
                        </svg>
                    </button>
                ` : ''}
            </div>
            <div class="movie-card__content">
                <h3 class="movie-card__title">${title}</h3>
                <div class="movie-card__meta">
                    <span class="movie-card__year">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${year}
                    </span>
                    <span class="movie-card__genre">${this.escapeHtml(genre)}</span>
                </div>
                <p class="movie-card__description">${this.escapeHtml(description)}</p>
                <div class="movie-card__footer">
                    <span class="movie-card__stars">Actores: <span>${this.escapeHtml(stars)}</span></span>
                    ${isMyList ? `
                        <button class="movie-card__remove-btn" data-movie-id="${movie.id || title}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        this.setupCardEventListeners(card, movie, isMyList);
        
        return card;
    },
    
    /**
     * Setup card event listeners
     */
    setupCardEventListeners(card, movie, isMyList) {
        // Add to list button
        const addBtn = card.querySelector('.movie-card__add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleAddToList(movie, addBtn);
            });
        }
        
        // Remove from list button
        const removeBtn = card.querySelector('.movie-card__remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromList(movie, card);
            });
        }
    },
    
    /**
     * Toggle add to list
     */
    toggleAddToList(movie, btn) {
        const isInList = Storage.isInList(movie.id || movie.title);
        
        if (isInList) {
            Storage.removeFromList(movie.id || movie.title);
            btn.classList.remove('added');
            btn.querySelector('svg').setAttribute('fill', 'none');
            this.showToast('Eliminado de Mi Lista', 'success');
            this.updateListBadge();
        } else {
            const movieId = movie.id || movie.title;
            Storage.addToList({...movie, id: movieId});
            btn.classList.add('added');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
            this.showToast('Añadido a Mi Lista', 'success');
            this.updateListBadge();
        }
    },
    
    /**
     * Remove from list
     */
    removeFromList(movie, card) {
        const movieId = movie.id || movie.title;
        Storage.removeFromList(movieId);
        
        // Animate removal
        card.style.animation = 'fadeOutDown 0.3s ease forwards';
        
        setTimeout(() => {
            card.remove();
            
            // Check if list is empty
            const remainingCards = document.querySelectorAll('#mylist-grid .movie-card');
            if (remainingCards.length === 0) {
                const emptyState = document.getElementById('mylist-empty');
                if (emptyState) {
                    emptyState.style.display = 'flex';
                }
            }
            
            // Update count
            const countEl = document.getElementById('mylist-count');
            if (countEl) {
                countEl.textContent = `${remainingCards.length} ${remainingCards.length === 1 ? 'título' : 'títulos'}`;
            }
            
            // Update badge
            this.updateListBadge();
        }, 300);
        
        this.showToast('Eliminado de Mi Lista', 'success');
    },
    
    /**
     * Update the list badge count in navigation
     */
    updateListBadge() {
        const count = Storage.getListCount();
        const badge = document.getElementById('my-list-count');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const iconPath = type === 'error' 
            ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
            : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
        
        toast.innerHTML = `
            <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${iconPath}
            </svg>
            <span class="toast__message">${this.escapeHtml(message)}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    Navigation.init();
});

// Add fadeOutDown animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(fadeOutStyle);