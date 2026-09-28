
import { LaboratorioService } from '../Servicios/serviciosLaboratorio.js';

let listaLaboratoriosGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarLaboratorios();

    const txtBuscar = document.getElementById("txtBuscarLaboratorio");
    if (txtBuscar) txtBuscar.addEventListener("keyup", aplicarFiltros);

    const formLab = document.getElementById("formLaboratorio");
    if (formLab) {
        formLab.addEventListener("submit", async (e) => {
            e.preventDefault();

            const labData = {
                LaboratorioID: parseInt(document.getElementById("txtLaboratorioID").value) || 0,
                NIT: document.getElementById("txtNit").value.trim(),
                Nombre: document.getElementById("txtNombreLaboratorio").value.trim(),
                Telefono: document.getElementById("txtTelefono").value.trim() || null,
                Contacto: document.getElementById("txtContacto").value.trim() || null,
                Direccion: document.getElementById("txtDireccion").value.trim() || null,
                Estado: true
            };

            try {
                const res = await LaboratorioService.guardar(labData);
                alert(res.mensaje || "Operación realizada con éxito.");

                const modalEl = document.getElementById("modalLaboratorio");
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();

                prepararCrearLaboratorio();
                await cargarLaboratorios();
            } catch (error) {
                console.error("Error al guardar laboratorio:", error);
                alert("Atención: " + error.message);
            }
        });
    }
});

async function cargarLaboratorios() {
    try {
        listaLaboratoriosGlobal = await LaboratorioService.listar() || [];
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar laboratorios:", error);
    }
}

function aplicarFiltros() {
    const busqueda = (document.getElementById("txtBuscarLaboratorio")?.value || "").toLowerCase().trim();

    const filtrados = listaLaboratoriosGlobal.filter(l => {
        const nit = (l.NIT ?? l.nit ?? '').toLowerCase();
        const nombre = (l.Nombre ?? l.nombre ?? '').toLowerCase();
        const contacto = (l.Contacto ?? l.contacto ?? '').toLowerCase();
        return busqueda === "" || nit.includes(busqueda) || nombre.includes(busqueda) || contacto.includes(busqueda);
    });

    renderizarTabla(filtrados);
}

function renderizarTabla(laboratorios) {
    const tbody = document.getElementById("tablaLaboratoriosBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!laboratorios || laboratorios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron laboratorios</td></tr>`;
        return;
    }

    laboratorios.forEach(l => {
        const id = l.LaboratorioID ?? l.laboratorioID;
        const nit = l.NIT ?? l.nit ?? 'N/A';
        const nombre = l.Nombre ?? l.nombre;
        const contacto = l.Contacto ?? l.contacto ?? '-';
        const telefono = l.Telefono ?? l.telefono ?? '-';

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">${id}</td>
            <td><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">${nit}</span></td>
            <td class="fw-semibold">${nombre}</td>
            <td>${contacto}</td>
            <td>${telefono}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarLaboratorio(${id})" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarLaboratorio(${id})" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.prepararCrearLaboratorio = function() {
    document.getElementById("formLaboratorio").reset();
    document.getElementById("txtLaboratorioID").value = "0";
    document.getElementById("modalLaboratorioLabel").textContent = "Registrar Nuevo Laboratorio";
};

window.editarLaboratorio = async function(id) {
    try {
        const lab = await LaboratorioService.consultarPorId(id);
        if (!lab) return;

        document.getElementById("txtLaboratorioID").value = lab.LaboratorioID || lab.laboratorioID;
        document.getElementById("txtNit").value = lab.NIT || lab.nit || '';
        document.getElementById("txtNombreLaboratorio").value = lab.Nombre || lab.nombre || '';
        document.getElementById("txtTelefono").value = lab.Telefono || lab.telefono || '';
        document.getElementById("txtContacto").value = lab.Contacto || lab.contacto || '';
        document.getElementById("txtDireccion").value = lab.Direccion || lab.direccion || '';

        document.getElementById("modalLaboratorioLabel").textContent = "Editar Laboratorio";
        
        const modalEl = document.getElementById("modalLaboratorio");
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    } catch (error) {
        alert("Error al cargar los datos del laboratorio: " + error.message);
    }
};

window.eliminarLaboratorio = async function(id) {
    if (confirm("¿Está seguro de eliminar este laboratorio?")) {
        try {
            const res = await LaboratorioService.eliminar(id);
            alert(res.mensaje || "Laboratorio eliminado.");
            await cargarLaboratorios();
        } catch (error) {
            alert("Error al eliminar laboratorio: " + error.message);
        }
    }
};