import { ServiciosReporteVentas } from '../Servicios/ServiciosReporteVentas.js';

let listaVentas = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarHistorial();

    // Eventos de Filtros y Botones
    document.getElementById('btnActualizarReporte')?.addEventListener('click', cargarHistorial);
    document.getElementById('txtBuscarVenta')?.addEventListener('input', aplicarFiltros);
    document.getElementById('txtFechaInicio')?.addEventListener('change', aplicarFiltros);
    document.getElementById('txtFechaFin')?.addEventListener('change', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', limpiarFiltros);
});

async function cargarHistorial() {
    listaVentas = await ServiciosReporteVentas.obtenerHistorialVentas();
    renderizarTabla(listaVentas);
}

function renderizarTabla(ventas) {
    const tbody = document.getElementById('tablaReporteBody');
    if (!tbody) return;

    if (!ventas || ventas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i> No se encontraron transacciones registradas.
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = ventas.map(v => {
        // Mapeo directo con fallback para PascalCase (C#) y camelCase (JSON)
        const id = v.VentaID ?? v.ventaID;
        const fechaRaw = v.FechaVenta ?? v.fechaVenta;
        const fecha = fechaRaw ? new Date(fechaRaw).toLocaleString('es-CO') : '--';
        
        const vendedor = v.Vendedor ?? v.vendedor ?? v.NombreVendedor ?? 'Sin asignar';
        const cantItems = v.CantidadProductos ?? v.cantidadProductos ?? v.CantidadItems ?? 0;
        const totalNum = v.TotalVenta ?? v.totalVenta ?? v.Total ?? 0;

        const totalFormateado = totalNum.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0 
        });

        return `
            <tr>
                <td class="ps-4 fw-bold">#${id}</td>
                <td>${fecha}</td>
                <td>${vendedor}</td>
                <td><span class="badge bg-secondary-subtle text-secondary rounded-pill">${cantItems} u.</span></td>
                <td class="fw-bold text-success">${totalFormateado}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="verDetalleVenta(${id})">
                        <i class="bi bi-eye-fill me-1"></i> Ver Detalle
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function aplicarFiltros() {
    const texto = document.getElementById('txtBuscarVenta').value.toLowerCase().trim();
    const fechaInicio = document.getElementById('txtFechaInicio').value;
    const fechaFin = document.getElementById('txtFechaFin').value;

    const filtradas = listaVentas.filter(v => {
        const numFactura = (v.ventaID || v.VentaID || '').toString();
        const vendedor = (v.nombreVendedor || v.NombreVendedor || '').toLowerCase();
        const fechaVenta = (v.fechaVenta || v.FechaVenta || '').split('T')[0];

        const coincideTexto = numFactura.includes(texto) || vendedor.includes(texto);
        const coincideInicio = !fechaInicio || fechaVenta >= fechaInicio;
        const coincideFin = !fechaFin || fechaVenta <= fechaFin;

        return coincideTexto && coincideInicio && coincideFin;
    });

    renderizarTabla(filtradas);
}

function limpiarFiltros() {
    document.getElementById('txtBuscarVenta').value = '';
    document.getElementById('txtFechaInicio').value = '';
    document.getElementById('txtFechaFin').value = '';
    renderizarTabla(listaVentas);
}

// Ventana Modal de Detalle accesible globalmente
window.verDetalleVenta = async function(ventaID) {
    const detalle = await ServiciosReporteVentas.obtenerDetalleVenta(ventaID);
    if (!detalle) return;

    // Propiedades del objeto Venta en C#
    const vendedor = detalle.Vendedor ?? detalle.vendedor ?? detalle.NombreVendedor ?? '--';
    const fechaRaw = detalle.FechaVenta ?? detalle.fechaVenta;
    const totalNum = detalle.TotalVenta ?? detalle.totalVenta ?? 0;
    const listaItems = detalle.Detalles ?? detalle.detalles ?? [];

    document.getElementById('lblNumFactura').textContent = ventaID;
    document.getElementById('lblVendedorModal').textContent = vendedor;
    document.getElementById('lblFechaModal').textContent = fechaRaw ? new Date(fechaRaw).toLocaleString('es-CO') : '--';
    document.getElementById('lblTotalModal').textContent = totalNum.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const tbodyDetalle = document.getElementById('tablaDetalleBody');
    tbodyDetalle.innerHTML = listaItems.map(item => {
        const nombre = item.NombreProducto ?? item.nombreProducto;
        const lote = item.CodigoLote ?? item.codigoLote;
        const cant = item.Cantidad ?? item.cantidad ?? 0;
        const precio = item.PrecioUnitario ?? item.precioUnitario ?? 0;
        const subtotal = item.SubTotal ?? item.subTotal ?? (cant * precio);

        return `
            <tr>
                <td>${nombre}</td>
                <td><span class="badge bg-light text-dark border">${lote}</span></td>
                <td class="text-center">${cant}</td>
                <td class="text-end">$${precio.toLocaleString('es-CO')}</td>
                <td class="text-end fw-semibold">$${subtotal.toLocaleString('es-CO')}</td>
            </tr>
        `;
    }).join('');

    const modal = new bootstrap.Modal(document.getElementById('modalDetalleVenta'));
    modal.show();
};