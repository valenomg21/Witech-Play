document.addEventListener('DOMContentLoaded', () => {
    const seccionSeguirViendo = document.getElementById('seccion-seguir-viendo');
    const carruselContenedor = document.getElementById('carrusel-seguir-viendo');

    if (!seccionSeguirViendo || !carruselContenedor) {
        return;
    }

    // 1. Obtener el historial del localStorage
    function getHistorial() {
        try {
            const historialGuardado = localStorage.getItem('historialWitechPlay');
            return historialGuardado ? JSON.parse(historialGuardado) : {};
        } catch (e) {
            console.error("Error al leer el historial del localStorage:", e);
            return {};
        }
    }

    // 2. Crear la tarjeta HTML con la barra de progreso
    function crearTarjetaHistorialHTML(item, progreso) {
    const todoElContenido = { ...window.peliculas, ...window.series };
    const data = todoElContenido[item];

    if (!data) return '';

    const imagenSrc = data.imagenTarjeta || '/FrontEnd/Imagenes/placeholder-poster.webp';
    const altText = data.titulo || 'Título no disponible';

    // Se mantiene la estructura con el botón dentro del overlay
    return `
        <div class="pelicula-wrapper">
          <div class="pelicula con-progreso" data-id="${item}">
            <img src="${imagenSrc}" alt="${altText}" loading="lazy" />
            
            <div class="overlay-reanudar">
                <button class="boton-reanudar" aria-label="Reanudar ${altText}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.555 5.169a1 1 0 0 1 1.482-.858l10.609 6.154a1 1 0 0 1 0 1.716L8.037 18.337a1 1 0 0 1-1.482-.858V5.169z"/>
                    </svg>
                </button>
            </div>
            
            <div class="barra-progreso-visualizacion">
                <div class="progreso" style="width: ${progreso}%;"></div>
            </div>
          </div>
        </div>
    `;
    }

    // 3. Renderizar el carrusel
    function renderizarCarrusel() {
        const historial = getHistorial();
        const itemsEnHistorial = Object.keys(historial);

        if (itemsEnHistorial.length === 0) {
            seccionSeguirViendo.style.display = 'none'; // Ocultar la sección si no hay historial
            return;
        }

        // Ordenar por la última vez que se vio (más reciente primero)
        itemsEnHistorial.sort((a, b) => historial[b].timestamp - historial[a].timestamp);

        let carruselHTML = '';
        itemsEnHistorial.forEach(id => {
            const progreso = historial[id].progreso;
            carruselHTML += crearTarjetaHistorialHTML(id, progreso);
        });

        carruselContenedor.innerHTML = carruselHTML;
        seccionSeguirViendo.style.display = 'block'; // Mostrar la sección

        carruselContenedor.querySelectorAll('.boton-reanudar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que el clic se propague a otros elementos
            const tarjeta = boton.closest('.pelicula.con-progreso');
            const idContenido = tarjeta.dataset.id;
            if (idContenido) {
                // Actualizamos el historial y redirigimos
                if (typeof guardarEnHistorial === 'function') {
                    guardarEnHistorial(idContenido);
                }
                window.location.href = `/FrontEnd/Index/plantilla.html?id=${idContenido}`;
            }
        });
    });

        // IMPORTANTE: Reiniciar la lógica del carrusel para esta nueva sección
        const carruselControl = seccionSeguirViendo.querySelector('.carrusel-control');
        if (carruselControl && typeof initCarousel === 'function') {
            initCarousel(carruselControl);
        }
    }

    // 4. Iniciar el renderizado
    // Asegurarnos que los datos de películas y series ya estén cargados
    if (window.peliculas && window.series) {
        renderizarCarrusel();
    } else {
        // Si data.js carga de forma asíncrona (no es el caso, pero es buena práctica)
        // se podría usar un observer o un evento personalizado.
        console.warn("Datos de películas/series no disponibles al cargar seguir-viendo.js");
    }

});
