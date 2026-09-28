const API_URL_VENTAS = "https://localhost:44378/api/ventas";
const API_URL_INVENTARIO = "https://localhost:44378/api/inventario"; 

export const VentasService = {
    // 1. Obtiene los productos en stock para agregar a la venta
    async obtenerProductosInventario() {
        try {
            const res = await fetch(API_URL_INVENTARIO);
            if (!res.ok) throw new Error("Error al consultar el inventario.");
            return await res.json();
        } catch (error) {
            console.error("Servicio Inventario Error:", error);
            return [];
        }
    },

    // 2. Envía la venta completa al endpoint POST de VentasController.cs
    async registrarVenta(ventaPayload) {
        const res = await fetch(API_URL_VENTAS, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(ventaPayload)
        });

        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || "No se pudo registrar la venta.");
        }

        return await res.json();
    }
};