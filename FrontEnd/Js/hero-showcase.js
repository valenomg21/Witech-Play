document.addEventListener('DOMContentLoaded', () => {
    const showcaseContainer = document.getElementById('showcase-container');
    if (!showcaseContainer) {
        return;
    }

    const navContainer = document.getElementById('showcase-nav');
    const trailerModal = document.getElementById('trailer-modal-overlay');
    const trailerIframe = document.getElementById('trailer-iframe');
    const closeModalBtn = document.getElementById('trailer-modal-close');

    const autoplayDuration = 8000; // 8 segundos para cada slide
    let currentSlideIndex = 0;
    const slidesData = Object.values(window.proximosEstrenos || {});

    // ==================================================================
    // INICIO DE LA NUEVA LÓGICA DE TIEMPO
    // ==================================================================
    let animationFrameId;
    let startTime;
    let timeElapsed = 0;
    let isPaused = false;
    // ==================================================================
    // FIN DE LA NUEVA LÓGICA DE TIEMPO
    // ==================================================================

    function getYoutubeVideoId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // 1. Función para renderizar los slides (sin cambios)
    function renderShowcase() {
        if (slidesData.length === 0) {
            showcaseContainer.innerHTML = '<p style="color: white; text-align: center;">No hay próximos estrenos.</p>';
            return;
        }

        slidesData.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'showcase-slide';
            slideElement.dataset.index = index;
            const generosHTML = slide.genero ? slide.genero.join(' • ') : '';
            const trailerVideoId = getYoutubeVideoId(slide.videoTrailerUrl);
            const embedUrl = trailerVideoId ? `https://www.youtube.com/embed/${trailerVideoId}` : '';

            slideElement.innerHTML = `
                <div class="slide-background-wrapper">
                    <img src="${slide.imagenFondo}" class="slide-background-image" alt="${slide.titulo}">
                </div>
                <div class="slide-info-content">
                    <div style="display: flex; align-items: flex-end; gap: 25px;">
                        <img src="${slide.imagenTarjeta}" class="slide-poster" alt="Póster de ${slide.titulo}">
                        <div class="slide-details">
                            <h2>${slide.titulo}</h2>
                            <p class="estreno"><strong>Estreno:</strong> ${slide.fechaEstreno}</p>
                            <p class="generos">${generosHTML}</p>
                        </div>
                    </div>
                    <div class="slide-actions">
                        <button class="boton-ver-trailer" data-trailer-url="${embedUrl}">Ver Tráiler</button>
                    </div>
                </div>`;
            showcaseContainer.appendChild(slideElement);
        });

        slidesData.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'nav-indicator';
            indicator.dataset.index = index;
            indicator.innerHTML = '<div class="nav-indicator-progress"></div>';
            indicator.addEventListener('click', () => {
                if (currentSlideIndex !== index) {
                    goToSlide(index, true);
                }
            });
            navContainer.appendChild(indicator);
        });

        goToSlide(0);
    }

    // 2. Función para cambiar de slide (modificada para reiniciar la animación)
    function goToSlide(index, manual = false) {
        currentSlideIndex = index;

        document.querySelectorAll('.showcase-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        document.querySelectorAll('.nav-indicator').forEach((indicator, i) => {
            indicator.classList.remove('active');
            const progress = indicator.querySelector('.nav-indicator-progress');
            if (progress) {
                progress.style.transition = 'none'; // Sin transición al reiniciar
                progress.style.width = '0%';
            }
        });
        
        const activeIndicator = document.querySelector(`.nav-indicator[data-index="${index}"]`);
        if (activeIndicator) {
            activeIndicator.classList.add('active');
        }

        // Reiniciar y empezar el bucle de animación
        if (manual) {
            stopAnimation();
            startAnimation();
        }
    }

    // 3. NUEVA Lógica de animación con requestAnimationFrame
    function animationLoop(timestamp) {
        if (isPaused) {
            // Si está en pausa, guardamos el tiempo de inicio para reanudar desde ahí
            startTime = timestamp - timeElapsed;
            animationFrameId = requestAnimationFrame(animationLoop);
            return;
        }

        if (!startTime) {
            startTime = timestamp;
        }

        timeElapsed = timestamp - startTime;
        let progressPercentage = (timeElapsed / autoplayDuration) * 100;

        // Actualizar la barra de progreso
        const activeProgress = document.querySelector('.nav-indicator.active .nav-indicator-progress');
        if (activeProgress) {
            activeProgress.style.width = `${Math.min(progressPercentage, 100)}%`;
        }

        if (timeElapsed >= autoplayDuration) {
            // Cambiar al siguiente slide
            const nextIndex = (currentSlideIndex + 1) % slidesData.length;
            goToSlide(nextIndex);
            startTime = timestamp;
            timeElapsed = 0;
        }
        
        animationFrameId = requestAnimationFrame(animationLoop);
    }
    
    function startAnimation() {
        if (slidesData.length <= 1) return;
        startTime = null; // Reinicia el tiempo de inicio
        timeElapsed = 0;
        cancelAnimationFrame(animationFrameId); // Asegura que no haya bucles duplicados
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    function stopAnimation() {
        cancelAnimationFrame(animationFrameId);
    }

    // 4. Lógica de Pausa y Reanudación
    function pause() {
        if (!isPaused) {
            isPaused = true;
        }
    }

    function resume() {
        if (isPaused) {
            isPaused = false;
        }
    }

    // 5. Lógica del Modal
    function openTrailerModal(url) {
        if (!url) {
            alert('Tráiler no disponible en este momento.');
            return;
        }
        trailerIframe.src = url + "?autoplay=1&mute=0";
        trailerModal.classList.add('visible');
        pause();
    }

    function closeTrailerModal() {
        trailerIframe.src = "";
        trailerModal.classList.remove('visible');
        resume();
    }

    showcaseContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('boton-ver-trailer')) {
            const url = e.target.dataset.trailerUrl;
            openTrailerModal(url);
        }
    });

    closeModalBtn.addEventListener('click', closeTrailerModal);
    trailerModal.addEventListener('click', (e) => {
        if (e.target === trailerModal) {
            closeTrailerModal();
        }
    });

    // Iniciar todo
    renderShowcase();
    startAnimation();
});