// Función para "retrasar" la ejecución de un evento, mejora el rendimiento en 'resize'
function debounce(func, wait = 20, immediate = true) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Función principal que configura un carrusel individual
function initCarousel(contenedor) {
  const carrusel = contenedor.querySelector('.peliculas-carrusel');
  const btnIzquierda = contenedor.querySelector('.flecha.izquierda');
  const btnDerecha = contenedor.querySelector('.flecha.derecha');

  if (!carrusel || !btnIzquierda || !btnDerecha) return;

  const tarjetas = carrusel.querySelectorAll('.pelicula-wrapper');
  const esCarruselHorizontal = contenedor.parentElement.classList.contains('tarjetas-horizontales');
  if (tarjetas.length === 0) return;

  // --- VARIABLES ---
  let tarjetaAnchoTotal;
  const cantidadTarjetasAMover = 3;
  const duracionTransicion = 500;
  let posicion = 0;
  let isAnimating = false;
  
  // --- FUNCIÓN PARA OBTENER EL ANCHO TOTAL DE LA TARJETA (INCLUYENDO GAP) ---
  function getTarjetaAnchoTotal() {
    if (tarjetas.length === 0) return 0;
    
    // Obtenemos el estilo computado del CONTENEDOR del carrusel para leer el gap
    const carruselStyle = window.getComputedStyle(carrusel);
    // Leemos el valor de 'column-gap' (o 'gap') y lo convertimos a número
    const gap = parseFloat(carruselStyle.columnGap) || 0;
    
    // El ancho total es el ancho del elemento + el gap que acabamos de medir
    return tarjetas[0].offsetWidth + gap;
  }

  // --- LÓGICA DE ACTUALIZACIÓN AL REDIMENSIONAR ---
  function resetearCarrusel() {
    posicion = 0;
    carrusel.style.transition = 'none';
    carrusel.style.transform = `translateX(${posicion}px)`;
  }

  // --- LÓGICA DE MOVIMIENTO ---
  function mover(direccion) {
    if (isAnimating) return;
    isAnimating = true;

    // ¡CAMBIO CLAVE! Calculamos el ancho justo antes de cada movimiento.
    tarjetaAnchoTotal = getTarjetaAnchoTotal();
    
    const desplazamiento = tarjetaAnchoTotal * cantidadTarjetasAMover;

    if (direccion === 'derecha') {
      posicion -= desplazamiento;
      carrusel.style.transition = `transform ${duracionTransicion / 1000}s ease`;
      carrusel.style.transform = `translateX(${posicion}px)`;

      setTimeout(() => {
        for (let i = 0; i < cantidadTarjetasAMover; i++) {
          if (carrusel.firstElementChild) {
            carrusel.appendChild(carrusel.firstElementChild);
          }
        }
        posicion += desplazamiento;
        carrusel.style.transition = 'none';
        carrusel.style.transform = `translateX(${posicion}px)`;
        isAnimating = false;
      }, duracionTransicion);
    } else if (direccion === 'izquierda') {
      for (let i = 0; i < cantidadTarjetasAMover; i++) {
        if (carrusel.lastElementChild) {
            carrusel.prepend(carrusel.lastElementChild);
        }
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
  
  // --- EVENT LISTENERS ---
  btnDerecha.addEventListener('click', () => mover('derecha'));
  btnIzquierda.addEventListener('click', () => mover('izquierda'));

  let touchStartX = 0;
  let touchEndX = 0;

  carrusel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  carrusel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (isAnimating) return;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      mover('derecha');
    } else if (touchEndX > touchStartX + swipeThreshold) {
      mover('izquierda');
    }
  }
  
  window.addEventListener('resize', debounce(resetearCarrusel, 250));
}

// --- INICIAR TODOS LOS CARRUSELES Y EFECTOS DE HOVER ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carrusel-control').forEach(initCarousel);

  document.querySelectorAll('.tarjetas-horizontales .pelicula').forEach(tarjetaHorizontal => {
    const titulo = tarjetaHorizontal.querySelector('.titulo-pelicula');
    if (titulo) {
      // 1. Cambiamos la clase
      titulo.classList.remove('titulo-pelicula');
      titulo.classList.add('titulo-pelicula-horizontal');
      
      // 2. Añadimos el data-title para la animación de rebote
      titulo.setAttribute('data-title', titulo.textContent);
    }
  });

  document.querySelectorAll('.pelicula').forEach(tarjeta => {
    const wrapper = tarjeta.parentElement;
    const carruselContenedor = wrapper.closest('.peliculas-carrusel');

    tarjeta.addEventListener('mouseenter', function() {
      if (carruselContenedor) {
        carruselContenedor.classList.add('carrusel-item-active');
      }
      this.classList.add('is-hovered');
    });

    tarjeta.addEventListener('mouseleave', function() {
      if (carruselContenedor) {
        carruselContenedor.classList.remove('carrusel-item-active');
      }
      this.classList.remove('is-hovered');
    });
  });
});