document.addEventListener("DOMContentLoaded", () => {
    // 1. Mostrar nombre de usuario logueado
    const fullName = sessionStorage.getItem("userFullName");
    const userNameSpan = document.getElementById("userName");

    if (fullName && userNameSpan) {
        userNameSpan.textContent = fullName;
    }

    // 2. Control de Modo Oscuro / Claro (Bootstrap 5.3)
    const htmlElement = document.documentElement;
    const btnThemeToggle = document.getElementById("btnThemeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-bs-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(newTheme);
        });
    }

    function applyTheme(theme) {
        htmlElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);

        if (themeIcon && themeText) {
            if (theme === "dark") {
                themeIcon.className = "bi bi-sun-fill me-1";
                themeText.textContent = "Claro";
            } else {
                themeIcon.className = "bi bi-moon-stars-fill me-1";
                themeText.textContent = "Oscuro";
            }
        }
    }

    // 3. Manejar el cierre de sesión y limpieza de sessionStorage
    const btnLogout = document.getElementById("btnLogout");

    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        
        // 1. Obtiene la ruta configurada en el HTML de la vista actual
        const targetUrl = btnLogout.getAttribute("href");
        
        // 2. Limpia la sesión
        sessionStorage.clear();
        
        // 3. Redirige dinámicamente según el href de la página donde se ejecute
        if (targetUrl && targetUrl !== "#") {
            window.location.href = targetUrl;
        } else {
            // Ruta de respaldo por si el href está vacío o no configurado
            window.location.href = "/Login/vista/login.html";}
        });
    }
});