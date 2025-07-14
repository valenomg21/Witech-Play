document.addEventListener('DOMContentLoaded', () => {
    const seccionSeguirViendo = document.getElementById('seccion-seguir-viendo');
    const carruselContenedor = document.getElementById('carrusel-seguir-viendo');

    if (!seccionSeguirViendo || !carruselContenedor) {
        return; // Salir si los elementos no existen
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

        if (!data) return ''; // Si el item ya no existe en data.js

        const imagenSrc = data.imagenTarjeta || '/FrontEnd/Imagenes/placeholder-poster.webp';
        const altText = data.titulo || 'Título no disponible';

        return `
            <div class="pelicula-wrapper">
              <div class="pelicula con-progreso" data-id="${item}">
                <img src="${imagenSrc}" alt="${altText}" loading="lazy" />
                
                <div class="overlay-reanudar">
                    <button class="boton-reanudar" aria-label="Reanudar ${altText}">
                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
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

// --- FUNCIÓN PARA GUARDAR EN EL HISTORIAL (para ser llamada desde otras partes) ---
// La hacemos global para poder llamarla desde plantilla.js
function guardarEnHistorial(idContenido) {
    if (!idContenido) return;

    try {
        const historialGuardado = localStorage.getItem('historialWitechPlay');
        let historial = historialGuardado ? JSON.parse(historialGuardado) : {};

        // Simulamos un progreso aleatorio entre 20% y 80%
        const progresoSimulado = Math.floor(Math.random() * 61) + 20;

        historial[idContenido] = {
            progreso: progresoSimulado,
            timestamp: Date.now() // Guardamos la fecha para ordenar por más reciente
        };

        // Limitar el historial a, por ejemplo, los últimos 20 items
        const historialKeys = Object.keys(historial);
        if (historialKeys.length > 20) {
            historialKeys.sort((a, b) => historial[a].timestamp - historial[b].timestamp);
            delete historial[historialKeys[0]]; // Eliminar el más antiguo
        }

        localStorage.setItem('historialWitechPlay', JSON.stringify(historial));
        console.log(`Guardado en historial: ${idContenido} con ${progresoSimulado}% de progreso.`);

    } catch (e) {
        console.error("Error al guardar en el historial:", e);
    }
}