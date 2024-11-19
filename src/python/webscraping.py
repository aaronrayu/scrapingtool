from flask import Flask, request, jsonify, render_template, make_response
import requests
from bs4 import BeautifulSoup
import re
from flask_cors import CORS
from urllib.parse import urlparse, urljoin

app = Flask(__name__)
CORS(app)

def extraer_emails(texto):
    """
    Con esta función busco emails en un texto
    Uso expresiones regulares para encontrar los patrones de email
    """
    # Defino dos patrones: uno para emails normales y otro para enlaces mailto:
    patron_email = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}'
    patron_mailto = r'mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})'
    
    # Buscar emails en texto y enlaces mailto
    emails_texto = re.findall(patron_email, texto)
    emails_mailto = re.findall(patron_mailto, texto)
    
    # Unir, eliminar duplicados y ordenar
    todos_emails = list(set(emails_texto + emails_mailto))
    return {
        'emails_encontrados': sorted(todos_emails),
        'total_emails': len(todos_emails)
    }

def es_url_valida(url):
    """
    Aquí verifico si una URL es válida
    Me aseguro que tenga http/https y un dominio válido
    Si algo falla, devuelvo False
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def clasificar_enlace(url):
    """
    En esta función analizo las URLs para saber de qué tipo son
    Puedo detectar si son:
    - Enlaces de LinkedIn (perfil o empresa)
    - Direcciones de email
    - Redes sociales
    - Otros enlaces generales
    """
    url_lower = url.lower()
    if 'linkedin.com' in url_lower:
        if '/in/' in url_lower:
            return 'perfil_linkedin'
        elif '/company/' in url_lower:
            return 'empresa_linkedin'
        return 'linkedin_otro'
    elif 'mailto:' in url_lower:
        return 'email'
    elif any(red in url_lower for red in ['facebook.com', 'twitter.com', 'instagram.com']):
        return 'red_social'
    return 'general'

def extraer_enlaces(soup, base_url):
    todos_enlaces = []
    
    for enlace in soup.find_all('a'):
        href = enlace.get('href', '')
        texto = enlace.text.strip()
        
        # Convertir URLs relativas a absolutas
        if href and not href.startswith(('http://', 'https://', 'mailto:', 'tel:', '#')):
            href = urljoin(base_url, href)
        
        # Solo agregar enlaces válidos
        if href and es_url_valida(href):
            info_enlace = {
                'url': href,
                'texto': texto if texto else href,
                'tipo': clasificar_enlace(href)
            }
            todos_enlaces.append(info_enlace)
    
    return todos_enlaces

def detectar_redes_sociales(soup, base_url):
    redes_sociales = {
        'linkedin': [],
        'facebook': [],
        'twitter': [],
        'instagram': [],
        'youtube': [],
        'tiktok': []
    }
    
    patrones = {
        'linkedin': [
            r'linkedin\.com/(?:in|company)/[^/\s]+',
            r'linkedin\.com/profile/view\?id=[^/\s]+'
        ],
        'facebook': [
            r'facebook\.com/[^/\s]+',
            r'fb\.com/[^/\s]+'
        ],
        'twitter': [
            r'twitter\.com/[^/\s]+',
            r'x\.com/[^/\s]+'
        ],
        'instagram': [
            r'instagram\.com/[^/\s]+'
        ],
        'youtube': [
            r'youtube\.com/(?:user|channel|c)/[^/\s]+',
            r'youtube\.com/@[^/\s]+'
        ],
        'tiktok': [
            r'tiktok\.com/@[^/\s]+'
        ]
    }
    
    for enlace in soup.find_all('a'):
        href = enlace.get('href', '')
        texto = enlace.text.strip()
        
        # Convertir URLs relativas a absolutas
        if href and not href.startswith(('http://', 'https://')):
            href = urljoin(base_url, href)
        
        for red, patrones_red in patrones.items():
            for patron in patrones_red:
                if re.search(patron, href, re.I):
                    info_perfil = {
                        'url': href,
                        'texto': texto if texto else href,
                        'username': extraer_username(href, red)
                    }
                    redes_sociales[red].append(info_perfil)
    
    return redes_sociales

def extraer_username(url, red):
    """Extrae el nombre de usuario de la URL de la red social"""
    patrones = {
        'linkedin': r'linkedin\.com/(?:in|company)/([^/\s?]+)',
        'facebook': r'facebook\.com/([^/\s?]+)',
        'twitter': r'(?:twitter\.com|x\.com)/([^/\s?]+)',
        'instagram': r'instagram\.com/([^/\s?]+)',
        'youtube': r'youtube\.com/(?:user|channel|c|@)([^/\s?]+)',
        'tiktok': r'tiktok\.com/@([^/\s?]+)'
    }
    
    if red in patrones:
        match = re.search(patrones[red], url, re.I)
        if match:
            return match.group(1)
    return None

def extraer_emails_y_links_de_imagen(soup):
    """Extrae emails y enlaces de atributos de imágenes"""
    resultados = {
        'emails': set(),
        'links': set()
    }
    
    # Patrón para emails mejorado
    patron_email = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}'
    
    try:
        # Buscar en todas las imágenes
        for img in soup.find_all(['img', 'image']):
            # Lista de atributos a revisar
            atributos = ['src', 'alt', 'title', 'data-original', 'data-src', 'href']
            
            for attr in atributos:
                valor = img.get(attr, '')
                if valor:
                    # Buscar emails
                    emails = re.findall(patron_email, valor)
                    resultados['emails'].update(emails)
                    
                    # Buscar enlaces
                    if valor.startswith(('http://', 'https://')):
                        resultados['links'].add(valor)
                    elif valor.startswith('//'):
                        resultados['links'].add('https:' + valor)
                    elif valor.startswith('/'):
                        resultados['links'].add(valor)

        print(f"Datos encontrados en imágenes: {resultados}")  # Debug
        return resultados
    except Exception as e:
        print(f"Error en extraer_emails_y_links_de_imagen: {str(e)}")
        return resultados

def extraer_de_metadatos(soup):
    """Extrae información de metadatos"""
    resultados = {
        'emails': set(),
        'links': set(),
        'redes_sociales': {
            'linkedin': set(),
            'facebook': set(),
            'twitter': set(),
            'instagram': set()
        }
    }
    
    try:
        # Patrón para emails
        patron_email = r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}'
        
        # Patrones para redes sociales
        patrones_redes = {
            'linkedin': r'linkedin\.com/(?:in|company)/[^/\s]+',
            'facebook': r'facebook\.com/[^/\s]+',
            'twitter': r'twitter\.com/[^/\s]+',
            'instagram': r'instagram\.com/[^/\s]+'
        }
        
        # Buscar en meta tags
        for meta in soup.find_all(['meta', 'link']):
            # Buscar en todos los atributos
            for attr in meta.attrs:
                valor = meta[attr]
                if isinstance(valor, str):  # Asegurarse de que el valor es una cadena
                    # Buscar emails
                    emails = re.findall(patron_email, valor)
                    resultados['emails'].update(emails)
                    
                    # Buscar enlaces
                    if valor.startswith(('http://', 'https://')):
                        resultados['links'].add(valor)
                    
                    # Buscar redes sociales
                    for red, patron in patrones_redes.items():
                        if re.search(patron, valor, re.I):
                            resultados['redes_sociales'][red].add(valor)

        # Buscar en Open Graph y Twitter Cards
        for prop in ['og:image', 'og:url', 'twitter:image', 'twitter:url']:
            meta = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
            if meta and meta.get('content'):
                valor = meta['content']
                if valor.startswith(('http://', 'https://')):
                    resultados['links'].add(valor)

        print(f"Datos encontrados en metadatos: {resultados}")  # Debug
        return resultados
    except Exception as e:
        print(f"Error en extraer_de_metadatos: {str(e)}")
        return resultados

@app.route('/scrape', methods=['POST'])
def scrape():
    """
    Esta es mi función principal que:
    1. Recibe la URL que quiero analizar
    2. Descarga la página web
    3. Busca emails, enlaces y redes sociales
    4. Devuelve todo lo que encontré en formato JSON
    """
    try:
        # Obtengo la URL que me enviaron
        url = request.json['url']
        
        # Me aseguro que la URL tenga http:// o https://
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Configuro los headers para que mi petición parezca venir de un navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        }
        
        # Hago la petición a la página web
        response = requests.get(url, headers=headers, timeout=10, verify=False)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extraer información de imágenes y metadatos
        img_data = extraer_emails_y_links_de_imagen(soup)
        meta_data = extraer_de_metadatos(soup)
        
        # Convertir sets a listas para JSON
        img_data_json = {
            'emails': list(img_data['emails']),
            'links': list(img_data['links'])
        }
        
        meta_data_json = {
            'emails': list(meta_data['emails']),
            'links': list(meta_data['links']),
            'redes_sociales': {
                red: list(urls) for red, urls in meta_data['redes_sociales'].items()
            }
        }
        
        # Resto del código existente...
        emails_data = extraer_emails(soup.get_text())
        data = {
            'titulo': soup.title.string if soup.title else 'URL analizada',
            'emails': {
                'emails_encontrados': emails_data['emails_encontrados'],
                'total_emails': emails_data['total_emails']
            },
            'redes_sociales': detectar_redes_sociales(soup, url),
            'enlaces': extraer_enlaces(soup, url),
            'img_data': img_data_json,  # Agregar datos de imágenes
            'meta_data': meta_data_json  # Agregar datos de metadatos
        }
        
        print("Datos completos a enviar:", data)  # Debug
        return jsonify(data)
        
    except Exception as e:
        print(f"Error en scrape: {str(e)}")
        return jsonify({
            'error': str(e),
            'img_data': {'emails': [], 'links': []},
            'meta_data': {
                'emails': [],
                'links': [],
                'redes_sociales': {
                    'linkedin': [],
                    'facebook': [],
                    'twitter': [],
                    'instagram': []
                }
            }
        }), 500

if __name__ == '__main__':
    app.run(debug=True)