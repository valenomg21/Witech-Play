document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const loader = document.getElementById('loader');
  const mainContainer = document.querySelector("main.contenedor-principal-detalle");

  // Elementos del Overlay de Video
  const overlay = document.getElementById("video-overlay");
  const videoIframePlayer = document.getElementById("video-player-iframe");
  const closeVideoOverlayButton = document.getElementById("close-video-overlay-button");

  // Referencias a elementos de la plantilla
  const tituloEl = document.querySelector(".titulo-contenido");
  const imagenFondoEl = document.querySelector(".imagen-fondo");
  const sinopsisEl = document.querySelector(".sinopsis-contenido");
  const generosContainer = document.querySelector(".generos-contenido");
  const añoEl = document.querySelector(".año-contenido");
  
  const infoPeliculaDuracionEl = document.querySelector(".info-pelicula-duracion");
  const botonesPeliculaEl = document.querySelector(".botones-pelicula");
  const botonVerAhoraEl = document.querySelector(".boton-ver-ahora");
  const botonVerMasPeliculaEl = document.querySelector(".boton-ver-mas");
  const detallesAdicionalesPeliculaEl = document.getElementById("detalles-adicionales-pelicula");

  const infoSerieTemporadasEstadoEl = document.querySelector(".info-serie-temporadas-estado");
  const controlesSerieEl = document.querySelector(".controles-serie");
  const serieElencoEl = document.querySelector(".serie-elenco");
  const serieCreadoresEl = document.querySelector(".serie-creadores");
  
  // Contenedores para la lógica de series
  const listaBotonesTemporadasEl = document.querySelector(".lista-botones-temporadas");
  const listaCapitulosContainerEl = document.querySelector(".lista-capitulos-container");
  const listaCapitulosUlEl = document.querySelector(".lista-capitulos"); // El <ul> dentro del container

  const separadoresInfo = document.querySelectorAll(".separador-info");

  let datosCompletosSerie = null; // Para guardar los datos de la serie actual y acceder a ellos fácilmente

  function closeOverlay() {
    if (overlay) overlay.style.display = "none";
    if (videoIframePlayer) videoIframePlayer.src = "";
  }

  if (overlay) overlay.style.display = "none";
  if (videoIframePlayer) videoIframePlayer.src = "";
  if (closeVideoOverlayButton) closeVideoOverlayButton.addEventListener("click", closeOverlay);
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  let data = null;
  let tipoContenido = null;

  if (id) {
    if (window.peliculas && window.peliculas[id]) {
      data = window.peliculas[id];
      tipoContenido = "pelicula";
    } else if (window.series && window.series[id]) {
      data = window.series[id];
      tipoContenido = "serie";
      datosCompletosSerie = data; // Guardamos referencia para las funciones de serie
    }
  }

  if (data) {
    if(loader) loader.style.display = "block";
    if(mainContainer) mainContainer.style.display = "none";

    setTimeout(() => {
      if (tituloEl) tituloEl.textContent = data.titulo;
      if (imagenFondoEl && data.imagenFondo) imagenFondoEl.style.backgroundImage = `url(${data.imagenFondo})`;
      if (sinopsisEl) sinopsisEl.textContent = data.sinopsis || data.sinopsisGeneral || "Sinopsis no disponible.";
      
      if (generosContainer && data.generos && data.generos.length > 0) {
        generosContainer.innerHTML = data.generos.map(genero => `<a href="#" class="link-genero">${genero}</a>`).join(", ");
        separadoresInfo.forEach(sep => sep.style.display = "inline");
      } else {
         generosContainer.innerHTML = "";
      }

      if (tipoContenido === "pelicula") {
        if (infoPeliculaDuracionEl) {
            infoPeliculaDuracionEl.textContent = data.duracion;
            infoPeliculaDuracionEl.style.display = "inline";
        }
        if (añoEl) añoEl.textContent = data.año;
        if (botonesPeliculaEl) botonesPeliculaEl.style.display = "flex";
        if (controlesSerieEl) controlesSerieEl.style.display = "none";
        if (infoSerieTemporadasEstadoEl) infoSerieTemporadasEstadoEl.style.display = "none";


        if (detallesAdicionalesPeliculaEl) {
            detallesAdicionalesPeliculaEl.innerHTML = `
                <p><strong>Año de lanzamiento:</strong> ${data.año || "N/A"}</p>
                <p><strong>Elenco:</strong> ${data.elenco || "N/A"}</p>
                <p><strong>Director:</strong> ${data.director || "N/A"}</p>
            `;
        }
        if (botonVerMasPeliculaEl && detallesAdicionalesPeliculaEl) {
            botonVerMasPeliculaEl.addEventListener("click", () => {
                detallesAdicionalesPeliculaEl.classList.toggle("visible");
                botonVerMasPeliculaEl.textContent = detallesAdicionalesPeliculaEl.classList.contains("visible") ? "Ver menos" : "Ver más";
            });
        }
        if (botonVerAhoraEl && videoIframePlayer && overlay) {
            botonVerAhoraEl.addEventListener("click", () => {
                videoIframePlayer.src = data.video;
                overlay.style.display = "flex";
                if (typeof guardarEnHistorial === 'function') {
                       guardarEnHistorial(id); 
                }
            });
        }

      } else if (tipoContenido === "serie") {
        if (infoSerieTemporadasEstadoEl) {
            let textoTemporadas = datosCompletosSerie.temporadas ? `${datosCompletosSerie.temporadas.length} Temporada(s)` : "Info no disponible";
            let textoEstado = datosCompletosSerie.estadoEmision ? `· ${datosCompletosSerie.estadoEmision}` : "";
            infoSerieTemporadasEstadoEl.textContent = `${textoTemporadas} ${textoEstado}`;
            infoSerieTemporadasEstadoEl.style.display = "inline";
        }
        if (infoPeliculaDuracionEl) infoPeliculaDuracionEl.style.display = "none";

        if (añoEl) {
            if (datosCompletosSerie.añoFin && datosCompletosSerie.añoFin !== datosCompletosSerie.añoInicio) {
                añoEl.textContent = `${datosCompletosSerie.añoInicio} - ${datosCompletosSerie.añoFin === null || datosCompletosSerie.añoFin === "Presente" ? "Presente" : datosCompletosSerie.añoFin}`;
            } else {
                añoEl.textContent = datosCompletosSerie.añoInicio;
            }
        }
        if (botonesPeliculaEl) botonesPeliculaEl.style.display = "none";
        if (controlesSerieEl) controlesSerieEl.style.display = "block";

        if(serieElencoEl && datosCompletosSerie.elencoPrincipal) serieElencoEl.textContent = datosCompletosSerie.elencoPrincipal.join(", ");
        if(serieCreadoresEl && datosCompletosSerie.creadores) serieCreadoresEl.textContent = datosCompletosSerie.creadores.join(", ");
        
        // --- Lógica para Temporadas y Capítulos ---
        renderizarBotonesTemporada();
        // Opcionalmente, cargar la primera temporada por defecto:
        if (datosCompletosSerie.temporadas && datosCompletosSerie.temporadas.length > 0) {
             // Asegúrate de que listaBotonesTemporadasEl ya tenga los botones para poder aplicar la clase 'activo'
            setTimeout(() => { // Pequeño timeout para asegurar que los botones están en el DOM
                const primerBotonTemporada = listaBotonesTemporadasEl.querySelector('.boton-temporada');
                if (primerBotonTemporada) {
                    primerBotonTemporada.classList.add('activo');
                    renderizarCapitulos(datosCompletosSerie.temporadas[0].numeroTemporada);
                }
            }, 0);
        }
      }

      if(loader) loader.style.display = "none";
      if(mainContainer) mainContainer.style.display = "block";
    }, 100);
  } else {
    if (mainContainer) {
        mainContainer.innerHTML = '';
        const errorMensaje = document.createElement('p');
        errorMensaje.textContent = `Contenido no encontrado. (ID: ${id})`;
        if (window.peliculas || window.series) {
            console.warn("IDs de películas disponibles:", window.peliculas ? Object.keys(window.peliculas) : "Ninguna");
            console.warn("IDs de series disponibles:", window.series ? Object.keys(window.series) : "Ninguna");
        } else {
            console.error("Los objetos window.peliculas y window.series no están definidos.");
        }
        errorMensaje.style.color = 'red';
        errorMensaje.style.textAlign = 'center';
        errorMensaje.style.marginTop = '50px';
        mainContainer.appendChild(errorMensaje);
        mainContainer.style.display = "block";
    }
    if(loader) loader.style.display = "none";
  }

  // --- Funciones para renderizar temporadas y capítulos ---
  function renderizarBotonesTemporada() {
    if (!listaBotonesTemporadasEl || !datosCompletosSerie || !datosCompletosSerie.temporadas) {
        console.warn("No se pueden renderizar botones de temporada: elementos faltantes o datos incompletos.");
        return;
    }
    listaBotonesTemporadasEl.innerHTML = ''; // Limpiar botones existentes

    datosCompletosSerie.temporadas.forEach(temporada => {
      const boton = document.createElement('button');
      boton.classList.add('boton-temporada');
      boton.textContent = temporada.nombreTemporada || `Temporada ${temporada.numeroTemporada}`;
      boton.dataset.numeroTemporada = temporada.numeroTemporada;

      boton.addEventListener('click', () => {
        // Quitar clase 'activo' de cualquier otro botón
        document.querySelectorAll('.boton-temporada.activo').forEach(btn => btn.classList.remove('activo'));
        // Añadir clase 'activo' al botón clickeado
        boton.classList.add('activo');
        renderizarCapitulos(temporada.numeroTemporada);
      });
      listaBotonesTemporadasEl.appendChild(boton);
    });
  }

  function renderizarCapitulos(numeroTemporadaSeleccionada) {
    if (!listaCapitulosUlEl || !listaCapitulosContainerEl || !datosCompletosSerie || !datosCompletosSerie.temporadas) {
        console.warn("No se pueden renderizar capítulos: elementos faltantes o datos incompletos.");
        return;
    }

    const temporadaData = datosCompletosSerie.temporadas.find(t => t.numeroTemporada === parseInt(numeroTemporadaSeleccionada));

    if (!temporadaData || !temporadaData.capitulos) {
      listaCapitulosUlEl.innerHTML = '<li>No hay capítulos disponibles para esta temporada.</li>';
      listaCapitulosContainerEl.style.display = 'block';
      return;
    }

    listaCapitulosUlEl.innerHTML = ''; // Limpiar lista de capítulos existente
    if (temporadaData.capitulos.length === 0) {
        listaCapitulosUlEl.innerHTML = '<li>No hay capítulos disponibles para esta temporada.</li>';
    } else {
        temporadaData.capitulos.forEach(capitulo => {
          const li = document.createElement('li');
          li.classList.add('item-capitulo');
          // Usar `<strong>` para el número y luego el título.
          li.innerHTML = `<strong>${capitulo.numeroCapituloEnTemporada}.</strong> ${capitulo.tituloCapitulo || `Capítulo ${capitulo.numeroCapituloEnTemporada}`}`;
          li.dataset.videoUrl = capitulo.videoUrl;

          li.addEventListener('click', () => {
            if (capitulo.videoUrl && capitulo.videoUrl !== "." && videoIframePlayer && overlay) { // Verificar que la URL no sea placeholder
              videoIframePlayer.src = capitulo.videoUrl;
              overlay.style.display = 'flex';

              if (typeof guardarEnHistorial === 'function') {
                  guardarEnHistorial(id); // <--- AÑADIR ESTA LÍNEA (aquí 'id' es el de la serie)
              }
            } else {
                alert("Video no disponible para este capítulo.");
                console.warn("URL de video no válida o faltante para el capítulo:", capitulo);
            }
          });
          listaCapitulosUlEl.appendChild(li);
        });
    }
    listaCapitulosContainerEl.style.display = 'block'; // Mostrar el contenedor de la lista de capítulos
  }

});