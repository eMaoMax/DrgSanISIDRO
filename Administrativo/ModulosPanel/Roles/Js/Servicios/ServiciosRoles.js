const API_URL = "https://localhost:44378/api/roles";

export const RolService = {
    async listar() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al consultar los roles");
        return await res.json();
    },

    async consultarPorId(id) {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Rol no encontrado");
        return await res.json();
    },

    async registrar(rol) {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rol)
        });
        if (!res.ok) throw new Error(await res.text() || "Error al registrar el rol");
        return await res.json();
    },

    async eliminar(id) {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar el rol");
        return await res.json();
    }
};