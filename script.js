/**
 * CINEMATIC SEARCH
 * Modern Movie Search Application
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://devsapihub.com/api-movies',
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 500,
};

// DOM Elements
const elements = {
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    movieResults: document.getElementById('movie-results'),
    loadingContainer: document.getElementById('loading-container'),
    errorContainer: document.getElementById('error-container'),
    emptyContainer: document.getElementById('empty-container'),
    resultsHeader: document.getElementById('results-header'),
    resultsCount: document.getElementById('results-count'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    toastContainer: document.getElementById('toast-container'),
    popularTags: document.querySelectorAll('.popular-tag'),
};

// State
let searchTimeout = null;
let lastSearchTerm = '';

/**
 * Initialize the application
 */
function init() {
    setupEventListeners();
    setupPopularSearches();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Form submission
    elements.searchForm.addEventListener('submit', handleSearch);
    
    // Retry button
    elements.retryBtn.addEventListener('click', retrySearch);
    
    // Debounced input
    elements.searchInput.addEventListener('input', debouncedSearch);
}

/**
 * Setup popular search tags
 */
function setupPopularSearches() {
    elements.popularTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const query = tag.dataset.query;
            elements.searchInput.value = query;
            performSearch(query);
        });
    });
}

/**
 * Handle search form submission
 */
function handleSearch(e) {
    e.preventDefault();
    const searchTerm = elements.searchInput.value.trim();
    
    if (searchTerm) {
        performSearch(searchTerm);
    } else {
        showToast('Por favor, ingresa un término de búsqueda', 'error');
    }
}

/**
 * Debounced search function
 */
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = elements.searchInput.value.trim();
        if (searchTerm.length >= 2) {
            performSearch(searchTerm);
        }
    }, CONFIG.DEBOUNCE_DELAY);
}

/**
 * Perform the search
 */
async function performSearch(searchTerm) {
    if (searchTerm === lastSearchTerm) return;
    lastSearchTerm = searchTerm;
    
    showLoading();
    
    try {
        const movies = await fetchMovies(searchTerm);
        displayMovies(movies);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Fetch movies from API
 */
async function fetchMovies(query) {
    const url = `${CONFIG.API_BASE_URL}?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
    }
    
    const data = await response.json();
    
    return data;
}

/**
 * Display movies in the grid
 */
function displayMovies(movies) {
    hideAllStates();
    
    if (!movies || movies.length === 0) {
        showEmpty();
        return;
    }
    
    // Update results header
    elements.resultsHeader.style.display = 'flex';
    elements.resultsCount.textContent = `${movies.length} ${movies.length === 1 ? 'película' : 'películas'} encontrada${movies.length === 1 ? '' : 's'}`;
    
    // Clear previous results
    elements.movieResults.innerHTML = '';
    
    // Create movie cards
    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        elements.movieResults.appendChild(card);
    });
}

/**
 * Create a movie card element
 */
function createMovieCard(movie, index) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const imageUrl = movie.image_url || movie.image || 'https://via.placeholder.com/400x600/1a1a2e/e94560?text=Sin+Imagen';
    const title = escapeHtml(movie.title || 'Título desconocido');
    const year = movie.year || 'N/A';
    const genre = movie.genre || 'N/A';
    const description = movie.description || 'Sin descripción disponible.';
    const stars = movie.stars || 'No disponible';
    
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
                <span class="movie-card__genre">${escapeHtml(genre)}</span>
            </div>
            <p class="movie-card__description">${escapeHtml(description)}</p>
            <div class="movie-card__footer">
                <span class="movie-card__stars">Actores: <span>${escapeHtml(stars)}</span></span>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Show loading state
 */
function showLoading() {
    hideAllStates();
    elements.loadingContainer.style.display = 'flex';
}

/**
 * Show error state
 */
function showError(message) {
    hideAllStates();
    elements.errorContainer.style.display = 'flex';
    elements.errorMessage.textContent = message;
    
    showToast('Error al buscar películas', 'error');
}

/**
 * Show empty state
 */
function showEmpty() {
    hideAllStates();
    elements.emptyContainer.style.display = 'flex';
    elements.resultsHeader.style.display = 'none';
}

/**
 * Hide all states
 */
function hideAllStates() {
    elements.loadingContainer.style.display = 'none';
    elements.errorContainer.style.display = 'none';
    elements.emptyContainer.style.display = 'none';
}

/**
 * Retry last search
 */
function retrySearch() {
    if (lastSearchTerm) {
        performSearch(lastSearchTerm);
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    const iconPath = type === 'error' 
        ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
        : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
    
    toast.innerHTML = `
        <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${iconPath}
        </svg>
        <span class="toast__message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Debounce utility
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for slideOutRight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);