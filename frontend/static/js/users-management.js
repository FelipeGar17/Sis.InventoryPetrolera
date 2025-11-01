/**
 * Gestión de Usuarios - Funcionalidad separada
 */

let usersTable;

/**
 * Inicializar DataTable de usuarios cuando se carga la sección
 */
function initUsersTable() {
    // Si ya existe, destruirlo primero
    if (usersTable) {
        usersTable.destroy();
    }
    
    usersTable = $('#usersTable').DataTable({
        ajax: {
            url: '/api/users/',
            dataSrc: '',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            error: function(xhr, error, thrown) {
                console.error('Error al cargar usuarios:', xhr.responseText);
                alert('Error al cargar usuarios: ' + (xhr.responseJSON?.error || 'Error de conexión'));
            }
        },
        columns: [
            { data: 'username' },
            { data: 'full_name' },
            { data: 'email' },
            { 
                data: 'role',
                render: function(data) {
                    const badges = {
                        'ADMIN': '<span class="badge badge-admin">Administrador</span>',
                        'USER': '<span class="badge badge-user">Operario</span>'
                    };
                    return badges[data] || data;
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const badges = {
                        'ACTIVO': '<span class="badge badge-funcionando">Activo</span>',
                        'INACTIVO': '<span class="badge badge-baja">Inactivo</span>'
                    };
                    return badges[data] || data;
                }
            },
            { 
                data: 'last_login',
                render: function(data) {
                    if (!data) return '<span style="color: #999;">Nunca</span>';
                    const date = new Date(data);
                    return date.toLocaleString('es-ES');
                }
            },
            {
                data: null,
                orderable: false,
                className: 'text-center',
                render: function(data, type, row) {
                    // No permitir editar/desactivar al admin principal (id=1)
                    if (row.id === 1) {
                        return `
                            <div class="action-buttons">
                                <span style="color: #999; font-size: 0.875rem;">🔒 Protegido</span>
                            </div>
                        `;
                    }
                    
                    const activateBtn = row.status === 'INACTIVO' ? `
                        <button class="action-btn" style="background: #10b981;" 
                                onclick="activateUser(${row.id})" title="Activar">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                            </svg>
                        </button>
                    ` : '';
                    
                    return `
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editUser(${row.id})" title="Editar">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                </svg>
                            </button>
                            ${activateBtn}
                            ${row.status === 'ACTIVO' ? `
                            <button class="action-btn delete" onclick="deactivateUser(${row.id})" title="Desactivar">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                </svg>
                            </button>
                            ` : ''}
                        </div>
                    `;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        pageLength: 10,
        order: [[0, 'asc']]
    });
}

/**
 * Abrir modal de crear usuario
 */
function openCreateUserModal() {
    document.getElementById('userModalTitle').textContent = 'Nuevo Operario';
    document.getElementById('userSubmitBtnText').textContent = 'Crear Usuario';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('username').disabled = false;
    document.getElementById('userPassword').required = true;
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('usernameHint').textContent = '';
    document.getElementById('emailHint').textContent = '';
    
    // Mostrar campo de rol (aunque solo tenga una opción)
    document.getElementById('userRole').closest('.form-group').style.display = 'block';
    document.getElementById('userRole').value = 'USER';
    
    document.getElementById('userModal').classList.add('show');
}

/**
 * Editar usuario
 */
async function editUser(id) {
    try {
        const user = await API.getUser(id);
        
        // Llenar formulario
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('username').disabled = true; // No se puede cambiar el username
        document.getElementById('userEmail').value = user.email;
        document.getElementById('fullName').value = user.full_name;
        document.getElementById('userPassword').value = '';
        document.getElementById('userPassword').required = false;
        document.getElementById('passwordRequired').style.display = 'none';
        
        // Ocultar campo de rol (no se puede cambiar)
        document.getElementById('userRole').value = user.role;
        document.getElementById('userRole').closest('.form-group').style.display = 'none';
        
        // Hint del username
        document.getElementById('usernameHint').textContent = '🔒 El nombre de usuario no puede modificarse';
        document.getElementById('usernameHint').className = 'hint-text';
        
        // Cambiar título del modal
        document.getElementById('userModalTitle').textContent = 'Editar Usuario';
        document.getElementById('userSubmitBtnText').textContent = 'Actualizar Usuario';
        document.getElementById('userModal').classList.add('show');
        
    } catch (error) {
        alert('Error al cargar el usuario');
        console.error(error);
    }
}

/**
 * Cerrar modal de usuarios
 */
function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    document.getElementById('userForm').reset();
}

/**
 * Guardar usuario (crear o editar)
 */
async function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const formData = {
        username: document.getElementById('username').value.trim().toLowerCase(),
        email: document.getElementById('userEmail').value.trim().toLowerCase(),
        full_name: document.getElementById('fullName').value.trim(),
        role: document.getElementById('userRole').value
    };
    
    // Agregar password solo si se proporcionó
    const password = document.getElementById('userPassword').value;
    if (password) {
        formData.password = password;
    }
    
    try {
        if (userId) {
            // Actualizar
            await API.updateUser(userId, formData);
            alert('Usuario actualizado correctamente');
        } else {
            // Crear (password es requerido)
            if (!password) {
                alert('La contraseña es requerida para crear un usuario');
                return;
            }
            await API.createUser(formData);
            alert('Usuario creado correctamente');
        }
        
        closeUserModal();
        usersTable.ajax.reload();
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Error al guardar el usuario';
        alert(errorMsg);
        console.error(error);
    }
}

/**
 * Desactivar usuario
 */
async function deactivateUser(id) {
    if (!confirm('¿Está seguro de desactivar este usuario?\n\nEl usuario no podrá iniciar sesión hasta que sea reactivado.')) return;
    
    try {
        await API.deactivateUser(id);
        alert('Usuario desactivado correctamente');
        usersTable.ajax.reload();
    } catch (error) {
        alert('Error al desactivar usuario');
        console.error(error);
    }
}

/**
 * Activar usuario
 */
async function activateUser(id) {
    if (!confirm('¿Desea reactivar este usuario?')) return;
    
    try {
        await API.activateUser(id);
        alert('Usuario activado correctamente');
        usersTable.ajax.reload();
    } catch (error) {
        alert('Error al activar usuario');
        console.error(error);
    }
}
