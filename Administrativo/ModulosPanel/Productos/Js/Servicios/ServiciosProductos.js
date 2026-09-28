const API_URL = "https://localhost:44378/api/productos";

export const ProductosService = {
    async listar() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al consultar el catálogo de productos.");
        return await res.json();
    },

    async consultarPorId(id) {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Producto no encontrado.");
        return await res.json();
    },

    async guardar(producto) {
        const esEdicion = producto.ProductoID > 0;
        const res = await fetch(API_URL, {
            method: esEdicion ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Error al procesar la solicitud del producto.");
        }
        return await res.json();
    },

    async eliminar(id) {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Error al eliminar el producto.");
        }
        return await res.json();
    }
};