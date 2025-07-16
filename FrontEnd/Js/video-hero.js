document.addEventListener('DOMContentLoaded', () => {
    const slidesContainer = document.getElementById('video-hero-slides');
    const navContainer = document.getElementById('video-hero-navigation');

    if (!slidesContainer || !navContainer) {
        return;
    }

    const heroData = Object.keys(window.videoHeroData || {}).map(key => ({
        id: key,
        ...window.videoHeroData[key]
    }));

    if (heroData.length === 0) {
        slidesContainer.innerHTML = "<p>No hay contenido destacado para mostrar.</p>";
        return;
    }

    let currentSlideIndex = 0;
    let slideIntervalId = null;
    const AUTOPLAY_DURATION = 15000;

    // Función para extraer el ID de video de YouTube
    function getYoutubeVideoId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // 1. Crear y añadir los slides
    function initializeHero() {
        heroData.forEach((data, index) => {
            const videoId = getYoutubeVideoId(data.videoUrl);
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&origin=${window.location.origin}` : '';

            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            slide.dataset.index = index;
            slide.innerHTML = `
                <div class="hero-slide-video-wrapper">
                    <iframe class="hero-slide-video-bg"
                            src=""
                            data-src="${embedUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                    </iframe>
                </div>
                <div class="hero-info-card">
                    <h2>${data.titulo}</h2>
                    <div class="hero-info-meta">
                        <span class="rating">${data.rating.toFixed(1)}</span>
                        <span>${data.duracion}</span>
                        <span>${data.generos.join(' • ')}</span>
                    </div>
                    <p class="sinopsis">${data.sinopsis}</p>
                    <div class="hero-info-actions">
                        <a href="/FrontEnd/Index/plantilla.html?id=${data.id}" class="btn btn-primary" data-id="${data.id}">Reproducir</a>
                        <a href="/FrontEnd/Index/plantilla.html?id=${data.id}" class="btn btn-secondary">Más Información</a>
                    </div>
                </div>
            `;
            slidesContainer.appendChild(slide);
        });

        heroData.forEach((data, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.dataset.index = index;
            navItem.textContent = data.titulo;
            navItem.addEventListener('click', () => {
                if (index !== currentSlideIndex) {
                    goToSlide(index, true);
                }
            });
            navContainer.appendChild(navItem);
        });
        
        
        activateSlide(0); 
        
        startAutoplay();
    }

    function activateSlide(index) {
        const slides = document.querySelectorAll('.hero-slide');
        const navItems = document.querySelectorAll('.nav-item');

        const prevSlide = slides[currentSlideIndex];
        if (prevSlide) {
            const prevIframe = prevSlide.querySelector('iframe');
            if (prevIframe) prevIframe.src = '';
        }

        currentSlideIndex = index;

        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        navItems.forEach((nav, i) => nav.classList.toggle('active', i === index));

        const activeSlide = slides[index];
        const iframe = activeSlide.querySelector('iframe');
        
        if (iframe && iframe.dataset.src && iframe.src !== iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
        }
    }

    // 3. Función goToSlide
    function goToSlide(index, isManual = false) {
        if (isManual) {
            stopAutoplay();
        }
        activateSlide(index);
        
        if (isManual) {
            startAutoplay();
        }
    }

    // 4. Lógica de Autoplay
    function stopAutoplay() {
        
        if (slideIntervalId) {
            clearInterval(slideIntervalId);
            slideIntervalId = null;
        }
    }

    function startAutoplay() {
        stopAutoplay();
        if (heroData.length > 1) {
            slideIntervalId = setInterval(() => {
                // Calcula el próximo índice de forma fiable
                const nextIndex = (currentSlideIndex + 1) % heroData.length;
                activateSlide(nextIndex);
            }, AUTOPLAY_DURATION);
        }
    }

    slidesContainer.addEventListener('mouseenter', stopAutoplay);
    slidesContainer.addEventListener('mouseleave', startAutoplay);
    navContainer.addEventListener('mouseenter', stopAutoplay);
    navContainer.addEventListener('mouseleave', startAutoplay);
    
    initializeHero();
});