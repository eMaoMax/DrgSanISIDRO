const API_URL = "https://localhost:44378/api/usuarios";

export const UsuarioService = {
    // GET: api/usuarios
    async listar() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al obtener usuarios");
        return await res.json();
    },

    // GET: api/usuarios/{UsuarioID}
    async consultarPorId(id) {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Usuario no encontrado");
        return await res.json();
    },

    // POST: api/usuarios
async registrar(usuario) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Error al registrar el usuario");
    }
    
    return await res.json();
},

   // PUT: api/usuarios
    async actualizar(usuario) {
        const res = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });
        
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Error HTTP ${res.status}`);
        }
        
        return await res.json();
    },

    // DELETE: api/usuarios/{UsuarioID}
    async eliminar(id) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Error al eliminar el usuario");
        return await res.json();
    },
    
    async listarRoles() {
        const res = await fetch("https://localhost:44378/api/roles");
        if (!res.ok) throw new Error("Error al obtener roles");
        return await res.json();
    }
};