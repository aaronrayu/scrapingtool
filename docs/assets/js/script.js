// Determina la URL base según el entorno
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://tu-api-publica.com'; // Cambia esto por tu URL de producción

document.getElementById('scrapingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('urlInput').value;
    const inicioDiv = document.getElementById('inicio');
    const resultadosDiv = document.getElementById('resultados');
    const resultadoDiv = document.getElementById('resultado');
    const loadingDiv = document.getElementById('loading');
    
    try {
        // Validación básica de URL
        if (!url || !url.startsWith('http')) {
            throw new Error('Por favor, ingresa una URL válida que comience con http:// o https://');
        }

        // Ocultar inicio y mostrar sección de resultados
        inicioDiv.classList.add('hidden');
        resultadosDiv.classList.remove('hidden');
        loadingDiv.style.display = 'block';
        resultadoDiv.innerHTML = '';
        
        console.log('Enviando solicitud a:', `${BASE_URL}/scrape`);
        
        const response = await fetch(`${BASE_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        let data = await response.json();
        
        // ... resto del código igual ...

    } catch (error) {
        console.error('Error completo:', error);
        resultadoDiv.innerHTML = `
            <div class="error">
                <p>Error: ${error.message}</p>
                <p>Por favor verifica:</p>
                <ul>
                    <li>Que la URL sea válida</li>
                    <li>Que el servidor esté funcionando</li>
                    <li>Tu conexión a internet</li>
                </ul>
                <button onclick="volverInicio()" class="btn-volver">
                    Volver a intentar
                </button>
            </div>
        `;
    } finally {
        loadingDiv.style.display = 'none';
    }
});

// Función mejorada para volver al inicio
function volverInicio() {
    const inicioDiv = document.getElementById('inicio');
    const resultadosDiv = document.getElementById('resultados');
    const urlInput = document.getElementById('urlInput');
    const loadingDiv = document.getElementById('loading');
    
    // Limpiar el input y ocultar loading
    urlInput.value = '';
    loadingDiv.style.display = 'none';
    
    // Mostrar inicio y ocultar resultados
    inicioDiv.classList.remove('hidden');
    resultadosDiv.classList.add('hidden');
    
    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hacer la función accesible globalmente
window.volverInicio = volverInicio;
