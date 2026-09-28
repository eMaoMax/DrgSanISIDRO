const API_URL = "https://localhost:44378/api/ventas"; 

export const ServiciosReporteVentas = {
    // Obtener el historial completo de ventas (Mapeado a [HttpGet] Route(""))
    async obtenerHistorialVentas() {
        try {
            const respuesta = await fetch(API_URL);
            if (!respuesta.ok) throw new Error("Error al consultar el historial de ventas.");
            return await respuesta.json();
        } catch (error) {
            console.error("Error en ServiciosReporteVentas:", error);
            return [];
        }
    },

    // Obtener detalle de una venta por ID (Mapeado a [HttpGet] Route("{ventaID:int}"))
    async obtenerDetalleVenta(ventaID) {
        try {
            const respuesta = await fetch(`${API_URL}/${ventaID}`);
            if (!respuesta.ok) throw new Error("Error al obtener el detalle de la venta.");
            return await respuesta.json();
        } catch (error) {
            console.error("Error al obtener detalle de venta:", error);
            return null;
        }
    }
};