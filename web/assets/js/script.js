document.getElementById('scrapingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('urlInput').value;
    const inicioDiv = document.getElementById('inicio');
    const resultadosDiv = document.getElementById('resultados');
    const resultadoDiv = document.getElementById('resultado');
    const loadingDiv = document.getElementById('loading');
    
    try {
        // Ocultar inicio y mostrar sección de resultados
        inicioDiv.classList.add('hidden');
        resultadosDiv.classList.remove('hidden');
        loadingDiv.style.display = 'block';
        resultadoDiv.innerHTML = '';
        
        const response = await fetch('http://localhost:5000/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        let data = await response.json();
        
        // Asegurar que todas las propiedades existan
        data = {
            titulo: data?.titulo || 'URL analizada',
            emails: {
                emails_encontrados: data?.emails?.emails_encontrados || [],
                total_emails: data?.emails?.total_emails || 0
            },
            redes_sociales: {
                linkedin: data?.redes_sociales?.linkedin || [],
                facebook: data?.redes_sociales?.facebook || [],
                twitter: data?.redes_sociales?.twitter || [],
                instagram: data?.redes_sociales?.instagram || []
            },
            estadisticas: {
                total_emails: data?.estadisticas?.total_emails || 0,
                total_enlaces: data?.estadisticas?.total_enlaces || 0,
                total_linkedin: data?.estadisticas?.total_linkedin || 0,
                total_facebook: data?.estadisticas?.total_facebook || 0,
                total_twitter: data?.estadisticas?.total_twitter || 0,
                total_instagram: data?.estadisticas?.total_instagram || 0
            },
            img_data: {
                emails: data?.img_data?.emails || [],
                links: data?.img_data?.links || []
            },
            meta_data: {
                emails: data?.meta_data?.emails || [],
                links: data?.meta_data?.links || [],
                redes_sociales: {
                    ...(data?.meta_data?.redes_sociales || {})
                }
            }
        };

        console.log('Datos completos:', data); // Debug

        resultadoDiv.innerHTML = `
            <h3 id="resultadosTitulo">Resultados para: ${data.titulo}</h3>
            
            <!-- Sección Emails -->
            <div class="seccion">
                <h4>Emails Encontrados (${data.emails.emails_encontrados.length})</h4>
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

            <!-- Sección de Imágenes y Metadatos -->
            <div class="seccion">
                <h4>Contenido en Imágenes y Metadatos</h4>
                
                <!-- Subsección de Imágenes -->
                <div class="subseccion">
                    <h5>Encontrado en Imágenes</h5>
                    <div class="contenido-imagenes">
                        <div class="emails-imagenes">
                            <h6>Emails en imágenes (${data.img_data?.emails?.length || 0})</h6>
                            <ul class="lista-emails-img">
                                ${data.img_data?.emails?.length > 0
                                    ? data.img_data.emails.map(email => `
                                        <li>${email}</li>
                                    `).join('')
                                    : '<li>No se encontraron emails en imágenes</li>'}
                            </ul>
                        </div>
                        <div class="links-imagenes">
                            <h6>Enlaces en imágenes (${data.img_data?.links?.length || 0})</h6>
                            <ul class="lista-links-img">
                                ${data.img_data?.links?.length > 0
                                    ? data.img_data.links.map(link => `
                                        <li><a href="${link}" target="_blank">${link}</a></li>
                                    `).join('')
                                    : '<li>No se encontraron enlaces en imágenes</li>'}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Subsección de Metadatos -->
                <div class="subseccion">
                    <h5>Encontrado en Metadatos</h5>
                    <div class="contenido-meta">
                        <div class="emails-meta">
                            <h6>Emails en metadatos (${data.meta_data?.emails?.length || 0})</h6>
                            <ul class="lista-emails-meta">
                                ${data.meta_data?.emails?.length > 0
                                    ? data.meta_data.emails.map(email => `
                                        <li>${email}</li>
                                    `).join('')
                                    : '<li>No se encontraron emails en metadatos</li>'}
                            </ul>
                        </div>
                        <div class="links-meta">
                            <h6>Enlaces en metadatos (${data.meta_data?.links?.length || 0})</h6>
                            <ul class="lista-links-meta">
                                ${data.meta_data?.links?.length > 0
                                    ? data.meta_data.links.map(link => `
                                        <li><a href="${link}" target="_blank">${link}</a></li>
                                    `).join('')
                                    : '<li>No se encontraron enlaces en metadatos</li>'}
                            </ul>
                        </div>
                        <div class="redes-meta">
                            <h6>Redes Sociales en metadatos</h6>
                            <ul class="lista-redes-meta">
                                ${Object.entries(data.meta_data?.redes_sociales || {}).some(([_, urls]) => urls.length > 0)
                                    ? Object.entries(data.meta_data.redes_sociales).map(([red, urls]) => 
                                        urls.length > 0 
                                            ? urls.map(url => `
                                                <li>${red.charAt(0).toUpperCase() + red.slice(1)}: 
                                                    <a href="${url}" target="_blank">${url}</a>
                                                </li>
                                            `).join('')
                                            : ''
                                    ).join('')
                                    : '<li>No se encontraron redes sociales en metadatos</li>'}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Agregar botón para volver al inicio -->
            <div class="seccion">
                <button onclick="volverInicio()" class="btn-volver">
                    Nueva búsqueda
                </button>
            </div>
        `;

        // Desplazamiento suave hasta los resultados
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

// Función para volver al inicio
function volverInicio() {
    const inicioDiv = document.getElementById('inicio');
    const resultadosDiv = document.getElementById('resultados');
    const urlInput = document.getElementById('urlInput');
    
    // Limpiar el input
    urlInput.value = '';
    
    // Mostrar inicio y ocultar resultados
    inicioDiv.classList.remove('hidden');
    resultadosDiv.classList.add('hidden');
}

// Hacer la función accesible globalmente
window.volverInicio = volverInicio;