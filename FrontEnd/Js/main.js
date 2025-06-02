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