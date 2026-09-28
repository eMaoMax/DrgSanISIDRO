import { VentasService } from '../Servicios/ServiciosVentas.js';

let inventarioGlobal = [];
let carrito = [];

document.addEventListener("DOMContentLoaded", async () => {
    inicializarDatosUsuario();
    await cargarProductos();

    // Eventos
    document.getElementById("txtBuscarProducto")?.addEventListener("keyup", filtrarProductos);
    document.getElementById("btnProcesarVenta")?.addEventListener("click", procesarVenta);
});

function inicializarDatosUsuario() {
    // Busca primero la clave en español y luego la clave en inglés guardada en el Login
    const nombre = sessionStorage.getItem("nombreUsuario") || sessionStorage.getItem("userFullName") || "Vendedor General";
    const rol = sessionStorage.getItem("rolUsuario") || sessionStorage.getItem("userRoleName") || "";

    const txtVendedor = document.getElementById("txtVendedorNombre");
    if (txtVendedor) {
        // Muestra: "Carlos Pérez (Administrador)" o solo "Carlos Pérez"
        txtVendedor.value = rol ? `${nombre} (${rol})` : nombre;
    }
}

async function cargarProductos() {
    try {
        const respuesta = await VentasService.obtenerProductosInventario() || [];
        
        // Imprime en consola para verificar los nombres exactos de la BD/API
        console.log("Respuesta de la API Inventario:", respuesta);

        inventarioGlobal = respuesta.map(p => {
            // Extracción flexible del precio evaluando todas las posibles claves
            const rawPrecio = p.precioVenta ?? p.PrecioVenta ?? 
                              p.precioUnitario ?? p.PrecioUnitario ?? 
                              p.precio ?? p.Precio ?? 
                              p.precioUnit ?? p.PrecioUnit ?? 
                              p.precio_venta ?? p.precio_unitario ?? 0;

            return {
                productoID: p.productoID ?? p.ProductoID ?? p.idProducto ?? p.IDProducto ?? 0,
                loteID: p.loteID ?? p.LoteID ?? p.idLote ?? p.IDLote ?? 0,
                nombreProducto: p.nombreProducto ?? p.NombreProducto ?? p.nombre ?? p.Nombre ?? 'Sin Nombre',
                codigoLote: p.codigoLote ?? p.CodigoLote ?? p.lote ?? p.Lote ?? 'N/A',
                stockActual: p.stockActual ?? p.StockActual ?? p.stock ?? p.Stock ?? 0,
                precioVenta: parseFloat(rawPrecio) || 0
            };
        });

        renderizarTablaProductos(inventarioGlobal);
    } catch (err) {
        console.error("Error al cargar productos:", err);
    }
}

function renderizarTablaProductos(lista) {
    const tbody = document.getElementById("tablaProductosBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay productos disponibles.</td></tr>`;
        return;
    }

    lista.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-3 fw-semibold">${p.nombreProducto}</td>
            <td><code class="text-primary">${p.codigoLote}</code></td>
            <td>
                <span class="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill">
                    ${p.stockActual} u.
                </span>
            </td>
            <td class="fw-bold text-success">$${Number(p.precioVenta).toLocaleString()}</td>
            <td class="text-end pe-3">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="agregarAlCarrito(${p.loteID})">
                    <i class="bi bi-plus-lg me-1"></i>Agregar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarProductos() {
    const busqueda = (document.getElementById("txtBuscarProducto")?.value || "").toLowerCase().trim();
    const filtrados = inventarioGlobal.filter(p => 
        p.nombreProducto.toLowerCase().includes(busqueda) ||
        p.codigoLote.toLowerCase().includes(busqueda)
    );
    renderizarTablaProductos(filtrados);
}

window.agregarAlCarrito = function(loteID) {
    const productoSel = inventarioGlobal.find(p => p.loteID === loteID);
    if (!productoSel) return;

    const itemEnCarrito = carrito.find(c => c.loteID === loteID);

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad + 1 > productoSel.stockActual) {
            alert("No hay más stock disponible para este lote.");
            return;
        }
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({
            productoID: productoSel.productoID,
            loteID: productoSel.loteID,
            nombreProducto: productoSel.nombreProducto,
            precioUnitario: productoSel.precioVenta,
            cantidad: 1,
            stockMaximo: productoSel.stockActual
        });
    }

    actualizarCarritoUI();
};

function actualizarCarritoUI() {
    const tbody = document.getElementById("tablaCarritoBody");
    const lblTotal = document.getElementById("lblTotalVenta");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">El carrito está vacío</td></tr>`;
        if (lblTotal) lblTotal.textContent = "$0";
        return;
    }

    let totalVenta = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.cantidad * item.precioUnitario;
        totalVenta += subtotal;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <small class="fw-bold d-block">${item.nombreProducto}</small>
                <small class="text-muted">$${Number(item.precioUnitario).toLocaleString()}</small>
            </td>
            <td class="text-center">
                <input type="number" min="1" max="${item.stockMaximo}" value="${item.cantidad}" 
                    class="form-control form-control-sm text-center" 
                    onchange="cambiarCantidad(${index}, this.value)">
            </td>
            <td class="text-end fw-bold text-dark">$${Number(subtotal).toLocaleString()}</td>
            <td class="text-center">
                <button class="btn btn-sm text-danger border-0 p-0" onclick="eliminarDelCarrito(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (lblTotal) lblTotal.textContent = `$${Number(totalVenta).toLocaleString()}`;
}

window.cambiarCantidad = function(index, nuevaCantidad) {
    const cant = parseInt(nuevaCantidad);
    if (isNaN(cant) || cant <= 0) {
        carrito[index].cantidad = 1;
    } else if (cant > carrito[index].stockMaximo) {
        alert("Supera el stock disponible.");
        carrito[index].cantidad = carrito[index].stockMaximo;
    } else {
        carrito[index].cantidad = cant;
    }
    actualizarCarritoUI();
};

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
};

async function procesarVenta() {
    if (carrito.length === 0) {
        alert("Agregue al menos un producto al carrito para procesar la venta.");
        return;
    }

    // Se extrae el UsuarioID guardado desde el Login
    const usuarioID = parseInt(sessionStorage.getItem("usuarioID") || 1);
    const totalVenta = carrito.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

    // Mapeo exacto hacia la clase Ventas.cs de C# (PascalCase)
    const ventaPayload = {
        UsuarioID: usuarioID,
        TotalVenta: totalVenta,
        Detalles: carrito.map(item => ({
            ProductoID: item.productoID,
            LoteID: item.loteID,
            Cantidad: item.cantidad,
            PrecioUnitario: item.precioUnitario
        }))
    };

    try {
        const respuesta = await VentasService.registrarVenta(ventaPayload);
        alert(respuesta.mensaje || "Venta realizada con éxito.");
        
        // Limpiar carrito y recargar productos/inventario
        carrito = [];
        actualizarCarritoUI();
        await cargarProductos();
    } catch (err) {
        alert("Error al finalizar venta: " + err.message);
    }
}