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
        console.log('Datos recibidos del servidor:', data);

        // Estructura de datos por defecto
        const defaultData = {
            titulo: url,
            emails: {
                emails_encontrados: [],
                total_emails: 0
            },
            redes_sociales: {
                linkedin: [],
                facebook: [],
                twitter: [],
                instagram: []
            },
            estadisticas: {
                total_emails: 0,
                total_enlaces: 0,
                total_linkedin: 0,
                total_facebook: 0,
                total_twitter: 0,
                total_instagram: 0
            }
        };

        // Combinar datos recibidos con datos por defecto
        data = {
            ...defaultData,
            ...data,
            emails: {
                ...defaultData.emails,
                ...(data?.emails || {})
            },
            redes_sociales: {
                ...defaultData.redes_sociales,
                ...(data?.redes_sociales || {})
            },
            estadisticas: {
                ...defaultData.estadisticas,
                ...(data?.estadisticas || {})
            }
        };

        console.log('Datos procesados:', data);

        // Generar HTML con los datos procesados
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
                    <div class="red-social linkedin">
                        <h5>LinkedIn (${data.redes_sociales.linkedin.length})</h5>
                        <ul class="lista-linkedin">
                            ${data.redes_sociales.linkedin.length > 0
                                ? data.redes_sociales.linkedin.map(perfil => 
                                    `<li><a href="${perfil.url}" target="_blank">${perfil.texto || perfil.url}</a></li>`
                                ).join('')
                                : '<li>No se encontraron perfiles de LinkedIn</li>'}
                        </ul>
                    </div>
                    <div class="red-social facebook">
                        <h5>Facebook (${data.redes_sociales.facebook.length})</h5>
                        <ul class="lista-facebook">
                            ${data.redes_sociales.facebook.length > 0
                                ? data.redes_sociales.facebook.map(perfil => 
                                    `<li><a href="${perfil.url}" target="_blank">${perfil.texto || perfil.url}</a></li>`
                                ).join('')
                                : '<li>No se encontraron perfiles de Facebook</li>'}
                        </ul>
                    </div>
                    <div class="red-social twitter">
                        <h5>Twitter (${data.redes_sociales.twitter.length})</h5>
                        <ul class="lista-twitter">
                            ${data.redes_sociales.twitter.length > 0
                                ? data.redes_sociales.twitter.map(perfil => 
                                    `<li><a href="${perfil.url}" target="_blank">${perfil.texto || perfil.url}</a></li>`
                                ).join('')
                                : '<li>No se encontraron perfiles de Twitter</li>'}
                        </ul>
                    </div>
                    <div class="red-social instagram">
                        <h5>Instagram (${data.redes_sociales.instagram.length})</h5>
                        <ul class="lista-instagram">
                            ${data.redes_sociales.instagram.length > 0
                                ? data.redes_sociales.instagram.map(perfil => 
                                    `<li><a href="${perfil.url}" target="_blank">${perfil.texto || perfil.url}</a></li>`
                                ).join('')
                                : '<li>No se encontraron perfiles de Instagram</li>'}
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Sección Estadísticas -->
            <div class="seccion">
                <h4>Estadísticas</h4>
                <ul class="estadisticas">
                    <li>Total Emails: ${data.estadisticas.total_emails}</li>
                    <li>Total Enlaces: ${data.estadisticas.total_enlaces}</li>
                    <li>LinkedIn: ${data.estadisticas.total_linkedin}</li>
                    <li>Facebook: ${data.estadisticas.total_facebook}</li>
                    <li>Twitter: ${data.estadisticas.total_twitter}</li>
                    <li>Instagram: ${data.estadisticas.total_instagram}</li>
                </ul>
            </div>

            <div class="seccion">
                <button onclick="volverInicio()" class="btn-volver">
                    Nueva búsqueda
                </button>
            </div>
        `;

        // Scroll a los resultados
        document.getElementById('resultadosTitulo').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

    } catch (error) {
        console.error('Error completo:', error);
        resultadoDiv.innerHTML = `
            <div class="error">
                <p>Error: ${error.message}</p>
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
