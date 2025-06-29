// Función para "retrasar" la ejecución de un evento, mejora el rendimiento en 'resize'
function debounce(func, wait = 250) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Función principal que configura un carrusel individual
function initCarousel(contenedor) {
  const carrusel = contenedor.querySelector('.peliculas-carrusel');
  const btnIzquierda = contenedor.querySelector('.flecha.izquierda');
  const btnDerecha = contenedor.querySelector('.flecha.derecha');

  if (!carrusel || !btnIzquierda || !btnDerecha) return;

  const tarjetas = Array.from(carrusel.querySelectorAll('.pelicula-wrapper'));
  if (tarjetas.length === 0) return;

  let cantidadTarjetasAMover;
  const duracionTransicion = 500;
  let posicion = 0;
  let isAnimating = false;
  
  // FUNCIÓN CLAVE: Calcula cuántas tarjetas mover según el espacio disponible
  function actualizarValores() {
    const anchoContenedor = contenedor.offsetWidth;
    const primeraTarjeta = tarjetas[0];
    if (!primeraTarjeta) return;
    
    const carruselStyle = window.getComputedStyle(carrusel);
    const gap = parseFloat(carruselStyle.columnGap) || 0;
    const anchoTarjeta = primeraTarjeta.offsetWidth;

    // Calculamos cuántas tarjetas completas caben en el contenedor
    const tarjetasVisibles = Math.floor(anchoContenedor / (anchoTarjeta + gap));
    
    // Decidimos cuántas mover: una menos de las visibles, con un mínimo de 1 y un máximo de 4.
    cantidadTarjetasAMover = Math.max(1, Math.min(tarjetasVisibles - 1, 4));
    
    // Reseteamos la posición para evitar saltos al redimensionar
    posicion = 0;
    carrusel.style.transition = 'none';
    carrusel.style.transform = `translateX(0px)`;
  }

  // Lógica de movimiento (tu código, pero usando la variable dinámica)
  function mover(direccion) {
    if (isAnimating || !cantidadTarjetasAMover) return;
    isAnimating = true;

    const carruselStyle = window.getComputedStyle(carrusel);
    const gap = parseFloat(carruselStyle.columnGap) || 0;
    const tarjetaAnchoTotal = tarjetas[0].offsetWidth + gap;
    
    const desplazamiento = tarjetaAnchoTotal * cantidadTarjetasAMover;

    if (direccion === 'derecha') {
      posicion -= desplazamiento;
      carrusel.style.transition = `transform ${duracionTransicion / 1000}s ease`;
      carrusel.style.transform = `translateX(${posicion}px)`;

      setTimeout(() => {
        for (let i = 0; i < cantidadTarjetasAMover; i++) {
          carrusel.appendChild(carrusel.firstElementChild);
        }
        posicion += desplazamiento;
        carrusel.style.transition = 'none';
        carrusel.style.transform = `translateX(${posicion}px)`;
        isAnimating = false;
      }, duracionTransicion);

    } else if (direccion === 'izquierda') {
      for (let i = 0; i < cantidadTarjetasAMover; i++) {
        carrusel.prepend(carrusel.lastElementChild);
      }
      
      posicion -= desplazamiento;
      carrusel.style.transition = 'none';
      carrusel.style.transform = `translateX(${posicion}px)`;
      
      void carrusel.offsetWidth; 

      carrusel.style.transition = `transform ${duracionTransicion / 1000}s ease`;
      posicion += desplazamiento;
      carrusel.style.transform = `translateX(${posicion}px)`;

      setTimeout(() => {
        isAnimating = false;
      }, duracionTransicion);
    }
  }
  
  // Event Listeners (botones y swipe)
  btnDerecha.addEventListener('click', () => mover('derecha'));
  btnIzquierda.addEventListener('click', () => mover('izquierda'));

  let touchStartX = 0;
  let touchEndX = 0;

  carrusel.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  carrusel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) mover('derecha');
    else if (touchEndX > touchStartX + swipeThreshold) mover('izquierda');
  }, { passive: true });
  
  // Inicialización y re-cálculo en resize
  actualizarValores();
  window.addEventListener('resize', debounce(actualizarValores));
}

// Iniciar todos los carruseles y los efectos de hover
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carrusel-control').forEach(initCarousel);

  document.querySelectorAll('.pelicula').forEach(tarjeta => {
    const wrapper = tarjeta.parentElement;
    const carruselContenedor = wrapper.closest('.peliculas-carrusel');

    tarjeta.addEventListener('mouseenter', function() {
      if (carruselContenedor) carruselContenedor.classList.add('carrusel-item-active');
      this.classList.add('is-hovered');
    });
    tarjeta.addEventListener('mouseleave', function() {
      if (carruselContenedor) carruselContenedor.classList.remove('carrusel-item-active');
      this.classList.remove('is-hovered');
    });
  });
});