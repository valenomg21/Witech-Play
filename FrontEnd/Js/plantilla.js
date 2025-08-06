document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // --- Selección de Elementos del DOM ---
  const loader = document.getElementById('pantalla-carga');
  const mainContainer = document.querySelector(".detalle-main-container");
  
  // Elementos del Overlay de Video
  const overlay = document.getElementById("video-overlay");
  const videoIframePlayer = document.getElementById("video-player-iframe");
  const closeVideoOverlayButton = document.getElementById("close-video-overlay-button");

  // Elementos de la sección Hero
  const tituloEl = document.querySelector(".titulo-contenido");
  const paginaFondoEl = document.querySelector(".pagina-fondo");
  const posterPrincipalImg = document.getElementById('poster-principal');
  const sinopsisEl = document.querySelector(".sinopsis-contenido");
  const generosContainer = document.querySelector(".generos-contenido");
  const añoEl = document.querySelector(".año-contenido");
  const infoPeliculaDuracionEl = document.querySelector(".info-pelicula-duracion");
  const infoSerieTemporadasEstadoEl = document.querySelector(".info-serie-temporadas-estado");
  const separadoresInfo = document.querySelectorAll(".separador-info");

  // Controles de Película
  const botonesPeliculaEl = document.querySelector(".botones-pelicula");
  const botonVerAhoraEl = document.querySelector(".boton-ver-ahora");

  // Controles de Serie
  const controlesSerieEl = document.querySelector(".controles-serie");
  const listaBotonesTemporadasEl = document.querySelector(".lista-botones-temporadas");
  const listaCapitulosContainerEl = document.querySelector(".lista-capitulos-container");
  const listaCapitulosUlEl = document.querySelector(".lista-capitulos");

  // Elementos de la sección "Detalles Adicionales"
  const itemElencoDiv = document.getElementById('item-elenco');
  const itemCreadoresDiv = document.getElementById('item-creadores');
  const itemDirectorDiv = document.getElementById('item-director');
  const serieElencoSpan = document.querySelector('.serie-elenco');
  const serieCreadoresSpan = document.querySelector('.serie-creadores');
  const valorDirectorSpan = document.getElementById('valor-director');

  let datosCompletosSerie = null;
  let data = null;
  let tipoContenido = null;

  // --- Funciones Auxiliares ---
  function closeOverlay() {
    if (overlay) overlay.style.display = "none";
    if (videoIframePlayer) videoIframePlayer.src = "";
  }

  // --- Lógica Principal ---
  if (id) {
    if (window.peliculas && window.peliculas[id]) {
      data = window.peliculas[id];
      tipoContenido = "pelicula";
    } else if (window.series && window.series[id]) {
      data = window.series[id];
      tipoContenido = "serie";
      datosCompletosSerie = data;
    }
  }

  if (data) {
    // Rellenar la información común
    document.title = `${data.titulo} - Witech Play`;
    if (tituloEl) tituloEl.textContent = data.titulo;
    if (paginaFondoEl && data.imagenFondo) paginaFondoEl.style.backgroundImage = `url(${data.imagenFondo})`;
    if (posterPrincipalImg && data.imagenTarjeta) posterPrincipalImg.src = data.imagenTarjeta;
    if (sinopsisEl) sinopsisEl.textContent = data.sinopsis || data.sinopsisGeneral || "Sinopsis no disponible.";
    
    if (generosContainer && data.generos && data.generos.length > 0) {
      generosContainer.innerHTML = data.generos.map(g => `<span class="link-genero">${g}</span>`).join(', ');
    } else {
      generosContainer.innerHTML = "";
    }

    // Lógica específica por tipo de contenido
    if (tipoContenido === "pelicula") {
      if (infoPeliculaDuracionEl) {
        infoPeliculaDuracionEl.textContent = data.duracion;
        infoPeliculaDuracionEl.style.display = "inline";
      }
      if (añoEl) añoEl.textContent = data.año;
      if (botonesPeliculaEl) botonesPeliculaEl.style.display = "flex";

      // Rellenar detalles adicionales de la película
      if (data.elenco && serieElencoSpan) {
        serieElencoSpan.textContent = data.elenco;
        if(itemElencoDiv) itemElencoDiv.style.display = 'block';
      }
      if (data.director && valorDirectorSpan) {
        valorDirectorSpan.textContent = data.director;
        if(itemDirectorDiv) itemDirectorDiv.style.display = 'block';
      }

    } else if (tipoContenido === "serie") {
      if (infoSerieTemporadasEstadoEl) {
        let textoTemporadas = datosCompletosSerie.temporadas ? `${datosCompletosSerie.temporadas.length} Temporada(s)` : "";
        infoSerieTemporadasEstadoEl.textContent = textoTemporadas;
        infoSerieTemporadasEstadoEl.style.display = "inline";
      }
      if (añoEl) {
        añoEl.textContent = `${datosCompletosSerie.añoInicio} - ${datosCompletosSerie.añoFin || "Presente"}`;
      }
      if (controlesSerieEl) controlesSerieEl.style.display = "block";

      // Rellenar detalles adicionales de la serie
      if (datosCompletosSerie.elencoPrincipal && serieElencoSpan) {
        serieElencoSpan.textContent = datosCompletosSerie.elencoPrincipal.join(', ');
        if(itemElencoDiv) itemElencoDiv.style.display = 'block';
      }
      if (datosCompletosSerie.creadores && serieCreadoresSpan) {
        serieCreadoresSpan.textContent = datosCompletosSerie.creadores.join(', ');
        if(itemCreadoresDiv) itemCreadoresDiv.style.display = 'block';
      }

      // Renderizar temporadas y capítulos
      renderizarBotonesTemporada();
      if (datosCompletosSerie.temporadas && datosCompletosSerie.temporadas.length > 0) {
        setTimeout(() => {
          const primerBotonTemporada = listaBotonesTemporadasEl.querySelector('.boton-temporada');
          if (primerBotonTemporada) {
            primerBotonTemporada.click();
          }
        }, 0);
      }
    }

  } else {
    // Manejo de error si no se encuentra el contenido
    if (mainContainer) {
      mainContainer.innerHTML = `<h1 style="text-align: center; margin-top: 50px;">Contenido no encontrado.</h1>`;
    }
  }

  // --- Event Listeners ---
  if (closeVideoOverlayButton) closeVideoOverlayButton.addEventListener("click", closeOverlay);
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });

  if (botonVerAhoraEl) {
    botonVerAhoraEl.addEventListener("click", () => {
      if (data.video && videoIframePlayer && overlay) {
        videoIframePlayer.src = data.video;
        overlay.style.display = "flex";
        if (typeof guardarEnHistorial === 'function') {
          guardarEnHistorial(id);
        }
      }
    });
  }

  // --- Funciones de Renderizado para Series ---
  function renderizarBotonesTemporada() {
    if (!listaBotonesTemporadasEl || !datosCompletosSerie || !datosCompletosSerie.temporadas) return;
    listaBotonesTemporadasEl.innerHTML = '';
    datosCompletosSerie.temporadas.forEach(temporada => {
      const boton = document.createElement('button');
      boton.classList.add('boton-temporada');
      boton.textContent = temporada.nombreTemporada || `Temporada ${temporada.numeroTemporada}`;
      boton.addEventListener('click', () => {
        document.querySelectorAll('.boton-temporada.activo').forEach(btn => btn.classList.remove('activo'));
        boton.classList.add('activo');
        renderizarCapitulos(temporada.numeroTemporada);
      });
      listaBotonesTemporadasEl.appendChild(boton);
    });
  }

  function renderizarCapitulos(numTemporada) {
    if (!listaCapitulosUlEl || !listaCapitulosContainerEl || !datosCompletosSerie || !datosCompletosSerie.temporadas) return;
    const temporadaData = datosCompletosSerie.temporadas.find(t => t.numeroTemporada === numTemporada);
    if (!temporadaData || !temporadaData.capitulos) {
      listaCapitulosUlEl.innerHTML = '<li>No hay capítulos disponibles para esta temporada.</li>';
      listaCapitulosContainerEl.style.display = 'block';
      return;
    }
    listaCapitulosUlEl.innerHTML = '';
    temporadaData.capitulos.forEach(capitulo => {
      const li = document.createElement('li');
      li.classList.add('item-capitulo');
      li.innerHTML = `<strong>${capitulo.numeroCapituloEnTemporada}.</strong> ${capitulo.tituloCapitulo || `Capítulo ${capitulo.numeroCapituloEnTemporada}`}`;
      li.addEventListener('click', () => {
        if (capitulo.videoUrl && videoIframePlayer && overlay) {
          videoIframePlayer.src = capitulo.videoUrl;
          overlay.style.display = 'flex';
          if (typeof guardarEnHistorial === 'function') {
            guardarEnHistorial(id);
          }
        } else {
          alert("Video no disponible para este capítulo.");
        }
      });
      listaCapitulosUlEl.appendChild(li);
    });
    listaCapitulosContainerEl.style.display = 'block';
  }

});