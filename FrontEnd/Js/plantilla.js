// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (peliculas[id]) {
    const data = peliculas[id];

    // Cargar datos principales
    document.querySelector(".titulo-pelicula").textContent = data.titulo;
    document.querySelector(".duracion-pelicula").textContent = data.duracion;
    document.querySelector(".año-pelicula").textContent = data.año;
    document.querySelector(".sinopsis-pelicula").textContent = data.sinopsis;
    document.querySelector(".imagen-fondo").style.backgroundImage = `url(${data.imagenFondo})`;
    document.querySelector("#URL").src = data.video;

    // Generar enlaces de géneros
    const generosContainer = document.querySelector(".generos-pelicula");
    generosContainer.innerHTML = data.generos
      .map(genero => `<a href="#" class="link-genero">${genero}</a>`)
      .join(", ");

    // Mostrar más detalles
    const detalles = document.getElementById("detalles-adicionales");
    detalles.innerHTML = `
      <p><strong>Año de lanzamiento:</strong> ${data.año}</p>
      <p><strong>Elenco:</strong> ${data.elenco}</p>
      <p><strong>Director:</strong> ${data.director}</p>
    `;

    // Botón "Ver más" para mostrar/ocultar detalles
    const botonVerMas = document.querySelector(".boton-ver-mas");
    if (botonVerMas && detalles) {
      botonVerMas.addEventListener("click", () => {
        detalles.classList.toggle("visible");
      });
    }

    // Botón "Ver ahora" para mostrar video en overlay
    const botonVerAhora = document.querySelector(".boton-ver-ahora");
    const overlay = document.getElementById("videoOverlay");
    const video = document.getElementById("videoFull");

    if (botonVerAhora && overlay && video) {
      botonVerAhora.addEventListener("click", () => {
        video.src = data.video;
        overlay.style.display = "flex";

        // Cerrar el overlay al hacer clic fuera del video
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.style.display = "none";
            video.pause();
            video.src = "";
          }
        });
      });
    }
  } else {
    console.warn("Película no encontrada.");
  }
});
