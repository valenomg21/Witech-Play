document.addEventListener("DOMContentLoaded", function () {
  // Función para cargar archivos HTML y ejecutar callback
  function cargar(id, archivo, callback) {
    fetch(archivo)
      .then((res) => res.text())
      .then((html) => {
        document.getElementById(id).innerHTML = html;
        if (callback) callback(); // Ejecutar después de insertar
      })
      .catch((error) => console.error(`Error cargando ${archivo}:`, error));
  }

  // Cargar header y footer
  cargar("header-container", "/FrontEnd/Index/header.htmlp", () => {
    inicializarHeader();
  });
  cargar("footer-container", "/FrontEnd/Index/footer.htmlp");

  // Inicializar comportamientos del header después de cargarlo
  function inicializarHeader() {
    const header = document.getElementById("header");
    const panel = document.querySelector(".panel-lateral");
    const menuButton = document.querySelector(".menu");
    const fondoOscuro = document.querySelector(".fondo-oscuro");

    // Ocultar header al hacer scroll
    let prevScrollPos = window.scrollY;
    window.onscroll = function () {
      let currentScrollPos = window.scrollY;

      if (currentScrollPos > 500) {
        header.style.top = "-200px";
      } else {
        header.style.top = "0";
      }

      if (currentScrollPos > prevScrollPos) {
        panel.classList.remove("open");
        fondoOscuro.classList.remove("visible");
        document
          .querySelectorAll(".panel-lateral .has-submenu.open")
          .forEach((li) => {
            li.classList.remove("open");
          });
      }

      prevScrollPos = currentScrollPos;
    };

    // Boton de menu
    function togglePanel() {
      panel.classList.toggle("open");
      fondoOscuro.classList.toggle("visible");
    }

    menuButton.addEventListener("click", function (event) {
      togglePanel();
      event.stopPropagation();
    });

    // Cerrar el panel si se hace clic fuera
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !menuButton.contains(event.target)) {
        panel.classList.remove("open");
        fondoOscuro.classList.remove("visible");
      }
    });

    // También cerrar al hacer clic sobre el fondo oscuro
    fondoOscuro.addEventListener("click", () => {
      panel.classList.remove("open");
      fondoOscuro.classList.remove("visible");
    });

    // Submenus
    document
      .querySelectorAll(".panel-lateral .submenu-toggle")
      .forEach((toggle) => {
        toggle.addEventListener("click", function (e) {
          e.preventDefault();

          const parentLi = this.closest(".has-submenu");
          parentLi.classList.toggle("open");

          document
            .querySelectorAll(".panel-lateral .has-submenu")
            .forEach((li) => {
              if (li !== parentLi) li.classList.remove("open");
            });
        });
      });

    //  POPUP DE INICIO DE SESIÓN / REGISTRO

    const btnLogin = document.querySelector(".btn-login");
    const popupOverlay = document.getElementById("popup-overlay");
    const closePopup = document.getElementById("close-popup");
    const loginForm = document.querySelector(".popup-form form"); // primer form visible
    const registerForm = document.getElementById("register-form");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");

    let isVerifyingCode = false; // Estado para verificar si estamos en proceso de verificar el código

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

    btnLogin.addEventListener("click", () => {
      popupOverlay.style.display = "flex";
      loginForm.style.display = "block";
      if (registerForm) registerForm.style.display = "none";
    });

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
        const newPasswordInput = document.getElementById("new-password");
        const confirmPasswordInput = document.getElementById("confirm-password");
        errorMessage.textContent = "Las contraseñas no coinciden.";
        errorMessage.style.display = "block";
        newPasswordInput.classList.add("error");
        confirmPasswordInput.classList.add("error");
        return;
      }
      passwordRegistro = newPassword;
      try {
        // ✅ Petición al backend (Supabase)
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: newUsername,
              email: email,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          console.log("Registro exitoso:", data);

          // Mostrar input de código
          document.getElementById("register-fields").style.display = "none";
          document.getElementById("codeSection").style.display = "block";
          document.getElementById("submit-register-btn").style.display = "none";
          isVerifyingCode = true;
        } else {
          // 🚨 Manejo de errores: mostrar mensaje al usuario
          console.error(
            "Error en el registro:",
            data.msg || response.statusText
          );
          alert(
            data.msg ||
              "Error al registrar usuario. Por favor, intenta de nuevo."
          ); // Un ejemplo simple
        }
      } catch (error) {
        // 🚨 Manejo de errores de red
        console.error("Error de red:", error);
        alert("Error de red. Por favor, verifica tu conexión a Internet.");
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
          const response = await fetch(
            `http://localhost:5000/api/auth/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                code,
                email: emailRegistro,
                password: passwordRegistro,
                username: usernameRegistro
              }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            console.log("Verificacion exitosa:", data);
            //Guardar el token
          } else {
            console.error(
              "Error en la verificacion:",
              data.msg || response.statusText
            );
          }
        } catch (error) {
          console.error("Error de red:", error);
        }
      });

    //  Funcionalidad de INICIO DE SESIÓN (Supabase)

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
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

    // Carrusel principal
    const carouselTrack = document.querySelector(".carrusel-pista");
    const carouselSlides = document.querySelectorAll(".carrusel-slide");
    const prevButton = document.querySelector(".carrusel-boton.prev");
    const nextButton = document.querySelector(".carrusel-boton.next");

    let slideIndex = 0;
    let intervalId;

    function updateCarousel() {
      const slideWidth = carouselSlides[0].offsetWidth;
      carouselTrack.style.transform = `translateX(-${
        slideIndex * slideWidth
      }px)`;
    }

    function nextSlide() {
      slideIndex = (slideIndex + 1) % carouselSlides.length;
      updateCarousel();
    }

    function prevSlide() {
      slideIndex =
        (slideIndex - 1 + carouselSlides.length) % carouselSlides.length;
      updateCarousel();
    }

    // Función para iniciar el avance automático
    function startCarousel() {
      intervalId = setInterval(nextSlide, 10000); // Cambia de slide cada 10 segundos
    }

    // Función para detener el avance automático
    function stopCarousel() {
      clearInterval(intervalId);
    }

    nextButton.addEventListener("click", () => {
      stopCarousel(); //Detener intervalo automatico al clicar boton siguiente
      nextSlide();
      startCarousel(); //Reanudar automaticamente
    });

    prevButton.addEventListener("click", () => {
      stopCarousel(); //Detener intervalo automatico al clicar boton anterior
      prevSlide();
      startCarousel(); //Reanudar automaticamente
    });

    // Llamada inicial a updateCarousel para el desplazamiento
    updateCarousel();

    // Iniciar el avance automático al cargar la página
    startCarousel();

    //

    document.querySelectorAll(".pelicula").forEach((pelicula) => {
      pelicula.addEventListener("click", () => {
        const id = pelicula.getAttribute("data-id");
        if (id) {
          window.location.href = `/FrontEnd/Index/plantilla.html?id=${id}`;
        }
      });
    });
  }
});
