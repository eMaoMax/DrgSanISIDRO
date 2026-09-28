document.addEventListener("DOMContentLoaded", () => {
    renderizarFooter();
});

function renderizarFooter() {
    let footer = document.querySelector("footer");
    
    if (!footer) {
        footer = document.createElement("footer");
        document.body.appendChild(footer);
    }

    // Obtiene automáticamente el año en curso del sistema
    const anioActual = new Date().getFullYear();

    footer.className = "py-3 my-4 border-top text-center text-body-secondary small";
    footer.innerHTML = `
        <div class="container">
            <p class="mb-0">&copy; ${anioActual} Droguería San Isidro FCH - Todos los derechos reservados.</p>
        </div>
    `;
}