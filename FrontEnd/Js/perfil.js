// FrontEnd/Js/perfil.js

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // ======================= MANEJO DEL MENÚ LATERAL Y SECCIONES =======================
  // ==========================================================================
  const menuItems = document.querySelectorAll('.menu-lateral li');
  const secciones = document.querySelectorAll('.contenido-principal .seccion');

  // Mapeo entre el data-text del ítem de menú y el ID de la sección correspondiente
  const mapeoSecciones = {
    'Descripción general': 'descripcion-general',
    'Info de la cuenta': 'info-cuenta',
    'Suscripción y pagos': 'suscripcion',
    'Seguridad': 'seguridad'
  };

  // Función para mostrar una sección específica y ocultar las demás
  function activarSeccion(idSeccionAMostrar) {
    secciones.forEach(seccion => {
      seccion.classList.add('oculto'); // Oculta todas
    });
    const seccionActiva = document.getElementById(idSeccionAMostrar);
    if (seccionActiva) {
      seccionActiva.classList.remove('oculto'); // Muestra la seleccionada
    } else {
      console.warn(`Error: Sección con ID '${idSeccionAMostrar}' no fue encontrada.`);
    }
  }

  // Función para marcar un ítem del menú como activo
  function activarItemMenu(itemClickeado) {
     menuItems.forEach(i => i.classList.remove('activo')); // Quita 'activo' de todos
     if (itemClickeado) {
        itemClickeado.classList.add('activo'); // Añade 'activo' al clickeado
     }
  }

  // Añadir event listeners a cada ítem del menú
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const textoClaveItem = item.dataset.text; // Obtener el identificador del data-text
      const idSeccionAMostrar = mapeoSecciones[textoClaveItem]; // Buscar el ID de sección correspondiente

      if (idSeccionAMostrar) {
        activarItemMenu(item); // Marcar el ítem del menú como activo
        activarSeccion(idSeccionAMostrar); // Mostrar la sección correspondiente
        
        // Scroll horizontal en móvil para que el ítem activo sea visible
        if (window.innerWidth <= 768 && item.scrollIntoView) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      } else {
        console.warn(`Advertencia: No se encontró mapeo para el ítem del menú: "${textoClaveItem}"`);
      }
    });
  });

  // Inicialización: Mostrar la primera sección (o la marcada como 'activo' en HTML)
  let itemActivoInicial = document.querySelector('.menu-lateral li.activo');
  if (!itemActivoInicial && menuItems.length > 0) { // Si ninguno está activo, tomar el primero
      itemActivoInicial = menuItems[0]; 
  }
  if (itemActivoInicial) {
      const textoClaveInicial = itemActivoInicial.dataset.text;
      const idSeccionInicial = mapeoSecciones[textoClaveInicial];
      if (idSeccionInicial) {
          activarItemMenu(itemActivoInicial); 
          activarSeccion(idSeccionInicial);
      } else { // Fallback si el mapeo falla para el ítem activo/inicial
          if (secciones.length > 0) { // Mostrar la primera sección disponible
            activarItemMenu(menuItems[0]); 
            activarSeccion(secciones[0].id);
          }
      }
  }

  // ==========================================================================
  // ======================= SELECCIÓN DE ELEMENTOS DEL DOM PARA POBLAR DATOS =======================
  // ==========================================================================
  // --- Generales del Header ---
  const avatarUsuarioImg = document.getElementById('avatar-usuario');
  // --- Sección: Descripción General ---
  const dgFechaCreacionSpan = document.getElementById('dg-fecha-creacion');
  const dgPlanActualNombreH4 = document.getElementById('dg-plan-actual-nombre');
  const dgProximoPagoSpan = document.getElementById('dg-proximo-pago');
  const dgIconoTarjetaImg = document.getElementById('dg-icono-tarjeta');
  const dgNumeroTarjetaSpan = document.getElementById('dg-numero-tarjeta');
  // --- Sección: Info de la Cuenta ---
  const infoNombreCompletoSpan = document.getElementById('info-nombre-completo');
  const infoCorreoSpan = document.getElementById('info-correo');
  const infoCreacionSpan = document.getElementById('info-creacion');
  const infoPlanSpan = document.getElementById('info-plan');
  // --- Sección: Suscripción y Pagos ---
  const subsPlanNombreH3 = document.getElementById('suscripcion-plan-nombre');
  const subsPlanDescripcionP = document.getElementById('suscripcion-plan-descripcion');
  const subsFechaProximoPagoP = document.getElementById('suscripcion-fecha-proximo-pago');
  const subsIconoTarjetaImg = document.getElementById('suscripcion-icono-tarjeta');
  const subsNumeroTarjetaSpan = document.getElementById('suscripcion-numero-tarjeta');
  // --- Sección: Seguridad ---
  const seguridadEmailSpan = document.getElementById('seguridad-email');
  const seguridadEmailAlertaSpan = document.getElementById('seguridad-email-alerta');
  const seguridadTelefonoSpan = document.getElementById('seguridad-telefono');
  // --- Elementos para Mensajes de Feedback ---
  const infoCuentaMensajeP = document.getElementById('info-cuenta-mensaje'); // Ejemplo para una sección


  // ==========================================================================
  // ======================= FUNCIÓN PARA POBLAR DATOS DEL USUARIO (CON DATOS DE PRUEBA) =======================
  // (Esta función se conectará a Firebase más adelante)
  // ==========================================================================
  function poblarDatosUsuario(datosUsuario) {
    if (!datosUsuario) {
        console.error("Error en poblarDatosUsuario: el objeto datosUsuario está vacío o no definido.");
        return;
    }

    // Avatar general en el header
    if (avatarUsuarioImg && datosUsuario.avatarURL) avatarUsuarioImg.src = datosUsuario.avatarURL;

    // --- Poblar Sección: Descripción General ---
    if (dgFechaCreacionSpan && datosUsuario.fechaCreacion) {
        dgFechaCreacionSpan.textContent = `Miembro desde ${new Date(datosUsuario.fechaCreacion).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    }
    const planPrincipal = datosUsuario.plan || datosUsuario.subscription?.planName; // Usar un campo general o el de suscripción
    if (dgPlanActualNombreH4) dgPlanActualNombreH4.textContent = planPrincipal || '--';
    
    const proximoPagoPrincipal = datosUsuario.proximoPago || datosUsuario.subscription?.nextPaymentDate;
    if (dgProximoPagoSpan && proximoPagoPrincipal) {
        dgProximoPagoSpan.textContent = new Date(proximoPagoPrincipal).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (dgProximoPagoSpan) {
        dgProximoPagoSpan.textContent = '--';
    }

    const iconoTarjetaPrincipal = datosUsuario.metodoPagoIcono || datosUsuario.subscription?.paymentMethodIcon;
    if (dgIconoTarjetaImg && iconoTarjetaPrincipal) {
        dgIconoTarjetaImg.src = `/FrontEnd/Imagenes/Icono/${iconoTarjetaPrincipal}.svg`; // Asumiendo que tienes los iconos SVG en esa ruta
        dgIconoTarjetaImg.alt = iconoTarjetaPrincipal;
        dgIconoTarjetaImg.style.display = 'inline';
    } else if (dgIconoTarjetaImg) {
        dgIconoTarjetaImg.style.display = 'none'; // Ocultar si no hay icono
    }
    const numTarjetaPrincipal = datosUsuario.ultimosDigitosTarjeta || datosUsuario.subscription?.lastCardDigits;
    if (dgNumeroTarjetaSpan) dgNumeroTarjetaSpan.textContent = numTarjetaPrincipal ? `•••• •••• •••• ${numTarjetaPrincipal}` : '----';

    // --- Poblar Sección: Info de la Cuenta ---
    if (infoNombreCompletoSpan) infoNombreCompletoSpan.textContent = datosUsuario.nombreCompleto || '--';
    const inputNombre = document.getElementById('editar-nombre-completo-input'); // Para el campo de edición
    if(inputNombre && datosUsuario.nombreCompleto) inputNombre.value = datosUsuario.nombreCompleto;

    if (infoCorreoSpan) infoCorreoSpan.textContent = datosUsuario.correo || '--';
    if (infoCreacionSpan && datosUsuario.fechaCreacion) { // Reutilizar fecha de creación
        infoCreacionSpan.textContent = new Date(datosUsuario.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (infoPlanSpan) infoPlanSpan.textContent = planPrincipal || '--'; // Reutilizar plan

    // --- Poblar Sección: Suscripción y Pagos ---
    if (subsPlanNombreH3) subsPlanNombreH3.textContent = datosUsuario.subscription?.planName || '--';
    if (subsPlanDescripcionP) subsPlanDescripcionP.textContent = datosUsuario.subscription?.planDescription || 'Detalles no disponibles.';
    if (subsFechaProximoPagoP && datosUsuario.subscription?.nextPaymentDate) {
        subsFechaProximoPagoP.textContent = new Date(datosUsuario.subscription.nextPaymentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (subsFechaProximoPagoP) {
        subsFechaProximoPagoP.textContent = '--';
    }
    if (subsIconoTarjetaImg && datosUsuario.subscription?.paymentMethodIcon) {
        subsIconoTarjetaImg.src = `/FrontEnd/Imagenes/Icono/${datosUsuario.subscription.paymentMethodIcon}.svg`;
        subsIconoTarjetaImg.alt = datosUsuario.subscription.paymentMethodIcon;
        subsIconoTarjetaImg.style.display = 'inline';
    } else if (subsIconoTarjetaImg) {
        subsIconoTarjetaImg.style.display = 'none';
    }
    if (subsNumeroTarjetaSpan) subsNumeroTarjetaSpan.textContent = datosUsuario.subscription?.lastCardDigits ? `•••• •••• •••• ${datosUsuario.subscription.lastCardDigits}` : '----';
  
    // --- Poblar Sección: Seguridad ---
    if (seguridadEmailSpan) seguridadEmailSpan.textContent = datosUsuario.correo || '--'; // Reutilizar email
    if (seguridadEmailAlertaSpan) { 
        if (datosUsuario.emailVerificado === false) { // Este dato vendría del backend
            seguridadEmailAlertaSpan.textContent = 'Requiere verificación';
            seguridadEmailAlertaSpan.style.display = 'block';
        } else {
            seguridadEmailAlertaSpan.style.display = 'none';
        }
    }
    if (seguridadTelefonoSpan) seguridadTelefonoSpan.textContent = datosUsuario.telefono || 'No especificado';
  }

  // ======================= DATOS DE PRUEBA INICIALES (TEMPORAL) =======================
  const datosDePrueba = {
    avatarURL: '/FrontEnd/Imagenes/Icono/play.png', // Ruta a tu imagen de avatar por defecto
    fechaCreacion: '2023-01-15T10:00:00Z', // Formato ISO 8601
    plan: 'Premium Familiar',
    proximoPago: '2024-09-15T10:00:00Z',
    metodoPagoIcono: 'mastercard', // Nombre del archivo del icono (ej. 'mastercard.svg')
    ultimosDigitosTarjeta: '1234',
    nombreCompleto: 'Usuario de Prueba Witech',
    correo: 'prueba@witechplay.com',
    emailVerificado: false, // Ejemplo para mostrar la alerta
    telefono: '011 1234-5678',
    subscription: { // Sub-objeto para datos más específicos de suscripción si es necesario
        planName: 'Premium Familiar',
        planDescription: 'Acceso Full HD, multidispositivo y contenido exclusivo sin anuncios.',
        nextPaymentDate: '2024-09-15T10:00:00Z',
        paymentMethodIcon: 'mastercard',
        lastCardDigits: '1234'
    }
  };
  poblarDatosUsuario(datosDePrueba); // Cargar datos de prueba al iniciar


  // ==========================================================================
  // ======================= MANEJO DE EDICIÓN INLINE (SECCIÓN INFO CUENTA) =======================
  // ==========================================================================
  document.querySelectorAll('#info-cuenta .opcion-info.editable').forEach(opcionEditable => {
    const valorSpan = opcionEditable.querySelector('.opcion-valor');
    const campoEdicionDiv = opcionEditable.querySelector('.campo-edicion');
    const inputEdicion = opcionEditable.querySelector('input[type="text"]');
    const btnGuardar = opcionEditable.querySelector('.btn-guardar-edicion');
    const btnCancelar = opcionEditable.querySelector('.btn-cancelar-edicion');
    const accionDiv = opcionEditable.querySelector('.opcion-accion'); // Para ocultar "Editar" y flecha

    // Evento para entrar en modo edición
    opcionEditable.addEventListener('click', (e) => {
        // Solo activar si no se está editando y el clic no es en los botones de acción del formulario
        if (!opcionEditable.classList.contains('editando') &&
            !e.target.closest('.btn-guardar-edicion') &&
            !e.target.closest('.btn-cancelar-edicion')) {
            
            opcionEditable.classList.add('editando');
            if(valorSpan) valorSpan.style.display = 'none';
            if(campoEdicionDiv) campoEdicionDiv.classList.remove('oculto');
            if(inputEdicion && valorSpan) inputEdicion.value = valorSpan.textContent; // Cargar valor actual
            if(inputEdicion) inputEdicion.focus();
            if(accionDiv) accionDiv.style.display = 'none'; // Ocultar "Editar >"
        }
    });

    // Evento para el botón "Cancelar" edición
    if (btnCancelar) {
        btnCancelar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic en el botón propague al div .opcion-info
            opcionEditable.classList.remove('editando');
            if(valorSpan) valorSpan.style.display = 'block'; // O 'inline' si era su display original
            if(campoEdicionDiv) campoEdicionDiv.classList.add('oculto');
            if(accionDiv) accionDiv.style.display = 'flex'; // Mostrar "Editar >" de nuevo
            ocultarMensajeInfoCuenta(); // Limpiar mensajes previos
        });
    }

    // Evento para el botón "Guardar" edición
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async (e) => { // async para simular llamada a backend
            e.stopPropagation(); // Evitar propagación
            const nuevoValor = inputEdicion.value.trim();
            const valorOriginal = valorSpan ? valorSpan.textContent : "";

            if (nuevoValor === "" || nuevoValor === valorOriginal) { // Si no hay cambio o está vacío
                if(btnCancelar) btnCancelar.click(); // Simplemente cerrar
                return;
            }
            
            mostrarMensajeInfoCuenta('Guardando cambios...', 'info');
            // --- SIMULACIÓN DE LLAMADA AL BACKEND ---
            try {
                // console.log('Simulando guardado de:', nuevoValor);
                // Reemplazar esto con la llamada real a Firebase:
                // await firebase.firestore().collection('users').doc(currentUser.uid).update({ displayName: nuevoValor });
                // o una Cloud Function:
                // await firebase.functions().httpsCallable('updateUserProfile')({ nombreCompleto: nuevoValor });
                
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simular demora de red

                if(valorSpan) valorSpan.textContent = nuevoValor; // Actualizar visualmente el span
                opcionEditable.classList.remove('editando'); // Salir de modo edición
                if(valorSpan) valorSpan.style.display = 'block';
                if(campoEdicionDiv) campoEdicionDiv.classList.add('oculto');
                if(accionDiv) accionDiv.style.display = 'flex';
                mostrarMensajeInfoCuenta('Información actualizada correctamente.', 'success');
            } catch (error) {
                console.error("Error simulado al guardar:", error);
                mostrarMensajeInfoCuenta('Error al guardar los cambios. Inténtalo de nuevo.', 'error');
                // Podrías decidir no cerrar el modo edición aquí para que el usuario reintente.
            }
            // --- FIN DE SIMULACIÓN ---
        });
    }
  });

  // Funciones auxiliares para mostrar/ocultar mensajes en la sección "Info de la cuenta"
  function mostrarMensajeInfoCuenta(texto, tipo = 'info') {
    if(infoCuentaMensajeP) {
        infoCuentaMensajeP.textContent = texto;
        infoCuentaMensajeP.className = `mensaje ${tipo}`; // Asigna la clase base y la de tipo
        infoCuentaMensajeP.classList.remove('oculto');
    }
  }
  function ocultarMensajeInfoCuenta() {
    if(infoCuentaMensajeP) {
        infoCuentaMensajeP.classList.add('oculto');
        infoCuentaMensajeP.textContent = ''; // Limpiar texto
    }
  }


  // ==========================================================================
  // ======================= MANEJO DE CLICS EN OTROS VÍNCULOS Y BOTONES (SIMULACIÓN) =======================
  // ==========================================================================
  
  // Botón "Administrar Perfiles"
  const btnAdministrarPerfiles = document.getElementById('btn-administrar-perfiles');
  if (btnAdministrarPerfiles) {
    btnAdministrarPerfiles.addEventListener('click', () => {
        // TODO: Implementar modal o navegación para administrar perfiles
        alert("SIMULACIÓN: Abrir modal/página para administrar perfiles.");
    });
  }

  // Botón "Cancelar Suscripción"
  const btnCancelarSuscripcion = document.querySelector('.cancelar-suscripcion-btn');
  if(btnCancelarSuscripcion) {
    btnCancelarSuscripcion.addEventListener('click', () => {
        if(confirm("¿Estás seguro de que quieres cancelar tu suscripción?")) {
            // TODO: Implementar lógica de cancelación (simulada por ahora)
            alert('SIMULACIÓN: Suscripción cancelada. Se actualizará el estado del plan.');
            // Aquí podrías, por ejemplo, actualizar los datosDePrueba y volver a llamar a poblarDatosUsuario()
            // para reflejar un plan "Cancelado" o "Gratuito".
        }
    });
  }

  // Botón "Eliminar Cuenta"
  const btnEliminarCuenta = document.querySelector('.eliminar-cuenta-btn');
  if(btnEliminarCuenta) {
    btnEliminarCuenta.addEventListener('click', () => {
        if(confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
            if(confirm("ÚLTIMA ADVERTENCIA: Todos tus datos y suscripciones se perderán permanentemente. ¿Continuar?")) {
                // TODO: Implementar lógica de eliminación de cuenta (simulada)
                alert('SIMULACIÓN: Cuenta eliminada. Serás redirigido.');
                // window.location.href = "/FrontEnd/Index/index.html"; // Ejemplo de redirección
            }
        }
    });
  }

  // Manejo de clics para opciones que navegan a otras secciones o abren modales (simulación)
  document.querySelectorAll('[data-link-action], .opcion-suscripcion, #seguridad .opcion-seguridad').forEach(link => {
    // Evitar añadir listeners duplicados a los elementos ya manejados por la edición inline
    if(link.classList.contains('editable') && link.closest('#info-cuenta')) return; 

    link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir la acción por defecto del enlace/botón si es un <a>

        const action = link.dataset.linkAction || link.querySelector('.opcion-titulo')?.textContent.trim();
        console.log(`Acción clickeada (simulación): ${action}`);
        
        let targetMenuText; // Para identificar a qué sección del menú lateral navegar

        // --- Lógica para determinar a qué sección navegar o qué modal mostrar ---
        switch(action) {
            // --- Vínculos de Descripción General ---
            case 'administrar-membresia':
            case 'cambiar-plan': // También en Suscripción y Pagos
            case 'administrar-pago': // También en Suscripción y Pagos
                targetMenuText = 'Suscripción y pagos';
                break;
            case 'actualizar-contraseña': // También en Seguridad
            case 'control-parental':
            case 'lenguaje':
            case 'administrar-dispositivos': // También en Seguridad
                targetMenuText = 'Seguridad'; // O una sub-página/modal específico
                // TODO: Para estos, en lugar de cambiar de sección, querrás mostrar un MODAL específico.
                alert(`SIMULACIÓN: Abrir modal para "${action}".`);
                return; // Salir para no intentar cambiar de sección del menú

            // --- Opciones de Suscripción y Pagos (los data-link-action deberían ser únicos si es necesario) ---
            // Si los `data-link-action` son iguales a los de arriba, ya están cubiertos.
            // Si son únicos, como "suscripcion-cambiar-plan":
            case 'suscripcion-cambiar-plan':
            case 'suscripcion-administrar-pago':
            case 'suscripcion-canjear-codigo':
            case 'suscripcion-historial-pagos':
                // TODO: Implementar modales o navegación específica para estas acciones.
                alert(`SIMULACIÓN: Acción para "${action}" en Suscripción y Pagos.`);
                return;

            // --- Opciones de Seguridad ---
            case 'seguridad-contraseña':
            case 'seguridad-email':
            case 'seguridad-telefono':
            case 'seguridad-acceso-dispositivos':
                // TODO: Implementar modales o navegación específica para estas acciones de seguridad.
                alert(`SIMULACIÓN: Acción para "${action}" en Seguridad.`);
                return;
            
            // Puedes añadir más casos según los `data-link-action` que definas.
            default:
                // Si la opción es una fila clickeable sin data-link-action pero con un título (ej. de .opcion-suscripcion)
                if (link.classList.contains('opcion-suscripcion') || link.classList.contains('opcion-seguridad')) {
                    alert(`SIMULACIÓN: Acción para la opción "${action}" no definida específicamente.`);
                    return;
                }
                break;
        }

        // Si se determinó un targetMenuText, intentar navegar a esa sección del menú
        if (targetMenuText) {
            const menuItemToClick = Array.from(menuItems).find(
                item => item.dataset.text && item.dataset.text.toLowerCase().includes(targetMenuText.toLowerCase())
            );
            if (menuItemToClick && !menuItemToClick.classList.contains('activo')) {
                // Llamar directamente a las funciones para evitar bucles de eventos si .click() propaga
                activarItemMenu(menuItemToClick);
                activarSeccion(mapeoSecciones[menuItemToClick.dataset.text]);
            } else if (menuItemToClick && menuItemToClick.classList.contains('activo')) {
                console.log(`Ya estás en la sección: ${targetMenuText}. No se requiere navegación.`);
                // Aquí podrías hacer scroll a un elemento específico dentro de la sección si fuera necesario.
            } else {
                 console.warn(`Advertencia: Opción de menú para "${targetMenuText}" no encontrada.`);
            }
        } else if (action && !link.classList.contains('editable')) { // Si hay una acción pero no un targetMenuText (debería abrir un modal)
             console.warn(`Advertencia: No se definió targetMenuText para la acción "${action}", se asume que abrirá un modal o es una acción directa.`);
        }
    });
  });


  // ==========================================================================
// ======================= MANEJO DE MODALES GENÉRICO =======================
// ==========================================================================
const modalOverlay = document.getElementById('modal-generico-overlay');
const modalContenidoDiv = document.getElementById('modal-generico-contenido');
const btnCerrarModal = document.getElementById('modal-cerrar-btn');

let activeModalFormSubmitHandler = null; // Para manejar el submit del form actual en el modal
let activeModalCancelHandler = null; // Para manejar la cancelación específica del paso actual

function abrirModal() {
    if (modalOverlay) modalOverlay.classList.remove('oculto');
}

function cerrarModal() {
    if (modalOverlay) {
        modalOverlay.classList.add('oculto');
        // Limpiar contenido y handlers para evitar ejecuciones no deseadas
        if (modalContenidoDiv) modalContenidoDiv.innerHTML = '<button class="modal-cerrar-btn" id="modal-cerrar-btn" aria-label="Cerrar modal">×</button>'; // Restaurar botón de cierre
        if (activeModalFormSubmitHandler && modalContenidoDiv.querySelector('form')) {
            modalContenidoDiv.querySelector('form').removeEventListener('submit', activeModalFormSubmitHandler);
        }
        if (activeModalCancelHandler && modalContenidoDiv.querySelector('.btn-modal-cancelar')) {
            modalContenidoDiv.querySelector('.btn-modal-cancelar').removeEventListener('click', activeModalCancelHandler);
        }
        activeModalFormSubmitHandler = null;
        activeModalCancelHandler = null;
    }
}

// Event listener para el botón de cierre principal del modal
if (btnCerrarModal) { // Este listener se añade una vez
    btnCerrarModal.addEventListener('click', cerrarModal);
}
// Cerrar modal si se hace clic fuera del contenido
if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            cerrarModal();
        }
    });
}

// Función para cargar contenido de una plantilla en el modal
function cargarContenidoModal(plantillaId, callbackDespuesDeCargar) {
    const plantilla = document.getElementById(plantillaId);
    if (plantilla && modalContenidoDiv) {
        // Clonar el contenido de la plantilla
        const contenidoClonado = plantilla.content.cloneNode(true);
        // Limpiar contenido previo excepto el botón de cerrar global
        modalContenidoDiv.innerHTML = ''; // Limpiar todo
        modalContenidoDiv.appendChild(contenidoClonado); // Añadir nuevo contenido
        
        // Re-añadir el botón de cierre global si se borró (si no está en la plantilla)
        if (!modalContenidoDiv.querySelector('.modal-cerrar-btn')) {
            const nuevoBtnCerrar = document.createElement('button');
            nuevoBtnCerrar.className = 'modal-cerrar-btn';
            nuevoBtnCerrar.id = 'modal-cerrar-btn-interno'; // ID diferente para evitar conflictos si es necesario
            nuevoBtnCerrar.setAttribute('aria-label', 'Cerrar modal');
            nuevoBtnCerrar.innerHTML = '×';
            nuevoBtnCerrar.addEventListener('click', cerrarModal); // El mismo handler de cierre
            modalContenidoDiv.prepend(nuevoBtnCerrar); // O append, según diseño
        } else {
            // Si la plantilla ya tiene un botón de cierre, asegurarse que funcione
            modalContenidoDiv.querySelector('.modal-cerrar-btn').addEventListener('click', cerrarModal);
        }


        if (callbackDespuesDeCargar) {
            callbackDespuesDeCargar();
        }
    } else {
        console.error(`Error: Plantilla con ID '${plantillaId}' o div de contenido del modal no encontrado.`);
    }
}


// ==========================================================================
// ======================= FLUJO: ACTUALIZAR CONTRASEÑA =======================
// ==========================================================================

// --- Variables específicas del flujo de cambio de contraseña ---
let contraseñaActualSimulada = "nasi2002"; // SIMULACIÓN: Contraseña actual del usuario
                                             // En un caso real, no la tendrías en el frontend.

// --- Paso 1: Pedir Contraseña Actual ---
function iniciarFlujoCambioContraseña() {
    cargarContenidoModal('plantilla-modal-paso1-contraseña', () => {
        const formContraseñaActual = document.getElementById('form-contraseña-actual');
        const inputContraseñaActual = document.getElementById('contraseña-actual-input');
        const errorMsgContraseñaActual = document.getElementById('error-contraseña-actual');
        const btnCancelarPaso1 = modalContenidoDiv.querySelector('.btn-modal-cancelar');

        activeModalFormSubmitHandler = async (e) => {
            e.preventDefault();
            errorMsgContraseñaActual.textContent = ''; // Limpiar error previo
            const contraseñaIngresada = inputContraseñaActual.value;

            if (!contraseñaIngresada) {
                errorMsgContraseñaActual.textContent = 'Por favor, ingresa tu contraseña actual.';
                return;
            }

            // SIMULACIÓN DE VERIFICACIÓN
            mostrarSpinnerEnBoton(formContraseñaActual.querySelector('.btn-modal-primario'));
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

            if (contraseñaIngresada === contraseñaActualSimulada) {
                // Contraseña correcta, pasar al siguiente paso
                console.log("Contraseña actual correcta (simulación).");
                cargarPaso2NuevaContraseña();
            } else {
                errorMsgContraseñaActual.textContent = 'La contraseña actual es incorrecta.';
            }
            ocultarSpinnerEnBoton(formContraseñaActual.querySelector('.btn-modal-primario'), "Continuar");
        };
        
        activeModalCancelHandler = () => cerrarModal();

        formContraseñaActual.addEventListener('submit', activeModalFormSubmitHandler);
        btnCancelarPaso1.addEventListener('click', activeModalCancelHandler);
    });
    abrirModal();
}

// --- Paso 2: Pedir Nueva Contraseña ---
function cargarPaso2NuevaContraseña() {
    cargarContenidoModal('plantilla-modal-paso2-nueva-contraseña', () => {
        const formNuevaContraseña = document.getElementById('form-nueva-contraseña');
        const inputNuevaContraseña = document.getElementById('nueva-contraseña-input');
        const inputConfirmarNuevaContraseña = document.getElementById('confirmar-nueva-contraseña-input');
        const errorMsgNueva = document.getElementById('error-nueva-contraseña');
        const errorMsgConfirmar = document.getElementById('error-confirmar-nueva-contraseña');
        const btnCancelarPaso2 = modalContenidoDiv.querySelector('.btn-modal-cancelar');

        activeModalFormSubmitHandler = async (e) => {
            e.preventDefault();
            errorMsgNueva.textContent = '';
            errorMsgConfirmar.textContent = '';

            const nueva = inputNuevaContraseña.value;
            const confirmarNueva = inputConfirmarNuevaContraseña.value;

            if (!nueva || nueva.length < 8) {
                errorMsgNueva.textContent = 'La contraseña debe tener al menos 8 caracteres.';
                return;
            }
            if (nueva !== confirmarNueva) {
                errorMsgConfirmar.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            // SIMULACIÓN DE GUARDADO DE NUEVA CONTRASEÑA
            mostrarSpinnerEnBoton(formNuevaContraseña.querySelector('.btn-modal-primario'));
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay

            console.log("Nueva contraseña guardada (simulación):", nueva);
            contraseñaActualSimulada = nueva; // Actualizar la contraseña simulada para futuras verificaciones
            
            cerrarModal();
            // TODO: Mostrar un mensaje de éxito en la página principal (no en el modal que se cierra)
            // Por ejemplo, usando una función global de notificación o un elemento en la sección de seguridad.
            alert("SIMULACIÓN: ¡Contraseña actualizada con éxito!");
            // ocultarSpinnerEnBoton(formNuevaContraseña.querySelector('.btn-modal-primario'), "Guardar Contraseña"); // No es necesario si el modal se cierra
        };

        activeModalCancelHandler = () => cerrarModal();

        formNuevaContraseña.addEventListener('submit', activeModalFormSubmitHandler);
        btnCancelarPaso2.addEventListener('click', activeModalCancelHandler);
    });
    // No llamamos a abrirModal() aquí porque el modal ya está abierto.
}


// --- Funciones auxiliares para Spinner en botones ---
function mostrarSpinnerEnBoton(boton) {
    boton.disabled = true;
    boton.innerHTML = '<span class="spinner-boton"></span> Guardando...'; // Necesitarás CSS para .spinner-boton
}
function ocultarSpinnerEnBoton(boton, textoOriginal) {
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
}

// ==========================================================================
// ======================= ASIGNAR EVENT LISTENER AL BOTÓN/OPCIÓN "ACTUALIZAR CONTRASEÑA" =======================
// ==========================================================================
// Primero, busca el enlace/opción en "Vínculos rápidos" de Descripción General
const opcionActualizarContraseñaDg = document.querySelector('#descripcion-general .opcion-vinculo-rapido[data-link-action="actualizar-contraseña"]');
if (opcionActualizarContraseñaDg) {
    opcionActualizarContraseñaDg.addEventListener('click', (e) => {
        e.preventDefault();
        iniciarFlujoCambioContraseña();
    });
}

// Luego, busca la opción en la sección de "Seguridad"
const opcionActualizarContraseñaSeg = document.querySelector('#seguridad .opcion-seguridad[data-link-action="seguridad-contraseña"]');
if (opcionActualizarContraseñaSeg) {
    opcionActualizarContraseñaSeg.addEventListener('click', (e) => {
        e.preventDefault();
        iniciarFlujoCambioContraseña();
    });
}

// TODO: Añadir aquí la lógica para los otros botones y flujos (Administrar Perfiles, Control Parental, etc.)
// usando un enfoque similar con plantillas y carga dinámica de contenido en el modal.

}); // Fin DOMContentLoaded