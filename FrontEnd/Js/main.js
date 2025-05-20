document.addEventListener("DOMContentLoaded", function () {
  // --- Lógica de la Pantalla de Carga ---
  window.addEventListener('load', function() {
  const pantallaCarga = document.getElementById('pantalla-carga');
  if (pantallaCarga) {
  
     setTimeout(() => {
     pantallaCarga.classList.add('oculta');
     }, 800);
     }
});

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
  cargar("header-container", "/FrontEnd/Index/header.htmlp", () => {
    inicializarHeader()
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
      e.preventDefault()

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

    const carruselPrincipal = document.querySelector('.carrusel');

    if (!carruselPrincipal) {
        // console.warn("Carrusel principal no encontrado.");
        return;
    }

    const carouselTrack = carruselPrincipal.querySelector('.carrusel-pista');
    const prevButton = carruselPrincipal.querySelector('.carrusel-boton.prev');
    const nextButton = carruselPrincipal.querySelector('.carrusel-boton.next');
    
    const slidesOriginalesNodeList = carouselTrack ? carouselTrack.children : null;
    if (!carouselTrack || !slidesOriginalesNodeList || slidesOriginalesNodeList.length === 0 || !prevButton || !nextButton) {
        // console.warn("Elementos esenciales del carrusel faltantes o carrusel vacío.");
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        return;
    }

    const slidesOriginales = Array.from(slidesOriginalesNodeList);
    const slideCountOriginal = slidesOriginales.length;

    let carouselSlides = [];
    let slideWidthWithMargin = 0;
    let currentIndex = 0; // Índice en el array `carouselSlides` (que incluye clones)
    let isTransitioning = false;
    const transitionDurationCSS = 600; // ms, DEBE COINCIDIR CON CSS .carrusel-pista transform
    const transitionTimingFunctionCSS = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // DEBE COINCIDIR CON CSS
    let autoplayIntervalId;
    const autoplayDelay = 7000; // Ajusta este valor según necesites

    // Guardar una referencia a la función del listener para poder removerla y añadirla
    let transitionEndHandler; 

    function calculateDimensions() {
        if (slidesOriginales.length === 0) return;
        const slideParaMedir = slidesOriginales[0]; // Usar siempre un slide original para consistencia
        const style = window.getComputedStyle(slideParaMedir);
        slideWidthWithMargin = slideParaMedir.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        // console.log("Calculated slideWidthWithMargin:", slideWidthWithMargin);
    }

    function calculateTrackOffset() {
        if (slideWidthWithMargin === 0) {
            calculateDimensions();
            if (slideWidthWithMargin === 0) { // Si sigue siendo 0, algo está muy mal
                // console.error("slideWidthWithMargin sigue siendo 0 después de recalcular.");
                return 0;
            }
        }
        const contenedor = carruselPrincipal.querySelector('.carrusel-contenedor');
        if (!contenedor) {
            // console.error("Contenedor del carrusel no encontrado para calcular offset.");
            return 0;
        }
        const contenedorWidth = contenedor.offsetWidth;
        // El desplazamiento necesario para centrar el slide en `currentIndex`
        const offset = (contenedorWidth / 2) - (currentIndex * slideWidthWithMargin) - (slideWidthWithMargin / 2);
        return offset;
    }

    function applyTrackTransform(animate = true) {
        const offset = calculateTrackOffset();
        // console.log(`applyTrackTransform: animate=${animate}, offset=${offset}, currentIndex=${currentIndex}`);

        if (animate) {
            carouselTrack.style.transitionProperty = 'transform';
            carouselTrack.style.transitionDuration = `${transitionDurationCSS / 1000}s`;
            carouselTrack.style.transitionTimingFunction = transitionTimingFunctionCSS;
            carouselTrack.style.transitionDelay = '0s';
        } else {
            // Cuando no animamos, nos aseguramos de que todas las propiedades de transición
            // estén configuradas para no tener efecto.
            carouselTrack.style.transitionProperty = 'none';
            carouselTrack.style.transitionDuration = '0s';
            carouselTrack.style.transitionTimingFunction = 'linear'; // o cualquier valor, no importa
            carouselTrack.style.transitionDelay = '0s';
        }
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }

    function updateSlideClasses() {
        carouselSlides.forEach((slide, idx) => {
            slide.classList.remove('is-active', 'is-prev', 'is-next');
            if (idx === currentIndex) {
                slide.classList.add('is-active');
            }
            // Lógica simplificada para is-prev e is-next, enfocada en el estado real
            const prevVisualIndex = (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
            const nextVisualIndex = (currentIndex + 1) % carouselSlides.length;

            // Solo aplicar is-prev/is-next si hay suficientes slides y no estamos en un clon que cause confusión
            if (carouselSlides.length > 2) { // Necesitamos al menos 3 items (ej. Clon, Real, Clon) para tener prev/next visual
                 if (idx === prevVisualIndex && !(currentIndex === 0 && idx === carouselSlides.length -1) && !(currentIndex === 1 && idx === 0) ) {
                     slide.classList.add('is-prev');
                 }
                 if (idx === nextVisualIndex && !(currentIndex === carouselSlides.length -1 && idx === 0) && !(currentIndex === carouselSlides.length -2 && idx === carouselSlides.length -1)) {
                    slide.classList.add('is-next');
                 }
            }
        });
        // console.log(`updateSlideClasses: Active index=${currentIndex}`);
    }
    
    function handleJump() {
        // console.log(`handleJump START. Current currentIndex=${currentIndex}. isTransitioning=${isTransitioning}`);
        let jumped = false;
        let newLogicalIndexForJump = currentIndex;

        if (currentIndex === 0) { // En el clon izquierdo (que es copia del último original)
            newLogicalIndexForJump = slideCountOriginal; // El índice del último original en el array `carouselSlides`
            jumped = true;
        } else if (currentIndex === carouselSlides.length - 1) { // En el clon derecho (copia del primero original)
            newLogicalIndexForJump = 1; // El índice del primer original en el array `carouselSlides`
            jumped = true;
        }

        if (jumped) {
            currentIndex = newLogicalIndexForJump; // Actualizar el currentIndex global
            // console.log(`JUMP: currentIndex actualizado a ${currentIndex}`);
            
            // 1. Remover el listener de transitionend para evitar que capture el salto
            if (transitionEndHandler) {
                carouselTrack.removeEventListener('transitionend', transitionEndHandler);
                // console.log("JUMP: Removed transitionend listener.");
            }

            // 2. Establecer explícitamente que NO haya transición
            carouselTrack.style.transitionProperty = 'none';
            carouselTrack.style.transitionDuration = '0s';
            carouselTrack.style.transitionTimingFunction = 'linear';
            carouselTrack.style.transitionDelay = '0s';
            // console.log("JUMP: Set transition styles to none/0s.");

            // 3. Forzar un reflow para que el navegador procese los estilos de no-transición
            void carouselTrack.offsetWidth;
            // console.log("JUMP: Reflow forced.");

            // 4. Aplicar el nuevo transform DENTRO de un requestAnimationFrame
            requestAnimationFrame(() => {
                // console.log("JUMP: Inside first rAF. Applying transform.");
                const offset = calculateTrackOffset(); // currentIndex ya está actualizado
                carouselTrack.style.transform = `translateX(${offset}px)`;
                // console.log(`JUMP: Applied new transform translateX(${offset}px)`);
                
                updateSlideClasses(); // Actualizar clases inmediatamente después del transform

                // 5. Restaurar el listener en el SIGUIENTE frame
                requestAnimationFrame(() => {
                    // console.log("JUMP: Inside second rAF. Restoring listener.");
                    if (transitionEndHandler) {
                        carouselTrack.addEventListener('transitionend', transitionEndHandler);
                        // console.log("JUMP: Re-added transitionend listener.");
                    }
                    isTransitioning = false; // Marcar el fin de la operación de salto
                    // console.log(`handleJump END (after jump & re-add listener). isTransitioning set to ${isTransitioning}`);
                });
            });

        } else { // Si no hubo salto (handleJump fue llamado pero currentIndex no era un clon)
            isTransitioning = false; // Simplemente resetear isTransitioning
            // console.log(`handleJump END (no jump). isTransitioning set to ${isTransitioning}`);
        }
    }

    function moveTo(direction) {
        // console.log(`moveTo START. Direction: ${direction}. Current isTransitioning: ${isTransitioning}`);
        if (isTransitioning) {
            // console.warn("moveTo: Blocked because isTransitioning is true.");
            return;
        }
        isTransitioning = true; // Marcar como en transición ANTES de hacer cualquier cosa

        if (direction === 'next') {
            currentIndex++;
        } else if (direction === 'prev') {
            currentIndex--;
        } else if (typeof direction === 'number') { // Permitir mover a un índice específico
            currentIndex = direction;
        }
        
        // console.log(`moveTo: New currentIndex for animation = ${currentIndex}`);
        applyTrackTransform(true); // Mover CON animación
        updateSlideClasses();      // Actualizar clases para el estado durante la animación
    }
    
    function setupCarousel() {
        if (slideCountOriginal === 0) return;

        if (slideCountOriginal > 1) { // Clonar solo si hay más de un slide
            const firstOriginalSlide = slidesOriginales[0];
            const lastOriginalSlide = slidesOriginales[slideCountOriginal - 1];
            const cloneFirst = firstOriginalSlide.cloneNode(true);
            cloneFirst.classList.add('carousel-clone');
            const cloneLast = lastOriginalSlide.cloneNode(true);
            cloneLast.classList.add('carousel-clone');

            carouselTrack.appendChild(cloneFirst);
            carouselTrack.insertBefore(cloneLast, firstOriginalSlide);
            
            carouselSlides = Array.from(carouselTrack.children);
            // El primer slide real (original) ahora está en el índice 1 del array `carouselSlides`
            currentIndex = 1; 
        } else { // Solo un slide original, no se clona
            carouselSlides = [...slidesOriginales];
            currentIndex = 0; // Solo hay un slide en el índice 0
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
        
        calculateDimensions(); // Calcular dimensiones después de que los clones estén en el DOM
        applyTrackTransform(false); // Posicionar inicialmente SIN animación
        updateSlideClasses();

        // Definir la función del handler aquí para que tenga el scope correcto
        transitionEndHandler = (event) => {
            // Asegurarse de que el evento es para la propiedad 'transform' y el target es el carruselTrack
            if (event.propertyName !== 'transform' || event.target !== carouselTrack) {
                // console.log("Transitionend: Not for track's transform or wrong target, ignoring. Property:", event.propertyName, "Target:", event.target);
                return;
            }
            // console.log("Transitionend: Event for 'transform' received on track.");
            // Solo llamar a handleJump si realmente estábamos en una transición animada
            // y no si es un evento residual de un salto anterior.
            if (isTransitioning) { // Si isTransitioning es true, significa que una animación moveTo acaba de terminar
                 handleJump();
            } else {
                // console.warn("Transitionend: Received for transform, but isTransitioning was false. Likely a residual event. Ignoring handleJump call.");
            }
        };

        // Añadir el listener una sola vez al track
        carouselTrack.addEventListener('transitionend', transitionEndHandler);
    }

    function startAutoplay() {
        if (slideCountOriginal <= 1) return;
        stopAutoplay();
        autoplayIntervalId = setInterval(() => {
            moveTo('next');
        }, autoplayDelay);
        // console.log("Autoplay started.");
    }

    function stopAutoplay() {
        clearInterval(autoplayIntervalId);
        // console.log("Autoplay stopped.");
    }

    // --- Event Listeners ---
    nextButton.addEventListener('click', () => { stopAutoplay(); moveTo('next'); startAutoplay(); });
    prevButton.addEventListener('click', () => { stopAutoplay(); moveTo('prev'); startAutoplay(); });
    
    window.addEventListener('resize', () => {
        stopAutoplay();
        calculateDimensions();
        applyTrackTransform(false); // Reajustar posición SIN animación
        updateSlideClasses(); 
        startAutoplay();
    });
    
    // Opcional: Pausar en hover
    carruselPrincipal.addEventListener('mouseenter', stopAutoplay);
    carruselPrincipal.addEventListener('mouseleave', startAutoplay);

    // --- Inicialización ---
    setupCarousel();
    startAutoplay();


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