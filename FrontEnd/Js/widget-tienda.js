document.addEventListener('DOMContentLoaded', () => {
    const carruselWrapper = document.querySelector('.widget-tienda-carrusel-wrapper');
    if (!carruselWrapper) return; 

    const pista = carruselWrapper.querySelector('.widget-tienda-carrusel-pista');
    if (!pista || pista.children.length === 0) return;

    // --- Configuración de la animación ---
    // CAMBIO: Reducimos la velocidad del scroll. Un número más bajo es más lento.
    const velocidadScroll = 30; // Píxeles por segundo (antes 50)

    function iniciarAnimacion() {
        const alturaTotalPista = pista.scrollHeight / 2;
        // Evitar división por cero si la pista no tiene altura
        if (alturaTotalPista === 0) return;

        const duracion = alturaTotalPista / velocidadScroll;

        pista.style.animation = 'none';
        void pista.offsetWidth; // Forzar reflow
        pista.style.animation = `scrollVerticalInfinito ${duracion}s linear infinite`;
    }

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes scrollVerticalInfinito {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(-50%);
            }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // CAMBIO: Lógica de pausa/reanudación mejorada
    let isHovering = false;

    pista.addEventListener('mouseenter', () => {
        isHovering = true;
        pista.style.animationPlayState = 'paused';
    });

    pista.addEventListener('mouseleave', () => {
        isHovering = false;
        pista.style.animationPlayState = 'running';
    });

    // Iniciar y reiniciar en cambio de tamaño o visibilidad
    iniciarAnimacion();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Solo reiniciar si no estamos en hover, para no causar un salto visual
            if (!isHovering) {
                 iniciarAnimacion();
            }
        }, 250);
    });

    // Opcional: Pausar si la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pista.style.animationPlayState = 'paused';
        } else if (!isHovering) { // Solo reanudar si el cursor no está encima
            pista.style.animationPlayState = 'running';
        }
    });
});