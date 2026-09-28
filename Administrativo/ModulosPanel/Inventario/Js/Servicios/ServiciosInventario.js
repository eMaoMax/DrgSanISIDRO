const API_URL = "https://localhost:44378/api/inventario";

export const InventarioService = {
    async listar() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al consultar el inventario.");
        return await res.json();
    },

    async consultarPorId(loteId) {
        const res = await fetch(`${API_URL}/${loteId}`);
        if (!res.ok) throw new Error("Lote no encontrado.");
        return await res.json();
    },

    async listarPorVencer(dias = 30) {
        const res = await fetch(`${API_URL}/por-vencer?dias=${dias}`);
        if (!res.ok) throw new Error("Error al listar lotes por vencer.");
        return await res.json();
    },

    async registrarLote(loteData) {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loteData)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Error al registrar el lote.");
        }
        return await res.json();
    },

    async actualizarStock(loteData) {
        const res = await fetch(`${API_URL}/actualizar-stock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loteData)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Error al actualizar el stock del lote.");
        }
        return await res.json();
    }
};