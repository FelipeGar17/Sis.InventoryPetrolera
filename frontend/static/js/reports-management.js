/**
 * Gestión de Reportes (Admin)
 * Admin visualiza reportes de operarios y gestiona su estado
 */

let reportsTable;

/**
 * Inicializa el DataTable de reportes para el admin
 */
function initReportsTable() {
    if (reportsTable) {
        reportsTable.ajax.reload();
        return;
    }
    
    const token = localStorage.getItem('access_token');
    
    reportsTable = $('#reportsTable').DataTable({
        ajax: {
            url: 'http://localhost:5000/api/reports/all',
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
                    return date.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            },
            { 
                data: 'user',
                render: function(data) {
                    return `<strong>${data.full_name}</strong><br><small style="color: #666;">@${data.username}</small>`;
                }
            },
            { 
                data: 'article',
                render: function(data) {
                    return `<strong>${data.code}</strong><br><small>${data.name}</small>`;
                }
            },
            { 
                data: 'report_type',
                render: function(data) {
                    const types = {
                        'FALLA': '<span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🔴 FALLA</span>',
                        'MANTENIMIENTO': '<span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🟡 MANT.</span>',
                        'OBSERVACION': '<span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🔵 OBS.</span>',
                        'SOLICITUD': '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">🟢 SOL.</span>'
                    };
                    return types[data] || data;
                }
            },
            { 
                data: 'message',
                render: function(data) {
                    // Limitar mensaje a 80 caracteres
                    if (data.length > 80) {
                        return '<span title="' + data + '">' + data.substring(0, 80) + '...</span>';
                    }
                    return data;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const badges = {
                        'PENDIENTE': '<span class="badge-mantenimiento">Pendiente</span>',
                        'EN_REVISION': '<span class="badge-revision">En Revisión</span>',
                        'RESUELTO': '<span class="badge-funcionando">Resuelto</span>',
                        'CERRADO': '<span style="background: #6b7280; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">Cerrado</span>'
                    };
                    return badges[data] || data;
                }
            },
            {
                data: null,
                orderable: false,
                render: function(data, type, row) {
                    return `
                        <button class="btn-action" onclick="openManageReportModal(${row.id})" title="Gestionar Reporte">
                            🔧
                        </button>
                        <button class="btn-action" onclick="deleteReport(${row.id})" title="Eliminar Reporte" style="background: #dc2626;">
                            🗑️
                        </button>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 25,
        order: [[0, 'desc']], // Ordenar por fecha descendente (más recientes primero)
        responsive: true
    });
}

/**
 * Filtra los reportes por estado
 */
function filterReportsByStatus() {
    const status = document.getElementById('reportStatusFilter').value;
    
    const token = localStorage.getItem('access_token');
    let url = 'http://localhost:5000/api/reports/all';
    if (status) url += `?status=${status}`;
    
    // Actualizar la URL del ajax y recargar
    reportsTable.ajax.url(url).load();
}

/**
 * Abre el modal para gestionar un reporte
 */
async function openManageReportModal(reportId) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://localhost:5000/api/reports/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const reports = await response.json();
        const report = reports.find(r => r.id === reportId);
        
        if (!report) {
            alert('Reporte no encontrado');
            return;
        }
        
        // Llenar formulario con datos del reporte
        document.getElementById('reportId').value = report.id;
        document.getElementById('reportedArticleInfo').value = `${report.article.code} - ${report.article.name}`;
        document.getElementById('reportedByInfo').value = report.user.full_name;
        
        const date = new Date(report.created_at);
        document.getElementById('reportDateInfo').value = date.toLocaleString('es-ES');
        
        const types = {
            'FALLA': '🔴 Falla / Avería',
            'MANTENIMIENTO': '🟡 Requiere Mantenimiento',
            'OBSERVACION': '🔵 Observación General',
            'SOLICITUD': '🟢 Solicitud de Revisión'
        };
        document.getElementById('reportTypeInfo').value = types[report.report_type] || report.report_type;
        
        document.getElementById('reportMessageInfo').value = report.message;
        document.getElementById('reportStatus').value = report.status;
        document.getElementById('adminResponse').value = report.admin_response || '';
        
        // Mostrar modal
        document.getElementById('manageReportModal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error al cargar reporte:', error);
        alert('Error al cargar el reporte: ' + error.message);
    }
}

/**
 * Cierra el modal de gestión de reportes
 */
function closeManageReportModal() {
    document.getElementById('manageReportModal').style.display = 'none';
    document.getElementById('manageReportForm').reset();
}

/**
 * Actualiza el estado y respuesta de un reporte
 */
async function updateReportStatus(event) {
    event.preventDefault();
    
    const reportId = document.getElementById('reportId').value;
    const status = document.getElementById('reportStatus').value;
    const adminResponse = document.getElementById('adminResponse').value;
    
    try {
        const updateData = {
            status: status
        };
        
        // Solo agregar admin_response si tiene contenido
        if (adminResponse.trim()) {
            updateData.admin_response = adminResponse.trim();
        }
        
        await API.updateReport(reportId, updateData);
        
        alert('✅ Reporte actualizado correctamente');
        closeManageReportModal();
        
        // Recargar tabla
        if (reportsTable) {
            reportsTable.ajax.reload();
        }
        
    } catch (error) {
        console.error('Error al actualizar reporte:', error);
        alert('❌ Error al actualizar el reporte: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Elimina un reporte (eliminación física)
 */
async function deleteReport(reportId) {
    if (!confirm('¿Está seguro de eliminar este reporte? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        await API.deleteReport(reportId);
        
        alert('✅ Reporte eliminado correctamente');
        
        // Recargar tabla
        if (reportsTable) {
            reportsTable.ajax.reload();
        }
        
    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        alert('❌ Error al eliminar el reporte: ' + (error.message || 'Error desconocido'));
    }
}
