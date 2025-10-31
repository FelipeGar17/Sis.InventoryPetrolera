/**
 * Módulo para comunicación con el API REST
 * Centraliza todas las peticiones HTTP
 */

const API_BASE_URL = 'http://localhost:5000/api';

class API {
    /**
     * Petición GET genérica
     */
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    }

    /**
     * Petición POST genérica
     */
    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                const error = new Error(result.error || `HTTP ${response.status}`);
                error.response = { data: result };
                throw error;
            }
            
            return result;
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    }

    /**
     * Petición PUT genérica
     */
    static async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                const error = new Error(result.error || `HTTP ${response.status}`);
                error.response = { data: result };
                throw error;
            }
            
            return result;
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    }

    /**
     * Petición DELETE genérica
     */
    static async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    }

    // === Endpoints específicos ===

    // Health checks
    static async checkHealth() {
        return await this.get('/health/');
    }

    static async checkDatabase() {
        return await this.get('/health/db');
    }

    // Artículos
    static async getAllArticles() {
        return await this.get('/articles/');
    }

    static async getArticle(id) {
        return await this.get(`/articles/${id}`);
    }

    static async createArticle(articleData) {
        return await this.post('/articles/', articleData);
    }

    static async updateArticle(id, articleData) {
        return await this.put(`/articles/${id}`, articleData);
    }

    static async deleteArticle(id) {
        return await this.delete(`/articles/${id}`);
    }

    // Usuarios
    static async getAllUsers() {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async getUser(id) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async createUser(userData) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            const error = new Error(result.error || `HTTP ${response.status}`);
            error.response = { data: result };
            throw error;
        }
        
        return result;
    }

    static async updateUser(id, userData) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            const error = new Error(result.error || `HTTP ${response.status}`);
            error.response = { data: result };
            throw error;
        }
        
        return result;
    }

    static async deactivateUser(id) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async activateUser(id) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/users/${id}/activate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    // ============================================
    // REPORTES / NOTAS
    // ============================================
    
    static async getMyReports() {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/reports/my-reports`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async createReport(reportData) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/reports/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reportData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            const error = new Error(result.message || `HTTP ${response.status}`);
            error.response = { data: result };
            throw error;
        }
        
        return result;
    }

    static async getAllReports(status = null) {
        const token = localStorage.getItem('access_token');
        let url = `${API_BASE_URL}/reports/all`;
        if (status) url += `?status=${status}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    static async updateReport(id, updateData) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            const error = new Error(result.message || `HTTP ${response.status}`);
            error.response = { data: result };
            throw error;
        }
        
        return result;
    }

    static async deleteReport(id) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
}
