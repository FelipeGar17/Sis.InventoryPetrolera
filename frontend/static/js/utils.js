/**
 * Funciones utilitarias reutilizables
 */

const Utils = {
    /**
     * Muestra un mensaje de notificación
     */
    showNotification(message, type = 'info') {
        // Implementar sistema de notificaciones
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message); // Temporal, luego usaremos algo más elegante
    },

    /**
     * Formatea una fecha
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Valida un formulario
     */
    validateForm(formData, requiredFields) {
        for (let field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                return {
                    valid: false,
                    message: `El campo ${field} es requerido`
                };
            }
        }
        return { valid: true };
    },

    /**
     * Debounce para búsquedas
     */
    debounce(func, wait) {
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
};
