document.addEventListener("DOMContentLoaded", function () {
// ====================================================================================
  // INICIO: LÓGICA DEL CARRUSEL PRINCIPAL (SCROLL INFINITO CONTINUO)
  // ====================================================================================
  const carruselPrincipal = document.querySelector('.carrusel');

  if (carruselPrincipal) {
    const carouselTrack = carruselPrincipal.querySelector('.carrusel-pista');
    const prevButton = carruselPrincipal.querySelector('.carrusel-boton.prev');
    const nextButton = carruselPrincipal.querySelector('.carrusel-boton.next');
    const slidesOriginalesHtmlCollection = carouselTrack ? carouselTrack.children : [];
    
    const slidesOriginales = Array.from(slidesOriginalesHtmlCollection).filter(node => 
        node.nodeType === 1 && node.classList.contains('carrusel-slide')
    );

    if (!carouselTrack || slidesOriginales.length === 0 || !prevButton || !nextButton) {
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      // console.warn("Carrusel Principal: Elementos esenciales no encontrados o carrusel vacío.");
    } else {
      const slideCountOriginal = slidesOriginales.length;
      let carouselSlides = []; 
      let slideWidthWithMargin = 0;
      let actualTrackIndex = 0; 
      let isTransitioning = false;
      const transitionDurationCSS = 600; 
      const transitionTimingFunctionCSS = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      let autoplayIntervalId;
      const autoplayDelay = 7000; 
      let transitionEndTimeout; 

      function calculateDimensions() {
        if (slidesOriginales.length === 0 || !slidesOriginales[0] || !slidesOriginales[0].offsetParent) {
            slideWidthWithMargin = 0; 
            return;
        }
        const slideParaMedir = slidesOriginales[0];
        const style = window.getComputedStyle(slideParaMedir);
        slideWidthWithMargin = slideParaMedir.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      }

      function getTrackOffset(indexToCenter) {
        const contenedor = carruselPrincipal.querySelector('.carrusel-contenedor');
        if (!contenedor || slideWidthWithMargin === 0) {
            return 0;
        }
        const contenedorWidth = contenedor.offsetWidth;
        return (contenedorWidth / 2) - (indexToCenter * slideWidthWithMargin) - (slideWidthWithMargin / 2);
      }

      function applyTrackTransform(offset, animate = true) {
        if (!carouselTrack) return;
        
        if (animate) {
          carouselTrack.style.transition = `transform ${transitionDurationCSS / 1000}s ${transitionTimingFunctionCSS}`;
        } else {
          carouselTrack.style.transition = 'none';
        }
        carouselTrack.style.transform = `translateX(${offset}px)`;
      }
      
      function updateSlideClasses() {
          if (!carouselSlides || carouselSlides.length === 0) return;
          
          carouselSlides.forEach((slide, physicalIndex) => {
              slide.classList.remove('is-active', 'is-prev', 'is-next');

              if (physicalIndex === actualTrackIndex) {
                  slide.classList.add('is-active');
              }
              
              let prevPhysical = (actualTrackIndex - 1 + carouselSlides.length) % carouselSlides.length;
              let nextPhysical = (actualTrackIndex + 1) % carouselSlides.length;
              
              if (physicalIndex === prevPhysical) {
                  slide.classList.add('is-prev');
              }
              if (physicalIndex === nextPhysical) {
                  slide.classList.add('is-next');
              }
          });
      }

      function checkForReset() {
        if (slideCountOriginal <= 1 || carouselSlides.length < slideCountOriginal * 3) {
            return; 
        }

        const numOriginals = slideCountOriginal; 
        let needsReposition = false;

        if (actualTrackIndex >= numOriginals * 2) { 
          actualTrackIndex -= numOriginals; 
          needsReposition = true;
        } else if (actualTrackIndex < numOriginals) {
          actualTrackIndex += numOriginals; 
          needsReposition = true;
        }

        if (needsReposition) {
          const offset = getTrackOffset(actualTrackIndex);
          applyTrackTransform(offset, false); 
          
          // Usar doble requestAnimationFrame para la máxima sincronización
          requestAnimationFrame(() => { 
            requestAnimationFrame(() => { 
                updateSlideClasses(); 
            });
          });
        }
      }
      
      function moveTo(direction) {
        if (isTransitioning || slideWidthWithMargin === 0) { 
            return;
        }
        isTransitioning = true; // Marcar al inicio
      
        clearTimeout(transitionEndTimeout); 

        if (direction === 'next') {
          actualTrackIndex++;
        } else if (direction === 'prev') {
          actualTrackIndex--;
        }
      
        const offset = getTrackOffset(actualTrackIndex);
        applyTrackTransform(offset, true); 
        updateSlideClasses(); // Para la animación en curso
      
        const transitionEndCallback = () => {
          clearTimeout(transitionEndTimeout); 
          checkForReset(); 
          requestAnimationFrame(() => { // Poner isTransitioning a false DESPUÉS del reset
             isTransitioning = false;
          });
        };
      
        carouselTrack.addEventListener('transitionend', transitionEndCallback, { once: true });
      
        transitionEndTimeout = setTimeout(() => {
          if (isTransitioning) { // Solo si el evento 'transitionend' no se disparó
            // console.warn("Carrusel Principal: transitionend no se disparó, usando fallback de timeout.");
            carouselTrack.removeEventListener('transitionend', transitionEndCallback); 
            
            checkForReset();
            requestAnimationFrame(() => { // Poner isTransitioning a false DESPUÉS del reset
                isTransitioning = false;
            });
          }
        }, transitionDurationCSS + 200);
      }

      function setupCarousel() {
        if (slideCountOriginal === 0) {
            return;
        }

        if (slideCountOriginal > 1) {
          const clonesPrevias = slidesOriginales.map(slide => slide.cloneNode(true));
          const clonesSiguientes = slidesOriginales.map(slide => slide.cloneNode(true));

          clonesPrevias.forEach(c => c.classList.add('carousel-clone-prev'));
          clonesSiguientes.forEach(c => c.classList.add('carousel-clone-next'));

          carouselTrack.innerHTML = ''; 
          carouselTrack.append(...clonesPrevias, ...slidesOriginales, ...clonesSiguientes);
          carouselSlides = Array.from(carouselTrack.children);
          
          actualTrackIndex = slideCountOriginal; 
        } else { 
          carouselSlides = [...slidesOriginales]; 
          actualTrackIndex = 0;
          if (prevButton) prevButton.style.display = 'none';
          if (nextButton) nextButton.style.display = 'none';
        }
        
        calculateDimensions(); 
        
        const attemptInitialPositioningAndStartAutoplay = () => {
            if (slideWidthWithMargin > 0) {
                const initialOffset = getTrackOffset(actualTrackIndex);
                applyTrackTransform(initialOffset, false);
                updateSlideClasses();
                if (slideCountOriginal > 1) { // Solo iniciar autoplay si hay más de 1 slide
                    // El inicio del autoplay se gestiona al final del setup general
                }
            } else {
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
            }
        };

        if (slideWidthWithMargin === 0 && slideCountOriginal > 0) { 
            let retries = 0;
            const maxRetries = 7; 
            const retryInterval = 250; 

            const retryCalc = setInterval(() => {
                calculateDimensions();
                retries++;
                if (slideWidthWithMargin > 0 || retries >= maxRetries) {
                    clearInterval(retryCalc);
                    attemptInitialPositioningAndStartAutoplay(); 
                    // El inicio del autoplay se moverá fuera de esta función de reintento.
                    // Se llamará una vez después de que todo el setup haya tenido oportunidad de completarse.
                    if (slideWidthWithMargin === 0 && retries >= maxRetries) {
                        // console.error("Carrusel Principal: No se pudo calcular el ancho del slide después de reintentos.");
                    }
                }
            }, retryInterval);
        } else {
            attemptInitialPositioningAndStartAutoplay(); 
        }
      }

      function startAutoplay() {
        if (slideCountOriginal <= 1 || slideWidthWithMargin === 0) {
            return;
        }
        stopAutoplay(); 
        autoplayIntervalId = setInterval(() => {
          moveTo('next');
        }, autoplayDelay);
      }

      function stopAutoplay() {
        clearInterval(autoplayIntervalId);
      }

      if (nextButton) nextButton.addEventListener('click', () => { stopAutoplay(); moveTo('next'); startAutoplay(); });
      if (prevButton) prevButton.addEventListener('click', () => { stopAutoplay(); moveTo('prev'); startAutoplay(); });

      let resizeTimeout;
      window.addEventListener('resize', () => {
        stopAutoplay();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          calculateDimensions();
          if (slideWidthWithMargin > 0) { 
            const offset = getTrackOffset(actualTrackIndex);
            applyTrackTransform(offset, false); 
            updateSlideClasses();
          }
          if (slideCountOriginal > 1 && slideWidthWithMargin > 0) {
            startAutoplay();
          }
        }, 250);
      });

      if (carruselPrincipal) {
        carruselPrincipal.addEventListener('mouseenter', stopAutoplay);
        carruselPrincipal.addEventListener('mouseleave', () => {
            if (slideCountOriginal > 1 && slideWidthWithMargin > 0) {
                startAutoplay();
            }
        });
      }

      // --- Ejecución del Setup e Inicio del Autoplay ---
      setupCarousel(); 
      // Se inicia el autoplay después de un pequeño delay para asegurar que el DOM y los estilos
      // del setup inicial se hayan procesado, especialmente si hubo reintentos.
      setTimeout(() => {
          // Volver a verificar condiciones antes de iniciar
          if (slideCountOriginal > 1 && slideWidthWithMargin > 0) {
              startAutoplay();
          } else if (slideCountOriginal > 1 && slideWidthWithMargin === 0) {
              // console.warn("Carrusel Principal: Autoplay no iniciado debido a ancho de slide 0 post-setup.");
              // Podrías intentar un último reintento de posicionamiento aquí o simplemente no iniciar.
          }
      }, 700); // Un delay un poco mayor para el primer inicio de autoplay.

    } 
  } 
  // ====================================================================================
  // FIN: LÓGICA DEL CARRUSEL PRINCIPAL
  // ====================================================================================

});