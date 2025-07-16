// Función para cargar archivos HTML y ejecutar callback
function cargar(id, archivo, callback) {
  fetch(archivo)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} en ${archivo}`);
      }
      return res.text();
    })
    .then((html) => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = html;
        if (callback) callback();
      } else {
        console.warn(
          `Elemento con ID '${id}' no encontrado para cargar ${archivo}`
        );
      }
    })
    .catch((error) => console.error(`Error cargando ${archivo}:`, error));
}

// Cargar header y footer
cargar("header-container", "/FrontEnd/Index/header.htmlp", () => {
  inicializarHeader(); // Esta es la función clave donde se maneja la lógica del header
});
cargar("footer-container", "/FrontEnd/Index/footer.htmlp");

//Función para ver si el usuario ya tiene un token activo

function checkTokenAndLoadProfile() {
  const token = localStorage.getItem("token");

  // Si no hay token, no hacemos nada.
  if (!token) {
    return;
  }

  // --- Si SÍ hay un token, procedemos ---

  const btnLogin = document.querySelector(".btn-login");
  const headerRightContainer = document.querySelector(".header-right"); // <--- ¡CAMBIO CLAVE AQUÍ!

  // --- Comprobación de seguridad ---
  if (!headerRightContainer) {
    console.error("Error crítico: El contenedor '.header-right' no se encontró en el DOM.");
    return;
  }
  
  // Ocultamos el botón de login SOLO si existe
  if (btnLogin) {
    btnLogin.style.display = "none";
  }

  // --- Crear y añadir el nuevo icono de perfil ---
  const userIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  userIcon.setAttribute("viewBox", "0 0 24 24");
  userIcon.setAttribute("width", "45");
  userIcon.setAttribute("height", "45");
  userIcon.style.borderRadius = "50%";
  userIcon.style.cursor = "pointer";
  userIcon.style.border = "2px solid #7359a1";
  userIcon.style.boxShadow = "0 0 8px rgba(115, 89, 161, 0.5)";
  userIcon.style.objectFit = "cover";

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z");
  userIcon.appendChild(path);

  const profileLink = document.createElement("a");
  profileLink.href = "/FrontEnd/Index/perfil.html";
  profileLink.appendChild(userIcon);

  // Añadimos el nuevo enlace/icono al contenedor correcto
  headerRightContainer.appendChild(profileLink);
}

function inicializarHeader() {
  const header = document.getElementById("header");
  const panel = document.querySelector(".panel-lateral");
  const menuButton = document.querySelector(".menu"); // Selector más específico para el botón de menú
  const fondoOscuro = document.querySelector(".fondo-oscuro");
  const closePanelButton = document.querySelector(".panel-close-btn"); // Botón de cierre X del panel

  let prevScrollPos = window.scrollY;

  window.onscroll = function () {
    let currentScrollPos = window.scrollY;
    if (header) {
      if (currentScrollPos > 500 && currentScrollPos > prevScrollPos) {
        // Ocultar solo si se scrollea hacia abajo
        header.style.top = "-200px";
      } else if (currentScrollPos < prevScrollPos || currentScrollPos <= 500) {
        // Mostrar si se scrollea hacia arriba o está cerca del top
        header.style.top = "0";
      }
    }
    // Cerrar el panel lateral si se hace scroll hacia abajo
    if (panel && panel.classList.contains("open") && fondoOscuro) {
      if (
        currentScrollPos > prevScrollPos &&
        currentScrollPos - prevScrollPos > 10
      ) {
        // Solo si hay un scroll significativo hacia abajo
        panel.classList.remove("open");
        fondoOscuro.classList.remove("visible");
        // Si tenías submenús y necesitas cerrarlos también:
        // document.querySelectorAll(".panel-lateral .has-submenu.open").forEach(li => {
        //   li.classList.remove("open");
        // });
      }
    }
    prevScrollPos = currentScrollPos;
  };

  if (menuButton && panel && fondoOscuro) {
    function togglePanel() {
      panel.classList.toggle("open");
      fondoOscuro.classList.toggle("visible");
    }

    menuButton.addEventListener("click", function (event) {
      togglePanel();
      event.stopPropagation(); // Evitar que el clic se propague al 'document'
    });

    // Cierre del panel al hacer clic en el fondo oscuro
    fondoOscuro.addEventListener("click", () => {
      panel.classList.remove("open");
      fondoOscuro.classList.remove("visible");
    });

    // Cierre del panel al hacer clic en el botón X
    if (closePanelButton) {
      closePanelButton.addEventListener("click", () => {
        panel.classList.remove("open");
        fondoOscuro.classList.remove("visible");
      });
    }

    // Cierre del panel al hacer clic fuera de él (y no en el botón de menú)
    document.addEventListener("click", function (event) {
      if (
        panel.classList.contains("open") && // Si el panel está abierto
        !panel.contains(event.target) && // Y el clic NO fue dentro del panel
        !menuButton.contains(event.target) && // Y el clic NO fue en el botón de menú
        (!closePanelButton || !closePanelButton.contains(event.target)) // Y el clic NO fue en el botón X (si existe)
      ) {
        panel.classList.remove("open");
        fondoOscuro.classList.remove("visible");
      }
    });
  }

  // Lógica para submenús (si la mantienes)
  // Si el nuevo diseño del panel ya no usa .has-submenu y .submenu-toggle, puedes eliminar esto.
  const submenuToggles = document.querySelectorAll(
    ".panel-lateral .submenu-toggle"
  );
  if (submenuToggles.length > 0) {
    submenuToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        const parentLi = this.closest(".has-submenu");
        if (parentLi) {
          parentLi.classList.toggle("open");
          // Cerrar otros submenús abiertos si es necesario
          document
            .querySelectorAll(".panel-lateral .has-submenu.open")
            .forEach((li) => {
              if (li !== parentLi) li.classList.remove("open");
            });
        }
      });
    });
  }

  //  POPUP DE INICIO DE SESIÓN / REGISTRO

  const btnLogin = document.querySelector(".btn-login");
  const popupOverlay = document.getElementById("popup-overlay");
  const closePopup = document.getElementById("close-popup");
  const loginForm = document.querySelector(".popup-form form"); // primer form visible
  const registerForm = document.getElementById("register-form");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");

  //  Funciones Auxiliares para el Popup

  // Función para mostrar el popup
  function showPopup() {
    popupOverlay.style.display = "flex";
  }

  // Función para ocultar el popup y resetear los formularios
  function hidePopup() {
    popupOverlay.style.display = "none";

    // Resetear estados del formulario de registro
    document.getElementById("register-fields").style.display = "block";
    document.getElementById("codeSection").style.display = "none";
    document.getElementById("submit-register-btn").style.display =
      "inline-block";
    isVerifyingCode = false;
  }

  // Función para alternar entre el formulario de login y registro
  function toggleForms(showLoginForm) {
    if (showLoginForm) {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    } else {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
      // 💡 Resetear formulario
      document.getElementById("register-fields").style.display = "block";
      document.getElementById("codeSection").style.display = "none";
      document.getElementById("submit-register-btn").style.display =
        "inline-block";
      // Reiniciar estado
      isVerifyingCode = false;
    }
  }

  //  Event Listeners para el Popup

  btnLogin.addEventListener("click", () => {
    showPopup();
    toggleForms(true); // Mostrar login al principio
  });

  closePopup.addEventListener("click", () => {
    hidePopup();
  });

  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) {
      hidePopup();
    }
  });

  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms(false); // Mostrar registro
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    toggleForms(true); // Mostrar login
  });

  // Función para mostrar un mensaje de error
  function mostrarMensaje(config) {
    config.element.textContent = config.message;
    config.element.style.display = "block";
  }
  // Función para ocultar un mensaje
  function ocultarMensaje(config) {
    config.element.style.display = "none";
  }

  //  Funcionalidad de Ocultar/Mostrar Contraseña

  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  togglePasswordBtn.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    togglePasswordBtn.textContent = isVisible ? "👁️" : "🙈"; // Cambia el ícono
  });

  //  Funcionalidad de REGISTRO (Supabase)

  let usernameRegistro;
  let passwordRegistro;
  let emailRegistro; // Variable para almacenar el correo electrónico

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById("new-username").value;
    const email = document.getElementById("email").value;
    emailRegistro = email;
    usernameRegistro = newUsername; //<<-- asignamos el correo de registro, importante porque lo usaremos despues

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      // Mostrar mensaje de error
      const errorMessage = document.getElementById("password-error");
      mostrarMensaje({
        element: errorMessage,
        message: "Las contraseñas no coinciden.",
      });
      const newPasswordInput = document.getElementById("new-password");
      const confirmPasswordInput = document.getElementById("confirm-password");
      errorMessage.style.display = "block";
      newPasswordInput.classList.add("error");
      confirmPasswordInput.classList.add("error");
      return;
    }
    passwordRegistro = newPassword;
    try {
      // ✅ Petición al backend (Supabase)
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.needsVerificationCode) {
          document.getElementById("register-fields").style.display = "none";
          codeSection.style.display = "block";
          document.getElementById("submit-register-btn").style.display = "none";
          const CodeError = document.getElementById("code-error");
          // Insertar el mensaje de error debajo del formulario
          mostrarMensaje({
            element: CodeError,
            message: data.msg,
          });
        } else {
          document.getElementById("register-fields").style.display = "none";
          document.getElementById("codeSection").style.display = "block";
          document.getElementById("submit-register-btn").style.display = "none";
        }
      } else {
        // 🚨 Manejo de errores: mostrar mensaje al usuario
        console.error("Error en el registro:", data.msg || response.statusText);
        alert(
          data.msg || "Error al registrar usuario. Por favor, intenta de nuevo."
        );
      }
    } catch (error) {
      // 🚨 Manejo de errores de red
      console.error("Error de red:", error);
      alert("Error de red. Por favor, verifica tu conexión a Internet.");
    }
  });

  //   Funcionalidad para reenviar códigos de verificación
  const resendCodeBtn = document.getElementById("resend-code-btn");
  const resendMessage = document.getElementById("resend-message");
  let resendCooldown = false;
  let resendTimeRemaining = 0;

  function updateResendButton() {
    if (resendCooldown) {
      resendCodeBtn.disabled = true;
      resendCodeBtn.textContent = `Reenviar en ${resendTimeRemaining}s`;
    } else {
      resendCodeBtn.disabled = false;
      resendCodeBtn.textContent = "Reenviar Código";
    }
  }

  function startCooldown() {
    resendCooldown = true;
    resendTimeRemaining = 60; // Cooldown de 60 segundos

    updateResendButton();

    const cooldownInterval = setInterval(() => {
      resendTimeRemaining--;
      updateResendButton();

      if (resendTimeRemaining <= 0) {
        resendCooldown = false;
        clearInterval(cooldownInterval);
        updateResendButton();
      }
    }, 1000);
  }

  resendCodeBtn.addEventListener("click", async () => {
    if (resendCooldown) {
      return; // No hacer nada si el cooldown está activo
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-verification-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailRegistro,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        mostrarMensaje({
          element: resendMessage,
          message: "Se ha reenviado el código a tu correo electrónico.",
        });
        startCooldown();
      } else {
        mostrarMensaje({
          element: resendMessage,
          message: data.msg || "Error al reenviar el código.",
        });
      }
    } catch (error) {
      console.error("Error al reenviar el código:", error);
      mostrarMensaje({
        element: resendMessage,
        message: "Error al comunicarse con el servidor.",
      });
    }
  });

  // SEGUNDO PASO: Validar el código ingresado
  document
    .getElementById("submit-code-btn")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const code = document.getElementById("code").value;

      if (emailRegistro == undefined || usernameRegistro == undefined) {
        alert("Por favor, complete el primer paso del registro.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            email: emailRegistro,
            password: passwordRegistro,
            username: usernameRegistro,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Verificacion exitosa:", data);
          localStorage.setItem("token", data.token);
          hidePopup();
          // Recargar la página
          location.reload();
          //Guardar el token
        } else {
          const CodeError = document.getElementById("code-error");
          // Insertar el mensaje de error debajo del formulario
          mostrarMensaje({
            element: CodeError,
            message: data.msg,
          });
        }
      } catch (error) {
        console.error("Error de red:", error);
      }
    });

  //  Funcionalidad de INICIO DE SESIÓN (Supabase)

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nick = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nick,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Inicio de sesión exitoso:", data);
        popupOverlay.style.display = "none";
        // Guardar token en localStorage o cookie
        localStorage.setItem("token", data.token);
        // Actualizar la interfaz (ocultar botón de login, mostrar info del usuario, etc.)
        // Ocultar el botón de login
        btnLogin.style.display = "none";

        // Crear el elemento de imagen (icono)
        const userIcon = document.createElement("img");
        userIcon.src = "/FrontEnd/Imagenes/Icono/play.png"; // Reemplaza con la ruta a tu icono
        userIcon.alt = "Perfil";
        userIcon.style.width = "45px";
        userIcon.style.height = "45px";
        userIcon.style.borderRadius = "50%";
        userIcon.style.objectFit = "cover";
        userIcon.style.border = "2px solid #7359a1";
        userIcon.style.boxShadow = "0 0 8px rgba(115, 89, 161, 0.5)";

        // Crear el enlace al perfil
        const profileLink = document.createElement("a");
        profileLink.href = "/FrontEnd/Index/perfil.html";
        profileLink.appendChild(userIcon);

        // Insertar el enlace antes del botón de login (si existe)
        const navAndButton = document.querySelector(".header-right");
        navAndButton.appendChild(profileLink);
        hidePopup();
        // Recargar la página
        location.reload();
      } else {
        console.error(
          "Error en el inicio de sesión:",
          data.msg || response.statusText
        );
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  });
  
  checkTokenAndLoadProfile();
} // Fin de inicializarHeader