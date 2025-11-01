/**
 * Dashboard Admin - Main functionality
 */

let productsTable;

// Inicializar cuando cargue la pagina
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticacion
    if (!Auth.checkAuth()) return;
    
    // Verificar que sea admin
    if (!Auth.isAdmin()) {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = '/login';
        return;
    }

    // Cargar info del usuario
    loadUserInfo();
    
    // Inicializar DataTable
    initProductsTable();
});

/**
 * Cargar informacion del usuario en el sidebar
 */
function loadUserInfo() {
    const user = Auth.getCurrentUser();
    if (user.full_name) {
        document.getElementById('user-name').textContent = user.full_name;
    }
    
    // Actualizar avatar con primera letra
    const avatar = document.querySelector('.user-avatar');
    if (avatar && user.full_name) {
        avatar.textContent = user.full_name.charAt(0).toUpperCase();
    }
}

/**
 * Inicializar DataTable de productos
 */
function initProductsTable() {
    productsTable = $('#productsTable').DataTable({
        ajax: {
            url: '/api/articles/',
            dataSrc: ''
        },
        columns: [
            { data: 'code' },
            { data: 'name' },
            { 
                data: 'tipo',
                render: function(data) {
                    return data || '-';
                }
            },
            { 
                data: 'category',
                render: function(data) {
                    return data || '-';
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const badges = {
                        'FUNCIONANDO': '<span class="badge badge-funcionando">Funcionando</span>',
                        'MANTENIMIENTO': '<span class="badge badge-mantenimiento">Mantenimiento</span>',
                        'REVISION': '<span class="badge badge-revision">Revision</span>',
                        'BAJA': '<span class="badge badge-baja">Dado de Baja</span>'
                    };
                    return badges[data] || data;
                }
            },
            { 
                data: 'stock_current',
                render: function(data, type, row) {
                    // Si es maquinaria (sin stock), mostrar N/A
                    if (!row.tipo) return '-';
                    const tipoLower = row.tipo.toLowerCase();
                    if (tipoLower.includes('maquinaria') || tipoLower.includes('electrica')) {
                        return '<span class="text-gray-500 italic">Unico</span>';
                    }
                    // Si es herramienta, mostrar stock
                    if (!data && data !== 0) return '0 ' + (row.unit || 'unidad');
                    return data + ' ' + (row.unit || 'unidad');
                }
            },
            { 
                data: 'location',
                render: function(data) {
                    return data || '-';
                }
            },
            { 
                data: 'acquisition_date',
                render: function(data) {
                    if (!data) return '-';
                    return new Date(data).toLocaleDateString('es-ES');
                }
            },
            {
                data: null,
                orderable: false,
                className: 'text-center',
                render: function(data, type, row) {
                    return `
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editProduct(${row.id})" title="Editar">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                </svg>
                            </button>
                            <button class="action-btn delete" onclick="deleteProduct(${row.id})" title="Eliminar">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 10,
        responsive: true,
        order: [[0, 'asc']]
    });
}

/**
 * Navegacion del sidebar
 */
function navigateTo(section) {
    // Remover active de todos
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Activar el seleccionado
    event.target.closest('.menu-item').classList.add('active');
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Mostrar la seccion seleccionada
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    
    // Inicializar tabla de usuarios si navegamos a operarios
    if (section === 'operarios') {
        setTimeout(() => {
            initUsersTable();
        }, 100);
    }
    
    // Inicializar tabla de reportes si navegamos a notas
    if (section === 'notas') {
        setTimeout(() => {
            initReportsTable();
        }, 100);
    }
}

/**
 * Abrir modal de crear producto
 */
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    document.getElementById('submitBtnText').textContent = 'Guardar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('code').disabled = false;
    document.getElementById('codeHint').textContent = '';
    document.getElementById('productModal').classList.add('show');
    
    // Ocultar campos de stock por defecto
    hideStockFields();
}

/**
 * Editar producto
 */
async function editProduct(id) {
    try {
        const product = await API.getArticle(id);
        
        // Llenar formulario
        document.getElementById('productId').value = product.id;
        document.getElementById('code').value = product.code;
        document.getElementById('code').disabled = true; // No se puede cambiar el código
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('tipo').value = product.tipo || '';
        document.getElementById('category').value = product.category || '';
        document.getElementById('location').value = product.location || '';
        document.getElementById('unit').value = product.unit || '';
        document.getElementById('stock_min').value = product.stock_min || 0;
        document.getElementById('stock_current').value = product.stock_current || 0;
        document.getElementById('status').value = product.status;
        document.getElementById('acquisition_date').value = product.acquisition_date || '';
        document.getElementById('observations').value = product.observations || '';
        
        // Ocultar hint del código cuando está en modo edición
        document.getElementById('codeHint').textContent = '🔒 El código no puede modificarse';
        document.getElementById('codeHint').className = 'hint-text';
        
        // Mostrar u ocultar campos de stock según el tipo
        handleTipoChange();
        
        // Cambiar título del modal
        document.getElementById('modalTitle').textContent = 'Editar Producto';
        document.getElementById('submitBtnText').textContent = 'Actualizar Producto';
        document.getElementById('productModal').classList.add('show');
        
    } catch (error) {
        alert('Error al cargar el producto');
        console.error(error);
    }
}

/**
 * Cerrar modal
 */
function closeProductModal() {
    document.getElementById('productModal').classList.remove('show');
    document.getElementById('productForm').reset();
    document.querySelectorAll('.suggestions-list').forEach(list => {
        list.classList.remove('show');
        list.innerHTML = '';
    });
}

/**
 * Guardar producto (crear o editar)
 */
async function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const formData = {
        code: document.getElementById('code').value.trim(),
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        tipo: document.getElementById('tipo').value,
        category: document.getElementById('category').value.trim(),
        location: document.getElementById('location').value.trim(),
        unit: document.getElementById('unit').value.trim(),
        stock_min: parseInt(document.getElementById('stock_min').value) || 0,
        stock_current: parseInt(document.getElementById('stock_current').value) || 0,
        status: document.getElementById('status').value,
        acquisition_date: document.getElementById('acquisition_date').value || null,
        observations: document.getElementById('observations').value.trim()
    };
    
    try {
        if (productId) {
            // Actualizar
            await API.updateArticle(productId, formData);
            alert('Producto actualizado correctamente');
        } else {
            // Crear
            await API.createArticle(formData);
            alert('Producto creado correctamente');
        }
        
        closeProductModal();
        productsTable.ajax.reload();
    } catch (error) {
        const errorMsg = error.response?.data?.error || 'Error al guardar el producto';
        alert(errorMsg);
        console.error(error);
    }
}

/**
 * Manejar cambio de tipo de equipo
 */
function handleTipoChange() {
    const tipo = document.getElementById('tipo').value;
    const tipoLower = tipo.toLowerCase();
    
    // Si es maquinaria, ocultar campos de stock
    if (tipoLower.includes('maquinaria') || tipoLower.includes('electrica')) {
        hideStockFields();
    } else {
        // Si es herramienta, mostrar campos de stock
        showStockFields();
    }
}

/**
 * Mostrar campos de stock
 */
function showStockFields() {
    document.getElementById('stockFields').style.display = 'block';
    document.getElementById('stockMinField').style.display = 'block';
    document.getElementById('stockCurrentField').style.display = 'block';
    document.getElementById('emptySpace').style.display = 'none';
}

/**
 * Ocultar campos de stock
 */
function hideStockFields() {
    document.getElementById('stockFields').style.display = 'none';
    document.getElementById('stockMinField').style.display = 'none';
    document.getElementById('stockCurrentField').style.display = 'none';
    document.getElementById('emptySpace').style.display = 'block';
    
    // Resetear valores
    document.getElementById('unit').value = 'unidad';
    document.getElementById('stock_min').value = 0;
    document.getElementById('stock_current').value = 0;
}

/**
 * Verificar disponibilidad del código
 */
let codeCheckTimeout;
async function checkCodeAvailability(code) {
    const codeHint = document.getElementById('codeHint');
    
    if (!code || code.length < 3) {
        codeHint.textContent = '';
        return;
    }
    
    // Normalizar a mayúsculas
    const normalizedCode = code.toUpperCase();
    document.getElementById('code').value = normalizedCode;
    
    // Debounce
    clearTimeout(codeCheckTimeout);
    codeCheckTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/articles/check-code/${normalizedCode}`);
            const data = await response.json();
            
            if (data.exists) {
                codeHint.textContent = '❌ Este código ya existe';
                codeHint.className = 'hint-text error';
            } else {
                codeHint.textContent = '✓ Código disponible';
                codeHint.className = 'hint-text success';
            }
        } catch (error) {
            console.error('Error al verificar código:', error);
        }
    }, 500);
}

/**
 * Manejar autocompletado de campos
 */
let autocompleteTimeout;
async function handleAutocomplete(input, field) {
    const query = input.value.trim();
    const suggestionsDiv = document.getElementById(`${field}-suggestions`);
    
    // Si el texto es muy corto, ocultar sugerencias
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        suggestionsDiv.innerHTML = '';
        return;
    }
    
    // Debounce
    clearTimeout(autocompleteTimeout);
    autocompleteTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `/api/articles/suggestions?field=${field}&query=${encodeURIComponent(query)}`
            );
            const suggestions = await response.json();
            
            // Limpiar sugerencias anteriores
            suggestionsDiv.innerHTML = '';
            
            if (suggestions.length === 0) {
                suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">No se encontraron sugerencias</div>';
            } else {
                suggestions.forEach(suggestion => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = suggestion;
                    div.onclick = () => selectSuggestion(input, suggestion, suggestionsDiv);
                    suggestionsDiv.appendChild(div);
                });
            }
            
            suggestionsDiv.classList.add('show');
        } catch (error) {
            console.error('Error al obtener sugerencias:', error);
        }
    }, 300);
}

/**
 * Seleccionar una sugerencia
 */
function selectSuggestion(input, value, suggestionsDiv) {
    input.value = value;
    suggestionsDiv.classList.remove('show');
    suggestionsDiv.innerHTML = '';
}

// Cerrar sugerencias al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        document.querySelectorAll('.suggestions-list').forEach(list => {
            list.classList.remove('show');
        });
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

/**
 * Eliminar producto
 */
async function deleteProduct(id) {
    if (!confirm('¿Estas seguro de eliminar este producto?')) return;
    
    try {
        await API.deleteArticle(id);
        alert('Producto eliminado correctamente');
        productsTable.ajax.reload();
    } catch (error) {
        alert('Error al eliminar producto');
        console.error(error);
    }
}

/**
 * Cerrar sesion
 */
function logout() {
    Auth.logout();
}
