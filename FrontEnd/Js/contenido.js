document.addEventListener('DOMContentLoaded', () => {
    // ... (selectores y constantes como antes) ...
    const filtroTipoSelect = document.getElementById('filtro-tipo');
    const filtroGeneroSelect = document.getElementById('filtro-genero');
    const filtroAñoSelect = document.getElementById('filtro-año');
    const filtroOrdenSelect = document.getElementById('filtro-orden');
    const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
    const gridCatalogo = document.getElementById('grid-catalogo');
    const paginacionCatalogo = document.getElementById('paginacion-catalogo');
    const mensajeCargaCatalogo = document.querySelector('.mensaje-carga-catalogo');

    const ELEMENTOS_POR_PAGINA = 20;
    let paginaActual = 1;
    let todosLosItems = []; 
    let itemsFiltradosYOrdenados = [];

    // --- FUNCIÓN AUXILIAR PARA NORMALIZAR TEXTO (quitar acentos y a minúsculas) ---
    function normalizarTexto(texto) {
        if (typeof texto !== 'string') return '';
        return texto
            .normalize("NFD") // Separa los acentos de las letras base
            .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos (acentos)
            .toLowerCase()
            .trim();
    }

    function capitalizarPrimeraLetra(string) {
        if (typeof string !== 'string' || string.length === 0) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // --- PREPARACIÓN DE DATOS INICIALES ---
    function prepararDatosIniciales() {
        const peliculasArray = Object.keys(window.peliculas || {}).map(key => ({
            id: key,
            ...window.peliculas[key],
            tipo: 'pelicula',
            // Normalizar géneros para consistencia en data.js si es necesario o aquí
            generos: (window.peliculas[key].generos || []).map(g => g.trim()), // Asegurar que no haya espacios extra
        }));

        const seriesArray = Object.keys(window.series || {}).map(key => ({
            id: key,
            ...window.series[key],
            tipo: 'serie',
            año: window.series[key].añoInicio,
            generos: (window.series[key].generos || []).map(g => g.trim()), // Asegurar que no haya espacios extra
        }));

        todosLosItems = [...peliculasArray, ...seriesArray];
    }

    // --- POBLAR FILTROS DINÁMICAMENTE ---
    function cargarGeneros() {
        // Usaremos un Map para almacenar el género normalizado como clave
        // y el género original (capitalizado y la primera versión encontrada) como valor para mostrar en el select.
        const generosMap = new Map(); 

        todosLosItems.forEach(item => {
            if (item.generos && Array.isArray(item.generos)) {
                item.generos.forEach(generoOriginal => {
                    const generoOriginalLimpio = generoOriginal.trim();
                    if (!generoOriginalLimpio) return; // Ignorar strings vacíos

                    const generoNormalizado = normalizarTexto(generoOriginalLimpio);
                    
                    if (generoNormalizado && !generosMap.has(generoNormalizado)) {
                        // Si el género normalizado NO está en el Map, lo añadimos.
                        // Usamos la primera forma capitalizada que encontramos para este género normalizado.
                        generosMap.set(generoNormalizado, capitalizarPrimeraLetra(generoOriginalLimpio));
                    }
                    // Si ya existe (generosMap.has(generoNormalizado) es true), no hacemos nada,
                    // así nos aseguramos de que solo haya una entrada por género normalizado
                    // y el texto que se muestra es el de la primera vez que lo encontramos.
                });
            }
        });

        // Convertir el Map a un array de objetos para ordenar por el texto a mostrar
        const generosParaSelect = Array.from(generosMap.entries()).map(([valorNormalizado, textoAMostrar]) => ({
            valor: valorNormalizado, // ej: "accion"
            texto: textoAMostrar     // ej: "Acción" (la primera forma capitalizada encontrada)
        }));
        
        // Ordenar por el texto que se muestra al usuario
        generosParaSelect.sort((a, b) => a.texto.localeCompare(b.texto));
        
        // Limpiar opciones previas del select de géneros, excepto la primera ("Todos")
        while (filtroGeneroSelect.options.length > 1) {
            filtroGeneroSelect.remove(1);
        }

        generosParaSelect.forEach(genero => {
            const option = document.createElement('option');
            option.value = genero.valor; 
            option.textContent = genero.texto; 
            filtroGeneroSelect.appendChild(option);
        });
    }


    function cargarAños() {
        // ... (sin cambios, esta función ya debería funcionar bien)
        const añosSet = new Set();
        todosLosItems.forEach(item => {
            if (item.año) { 
                añosSet.add(item.año);
            }
        });
        const añosOrdenados = Array.from(añosSet).sort((a, b) => b - a); 

        añosOrdenados.forEach(año => {
            const option = document.createElement('option');
            option.value = año;
            option.textContent = año;
            filtroAñoSelect.appendChild(option);
        });
    }

    // --- LÓGICA DE RENDERIZADO DEL GRID ---
    // ... (crearTarjetaHTML y mostrarContenido sin cambios significativos,
    //      solo asegurar que usan 'item.titulo' que ya está en los datos)

    function crearTarjetaHTML(item) {
        const imagenSrc = item.imagenTarjeta || '/FrontEnd/Imagenes/placeholder-poster.webp'; 
        const altText = item.titulo || 'Título no disponible';

        return `
            <div class="pelicula-wrapper">
                <a href="${item.tipo === 'pelicula' ? 'plantilla.html' : 'plantilla.html'}?id=${item.id}" class="pelicula-enlace-tarjeta" style="text-decoration: none">
                    <div class="pelicula" data-id="${item.id}" data-type="${item.tipo}">
                        <img src="${imagenSrc}" alt="${altText}" loading="lazy" />
                        <h3 class="titulo-pelicula">${altText}</h3>
                    </div>
                </a>
            </div>
        `;
    }

    function mostrarContenido(itemsAMostrar) {
        gridCatalogo.innerHTML = ''; 
        if (mensajeCargaCatalogo) mensajeCargaCatalogo.style.display = 'none';

        if (!itemsAMostrar || itemsAMostrar.length === 0) {
            gridCatalogo.innerHTML = '<p class="mensaje-no-resultados">No se encontraron resultados que coincidan con tu búsqueda.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        itemsAMostrar.forEach(item => {
            const tarjetaDiv = document.createElement('div'); 
            tarjetaDiv.innerHTML = crearTarjetaHTML(item).trim();
            fragment.appendChild(tarjetaDiv.firstChild); 
        });
        gridCatalogo.appendChild(fragment);
    }
    
    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
    function aplicarFiltrosYOrden() {
        const tipoSeleccionado = filtroTipoSelect.value;
        const generoSeleccionado = filtroGeneroSelect.value; // Este valor ya está normalizado (ej: "accion")
        const añoSeleccionado = filtroAñoSelect.value;
        const ordenSeleccionado = filtroOrdenSelect.value;

        let itemsResultado = [...todosLosItems];

        // Filtrar por Tipo
        if (tipoSeleccionado !== 'todos') {
            itemsResultado = itemsResultado.filter(item => item.tipo === tipoSeleccionado);
        }

        // Filtrar por Género
        if (generoSeleccionado !== 'todos') {
            itemsResultado = itemsResultado.filter(item => 
                item.generos && item.generos.some(g => normalizarTexto(g) === generoSeleccionado)
            );
        }
        
        // Filtrar por Año
        if (añoSeleccionado !== 'todos') {
            if (añoSeleccionado === 'anteriores') {
                 const añosRecientesEnSelect = Array.from(filtroAñoSelect.options)
                                       .map(opt => opt.value)
                                       .filter(val => !isNaN(parseInt(val)))
                                       .map(val => parseInt(val));
                
                // Asumimos que los años del select son los más recientes,
                // por ejemplo, si el select tiene 2025, 2024, 2023,
                // "anteriores" serían todos los menores a 2023.
                // Podrías tomar el año más bajo del select como umbral.
                if (añosRecientesEnSelect.length > 0) {
                    const añoMasViejoDelSelect = Math.min(...añosRecientesEnSelect);
                    itemsResultado = itemsResultado.filter(item => item.año < añoMasViejoDelSelect);
                }
                 
            } else {
                itemsResultado = itemsResultado.filter(item => String(item.año) === añoSeleccionado);
            }
        }

        // Ordenar
        switch (ordenSeleccionado) {
            case 'az':
                itemsResultado.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
                break;
            case 'za':
                itemsResultado.sort((a, b) => (b.titulo || '').localeCompare(a.titulo || ''));
                break;
            case 'año-desc': // Más nuevo primero
                itemsResultado.sort((a, b) => (b.año || 0) - (a.año || 0));
                break;
            case 'año-asc': // Más antiguo primero -> CORREGIDO
                itemsResultado.sort((a, b) => (a.año || Infinity) - (b.año || Infinity)); // Corregido: a.año - b.año
                break;
            default: 
                 itemsResultado.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
                 break;
        }
        return itemsResultado;
    }

    // --- LÓGICA DE PAGINACIÓN ---
    // ... (mostrarPagina y actualizarControlesPaginacion sin cambios principales)
    function mostrarPagina(pagina, items) {
        paginaActual = pagina;
        const inicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA;
        const fin = inicio + ELEMENTOS_POR_PAGINA;
        const itemsParaPagina = items.slice(inicio, fin);
        
        mostrarContenido(itemsParaPagina);
        actualizarControlesPaginacion(items.length, ELEMENTOS_POR_PAGINA, paginaActual);
    }

    function actualizarControlesPaginacion(totalItems, itemsPorPagina, paginaActualParam) {
        paginacionCatalogo.innerHTML = '';
        const totalPaginas = Math.ceil(totalItems / itemsPorPagina);

        if (totalPaginas <= 1) return; 

        const btnPrev = document.createElement('button');
        btnPrev.textContent = '‹ Anterior';
        btnPrev.disabled = paginaActualParam === 1;
        btnPrev.addEventListener('click', () => {
            if (paginaActual > 1) {
                mostrarPagina(paginaActual - 1, itemsFiltradosYOrdenados);
            }
        });
        paginacionCatalogo.appendChild(btnPrev);

        const MAX_BOTONES_PAGINA = 5; 
        let inicioRango = Math.max(1, paginaActualParam - Math.floor(MAX_BOTONES_PAGINA / 2));
        let finRango = Math.min(totalPaginas, inicioRango + MAX_BOTONES_PAGINA - 1);

        if (finRango === totalPaginas && (finRango - inicioRango + 1) < MAX_BOTONES_PAGINA) {
            inicioRango = Math.max(1, finRango - MAX_BOTONES_PAGINA + 1);
        }
        
        if (inicioRango > 1) {
            const firstBtn = document.createElement('button');
            firstBtn.textContent = '1';
            firstBtn.addEventListener('click', () => mostrarPagina(1, itemsFiltradosYOrdenados));
            paginacionCatalogo.appendChild(firstBtn);
            if (inicioRango > 2) {
                const ellipsisStart = document.createElement('span');
                ellipsisStart.classList.add('pagina-info');
                ellipsisStart.textContent = '...';
                paginacionCatalogo.appendChild(ellipsisStart);
            }
        }

        for (let i = inicioRango; i <= finRango; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.textContent = i;
            if (i === paginaActualParam) {
                btnPagina.classList.add('activo');
                btnPagina.disabled = true;
            }
            btnPagina.addEventListener('click', () => mostrarPagina(i, itemsFiltradosYOrdenados));
            paginacionCatalogo.appendChild(btnPagina);
        }

        if (finRango < totalPaginas) {
            if (finRango < totalPaginas - 1) {
                const ellipsisEnd = document.createElement('span');
                ellipsisEnd.classList.add('pagina-info');
                ellipsisEnd.textContent = '...';
                paginacionCatalogo.appendChild(ellipsisEnd);
            }
            const lastBtn = document.createElement('button');
            lastBtn.textContent = totalPaginas;
            lastBtn.addEventListener('click', () => mostrarPagina(totalPaginas, itemsFiltradosYOrdenados));
            paginacionCatalogo.appendChild(lastBtn);
        }

        const btnNext = document.createElement('button');
        btnNext.textContent = 'Siguiente ›';
        btnNext.disabled = paginaActualParam === totalPaginas;
        btnNext.addEventListener('click', () => {
            if (paginaActual < totalPaginas) {
                mostrarPagina(paginaActual + 1, itemsFiltradosYOrdenados);
            }
        });
        paginacionCatalogo.appendChild(btnNext);
    }

    // --- MANEJADOR DE EVENTOS PRINCIPAL Y ACTUALIZACIÓN ---
    function manejarCambioDeFiltro() {
        itemsFiltradosYOrdenados = aplicarFiltrosYOrden();
        mostrarPagina(1, itemsFiltradosYOrdenados); 
    }

    // --- EVENT LISTENERS ---
    if (filtroTipoSelect) filtroTipoSelect.addEventListener('change', manejarCambioDeFiltro);
    if (filtroGeneroSelect) filtroGeneroSelect.addEventListener('change', manejarCambioDeFiltro);
    if (filtroAñoSelect) filtroAñoSelect.addEventListener('change', manejarCambioDeFiltro);
    if (filtroOrdenSelect) filtroOrdenSelect.addEventListener('change', manejarCambioDeFiltro);
    
    if (limpiarFiltrosBtn) {
        limpiarFiltrosBtn.addEventListener('click', () => {
            if (filtroTipoSelect) filtroTipoSelect.value = 'todos';
            if (filtroGeneroSelect) filtroGeneroSelect.value = 'todos';
            if (filtroAñoSelect) filtroAñoSelect.value = 'todos';
            if (filtroOrdenSelect) filtroOrdenSelect.value = 'az'; 
            manejarCambioDeFiltro();
        });
    }

    // --- INICIALIZACIÓN ---
    function init() {
        if (typeof window.peliculas === 'undefined' || typeof window.series === 'undefined') {
            console.error("Los datos de películas o series no están disponibles en window.");
            if(gridCatalogo && mensajeCargaCatalogo) {
                gridCatalogo.innerHTML = '';
                mensajeCargaCatalogo.textContent = "Error al cargar los datos. Intenta recargar la página.";
                mensajeCargaCatalogo.style.display = 'block';
            }
            return;
        }

        if (mensajeCargaCatalogo) mensajeCargaCatalogo.style.display = 'block';
        
        const urlParams = new URLSearchParams(window.location.search);
        const tipoDesdeURL = urlParams.get('tipo'); // Busca un parámetro llamado 'tipo'

        if (tipoDesdeURL && filtroTipoSelect) {
            // Si encontramos el parámetro 'tipo' en la URL...
            console.log(`Filtro detectado desde URL: ${tipoDesdeURL}`);
            
            // 1. Establecemos el valor del <select> para que coincida con el parámetro.
            filtroTipoSelect.value = tipoDesdeURL;

            // 2. IMPORTANTE: Llamamos manualmente a la función de filtrado para aplicar el cambio.
            //    Simplemente cambiar el .value no dispara el evento 'change', así que lo hacemos nosotros.
            //    No es necesario llamar a manejarCambioDeFiltro() aquí, ya que se llamará al final de init().
            //    Solo con haber cambiado el valor del select es suficiente para el primer renderizado.
        }

        prepararDatosIniciales();
        cargarGeneros();
        cargarAños();
        
        if (filtroOrdenSelect) filtroOrdenSelect.value = 'az';

        itemsFiltradosYOrdenados = aplicarFiltrosYOrden(); 
        if (itemsFiltradosYOrdenados.length > 0) {
            mostrarPagina(1, itemsFiltradosYOrdenados);
        } else {
            if (mensajeCargaCatalogo) mensajeCargaCatalogo.style.display = 'none';
            gridCatalogo.innerHTML = '<p class="mensaje-no-resultados">No hay contenido disponible en este momento.</p>';
        }
    }

    init();
});