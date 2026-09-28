import { ProductosService } from '../Servicios/ServiciosProductos.js';
import { LaboratorioService } from '../../../Laboratorios/Js/Servicios/serviciosLaboratorio.js';

let listaProductosGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
    await cargarLaboratoriosSelect();
    await cargarProductos();

    const txtBuscar = document.getElementById("txtBuscarProducto");
    if (txtBuscar) txtBuscar.addEventListener("keyup", aplicarFiltros);

    const formProducto = document.getElementById("formProducto");
    if (formProducto) {
        formProducto.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productoData = {
                ProductoID: parseInt(document.getElementById("txtProductoID").value) || 0,
                Nombre: document.getElementById("txtNombreProducto").value.trim(),
                LaboratorioID: parseInt(document.getElementById("selectLaboratorio").value) || 0,
                Presentacion: document.getElementById("txtPresentacion").value.trim(),
                Concentracion: document.getElementById("txtConcentracion").value.trim() || null,
                PrecioVenta: parseFloat(document.getElementById("txtPrecioVenta").value) || 0,
                RequiereReceta: document.getElementById("chkRequiereReceta").checked
            };

            try {
                const res = await ProductosService.guardar(productoData);
                alert(res.mensaje || "Operación realizada con éxito.");

                const modalEl = document.getElementById("modalProducto");
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();

                prepararCrearProducto();
                await cargarProductos();
            } catch (error) {
                console.error("Error al guardar producto:", error);
                alert("Atención: " + error.message);
            }
        });
    }
});

// Carga el menú desplegable (Select) de laboratorios para el formulario
async function cargarLaboratoriosSelect() {
    const selectLab = document.getElementById("selectLaboratorio");
    if (!selectLab) return;

    try {
        const laboratorios = await LaboratorioService.listar() || [];
        selectLab.innerHTML = `<option value="">-- Seleccione Laboratorio --</option>`;
        laboratorios.forEach(l => {
            const id = l.LaboratorioID ?? l.laboratorioID;
            const nombre = l.Nombre ?? l.nombre;
            selectLab.innerHTML += `<option value="${id}">${nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar selector de laboratorios:", error);
    }
}

async function cargarProductos() {
    try {
        listaProductosGlobal = await ProductosService.listar() || [];
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function aplicarFiltros() {
    const busqueda = (document.getElementById("txtBuscarProducto")?.value || "").toLowerCase().trim();

    const filtrados = listaProductosGlobal.filter(p => {
        const nombre = (p.Nombre ?? p.nombreProducto ?? '').toLowerCase();
        const laboratorio = (p.NombreLaboratorio ?? p.nombreLaboratorio ?? '').toLowerCase();
        const presentacion = (p.Presentacion ?? p.presentacion ?? '').toLowerCase();

        return busqueda === "" || nombre.includes(busqueda) || laboratorio.includes(busqueda) || presentacion.includes(busqueda);
    });

    renderizarTabla(filtrados);
}

function renderizarTabla(productos) {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!productos || productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No se encontraron productos en el catálogo</td></tr>`;
        return;
    }

    productos.forEach(p => {
        const id = p.ProductoID ?? p.productoID;
        const nombre = p.Nombre ?? p.nombreProducto;
        const laboratorio = p.NombreLaboratorio ?? p.nombreLaboratorio ?? 'Sin asignar';
        const presentacion = p.Presentacion ?? p.presentacion ?? '-';
        const concentracion = p.Concentracion ?? p.concentracion ?? '-';
        const precio = p.PrecioVenta ?? p.precioVenta ?? 0;
        const receta = p.RequiereReceta ?? p.requiereReceta;
        const stock = p.StockTotal ?? p.stockTotal ?? 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">${id}</td>
            <td class="fw-semibold">${nombre}</td>
            <td><span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">${laboratorio}</span></td>
            <td>${presentacion}</td>
            <td>${concentracion}</td>
            <td>$${precio.toLocaleString('es-CO')}</td>
            <td>
                ${receta 
                    ? '<span class="badge bg-warning-subtle text-warning border border-warning-subtle">Receta</span>' 
                    : '<span class="badge bg-success-subtle text-success border border-success-subtle">Libre</span>'}
            </td>
            <td><span class="badge ${stock > 0 ? 'bg-secondary-subtle text-dark' : 'bg-danger-subtle text-danger'}">${stock} u.</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProducto(${id})" title="Editar">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${id})" title="Eliminar">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.prepararCrearProducto = function() {
    document.getElementById("formProducto").reset();
    document.getElementById("txtProductoID").value = "0";
    document.getElementById("modalProductoLabel").textContent = "Registrar Nuevo Producto";
};

window.editarProducto = async function(id) {
    try {
        const p = await ProductosService.consultarPorId(id);
        if (!p) return;

        document.getElementById("txtProductoID").value = p.ProductoID || p.productoID;
        document.getElementById("txtNombreProducto").value = p.Nombre || p.nombreProducto || '';
        document.getElementById("selectLaboratorio").value = p.LaboratorioID || p.laboratorioID;
        document.getElementById("txtPresentacion").value = p.Presentacion || p.presentacion || '';
        document.getElementById("txtConcentracion").value = p.Concentracion || p.concentracion || '';
        document.getElementById("txtPrecioVenta").value = p.PrecioVenta || p.precioVenta || 0;
        document.getElementById("chkRequiereReceta").checked = p.RequiereReceta ?? p.requiereReceta ?? false;

        document.getElementById("modalProductoLabel").textContent = "Editar Producto";

        const modalEl = document.getElementById("modalProducto");
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    } catch (error) {
        alert("Error al cargar los datos del producto: " + error.message);
    }
};

window.eliminarProducto = async function(id) {
    if (confirm("¿Está seguro de eliminar este producto?")) {
        try {
            const res = await ProductosService.eliminar(id);
            alert(res.mensaje || "Producto eliminado correctamente.");
            await cargarProductos();
        } catch (error) {
            alert("Atención: " + error.message);
        }
    }
};