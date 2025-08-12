document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // --- Selección de Elementos del DOM ---
  const mainContainer = document.querySelector(".detalle-main-container");
  const overlay = document.getElementById("video-overlay");
  const videoIframePlayer = document.getElementById("video-player-iframe");
  const closeVideoOverlayButton = document.getElementById("close-video-overlay-button");
  const tituloEl = document.querySelector(".titulo-contenido");
  const paginaFondoEl = document.querySelector(".pagina-fondo");
  const posterPrincipalImg = document.getElementById('poster-principal');
  const sinopsisEl = document.querySelector(".sinopsis-contenido");
  const generosContainer = document.querySelector(".generos-contenido");
  const añoEl = document.querySelector(".año-contenido");
  const infoPeliculaDuracionEl = document.querySelector(".info-pelicula-duracion");
  const infoSerieTemporadasEstadoEl = document.querySelector(".info-serie-temporadas-estado");
  const botonesPeliculaEl = document.querySelector(".botones-pelicula");
  const botonVerAhoraEl = document.querySelector(".boton-ver-ahora");
  const controlesSerieEl = document.querySelector(".controles-serie");
  const listaBotonesTemporadasEl = document.querySelector(".lista-botones-temporadas");
  const listaCapitulosContainerEl = document.querySelector(".lista-capitulos-container");
  const listaCapitulosUlEl = document.querySelector(".lista-capitulos");
  const itemElencoDiv = document.getElementById('item-elenco');
  const itemCreadoresDiv = document.getElementById('item-creadores');
  const itemDirectorDiv = document.getElementById('item-director');
  const serieElencoSpan = document.querySelector('.serie-elenco');
  const serieCreadoresSpan = document.querySelector('.serie-creadores');
  const valorDirectorSpan = document.getElementById('valor-director');
  
  // --- Elementos del NUEVO carrusel ---
  const seccionRelacionados = document.getElementById('seccion-relacionados');
  const pistaCarruselRelacionados = document.getElementById('carrusel-relacionados');

  let data = null;
  let tipoContenido = null;

  function closeOverlay() {
    if (overlay) overlay.style.display = "none";
    if (videoIframePlayer) videoIframePlayer.src = "";
  }

  // --- LÓGICA PRINCIPAL DE LA PÁGINA ---
  if (id) {
    const peliculas = window.peliculas || {};
    const series = window.series || {};
    if (peliculas[id]) {
      data = peliculas[id];
      tipoContenido = "pelicula";
    } else if (series[id]) {
      data = series[id];
      tipoContenido = "serie";
    }
  }

  if (data) {
    document.title = `${data.titulo} - Witech Play`;
    if (tituloEl) tituloEl.textContent = data.titulo;
    if (paginaFondoEl && data.imagenFondo) paginaFondoEl.style.backgroundImage = `url(${data.imagenFondo})`;
    if (posterPrincipalImg && data.imagenTarjeta) posterPrincipalImg.src = data.imagenTarjeta;
    if (sinopsisEl) sinopsisEl.textContent = data.sinopsis || data.sinopsisGeneral || "Sinopsis no disponible.";
    if (generosContainer && data.generos) {
      generosContainer.innerHTML = data.generos.map(g => `<span class="link-genero">${g}</span>`).join(', ');
    }

    if (tipoContenido === "pelicula") {
      if (infoPeliculaDuracionEl) { infoPeliculaDuracionEl.textContent = data.duracion; infoPeliculaDuracionEl.style.display = "inline"; }
      if (añoEl) añoEl.textContent = data.año;
      if (botonesPeliculaEl) botonesPeliculaEl.style.display = "flex";
      if (data.elenco && serieElencoSpan) { serieElencoSpan.textContent = data.elenco; if(itemElencoDiv) itemElencoDiv.style.display = 'block'; }
      if (data.director && valorDirectorSpan) { valorDirectorSpan.textContent = data.director; if(itemDirectorDiv) itemDirectorDiv.style.display = 'block'; }
    } else if (tipoContenido === "serie") {
      const serieData = data;
      if (infoSerieTemporadasEstadoEl) { infoSerieTemporadasEstadoEl.textContent = `${serieData.temporadas?.length || 0} Temporada(s)`; infoSerieTemporadasEstadoEl.style.display = "inline"; }
      if (añoEl) añoEl.textContent = `${serieData.añoInicio} - ${serieData.añoFin || "Presente"}`;
      if (controlesSerieEl) controlesSerieEl.style.display = "block";
      if (serieData.elencoPrincipal && serieElencoSpan) { serieElencoSpan.textContent = serieData.elencoPrincipal.join(', '); if(itemElencoDiv) itemElencoDiv.style.display = 'block'; }
      if (serieData.creadores && serieCreadoresSpan) { serieCreadoresSpan.textContent = serieData.creadores.join(', '); if(itemCreadoresDiv) itemCreadoresDiv.style.display = 'block'; }
      renderizarBotonesTemporada(serieData);
      if (serieData.temporadas && serieData.temporadas.length > 0) {
        setTimeout(() => listaBotonesTemporadasEl.querySelector('.boton-temporada')?.click(), 0);
      }
    }

    renderizarContenidoRelacionado(data, id);
    
  } else {
    if (mainContainer) mainContainer.innerHTML = `<h1 style="text-align: center; margin-top: 50px;">Contenido no encontrado.</h1>`;
  }

  // --- EVENT LISTENERS ---
  if (closeVideoOverlayButton) closeVideoOverlayButton.addEventListener("click", closeOverlay);
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
  if (botonVerAhoraEl) {
    botonVerAhoraEl.addEventListener("click", () => {
      if (data.video) {
        videoIframePlayer.src = data.video;
        overlay.style.display = "flex";
        if (typeof guardarEnHistorial === 'function') guardarEnHistorial(id);
      }
    });
  }

  // --- FUNCIONES DE RENDERIZADO DE SERIES ---
  function renderizarBotonesTemporada(serieData) {
    if (!listaBotonesTemporadasEl || !serieData?.temporadas) return;
    listaBotonesTemporadasEl.innerHTML = '';
    serieData.temporadas.forEach(temp => {
      const boton = document.createElement('button');
      boton.className = 'boton-temporada';
      boton.textContent = temp.nombreTemporada || `Temporada ${temp.numeroTemporada}`;
      boton.addEventListener('click', () => {
        listaBotonesTemporadasEl.querySelector('.activo')?.classList.remove('activo');
        boton.classList.add('activo');
        renderizarCapitulos(serieData, temp.numeroTemporada);
      });
      listaBotonesTemporadasEl.appendChild(boton);
    });
  }

  function renderizarCapitulos(serieData, numTemp) {
    if (!listaCapitulosUlEl || !listaCapitulosContainerEl || !serieData?.temporadas) return;
    const temp = serieData.temporadas.find(t => t.numeroTemporada === numTemp);
    if (!temp || !temp.capitulos) {
      listaCapitulosUlEl.innerHTML = '<li>No hay capítulos disponibles.</li>';
      listaCapitulosContainerEl.style.display = 'block';
      return;
    }
    
    listaCapitulosUlEl.innerHTML = '';
    
    temp.capitulos.forEach(cap => {
      const li = document.createElement('li');
      li.className = 'item-capitulo';
      li.innerHTML = `
        <span class="capitulo-numero"><strong>${cap.numeroCapituloEnTemporada}.</strong></span>
        <div class="capitulo-titulo-wrapper">
          <span class="capitulo-titulo-texto">${cap.tituloCapitulo || `Capítulo ${cap.numeroCapituloEnTemporada}`}</span>
        </div>
        <img src="/FrontEnd/Imagenes/Assets/play-icon.svg" class="capitulo-play-icon" alt="Reproducir">
      `;
      
      li.addEventListener('click', () => {
        if (cap.videoUrl) {
          videoIframePlayer.src = cap.videoUrl;
          overlay.style.display = 'flex';
          if (typeof guardarEnHistorial === 'function') guardarEnHistorial(id);
        } else {
          alert("Video no disponible.");
        }
      });
      listaCapitulosUlEl.appendChild(li);
    });
    
    listaCapitulosContainerEl.style.display = 'block';
    
    activarScrollTitulosLargos();
  }
  
  function activarScrollTitulosLargos() {
    // Usamos setTimeout para asegurar que el navegador ha renderizado todo.
    // Esto es crucial para obtener las medidas correctas.
    setTimeout(() => {
        const todosLosCapitulos = document.querySelectorAll('.item-capitulo');
        
        todosLosCapitulos.forEach(item => {
            const wrapper = item.querySelector('.capitulo-titulo-wrapper');
            const texto = item.querySelector('.capitulo-titulo-texto');

            if (wrapper && texto) {
                // Comprobamos si el ancho del texto es mayor que el de su contenedor
                const isOverflowing = texto.scrollWidth > wrapper.clientWidth;
                
                if (isOverflowing) {
                    item.classList.add('is-overflowing');

                    // Calculamos la distancia exacta que debe moverse el texto
                    const scrollDistance = wrapper.clientWidth - texto.scrollWidth;
                    
                    // Calculamos una duración dinámica basada en la cantidad de texto sobrante
                    // para que la velocidad de scroll sea siempre consistente.
                    // (Aprox. 60 píxeles por segundo)
                    const duration = Math.abs(scrollDistance) / 60;
                    
                    // Pasamos las variables a nuestro CSS
                    texto.style.setProperty('--scroll-distance', `${scrollDistance}px`);
                    texto.style.setProperty('--scroll-duration', `${duration}s`);
                } else {
                    // Si no hay overflow, nos aseguramos de que la clase no esté
                    item.classList.remove('is-overflowing');
                }
            }
        });
    }, 100);
}

  // --- LÓGICA DEL CARRUSEL DE CONTENIDO RELACIONADO ---
  function renderizarContenidoRelacionado(itemActual, idActual) {
    if (!itemActual.generos?.length) {
      if (seccionRelacionados) seccionRelacionados.style.display = 'none';
      return;
    }
    
    const todoElContenido = [
      ...Object.entries(window.peliculas || {}).map(([key, val]) => ({ id: key, tipo: 'pelicula', ...val })),
      ...Object.entries(window.series || {}).map(([key, val]) => ({ id: key, tipo: 'serie', ...val }))
    ];

    let relacionados = todoElContenido
      .filter(item => item.id !== idActual && item.generos?.some(g => itemActual.generos.includes(g)))
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    if (relacionados.length < 1) {
      if (seccionRelacionados) seccionRelacionados.style.display = 'none';
      return;
    }

    pistaCarruselRelacionados.innerHTML = relacionados.map(item => `
      <div class="detalle-tarjeta-wrapper">
        <a href="/FrontEnd/Index/plantilla.html?id=${item.id}" class="detalle-tarjeta-contenido">
          <img src="${item.imagenTarjeta || ''}" alt="${item.titulo || ''}" loading="lazy">
          <div class="detalle-tarjeta-titulo">${item.titulo || ''}</div>
        </a>
      </div>
    `).join('');

    if (seccionRelacionados) seccionRelacionados.style.display = 'block';
    
    // Inmediatamente después de renderizar, inicializamos el carrusel
    inicializarCarruselRelacionados();
  }
  
  // --- NUEVA FUNCIÓN PARA INICIALIZAR EL CARRUSEL DE DETALLES ---
  function inicializarCarruselRelacionados() {
    const contenedor = document.querySelector('.detalle-carrusel-contenedor');
    const pista = contenedor?.querySelector('.detalle-carrusel-pista');
    const flechaIzquierda = contenedor?.querySelector('.detalle-flecha.izquierda');
    const flechaDerecha = contenedor?.querySelector('.detalle-flecha.derecha');

    if (!contenedor || !pista || !flechaIzquierda || !flechaDerecha) return;

    const tarjetasOriginales = Array.from(pista.children);
    if (tarjetasOriginales.length === 0) return;

    // --- Lógica de Scroll Infinito ---
    // 1. Clonar tarjetas para crear el efecto de bucle
    const clonesInicio = tarjetasOriginales.map(card => card.cloneNode(true));
    const clonesFinal = tarjetasOriginales.map(card => card.cloneNode(true));
    
    pista.append(...clonesFinal);
    pista.prepend(...clonesInicio);

    const duracionTransicion = 500; // en ms
    let isMoving = false;
    let posicionActual = 0;
    
    // 2. Función para calcular el desplazamiento y la posición inicial
    function actualizarPosicion() {
        const tarjetaAncho = tarjetasOriginales[0].offsetWidth + 15; // 15 es el gap
        posicionActual = -tarjetaAncho * tarjetasOriginales.length;
        pista.style.transition = 'none'; // Sin animación para el ajuste inicial
        pista.style.transform = `translateX(${posicionActual}px)`;
    }

    // 3. Función de movimiento
    function mover(direccion) {
        if (isMoving) return;
        isMoving = true;
        
        const viewportAncho = contenedor.querySelector('.detalle-carrusel-viewport').offsetWidth;
        const tarjetaAncho = tarjetasOriginales[0].offsetWidth + 15;
        // Mover una cantidad de tarjetas que casi llene la pantalla
        const tarjetasAMover = Math.max(1, Math.floor(viewportAncho / tarjetaAncho));
        const desplazamiento = tarjetaAncho * tarjetasAMover;

        pista.style.transition = `transform ${duracionTransicion}ms ease`;

        if (direccion === 'derecha') {
            posicionActual -= desplazamiento;
        } else {
            posicionActual += desplazamiento;
        }
        
        pista.style.transform = `translateX(${posicionActual}px)`;
    }

    // 4. Listener para el final de la transición (la magia del bucle)
    pista.addEventListener('transitionend', () => {
        isMoving = false;
        
        const tarjetaAncho = tarjetasOriginales[0].offsetWidth + 15;
        const limiteDerecho = -tarjetaAncho * (tarjetasOriginales.length * 2);
        const limiteIzquierdo = -tarjetaAncho * (tarjetasOriginales.length - 1);

        // Si hemos llegado al final de los clones de la derecha...
        if (posicionActual <= limiteDerecho) {
            pista.style.transition = 'none';
            posicionActual = -tarjetaAncho * tarjetasOriginales.length;
            pista.style.transform = `translateX(${posicionActual}px)`;
        }

        // Si hemos llegado al final de los clones de la izquierda...
        if (posicionActual > limiteIzquierdo) {
            pista.style.transition = 'none';
            posicionActual = -tarjetaAncho * (tarjetasOriginales.length * 2 - 1);
            // El cálculo puede ser complejo, un ajuste simple suele funcionar:
            posicionActual = -tarjetaAncho * (tarjetasOriginales.length + (tarjetasOriginales.length - Math.floor(contenedor.querySelector('.detalle-carrusel-viewport').offsetWidth / tarjetaAncho)));
            pista.style.transform = `translateX(${posicionActual}px)`;
        }
    });

    // 5. Asignar eventos a las flechas
    flechaDerecha.addEventListener('click', () => mover('derecha'));
    flechaIzquierda.addEventListener('click', () => mover('izquierda'));
    
    // 6. Configuración inicial
    // Usamos un pequeño delay para asegurar que todas las imágenes han cargado y tienen dimensiones
    setTimeout(() => {
        actualizarPosicion();
        window.addEventListener('resize', actualizarPosicion);
    }, 100);
}

}); // Fin del DOMContentLoaded