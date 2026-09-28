import { InventarioService } from '../../Js/Servicios/ServiciosInventario.js';
import { ProductosService } from '../../../Productos/Js/Servicios/ServiciosProductos.js';

let listaInventarioGlobal = [];
let mostrandoPorVencer = false;

document.addEventListener("DOMContentLoaded", async () => {
    await cargarProductosSelect();
    await cargarInventario();

    const txtBuscar = document.getElementById("txtBuscarLote");
    if (txtBuscar) txtBuscar.addEventListener("keyup", aplicarFiltros);

    const formLote = document.getElementById("formLote");
    if (formLote) {
        formLote.addEventListener("submit", async (e) => {
            e.preventDefault();

            const loteID = parseInt(document.getElementById("txtLoteID").value) || 0;
            const stock = parseInt(document.getElementById("txtStockActual").value) || 0;
            const fechaVenc = document.getElementById("txtFechaVencimiento").value;

            try {
                if (loteID === 0) {
                    // Nuevo Lote
                    const loteData = {
                        ProductoID: parseInt(document.getElementById("selectProducto").value) || 0,
                        CodigoLote: document.getElementById("txtCodigoLote").value.trim(),
                        StockActual: stock,
                        FechaVencimiento: fechaVenc
                    };

                    const res = await InventarioService.registrarLote(loteData);
                    alert(res.mensaje || "Lote ingresado con éxito.");
                } else {
                    // Editar/Ajustar Stock Lote Existente
                    const loteData = {
                        LoteID: loteID,
                        StockActual: stock,
                        FechaVencimiento: fechaVenc
                    };

                    const res = await InventarioService.actualizarStock(loteData);
                    alert(res.mensaje || "Stock del lote actualizado.");
                }

                const modalEl = document.getElementById("modalLote");
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();

                prepararCrearLote();
                await cargarInventario();
            } catch (error) {
                console.error("Error al procesar lote:", error);
                alert("Atención: " + error.message);
            }
        });
    }
});

async function cargarProductosSelect() {
    const selectP = document.getElementById("selectProducto");
    if (!selectP) return;

    try {
        const productos = await ProductosService.listar() || [];
        selectP.innerHTML = `<option value="">-- Seleccione Producto --</option>`;
        productos.forEach(p => {
            const id = p.ProductoID ?? p.productoID;
            const nombre = p.Nombre ?? p.nombreProducto;
            const lab = p.NombreLaboratorio ?? p.nombreLaboratorio ?? '';
            selectP.innerHTML += `<option value="${id}">${nombre} (${lab})</option>`;
        });
    } catch (error) {
        console.error("Error al cargar selector de productos:", error);
    }
}

async function cargarInventario() {
    try {
        if (mostrandoPorVencer) {
            listaInventarioGlobal = await InventarioService.listarPorVencer(30) || [];
        } else {
            listaInventarioGlobal = await InventarioService.listar() || [];
        }
        aplicarFiltros();
    } catch (error) {
        console.error("Error al cargar inventario:", error);
    }
}

function aplicarFiltros() {
    const busqueda = (document.getElementById("txtBuscarLote")?.value || "").toLowerCase().trim();

    const filtrados = listaInventarioGlobal.filter(i => {
        const prod = (i.NombreProducto ?? i.nombreProducto ?? '').toLowerCase();
        const lote = (i.CodigoLote ?? i.codigoLote ?? '').toLowerCase();
        const lab = (i.NombreLaboratorio ?? i.nombreLaboratorio ?? '').toLowerCase();

        return busqueda === "" || prod.includes(busqueda) || lote.includes(busqueda) || lab.includes(busqueda);
    });

    renderizarTabla(filtrados);
}

function renderizarTabla(lista) {
    const tbody = document.getElementById("tablaInventarioBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No hay registros de inventario disponibles.</td></tr>`;
        return;
    }

    lista.forEach(i => {
        const id = i.LoteID ?? i.loteID;
        const producto = i.NombreProducto ?? i.nombreProducto;
        const laboratorio = i.NombreLaboratorio ?? i.nombreLaboratorio ?? 'Sin asignar';
        const lote = i.CodigoLote ?? i.codigoLote;
        const stock = i.StockActual ?? i.stockActual;
        const fechaVenc = (i.FechaVencimiento ?? i.fechaVencimiento ?? '').split('T')[0];
        const dias = i.DiasParaVencer ?? i.diasParaVencer ?? i.diasRestantes ?? 999;

        let badgeVencimiento = '<span class="badge bg-success-subtle text-success border border-success-subtle">Óptimo</span>';
        if (dias <= 0) {
            badgeVencimiento = '<span class="badge bg-danger text-white border border-danger">Vencido</span>';
        } else if (dias <= 30) {
            badgeVencimiento = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning">Vence en ${dias} d.</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">${id}</td>
            <td class="fw-semibold">${producto}</td>
            <td><span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">${laboratorio}</span></td>
            <td><code>${lote}</code></td>
            <td><span class="fw-bold fs-6">${stock} u.</span></td>
            <td>${fechaVenc}</td>
            <td>${badgeVencimiento}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary" onclick="editarLote(${id})" title="Ajustar Stock / Fecha">
                    <i class="bi bi-pencil-fill"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.alternarFiltroVencimiento = async function() {
    mostrandoPorVencer = !mostrandoPorVencer;
    const btn = document.getElementById("btnVerPorVencer");
    
    if (mostrandoPorVencer) {
        btn.classList.replace("btn-outline-warning", "btn-warning");
        btn.innerHTML = `<i class="bi bi-boxes me-1"></i> Ver Todo el Inventario`;
    } else {
        btn.classList.replace("btn-warning", "btn-outline-warning");
        btn.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-1"></i> Ver Próximos a Vencer (30 días)`;
    }

    await cargarInventario();
};

window.prepararCrearLote = function() {
    document.getElementById("formLote").reset();
    document.getElementById("txtLoteID").value = "0";
    document.getElementById("modalLoteLabel").textContent = "Ingresar Nuevo Lote";
    
    document.getElementById("secSelectProducto").classList.remove("d-none");
    document.getElementById("selectProducto").required = true;
    
    document.getElementById("secNombreProductoReadonly").classList.add("d-none");
    document.getElementById("txtCodigoLote").readOnly = false;
};

window.editarLote = async function(loteID) {
    try {
        const l = await InventarioService.consultarPorId(loteID);
        if (!l) return;

        document.getElementById("txtLoteID").value = l.LoteID || l.loteID;
        document.getElementById("txtNombreProductoReadonly").value = l.NombreProducto || l.nombreProducto;
        document.getElementById("txtCodigoLote").value = l.CodigoLote || l.codigoLote;
        document.getElementById("txtStockActual").value = l.StockActual || l.stockActual;
        
        const rawDate = l.FechaVencimiento || l.fechaVencimiento;
        document.getElementById("txtFechaVencimiento").value = rawDate ? rawDate.split('T')[0] : '';

        document.getElementById("modalLoteLabel").textContent = "Ajustar Stock / Lote";
        
        document.getElementById("secSelectProducto").classList.add("d-none");
        document.getElementById("selectProducto").required = false;
        
        document.getElementById("secNombreProductoReadonly").classList.remove("d-none");
        document.getElementById("txtCodigoLote").readOnly = true; // Código inmutable en edición

        const modalEl = document.getElementById("modalLote");
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    } catch (error) {
        alert("Error al obtener los detalles del lote: " + error.message);
    }
};