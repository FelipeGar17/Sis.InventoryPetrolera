/**
 * Auth utilities - Login y autenticacion
 */

const Auth = {
    /**
     * Verifica si el usuario esta autenticado
     */
    checkAuth() {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');

        if (!token || !role) {
            window.location.href = '/login';
            return false;
        }
        return true;
    },

    /**
     * Verifica si el usuario es admin
     */
    isAdmin() {
        const role = localStorage.getItem('user_role');
        return role === 'ADMIN';
    },

    /**
     * Verifica si el usuario es operario
     */
    isOperario() {
        const role = localStorage.getItem('user_role');
        return role === 'USER';
    },

    /**
     * Obtiene los datos del usuario actual
     */
    getCurrentUser() {
        return {
            username: localStorage.getItem('username') || '',
            full_name: localStorage.getItem('user_full_name') || '',
            role: localStorage.getItem('user_role') || ''
        };
    },

    /**
     * Obtiene el token
     */
    getToken() {
        return localStorage.getItem('access_token');
    },

    /**
     * Cierra sesion
     */
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('username');
        localStorage.removeItem('user_full_name');
        window.location.href = '/login';
    }
};
