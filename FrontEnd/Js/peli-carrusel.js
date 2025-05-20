document.querySelectorAll('.carrusel-control').forEach(contenedor => {
  const carrusel = contenedor.querySelector('.peliculas-carrusel');
  const btnIzquierda = contenedor.querySelector('.flecha.izquierda');
  const btnDerecha = contenedor.querySelector('.flecha.derecha');

  // --- Verificación inicial ---
  if (!carrusel || !btnIzquierda || !btnDerecha) {
    console.error("Error: No se encontraron todos los elementos necesarios (carrusel, botones) en:", contenedor);
    return;
  }

  const tarjetas = carrusel.querySelectorAll('.pelicula');

  if (tarjetas.length === 0) {
     console.warn("Advertencia: El carrusel está vacío:", carrusel);
     // Deshabilitar botones si no hay tarjetas
     btnIzquierda.disabled = true;
     btnDerecha.disabled = true;
     return; // Salir si no hay tarjetas
  }
  // --- Fin Verificación inicial ---

  const tarjetaAncho = tarjetas[0].offsetWidth + 15; // 15 gap
  const cantidadTarjetasAMover = 3;
  const duracionTransicion = 500; // ms - coincidir con css
  let posicion = 0;
  let isAnimating = false; // Para prevenir clics múltiples

  function mover(direccion) {
    if (isAnimating) {
      // console.log("Animación en progreso, ignorando clic.");
      return; 
    }
    isAnimating = true; 

    const desplazamiento = tarjetaAncho * cantidadTarjetasAMover;
    const totalTarjetas = carrusel.children.length;

     // Verificar si hay suficientes tarjetas para mover (básico)
     if (totalTarjetas <= cantidadTarjetasAMover) {
         console.warn("No hay suficientes tarjetas para realizar el ciclo completo.");
         isAnimating = false; // Desbloquear
         return;
     }

    // --- Mover a la DERECHA ---
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

        // Ajustar 'posicion' para reflejar el movimiento de elementos
        posicion += desplazamiento;
        // console.log(`--> Derecha. Posición reajustada (sin anim): ${posicion}`);
        carrusel.style.transition = 'none'; // Quitar transición para el reajuste
        carrusel.style.transform = `translateX(${posicion}px)`; // Reajustar instantáneamente
        // console.log(`--> Derecha. Transform reajustado: translateX(${posicion}px)`);

        isAnimating = false; // Desbloquear clics
        // console.log("--> Derecha. Animación completada.");
      }, duracionTransicion); 

    // --- Mover a la IZQUIERDA ---
    } else if (direccion === 'izquierda') {
       console.log(`<-- Izquierda. Posición ANTES: ${posicion}`);


       console.log("<-- Izquierda. Moviendo elementos del final al principio...");
      const elementosAMover = [];
      for (let i = 0; i < cantidadTarjetasAMover; i++) {
          if(carrusel.lastElementChild){
              elementosAMover.push(carrusel.lastElementChild);
              carrusel.removeChild(carrusel.lastElementChild); 
          } else {
              console.warn("<-- Izquierda. ¡No se encontró lastElementChild para mover!");
              break;
          }
      }
     
      elementosAMover.reverse().forEach(elemento => {
          if(carrusel.firstElementChild){
              carrusel.insertBefore(elemento, carrusel.firstElementChild);
              
          } else {
              
              carrusel.appendChild(elemento);
              console.warn("<-- Izquierda. No había firstElementChild, usando appendChild.");
          }
      });

      posicion -= desplazamiento;
      
      carrusel.style.transition = 'none';
      carrusel.style.transform = `translateX(${posicion}px)`;
    
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { 
            carrusel.style.transition = `transform ${duracionTransicion / 1000}s ease`;
            posicion += desplazamiento; 
            
            carrusel.style.transform = `translateX(${posicion}px)`;

           
             setTimeout(() => {
                isAnimating = false;
             
             }, duracionTransicion);
        });
      });
    }
  }

  
  btnDerecha.addEventListener('click', () => mover('derecha'));
  btnIzquierda.addEventListener('click', () => mover('izquierda'));

  const anchoVisibleEstimado = contenedor.offsetWidth;
  const anchoTotalContenido = tarjetas.length * tarjetaAncho;
  if (anchoTotalContenido <= anchoVisibleEstimado) {
      
  }

});

// --- NUEVO CÓDIGO PARA EL EFECTO HOVER DE LAS TARJETAS ---
document.querySelectorAll('.pelicula').forEach(tarjeta => {
  const wrapper = tarjeta.parentElement; // El .pelicula-wrapper
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