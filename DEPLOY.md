# Despliegue de manueldhers.com

Guía paso a paso para publicar el sitio, activar el panel de Manuel y dar de alta el SEO. Está pensada para hacer todo en una tarde (2–3 horas efectivas) más 24–48h de espera para que propague el DNS.

---

## 0 · Antes de empezar

Necesitas tener a mano:

- **Cuenta de GitHub** (gratis)
- **Cuenta de Cloudflare** (gratis) — https://dash.cloudflare.com/sign-up
- **Acceso al panel de Piensa Solutions** (dueño del dominio `manueldhers.com`)
- **Acceso al WordPress viejo** aún funcionando (para descargar las imágenes antes de darlo de baja)
- **Correo de Manuel** para invitarlo como colaborador al final

Instalado localmente:

- **Node.js 20+** (`node --version` debe dar `v20.x` o mayor)
- **Git** (`git --version`)

Descarga el zip del proyecto, extráelo, y abre una terminal en la carpeta `manueldhers-site/`.

---

## 1 · Descargar las imágenes del WordPress viejo

Las 19 entradas del blog referencian 9 imágenes/PDFs que hoy viven en el WordPress viejo. Hay que copiarlas al nuevo sitio **antes** de dar de baja el WordPress. La lista completa está en `imagenes-a-descargar.txt`.

Bash automático (con `wget`), desde la raíz del proyecto:

```bash
mkdir -p public/uploads
while IFS= read -r url; do
  # Ignora líneas vacías y comentarios
  [[ -z "$url" || "$url" == \#* ]] && continue
  # Nombre del archivo = último segmento del URL
  fname=$(basename "$url")
  wget -q --show-progress -O "public/uploads/$fname" "$url"
done < imagenes-a-descargar.txt
```

Verifica: `ls public/uploads/` debe listar los 9 archivos. Prueba abrir un par en el navegador para asegurar que no están corruptos.

> **Nota**: si el WordPress viejo ya no responde, mira el archivo del sitio infectado en Wayback Machine (`web.archive.org/web/*/manueldhers.com`) y guarda las versiones cacheadas de las imágenes.

---

## 2 · Crear la imagen `og-default.jpg`

Es la tarjeta que aparece cuando alguien comparte el sitio en Twitter, WhatsApp, LinkedIn. Formato: **1200 × 630 px**, JPEG, menos de 200 KB.

Diseño sugerido (respetando la paleta):

- Fondo crema `#F1ECDD`
- Texto en Inter Black 900, navy `#0A2340`: "Manuel D'Hers Del Pozo"
- Debajo, en JetBrains Mono, terracota `#B84A2E`: "Doctor en Antropología · URV"
- Alineación: izquierda, con aire generoso

Guarda como `public/og-default.jpg`. Puedes generarla en Figma, Photoshop o incluso con un editor online rápido. Si Manuel prefiere una foto suya, esa también funciona con el nombre encima.

---

## 3 · Probar en local

Antes de subir, verifica que compila y se ve bien:

```bash
cd manueldhers-site
npm install         # instala Astro + sitemap plugin
npm run dev         # levanta en http://localhost:4321
```

Abre `http://localhost:4321` y navega por:

- `/` (home)
- `/bio/`
- `/publicaciones/`
- `/blog/`
- Un par de entradas del blog en `/<slug>/`

Cuando esté OK:

```bash
npm run build       # genera dist/
```

No debe dar errores. La carpeta `dist/` es lo que Cloudflare publicará.

---

## 4 · Subir a GitHub

Crea un repositorio nuevo en GitHub llamado `manueldhers-site` (privado o público, da igual — el sitio publicado es lo que se ve, no el código).

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Diseño Crema · nombre natural aplicado + 19 entradas importadas"
git branch -M main
git remote add origin git@github.com:TU-USUARIO/manueldhers-site.git
git push -u origin main
```

Sustituye `TU-USUARIO` por tu handle de GitHub.

> **Si prefieres HTTPS en vez de SSH**: `git remote add origin https://github.com/TU-USUARIO/manueldhers-site.git`

---

## 5 · Desplegar en Cloudflare Pages

1. Entra a **Cloudflare Dashboard** → menú lateral → **Workers & Pages** → pestaña **Pages** → **Create a project** → **Connect to Git**.
2. Autoriza a Cloudflare a leer tus repos de GitHub. Selecciona `manueldhers-site`.
3. En **Set up builds and deployments**:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (vacío)
   - **Environment variables**: en `Variables and Secrets`, añade una variable de build:
     - `NODE_VERSION` = `20`
4. **Save and Deploy**.

El primer build tarda 1–2 minutos. Cuando termine, Cloudflare te da una URL provisional del tipo `manueldhers-site.pages.dev`. Ábrela y verifica que todo se ve bien.

> **Si el build falla**: revisa los logs en Cloudflare. Los errores más comunes son versión de Node mal, o algún paquete faltando. Corrige local, `git push`, y Cloudflare rebuilde solo.

Cada `git push` a `main` a partir de ahora dispara un rebuild automático.

---

## 6 · Custom domain + cambiar nameservers en Piensa Solutions

### 6.1 · Añadir el dominio a Cloudflare (como Zone)

Antes de conectar el dominio al proyecto de Pages, hay que **añadir `manueldhers.com` como zona en Cloudflare** para que Cloudflare gestione todo el DNS.

1. En Cloudflare Dashboard → **Add a Site** → escribe `manueldhers.com` → **Continue**.
2. Elige el **plan gratuito (Free)** → **Continue**.
3. Cloudflare escaneará el DNS actual y te mostrará los registros que encuentra. Revisa que estén los básicos (probablemente el A record apuntando al hosting de Piensa). Los puedes dejar por ahora — los reemplazaremos al conectar Pages.
4. Cloudflare te dará **dos nameservers** del tipo:
   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```
   **Cópialos, los necesitas para el paso 6.2.**

### 6.2 · Cambiar los nameservers en Piensa Solutions

1. Entra a tu panel de **Piensa Solutions** (https://panel.piensasolutions.com o similar, según Piensa).
2. Ve a **Dominios** → `manueldhers.com` → **Servidores DNS / Nameservers**.
3. Selecciona la opción de **usar nameservers externos / personalizados**.
4. Reemplaza los que tengan puestos actualmente (`ns1.piensasolutions.com`, `ns2.piensasolutions.com` o similares) por los dos que te dio Cloudflare.
5. Guardar.

**La propagación tarda de 30 minutos a 48 horas** (normalmente 2–6h). En Cloudflare aparecerá un banner que dice "Pending Nameserver Update" hasta que detecte el cambio. Puedes seguir con los pasos 6.3 en paralelo — solo empezará a funcionar cuando la propagación termine.

Puedes verificar en cualquier momento con:
```bash
dig NS manueldhers.com
```

### 6.3 · Conectar el dominio al proyecto de Pages

Una vez que Cloudflare detecta que ya gestiona el dominio (o incluso antes, se puede pre-configurar):

1. Cloudflare Dashboard → **Workers & Pages** → `manueldhers-site` → **Custom domains** → **Set up a custom domain**.
2. Escribe `manueldhers.com` → **Continue** → **Activate domain**. Cloudflare crea automáticamente el registro CNAME que apunta al `.pages.dev`.
3. Repite para `www.manueldhers.com` (redirige o sirve el mismo contenido).
4. Cloudflare emite el certificado SSL automáticamente en 5–15 minutos. Verás un candado verde en el navegador.

**Configurar redirección www → apex** (recomendado, para que Google no vea contenido duplicado):

En **DNS** de la zona → si tienes `www` apuntando al mismo sitio, deja como está. Y en **Rules → Redirect Rules** crea:

- **When**: `Hostname` equals `www.manueldhers.com`
- **Then**: URL redirect (301) → `https://manueldhers.com/$1`

O al revés, según prefieras. Manuel probablemente quiere sin `www`.

### 6.4 · Dar de baja el hosting de Piensa

Ya no lo usas — el sitio corre 100% en Cloudflare Pages. Puedes:

- **Cancelar solo el hosting** en Piensa, manteniendo el dominio ahí (Piensa te seguirá cobrando el registro anual del dominio pero no el hosting, ahorro significativo).
- **O transferir el dominio a Cloudflare Registrar** (registro más barato, sin markup): en Cloudflare → tu zona → **Registrar** → **Transfer**. Requiere que Piensa te dé el authcode (EPP code). Ahorro típico: 30–50% al año.

No hagas la transferencia hasta que el sitio en Cloudflare esté 100% estable — al menos una semana.

---

## 7 · Activar el panel de Manuel (Sveltia CMS + GitHub OAuth)

Esto le permite a Manuel entrar a `manueldhers.com/admin/`, escribir entradas nuevas y publicar sin tocar código. Requiere:

- Un **Cloudflare Worker** que intermedie el login con GitHub (el llamado `sveltia-cms-auth`)
- Una **OAuth App** de GitHub

### 7.1 · Desplegar el worker `sveltia-cms-auth`

1. Clona el repo del worker en tu máquina:
   ```bash
   git clone https://github.com/sveltia/sveltia-cms-auth.git
   cd sveltia-cms-auth
   ```
2. Instala Wrangler (CLI de Cloudflare Workers) si no lo tienes:
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. Configura las variables del worker (GitHub Client ID y Secret — los generamos en 7.2):
   ```bash
   wrangler secret put GITHUB_CLIENT_ID
   wrangler secret put GITHUB_CLIENT_SECRET
   ```
   Wrangler te pedirá pegar cada valor. Guárdalos vacíos por ahora, los rellenamos después del paso 7.2.
4. Despliega:
   ```bash
   wrangler deploy
   ```
   Al final te dará la URL del worker, algo como:
   ```
   https://sveltia-cms-auth.TU-USUARIO.workers.dev
   ```
   **Cópiala, la necesitas para el paso 7.3.**

### 7.2 · Crear la OAuth App en GitHub

1. En GitHub → tu foto (arriba derecha) → **Settings** → menú lateral → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Rellena:
   - **Application name**: `Manuel D'Hers CMS`
   - **Homepage URL**: `https://manueldhers.com`
   - **Authorization callback URL**: `https://sveltia-cms-auth.TU-USUARIO.workers.dev/callback`
     (la URL del worker + `/callback`)
   - **Application description**: (opcional) `Panel de edición para el sitio manueldhers.com`
3. **Register application**.
4. En la pantalla siguiente, copia el **Client ID** (visible siempre) y genera un **Client Secret** ("Generate a new client secret") — cópialo **inmediatamente**, GitHub no lo muestra dos veces.
5. Vuelve a la terminal donde tienes el worker y actualiza los secretos:
   ```bash
   wrangler secret put GITHUB_CLIENT_ID   # pega el Client ID
   wrangler secret put GITHUB_CLIENT_SECRET   # pega el Client Secret
   ```
6. Redeploya el worker: `wrangler deploy`.

### 7.3 · Configurar `public/admin/config.yml`

En el proyecto del sitio, edita `public/admin/config.yml` (líneas 3 y 6):

```yaml
backend:
  name: github
  repo: TU-USUARIO/manueldhers-site   # <- reemplaza
  branch: main
  base_url: https://sveltia-cms-auth.TU-USUARIO.workers.dev   # <- reemplaza
```

Commit + push:
```bash
git add public/admin/config.yml
git commit -m "Configurar CMS: repo + auth worker"
git push
```

Cloudflare Pages reconstruye el sitio automáticamente en ~1 minuto.

### 7.4 · Añadir a Manuel como colaborador

1. Manuel se crea una cuenta de GitHub gratis (si no tiene): `github.com/join`. Solo necesita email y una contraseña.
2. En tu repo `manueldhers-site` → **Settings** → **Collaborators** → **Add people** → escribe el handle de GitHub de Manuel → **Add**.
3. Manuel recibe un email de GitHub, acepta la invitación.

### 7.5 · Manuel entra al panel

Manuel abre `https://manueldhers.com/admin/` → **Login with GitHub** → autoriza la app → dentro del panel puede:

- Crear entradas de **Blog** (título, fecha, slug, categoría, descripción, imagen, cuerpo)
- Crear/editar entradas de **Publicaciones**, **En otros medios**
- Editar la **Bio**

Cada guardado dispara un commit en GitHub, y Cloudflare Pages reconstruye el sitio en ~1 minuto. Manuel ve el cambio en vivo.

**Regla de oro para Manuel**: nunca cambies el campo **Slug (URL)** de una entrada ya publicada. Si necesita mover una URL, añade una redirección en `public/_redirects` (esto sí lo haces tú, no Manuel).

---

## 8 · Google Search Console + Sitemap

Esto le dice a Google que existe el sitio nuevo y le da el mapa de todas las URLs.

1. Entra a **Google Search Console** → https://search.google.com/search-console → **Add Property**.
2. Elige tipo **URL prefix** (más simple) → introduce `https://manueldhers.com/` → **Continue**.
3. Verificar propiedad: elige el método **DNS record** (recomendado, no depende de un archivo).
   - Google te da un valor TXT del tipo `google-site-verification=xxxxxxxxx...`.
   - En Cloudflare → tu zona `manueldhers.com` → **DNS** → **Add record**:
     - Type: `TXT`
     - Name: `@` (raíz)
     - Content: `google-site-verification=xxxxxxxxx...`
     - TTL: Auto
   - En Google Search Console → **Verify**. Suele ser instantáneo.
4. Una vez verificado → **Sitemaps** en el menú lateral → **Add a new sitemap**:
   - Escribe: `sitemap-index.xml`
   - Submit.
5. Google empezará a indexar en las siguientes 24–72h.

**Recomendado también**: alta en **Bing Webmaster Tools** (https://www.bing.com/webmasters). Puedes importar la propiedad directamente desde Google Search Console con un botón.

---

## 9 · Post-deploy: verificar y monitorizar

### 9.1 · Verifica que los 19 slugs legacy resuelven

Cada entrada del blog debe abrir en su URL original. Rápido test con `curl`:

```bash
for slug in \
  al-regresar-diarios-de-campo-de-una-visita-a-venezuela \
  que-es-la-migracion-inmovil \
  diario-de-campo-0-un-delirio-instintivo-pero-necesario \
  venezuela-se-arreglo \
  notas-de-campo-4-caracas-es-un-laberinto; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://manueldhers.com/$slug/")
  echo "$status  https://manueldhers.com/$slug/"
done
```

Todas deben devolver `200`. Si alguna da 404, algo pasó — revisa el `slug` en el archivo Markdown correspondiente (debe coincidir exactamente).

### 9.2 · Testear las tarjetas OG (redes sociales)

- **Twitter / X**: https://cards-dev.twitter.com/validator → pega `https://manueldhers.com`
- **Facebook**: https://developers.facebook.com/tools/debug/ → pega la URL, click "Scrape again"
- **LinkedIn**: https://www.linkedin.com/post-inspector/

Deben mostrar la `og-default.jpg` con el título y descripción.

### 9.3 · Monitorizar

- **Cloudflare Analytics**: en tu zona → **Analytics & Logs** → tráfico, países, top URLs, etc. Gratis y sin JavaScript de tracking (respeta privacidad).
- **Cloudflare Pages Deployments**: cada `git push` genera un deploy con logs. Si algo rompe, ves el error.

### 9.4 · Backups

El código vive en GitHub (backup 1). El contenido vive en el repo también (backup 2). Cloudflare guarda los últimos 20 deploys — puedes hacer rollback con un click desde el dashboard.

---

## 10 · Cuando Manuel necesite cambios que no son de contenido

Si en el futuro hay que:

- Añadir una sección nueva
- Cambiar un color, tipografía, layout
- Añadir un plugin de Astro (comentarios, formulario, etc.)

Se hace en el código (`src/`), commit, push, deploy automático. Manuel sigue publicando desde el panel como siempre, sin que le afecte.

---

## Resumen ejecutivo (checklist)

- [ ] Descargar 9 imágenes viejas → `public/uploads/`
- [ ] Crear `public/og-default.jpg` (1200×630)
- [ ] `npm install && npm run build` local sin errores
- [ ] Crear repo en GitHub, subir el código
- [ ] Crear proyecto en Cloudflare Pages conectado al repo
- [ ] Añadir `manueldhers.com` como Zone en Cloudflare (copiar nameservers)
- [ ] Cambiar nameservers en Piensa Solutions
- [ ] Esperar propagación (2–48h) y añadir custom domain al proyecto de Pages
- [ ] Cancelar el hosting de Piensa (dejar solo el dominio, o transferirlo)
- [ ] Desplegar el worker `sveltia-cms-auth` en Cloudflare
- [ ] Crear OAuth App en GitHub → guardar Client ID + Secret
- [ ] Actualizar `admin/config.yml` con repo + worker URL
- [ ] Invitar a Manuel al repo como colaborador
- [ ] Manuel prueba entrar a `/admin/` y publicar
- [ ] Google Search Console: verificar por DNS TXT + enviar `sitemap-index.xml`
- [ ] Verificar los 19 slugs legacy con `curl`
- [ ] Testear tarjetas OG en Twitter, Facebook, LinkedIn

Cuando el checklist está limpio, el sitio está publicado, indexable y editable por Manuel. El WordPress viejo se puede dar de baja definitivamente.
