document.addEventListener('DOMContentLoaded', function () {

    // ======================================================
    // 0. HELPER DE ALERTAS BOOTSTRAP (UX Mejorada)
    // ======================================================
    function mostrarAlerta(mensaje, tipo = 'danger', duracion = 4000) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${tipo} alert-dismissible fade show rounded-4 shadow-sm py-2 px-3 small" role="alert">`,
            `   <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>`,
            `   <span>${mensaje}</span>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);

        if (duracion > 0) {
            setTimeout(() => {
                const alertElement = wrapper.querySelector('.alert');
                if (alertElement && typeof bootstrap !== 'undefined') {
                    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
                    bsAlert.close();
                }
            }, duracion);
        }
    }

    // ======================================================
    // 1. Proceso de Validación de Datos de Recuperación
    // ======================================================
    const formRecover = document.querySelector("form");
    const btnValidar = document.getElementById("btnValidar") || document.querySelector("button[type='submit']");

    if (formRecover) {
        formRecover.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById("email");
            const cedulaInput = document.getElementById("cedula");

            const emailVal = emailInput.value.trim();
            const cedulaVal = cedulaInput.value.trim();

            // Validación de campos vacíos
            if (!emailVal || !cedulaVal) {
                mostrarAlerta("Por favor, ingresar correo y cédula.", "warning");
                return;
            }

            const dataRequest = {
                Email: emailVal,
                Cedula: cedulaVal
            };

            const urlApi = "https://localhost:44378/api/usuarios/recuperacion";

            try {
                // Bloquear botón durante el fetch
                if (btnValidar) {
                    btnValidar.disabled = true;
                    btnValidar.innerHTML = `Validando... <span class="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>`;
                }

                const response = await fetch(urlApi, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataRequest)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Los datos ingresados no coinciden con nuestros registros.");
                }

                const resultado = await response.json();

                if (resultado && resultado.UsuarioID > 0) {
                    mostrarAlerta("Datos validados correctamente. Redirigiendo...", "success", 2000);

                    // Guardamos temporalmente el ID en sessionStorage para consumirlo en RestablecerPassw.html
                    sessionStorage.setItem("recoveryUserId", resultado.UsuarioID);

                    // Pequeña pausa para permitir visualización de la alerta de éxito
                    setTimeout(() => {
                        window.location.href = "RestablecerPassword.html";
                    }, 1200);

                } else {
                    mostrarAlerta("No se pudo validar la información solicitada.", "danger");
                }

            } catch (error) {
                console.error("Error al validar recuperación:", error);
                mostrarAlerta(error.message || "Error de conexión con el servidor.", "danger");
            } finally {
                if (btnValidar) {
                    btnValidar.disabled = false;
                    btnValidar.innerHTML = `Validar Datos <i class="bi bi-arrow-right-circle ms-1"></i>`;
                }
            }
        });
    }
});