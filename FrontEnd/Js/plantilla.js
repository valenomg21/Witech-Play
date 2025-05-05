document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const loader = document.getElementById('loader');
  const mainContainer = document.querySelector("main.contenedor-pelicula");
  const overlay = document.getElementById("video-overlay");
  const video = document.getElementById("video-full");

  // Asegúrate que el overlay esté oculto al cargar (por si acaso)
  overlay.style.display = "none";

  // Cierra overlay si clic fuera del video
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      video.pause();
      video.src = "";
    }
  });

  if (id && peliculas[id]) {
    loader.style.display = "block";
    mainContainer.style.display = "none";

    setTimeout(() => {
      const data = peliculas[id];

      document.querySelector(".titulo-pelicula").textContent = data.titulo;
      document.querySelector(".duracion-pelicula").textContent = data.duracion;
      document.querySelector(".año-pelicula").textContent = data.año;
      document.querySelector(".sinopsis-pelicula").textContent = data.sinopsis;
      document.querySelector(".imagen-fondo").style.backgroundImage = `url(${data.imagenFondo})`;

      const generosContainer = document.querySelector(".generos-pelicula");
      generosContainer.innerHTML = data.generos.map(genero =>
        `<a href="#" class="link-genero">${genero}</a>`
      ).join(", ");

      const detalles = document.getElementById("detalles-adicionales");
      detalles.innerHTML = `
        <p><strong>Año de lanzamiento:</strong> ${data.año}</p>
        <p><strong>Elenco:</strong> ${data.elenco}</p>
        <p><strong>Director:</strong> ${data.director}</p>
      `;

      const botonVerMas = document.querySelector(".boton-ver-mas");
      botonVerMas.addEventListener("click", () => {
        detalles.classList.toggle("visible");
        botonVerMas.textContent = detalles.classList.contains("visible") ? "Ver menos" : "Ver más";
      });

      const botonVerAhora = document.querySelector(".boton-ver-ahora");
      botonVerAhora.addEventListener("click", () => {
        video.src = data.video;
        overlay.style.display = "flex";
        video.play();
      });

      loader.style.display = "none";
      mainContainer.style.display = "block";
    }, 500);
  } else {
    // Si no hay id o no existe, muestra error
    const errorMensaje = document.createElement('p');
    errorMensaje.textContent = 'Película no encontrada.';
    errorMensaje.style.color = 'red';
    mainContainer.appendChild(errorMensaje);
    loader.style.display = "none";
    mainContainer.style.display = "block";
  }
});
