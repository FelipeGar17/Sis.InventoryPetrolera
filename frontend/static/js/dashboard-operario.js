/**
 * Dashboard del Operario
 * Gestión de inventario en modo solo lectura y reportes
 */

let inventoryTable;
let myReportsTable;
let currentArticleForReport = null;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (!token || role !== 'USER') {
        window.location.href = '/login';
        return;
    }
    
    // Cargar información del usuario
    loadUserInfo();
    
    // Inicializar tabla de inventario
    initInventoryTable();
});

/**
 * Carga la información del usuario en el sidebar
 */
function loadUserInfo() {
    const fullName = localStorage.getItem('user_full_name') || 'Operario';
    const username = localStorage.getItem('username') || 'user';
    
    document.getElementById('user-name').textContent = fullName;
    document.getElementById('user-avatar').textContent = fullName.charAt(0).toUpperCase();
}

/**
 * Inicializa el DataTable de inventario (solo lectura)
 */
function initInventoryTable() {
    const token = localStorage.getItem('access_token');
    
    inventoryTable = $('#inventoryTable').DataTable({
        ajax: {
            url: '/api/articles/',
            dataSrc: function(json) {
                // Filtrar productos dados de baja
                return json.filter(article => article.status !== 'BAJA');
            },
            headers: {
                'Authorization': 'Bearer ' + token
            },
            error: function(xhr, error, thrown) {
                console.error('Error al cargar inventario:', xhr.responseText);
                if (xhr.status === 401 || xhr.status === 403) {
                    alert('Sesión expirada. Por favor inicie sesión nuevamente.');
                    logout();
                }
            }
        },
        columns: [
            { data: 'code' },
            { data: 'name' },
            { 
                data: 'tipo',
                render: function(data) {
                    return data || '<span style="color: #999;">N/A</span>';
                }
            },
            { data: 'category' },
            { 
                data: 'status',
                render: function(data) {
                    const badges = {
                        'FUNCIONANDO': '<span class="badge-funcionando">Funcionando</span>',
                        'MANTENIMIENTO': '<span class="badge-mantenimiento">Mantenimiento</span>',
                        'REVISION': '<span class="badge-revision">En Revisión</span>',
                        'BAJA': '<span class="badge-baja">Dado de Baja</span>'
                    };
                    return badges[data] || data;
                }
            },
            { 
                data: 'stock_current',
                render: function(data, type, row) {
                    // Si es maquinaria, no mostrar stock
                    if (row.tipo && (row.tipo.toLowerCase().includes('maquinaria') || row.tipo.toLowerCase().includes('electrica'))) {
                        return '<span style="color: #999;">-</span>';
                    }
                    return data !== null ? data : '<span style="color: #999;">0</span>';
                }
            },
            { data: 'location' },
            { 
                data: 'acquisition_date',
                render: function(data) {
                    if (!data) return '<span style="color: #999;">N/A</span>';
                    // Formatear fecha a DD/MM/YYYY
                    const date = new Date(data);
                    return date.toLocaleDateString('es-ES');
                }
            },
            {
                data: null,
                orderable: false,
                render: function(data, type, row) {
                    // Escapar HTML para evitar XSS y errores de sintaxis
                    const safeCode = String(row.code || '').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
                    const safeName = String(row.name || '').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
                    
                    return `
                        <button class="btn-action btn-report" 
                                data-id="${row.id}" 
                                data-code="${safeCode}" 
                                data-name="${safeName}"
                                onclick="openReportModalSafe(this)" 
                                title="Reportar Problema">
                            📝
                        </button>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 25,
        order: [[0, 'asc']],
        responsive: true
    });
}

/**
 * Inicializa el DataTable de reportes del operario
 */
function initMyReportsTable() {
    if (myReportsTable) {
        myReportsTable.ajax.reload();
        return;
    }
    
    const token = localStorage.getItem('access_token');
    
    myReportsTable = $('#myReportsTable').DataTable({
        ajax: {
            url: '/api/reports/my-reports',
            dataSrc: '',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            error: function(xhr, error, thrown) {
                console.error('Error al cargar reportes:', xhr.responseText);
                if (xhr.status === 401 || xhr.status === 403) {
                    alert('Sesión expirada. Por favor inicie sesión nuevamente.');
                    logout();
                }
            }
        },
        columns: [
            { 
                data: 'created_at',
                render: function(data) {
                    const date = new Date(data);
                    return date.toLocaleString('es-ES');
                }
            },
            { 
                data: 'article',
                render: function(data) {
                    return `<strong>${data.code}</strong> - ${data.name}`;
                }
            },
            { 
                data: 'report_type',
                render: function(data) {
                    const types = {
                        'FALLA': '🔴 Falla',
                        'MANTENIMIENTO': '🟡 Mantenimiento',
                        'OBSERVACION': '🔵 Observación',
                        'SOLICITUD': '🟢 Solicitud'
                    };
                    return types[data] || data;
                }
            },
            { 
                data: 'message',
                render: function(data) {
                    // Limitar mensaje a 100 caracteres
                    return data.length > 100 ? data.substring(0, 100) + '...' : data;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const badges = {
                        'PENDIENTE': '<span class="badge-mantenimiento">Pendiente</span>',
                        'EN_REVISION': '<span class="badge-revision">En Revisión</span>',
                        'RESUELTO': '<span class="badge-funcionando">Resuelto</span>',
                        'CERRADO': '<span style="background: #6b7280; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Cerrado</span>'
                    };
                    return badges[data] || data;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 25,
        order: [[0, 'desc']],
        responsive: true
    });
}

/**
 * Navega entre secciones
 */
function navigateTo(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remover active de todos los menús
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    if (section === 'inventario') {
        document.getElementById('inventario-section').style.display = 'block';
        document.querySelector('[onclick*="inventario"]').classList.add('active');
    } else if (section === 'mis-reportes') {
        document.getElementById('mis-reportes-section').style.display = 'block';
        document.querySelector('[onclick*="mis-reportes"]').classList.add('active');
        initMyReportsTable();
    }
}

/**
 * Abre el modal para crear un reporte (versión segura con data attributes)
 */
function openReportModalSafe(button) {
    const articleId = parseInt(button.getAttribute('data-id'));
    const code = button.getAttribute('data-code');
    const name = button.getAttribute('data-name');
    
    // Decodificar HTML entities
    const decodedCode = code.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
    const decodedName = name.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
    
    openReportModal(articleId, decodedCode, decodedName);
}

/**
 * Abre el modal para crear un reporte
 */
function openReportModal(articleId, code, name) {
    currentArticleForReport = articleId;
    
    // Limpiar formulario
    document.getElementById('reportForm').reset();
    
    // Setear valores
    document.getElementById('articleId').value = articleId;
    document.getElementById('articleInfo').value = `${code} - ${name}`;
    
    // Mostrar modal
    document.getElementById('reportModal').style.display = 'flex';
}

/**
 * Cierra el modal de reportes
 */
function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    currentArticleForReport = null;
}

/**
 * Guarda un nuevo reporte
 */
async function saveReport(event) {
    event.preventDefault();
    
    const articleId = document.getElementById('articleId').value;
    const reportType = document.getElementById('reportType').value;
    const message = document.getElementById('reportMessage').value;
    
    if (!articleId || !reportType || !message.trim()) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    try {
        const reportData = {
            article_id: parseInt(articleId),
            report_type: reportType,
            message: message.trim()
        };
        
        await API.createReport(reportData);
        
        alert('✅ Reporte enviado correctamente. El administrador será notificado.');
        closeReportModal();
        
        // Si estamos en la sección de reportes, recargar tabla
        if (myReportsTable) {
            myReportsTable.ajax.reload();
        }
        
    } catch (error) {
        console.error('Error al crear reporte:', error);
        alert('❌ Error al enviar el reporte: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Cierra sesión
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_full_name');
    window.location.href = '/login';
}

// Cerrar modal con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeReportModal();
    }
});
