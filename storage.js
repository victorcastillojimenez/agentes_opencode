/**
 * Storage Module
 * Handles localStorage operations for "Mi Lista" feature
 */

const Storage = {
    LIST_KEY: 'cinematic_my_list',
    
    /**
     * Get all items from "Mi Lista"
     */
    getList() {
        try {
            const data = localStorage.getItem(this.LIST_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },
    
    /**
     * Add movie to "Mi Lista"
     */
    addToList(movie) {
        try {
            const list = this.getList();
            
            // Check if already in list
            if (list.some(item => item.id === movie.id)) {
                return { success: false, message: 'Ya está en tu lista' };
            }
            
            // Add to list with timestamp
            const listItem = {
                ...movie,
                addedAt: Date.now()
            };
            
            list.push(listItem);
            localStorage.setItem(this.LIST_KEY, JSON.stringify(list));
            
            return { success: true, message: 'Añadido a Mi Lista' };
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return { success: false, message: 'Error al guardar' };
        }
    },
    
    /**
     * Remove movie from "Mi Lista"
     */
    removeFromList(movieId) {
        try {
            let list = this.getList();
            list = list.filter(item => item.id !== movieId);
            localStorage.setItem(this.LIST_KEY, JSON.stringify(list));
            
            return { success: true, message: 'Eliminado de Mi Lista' };
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return { success: false, message: 'Error al eliminar' };
        }
    },
    
    /**
     * Check if movie is in "Mi Lista"
     */
    isInList(movieId) {
        const list = this.getList();
        return list.some(item => item.id === movieId);
    },
    
    /**
     * Clear entire list
     */
    clearList() {
        try {
            localStorage.removeItem(this.LIST_KEY);
            return { success: true };
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return { success: false, message: 'Error al limpiar la lista' };
        }
    },
    
    /**
     * Get list count
     */
    getListCount() {
        return this.getList().length;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}