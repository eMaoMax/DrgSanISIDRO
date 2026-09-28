const API_URL = "https://localhost:44378/api/laboratorios";

export const LaboratorioService = {
    async listar() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al consultar los laboratorios");
        return await res.json();
    },

    async consultarPorId(id) {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Laboratorio no encontrado");
        return await res.json();
    },

    async guardar(laboratorio) {
        const esEdicion = laboratorio.LaboratorioID > 0;
        const res = await fetch(API_URL, {
            method: esEdicion ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(laboratorio)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Error al procesar la solicitud");
        }
        return await res.json();
    },

    async eliminar(id) {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar el laboratorio");
        return await res.json();
    }
};