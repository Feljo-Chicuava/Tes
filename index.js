// index.js - Código principal atualizado para Node 24
const TARGET_BASE = "https://player.fimoo.site";
const FAKE_ORIGIN = "https://hyper.hyperappz.site/";
const FAKE_REFERER = "https://hyper.hyperappz.site/";

module.exports = async (req, res) => {
  try {
    // ================= PEGAR PATH DA URL =================
    const url = new URL(req.url, `https://${req.headers.host}`);
    const path = url.pathname.replace(/^\//, '');
    
    // Se for acesso à raiz sem nada
    if (!path) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Player Proxy</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
              h1 { color: #333; }
              code { background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <h1>🎬 Player Proxy</h1>
            <p>Use: <code>https://${req.headers.host}/70145</code></p>
            <p>Substitua <code>70145</code> pelo ID do vídeo</p>
          </body>
        </html>
      `);
    }
    
    // ================= DETERMINAR URL ALVO =================
    let targetPath;
    if (/^\d+$/.test(path)) {
      // É um ID de vídeo (apenas números)
      targetPath = `/embed/${path}`;
    } else {
      // É um asset (css, js, images, etc.)
      targetPath = `/${path}`;
    }
    
    const targetUrl = `${TARGET_BASE}${targetPath}`;
    
    // ================= HEADERS PARA REQUEST =================
    const headers = {
      "Origin": FAKE_ORIGIN,
      "Referer": FAKE_REFERER,
      "User-Agent": req.headers['user-agent'] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": req.headers['accept'] || "*/*",
      "Accept-Language": req.headers['accept-language'] || "pt-BR,pt;q=0.9,en;q=0.8,es;q=0.7",
      "Accept-Encoding": "gzip, deflate, br"
    };
    
    // ================= FAZER REQUEST =================
    const response = await fetch(targetUrl, {
      headers: headers,
      redirect: 'follow'
    });
    
    // ================= VERIFICAR STATUS =================
    if (!response.ok) {
      res.status(response.status);
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      return res.end(`
        <html>
          <body>
            <h1>Erro ${response.status}</h1>
            <p>Não foi possível carregar: ${req.url}</p>
            <p>Tente: <a href="https://${req.headers.host}/70145">https://${req.headers.host}/70145</a></p>
          </body>
        </html>
      `);
    }
    
    // ================= PROCESSAR CONTEÚDO =================
    const contentType = response.headers.get('content-type') || '';
    let content;
    
    if (contentType.includes('text/') || contentType.includes('javascript') || contentType.includes('css')) {
      // Para textos (HTML, JS, CSS)
      content = await response.text();
      
      // Substituir domínio original pelo nosso
      content = content.replace(
        new RegExp(TARGET_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        `https://${req.headers.host}`
      );
      
      // Substituir URLs relativas
      content = content.replace(
        /(href|src|action)=["'](\/[^"']*)["']/gi,
        (match, attr, path) => {
          return `${attr}="https://${req.headers.host}${path}"`;
        }
      );
      
      // Substituir URLs em CSS
      content = content.replace(
        /url\(['"]?(\/[^'")]*)['"]?\)/gi,
        (match, path) => {
          return `url(https://${req.headers.host}${path})`;
        }
      );
      
      // Para HTML, adicionar base tag se necessário
      if (contentType.includes('text/html') && !content.includes('<base href')) {
        content = content.replace(
          /<head[^>]*>/i,
          (match) => {
            return `${match}<base href="https://${req.headers.host}/">`;
          }
        );
      }
      
    } else {
      // Para binários (imagens, fonts, etc.)
      const buffer = await response.arrayBuffer();
      content = Buffer.from(buffer);
    }
    
    // ================= HEADERS DE RESPOSTA =================
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Copiar headers do response
    const headersToCopy = ['content-type', 'cache-control', 'content-length', 'last-modified'];
    headersToCopy.forEach(header => {
      const value = response.headers.get(header);
      if (value) res.setHeader(header, value);
    });
    
    // ================= ENVIAR RESPOSTA =================
    res.end(content);
    
  } catch (error) {
    console.error('❌ Erro no proxy:', error.message);
    
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erro 502</title>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #d32f2f;">⚠️ Erro 502 - Bad Gateway</h1>
          <p><strong>URL solicitada:</strong> ${req.url}</p>
          <p><strong>Erro:</strong> ${error.message}</p>
          <p><strong>Solução:</strong> Tente acessar <a href="https://${req.headers.host}/70145">https://${req.headers.host}/70145</a></p>
          <hr>
          <p><small>Player Proxy - ${new Date().toLocaleString()}</small></p>
        </body>
      </html>
    `);
  }
};
