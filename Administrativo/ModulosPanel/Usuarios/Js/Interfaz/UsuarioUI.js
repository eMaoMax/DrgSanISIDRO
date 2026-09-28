import { UsuarioService } from '../Servicios/ServiciosUsuarios.js';

// Variable global para guardar la lista original obtenida del backend
let listaUsuariosGlobal = [];

// 1. CARGA INICIAL
document.addEventListener("DOMContentLoaded", async () => {
    // Carga paralela de usuarios y roles al iniciar la página
    await Promise.all([
        cargarUsuarios(),
        cargarRolesModal()
    ]);

    const modalUsuario = document.getElementById("modalUsuario");
    if (modalUsuario) {
        modalUsuario.addEventListener('show.bs.modal', cargarRolesModal);
    }

    // CONTROL DE VER / OCULTAR CONTRASEÑA
const btnTogglePassword = document.getElementById("btnTogglePassword");
const txtPassword = document.getElementById("txtPassword");
const iconTogglePassword = document.getElementById("iconTogglePassword");

if (btnTogglePassword && txtPassword && iconTogglePassword) {
    btnTogglePassword.addEventListener("click", () => {
        const esPassword = txtPassword.type === "password";
        
        // Cambiar el tipo de input
        txtPassword.type = esPassword ? "text" : "password";
        
        // Cambiar el icono
        iconTogglePassword.className = esPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill";
    });
}

    // --- BÚSQUEDA Y FILTRADO DINÁMICO ---
    const txtBuscar = document.getElementById("txtBuscarUsuario");
    const cboFiltroRol = document.getElementById("cboFiltroRol");

    if (txtBuscar) {
        txtBuscar.addEventListener("keyup", aplicarFiltros);
    }
    if (cboFiltroRol) {
        cboFiltroRol.addEventListener("change", aplicarFiltros);
    }

    // EVENTO GUARDAR / ACTUALIZAR USUARIO
    const formUsuario = document.getElementById("formUsuario");
    if (formUsuario) {
        formUsuario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const usuarioIdVal = document.getElementById("txtUsuarioID")?.value;
            const esEdicion = Boolean(usuarioIdVal && usuarioIdVal !== "" && usuarioIdVal !== "0");
            const claveInput = document.getElementById("txtPassword")?.value.trim() || "";

            const usuarioData = {
                UsuarioID: esEdicion ? parseInt(usuarioIdVal) : 0,
                Nombre: (document.getElementById("txtNombre")?.value || "").trim(),
                Apellido: (document.getElementById("txtApellido")?.value || "").trim(),
                Cedula: (document.getElementById("txtCedula")?.value || "").trim(),
                Telefono: (document.getElementById("txtTelefono")?.value || "").trim(),
                Email: (document.getElementById("txtEmail")?.value || "").trim(),
                PasswordHash: claveInput,
                RolID: parseInt(document.getElementById("cboRol")?.value),
                Estado: true
            };

            if (!usuarioData.RolID || isNaN(usuarioData.RolID)) {
                alert("Por favor seleccione un rol válido.");
                return;
            }

            try {
                if (esEdicion) {
                    await UsuarioService.actualizar(usuarioData);
                    alert("Usuario actualizado con éxito.");
                } else {
                    await UsuarioService.registrar(usuarioData);
                    alert("Usuario registrado con éxito.");
                }

                const modalEl = document.getElementById("modalUsuario");
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modalInstance) modalInstance.hide();

                prepararCrearUsuario();
                await cargarUsuarios();

            } catch (error) {
                console.error("Error al procesar el usuario:", error);
                alert(`Error al ${esEdicion ? 'actualizar' : 'registrar'} el usuario: ` + error.message);
            }
        });
    }
});

// 2. FUNCIÓN PARA OBTENER Y CARGAR USUARIOS
async function cargarUsuarios() {
    try {
        // CORRECCIÓN: Se guardan los usuarios en la variable global
        listaUsuariosGlobal = await UsuarioService.listar() || [];
        aplicarFiltros(); // Renderiza aplicando los filtros activos
    } catch (error) {
        console.error("Error al cargar la tabla de usuarios:", error);
    }
}

// 3. FUNCIÓN ÚNICA DE FILTRADO EN TIEMPO REAL
function aplicarFiltros() {
    const textoBusqueda = (document.getElementById("txtBuscarUsuario")?.value || "").toLowerCase().trim();
    const rolSeleccionado = document.getElementById("cboFiltroRol")?.value || "";

    const usuariosFiltrados = listaUsuariosGlobal.filter(u => {
        const nombre = (u.Nombre ?? u.nombre ?? '').trim();
        const apellido = (u.Apellido ?? u.apellido ?? '').trim();
        const nombreCompleto = `${nombre} ${apellido}`.toLowerCase();
        
        const cedula = (u.Cedula ?? u.cedula ?? '').toString().toLowerCase();
        const email = (u.Email ?? u.email ?? '').toLowerCase();
        const rolID = (u.RolID ?? u.rolID ?? u.RolId ?? u.rolId ?? '').toString();

        // Evalúa concordancia por Nombre completo, Cédula o Correo
        const coincideTexto = textoBusqueda === "" || 
                               nombreCompleto.includes(textoBusqueda) || 
                               cedula.includes(textoBusqueda) || 
                               email.includes(textoBusqueda);

        const coincideRol = rolSeleccionado === "" || rolID === rolSeleccionado;

        return coincideTexto && coincideRol;
    });

    renderizarTabla(usuariosFiltrados);
}

// 4. FUNCIÓN PARA CARGAR ROLES
async function cargarRolesModal() {
    const selectModal = document.getElementById("cboRol");
    const selectFiltro = document.getElementById("cboFiltroRol"); 

    try {
        // CORRECCIÓN: Usar UsuarioService en lugar de fetch hardcodeado
        const roles = await UsuarioService.listarRoles();

        if (!roles || roles.length === 0) {
            if (selectModal) selectModal.innerHTML = '<option value="">No hay roles</option>';
            if (selectFiltro) selectFiltro.innerHTML = '<option value="">Todos los Roles</option>';
            return;
        }

        let opcionesModal = '<option value="">Seleccione un rol...</option>';
        let opcionesFiltro = '<option value="">Todos los Roles</option>';

        roles.forEach(rol => {
            const id = rol.RolID ?? rol.rolID;
            const nombre = rol.NombreRol ?? rol.nombreRol;

            opcionesModal += `<option value="${id}">${nombre}</option>`;
            opcionesFiltro += `<option value="${id}">${nombre}</option>`;
        });

        if (selectModal) selectModal.innerHTML = opcionesModal;
        if (selectFiltro) selectFiltro.innerHTML = opcionesFiltro;

    } catch (error) {
        console.error("Error crítico al obtener roles:", error);
        if (selectModal) selectModal.innerHTML = '<option value="">Error al cargar roles</option>';
        if (selectFiltro) selectFiltro.innerHTML = '<option value="">Error al cargar roles</option>';
    }
}

// 5. RENDERIZADO DE TABLA
function renderizarTabla(usuarios) {
    const tbody = document.getElementById("tablaUsuariosBody");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No se encontraron usuarios registrados</td></tr>`;
        return;
    }

    usuarios.forEach(u => {
        const id = u.UsuarioID ?? u.usuarioID;
        const nombre = u.Nombre ?? u.nombre;
        const apellido = u.Apellido ?? u.apellido;
        const cedula = u.Cedula ?? u.cedula;
        const telefono = u.Telefono ?? u.telefono;
        const email = u.Email ?? u.email;
        const nombreRol = u.NombreRol ?? u.nombreRol;
        const estado = u.Estado ?? u.estado;

        const estadoBadge = estado 
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">
                 <i class="bi bi-check-circle-fill me-1"></i>Activo
               </span>`
            : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">
                 <i class="bi bi-x-circle-fill me-1"></i>Inactivo
               </span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">${id}</td>
            <td>${nombre} ${apellido}</td>
            <td>${cedula}</td>
            <td>${telefono || '-'}</td>
            <td>${email}</td>
            <td>
                <span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill">
                    ${nombreRol || 'Sin Rol'}
                </span>
            </td>
            <td class="text-center">${estadoBadge}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="prepararEditarUsuario(${id})" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(${id})" title="${estado ? 'Desactivar' : 'Eliminar'}">
                    <i class="bi ${estado ? 'bi-person-x-fill' : 'bi-trash-fill'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 6. FUNCIONES GLOBALES
window.prepararCrearUsuario = function() {
    const form = document.getElementById("formUsuario");
    if (form) form.reset();
    
    const txtId = document.getElementById("txtUsuarioID");
    if (txtId) txtId.value = "0";

    const divPassword = document.getElementById("divPassword");
    const passInput = document.getElementById("txtPassword");
    if (divPassword) divPassword.classList.remove("d-none");
    if (passInput) passInput.required = true;

    const tituloModal = document.getElementById("modalUsuarioLabel");
    if (tituloModal) tituloModal.textContent = "Registrar Nuevo Usuario";

    cargarRolesModal(); 

    if (txtPassword) {
    txtPassword.type = "password";
}
if (iconTogglePassword) {
    iconTogglePassword.className = "bi bi-eye-fill";
}
};

window.prepararEditarUsuario = async function(id) {
    try {
        const usuario = await UsuarioService.consultarPorId(id);
        if (!usuario) {
            alert("No se encontraron los datos del usuario.");
            return;
        }

        await cargarRolesModal();

        const txtId = document.getElementById("txtUsuarioID");
        if (txtId) txtId.value = usuario.UsuarioID ?? usuario.usuarioID ?? id;

        document.getElementById("txtNombre").value = usuario.Nombre ?? usuario.nombre ?? "";
        document.getElementById("txtApellido").value = usuario.Apellido ?? usuario.apellido ?? "";
        document.getElementById("txtCedula").value = usuario.Cedula ?? usuario.cedula ?? "";
        document.getElementById("txtTelefono").value = usuario.Telefono ?? usuario.telefono ?? "";
        document.getElementById("txtEmail").value = usuario.Email ?? usuario.email ?? "";

        const cboRol = document.getElementById("cboRol");
        if (cboRol) cboRol.value = usuario.RolID ?? usuario.rolID ?? "";

        const divPassword = document.getElementById("divPassword");
        const passInput = document.getElementById("txtPassword");
        if (divPassword) divPassword.classList.add("d-none");
        if (passInput) {
            passInput.value = "";
            passInput.required = false;
        }

        const tituloModal = document.getElementById("modalUsuarioLabel");
        if (tituloModal) tituloModal.textContent = "Editar Usuario";

        const modalEl = document.getElementById("modalUsuario");
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
        }

    } catch (error) {
        console.error("Error al obtener usuario para edición:", error);
        alert("Error al cargar los datos del usuario: " + error.message);
    }
};

window.eliminarUsuario = async function(id) {
    if (confirm("¿Está seguro de cambiar el estado de este usuario?")) {
        try {
            await UsuarioService.eliminar(id);
            await cargarUsuarios();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    }
};