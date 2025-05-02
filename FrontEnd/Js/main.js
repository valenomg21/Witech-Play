document.addEventListener("DOMContentLoaded", function () {

  // Función para cargar archivos HTML y ejecutar callback
  function cargar(id, archivo, callback) {
    fetch(archivo)
      .then(res => res.text())
      .then(html => {
        document.getElementById(id).innerHTML = html;
        if (callback) callback(); // Ejecutar después de insertar
      })
      .catch(error => console.error(`Error cargando ${archivo}:`, error));
  }

  // Cargar header y footer
  cargar("header-container", "/FrontEnd/Index/header.htmlp", inicializarHeader);
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
      document.querySelectorAll(".panel-lateral .has-submenu.open").forEach(li => {
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
    if (
      !panel.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
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
  document.querySelectorAll(".panel-lateral .submenu-toggle").forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      if (e.target.tagName.toLowerCase() === 'a') return;

      const parentLi = this.closest('.has-submenu');
      parentLi.classList.toggle("open");

      document.querySelectorAll(".panel-lateral .has-submenu").forEach(li => {
        if (li !== parentLi) li.classList.remove("open");
      });
    });
  });


// Popup Login /

const btnLogin = document.querySelector(".btn-login");
const popupOverlay = document.getElementById("popup-overlay");
const closePopup = document.getElementById("close-popup");
const togglePasswordBtn = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

const loginForm = document.querySelector(".popup-form form"); // primer form visible
const registerForm = document.getElementById("register-form");
const showRegister = document.getElementById("show-register");
const showLogin = document.getElementById("show-login");

togglePasswordBtn.addEventListener("click", () => {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  togglePasswordBtn.textContent = isVisible ? "👁️" : "🙈"; // Cambia el ícono
});

btnLogin.addEventListener("click", () => {
  popupOverlay.style.display = "flex";
  loginForm.style.display = "block";
  if (registerForm) registerForm.style.display = "none";
});

closePopup.addEventListener("click", () => {
  popupOverlay.style.display = "none";
  // Resetear estados del formulario de registro
  document.getElementById("register-fields").style.display = "block";
  document.getElementById("codeSection").style.display = "none";
  document.getElementById("submit-register-btn").style.display =
    "inline-block";
  isVerifyingCode = false;
});

popupOverlay.addEventListener("click", (e) => {
  if (e.target === popupOverlay) {
    popupOverlay.style.display = "none";
  }
});

// 🔁 Alternar entre login y registro
if (showRegister && showLogin && loginForm && registerForm) {
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    // 💡 Resetear formulario
    document.getElementById("register-fields").style.display = "block";
    document.getElementById("codeSection").style.display = "none";
    document.getElementById("submit-register-btn").style.display =
      "inline-block";

    // Reiniciar estado
    isVerifyingCode = false;
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  });
}

let isVerifyingCode = false; // estado

// ✅ Validar que las contraseñas coincidan al registrar
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!isVerifyingCode) {
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword =
      document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("password-error");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput =
      document.getElementById("confirm-password");

    if (newPassword !== confirmPassword) {
      // Mostrar mensaje de error
      errorMessage.textContent = "Las contraseñas no coinciden.";
      errorMessage.style.display = "block";
      newPasswordInput.classList.add("error");
      confirmPasswordInput.classList.add("error");
      return;
    }
    // Si todo bien: mostrar input de código
    document.getElementById("register-fields").style.display = "none";
    document.getElementById("codeSection").style.display = "block";
    document.getElementById("submit-register-btn").style.display = "none";

    

    isVerifyingCode = true; // cambiamos al estado de verificación
  } else {
    // SEGUNDO PASO: Validar el código ingresado
    const code = document.getElementById("code").value;
            const email = document.getElementById("email").value;
            const newPassword = document.getElementById("new-password").value;

    // Validá el código ingresado (podés hacer fetch al backend)
    console.log("Verificando código:", code);

    registrarUsuario(email, newPassword, code);
  }
});


function registrarUsuario(email, password) {
// 1. Enviar código de verificación
firebase.functions().httpsCallable('sendVerificationCode')({ email: email })
    .then(result => {
        console.log(result.data.result);
        alert("Código de verificación enviado");
        // 2. Mostrar formulario de verificación
        //mostrarFormularioVerificacion(email, password);
    })
    .catch(error => {
        console.error("Error sending verification code:", error);
        alert(error.message);
    });
}

//Función para verificar código
function verificarCodigo(email, password, code) {
firebase.functions().httpsCallable('verifyCode')({ email: email, code: code })
    .then(result => {
        console.log(result.data.result);

        // 3. Crear la cuenta con createUserWithEmailAndPassword
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    })
    .then(userCredential => {
        console.log("User registered:", userCredential.user);
        alert("Registro completado con éxito");
        popupOverlay.style.display = "none";
        registerForm.reset();
    })
    .catch(error => {
        console.error("Error verifying code or creating user:", error);
        alert(error.message);
    });
}


  // Carrusel principal
  const botonIzquierdo = document.querySelector(".carrusel-boton.izquierdo");
  const botonDerecho = document.querySelector(".carrusel-boton.derecho");
  const carruselItems = document.querySelector(".carrusel-items");
  const imagenes = document.querySelectorAll(".carrusel-imagen");
  const carrusel = document.querySelector(".carrusel");
  const contenedorIndicadores = document.querySelector(".carrusel-indicadores");

  let indice = 0;
  let intervalo = null;

  imagenes.forEach((_, i) => {
    const punto = document.createElement("div");
    punto.classList.add("carrusel-indicador");
    if (i === 0) punto.classList.add("activo");
    punto.addEventListener("click", () => {
      indice = i;
      actualizarCarrusel();
      reiniciarIntervalo();
    });
    contenedorIndicadores.appendChild(punto);
  });

  function actualizarIndicadores() {
    const puntos = document.querySelectorAll(".carrusel-indicador");
    puntos.forEach((punto, i) => {
      punto.classList.toggle("activo", i === indice);
    });
  }

  function actualizarCarrusel() {
    carruselItems.style.transform = `translateX(calc(-${indice} * 100%))`;
    actualizarIndicadores();
  }

  function avanzarAutomaticamente() {
    intervalo = setInterval(() => {
      indice = (indice + 1) % imagenes.length;
      actualizarCarrusel();
    }, 10000);
  }

  function reiniciarIntervalo() {
    clearInterval(intervalo);
    avanzarAutomaticamente();
  }

  botonDerecho.addEventListener("click", () => {
    indice = (indice + 1) % imagenes.length;
    actualizarCarrusel();
    reiniciarIntervalo();
  });

  botonIzquierdo.addEventListener("click", () => {
    indice = (indice - 1 + imagenes.length) % imagenes.length;
    actualizarCarrusel();
    reiniciarIntervalo();
  });

  carrusel.addEventListener("mouseenter", () => clearInterval(intervalo));
  carrusel.addEventListener("mouseleave", avanzarAutomaticamente);

  actualizarCarrusel();
  avanzarAutomaticamente();

  //

  document.querySelectorAll('.pelicula').forEach(pelicula => {
    pelicula.addEventListener('click', () => {
      const id = pelicula.getAttribute('data-id');
      if (id) {
        window.location.href = `/FrontEnd/Index/plantilla.html?id=${id}`;
      }
    });
  });
  }
});
