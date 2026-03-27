/**
 * API Module
 * Handles all API calls to the movie database
 */

const API = {
    BASE_URL: 'https://devsapihub.com/api-movies',
    
    /**
     * Search movies by query
     */
    async searchMovies(query) {
        const url = `${this.BASE_URL}?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor');
        }
        
        return await response.json();
    },
    
    /**
     * Get popular movies (trending)
     * Using a default popular query since API doesn't have this endpoint
     */
    async getPopularMovies() {
        // Since the API only supports search, we'll use common popular movie queries
        const popularQueries = ['action', 'marvel', 'batman', 'avengers', 'star wars'];
        const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
        
        const data = await this.searchMovies(randomQuery);
        
        // Shuffle and return up to 8 movies
        return this.shuffleArray(data).slice(0, 8);
    },
    
    /**
     * Get series (simulated - same API with series-related queries)
     */
    async getSeries() {
        // The API doesn't differentiate between movies and series
        // So we simulate series content
        const seriesQueries = ['tv', 'breaking', 'sherlock', 'stranger', 'game of'];
        const randomQuery = seriesQueries[Math.floor(Math.random() * seriesQueries.length)];
        
        const data = await this.searchMovies(randomQuery);
        
        return this.shuffleArray(data).slice(0, 8);
    },
    
    /**
     * Shuffle array utility
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}