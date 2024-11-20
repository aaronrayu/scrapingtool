// Determina la URL base según el entorno
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'
    : 'https://scrapingtool.onrender.com'; // Cambia esto por tu URL de producción

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
        console.log('Datos recibidos:', data);

        // Asegurar que los datos tengan la estructura correcta
        data = {
            titulo: data?.titulo || url,
            emails: {
                emails_encontrados: data?.emails?.emails_encontrados || [],
                total_emails: data?.emails?.total_emails || 0
            },
            redes_sociales: data?.redes_sociales || {
                linkedin: [],
                facebook: [],
                twitter: [],
                instagram: []
            },
            estadisticas: data?.estadisticas || {
                total_emails: 0,
                total_enlaces: 0,
                total_linkedin: 0,
                total_facebook: 0,
                total_twitter: 0,
                total_instagram: 0
            }
        };

        resultadoDiv.innerHTML = `
            <h3 id="resultadosTitulo">Resultados para: ${data.titulo}</h3>
            
            <!-- Sección Emails -->
            <div class="seccion">
                <h4>Emails Encontrados (${data.emails.total_emails})</h4>
                <ul class="lista-emails">
                    ${data.emails.emails_encontrados.length > 0 
                        ? data.emails.emails_encontrados.map(email => `<li>${email}</li>`).join('')
                        : '<li>No se encontraron emails</li>'}
                </ul>
            </div>

            <!-- Sección Redes Sociales -->
            <div class="seccion">
                <h4>Redes Sociales</h4>
                <div class="redes-grid">
                    ${Object.entries(data.redes_sociales).map(([red, perfiles]) => `
                        <div class="red-social ${red.toLowerCase()}">
                            <h5>${red.charAt(0).toUpperCase() + red.slice(1)} (${Array.isArray(perfiles) ? perfiles.length : 0})</h5>
                            <ul class="lista-${red.toLowerCase()}">
                                ${Array.isArray(perfiles) && perfiles.length > 0
                                    ? perfiles.map(perfil => `
                                        <li><a href="${perfil.url || perfil}" target="_blank">${perfil.texto || perfil.url || perfil}</a></li>
                                    `).join('')
                                    : `<li>No se encontraron perfiles de ${red}</li>`}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Sección Estadísticas -->
            <div class="seccion">
                <h4>Estadísticas</h4>
                <ul class="estadisticas">
                    ${Object.entries(data.estadisticas).map(([key, value]) => `
                        <li>${key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}: ${value}</li>
                    `).join('')}
                </ul>
            </div>

            <div class="seccion">
                <button onclick="volverInicio()" class="btn-volver">
                    Nueva búsqueda
                </button>
            </div>
        `;

        document.getElementById('resultadosTitulo').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

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
