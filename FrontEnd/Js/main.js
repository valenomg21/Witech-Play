// FrontEnd/Js/main.js

document.addEventListener("DOMContentLoaded", function () {
  // --- Lógica de la Pantalla de Carga ---
  window.addEventListener('load', function() {
    const pantallaCarga = document.getElementById('pantalla-carga');
    if (pantallaCarga) {
      setTimeout(() => {
        pantallaCarga.classList.add('oculta');
      }, 400);
    }
  });


  const contenedorPrincipalPeliculas = document.querySelector(".contenedor-principal") || document.body;

  contenedorPrincipalPeliculas.addEventListener('click', function(event) {
    const pelicula = event.target.closest('.pelicula'); // Encuentra el elemento .pelicula más cercano al clic
    if (pelicula) {
      const id = pelicula.getAttribute('data-id');
      if (id) {
        window.location.href = `/FrontEnd/Index/plantilla.html?id=${id}`;
      }
    }
  });

}); // Fin del DOMContentLoaded

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