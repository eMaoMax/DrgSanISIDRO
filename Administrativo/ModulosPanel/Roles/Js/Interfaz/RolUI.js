import { RolService } from '../Servicios/ServiciosRoles.js';

let listaRolesGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarRoles();

    const txtBuscar = document.getElementById("txtBuscarRol");
    if (txtBuscar) txtBuscar.addEventListener("keyup", aplicarFiltros);

    const formRol = document.getElementById("formRol");
    if (formRol) {
        formRol.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Mapeo exacto de la clase C# Rol (RolID, NombreRol)
            const rolData = {
                RolID: 0,
                NombreRol: document.getElementById("txtNombreRol")?.value.trim()
            };

            try {
                await RolService.registrar(rolData);
                alert("Rol registrado con éxito.");

                const modalEl = document.getElementById("modalRol");
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modalInstance) modalInstance.hide();

                prepararCrearRol();
                await cargarRoles();
            } catch (error) {
                console.error("Error al guardar rol:", error);
                alert("Error al registrar el rol: " + error.message);
            }
        });
    }
});

async function cargarRoles() {
    try {
        listaRolesGlobal = await RolService.listar() || [];
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar roles:", error);
    }
}

// 1. Filtrado solo por nombre
function aplicarFiltros() {
    const busqueda = (document.getElementById("txtBuscarRol")?.value || "").toLowerCase().trim();

    const filtrados = listaRolesGlobal.filter(r => {
        const nombre = (r.NombreRol ?? r.nombreRol ?? '').toLowerCase();
        return busqueda === "" || nombre.includes(busqueda);
    });

    renderizarTabla(filtrados);
}

// 2. Renderizado de tabla ajustado (3 columnas en colspan si está vacía)
function renderizarTabla(roles) {
    const tbody = document.getElementById("tablaRolesBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!roles || roles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-muted">No se encontraron roles</td></tr>`;
        return;
    }

    roles.forEach(r => {
        const id = r.RolID ?? r.rolID;
        const nombre = r.NombreRol ?? r.nombreRol;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">${id}</td>
            <td class="fw-semibold">${nombre}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarRol(${id})" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.prepararCrearRol = function() {
    const form = document.getElementById("formRol");
    if (form) form.reset();
    document.getElementById("modalRolLabel").textContent = "Registrar Nuevo Rol";
};

window.eliminarRol = async function(id) {
    if (confirm("¿Está seguro de eliminar este rol?")) {
        try {
            await RolService.eliminar(id);
            await cargarRoles();
        } catch (error) {
            alert("Error al eliminar rol: " + error.message);
        }
    }
};