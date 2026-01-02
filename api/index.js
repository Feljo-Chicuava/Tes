const fetch = require('node-fetch');

// ================= CONFIGURAÇÕES =================
const BASE_PLAYER_URL = "https://player.fimoo.site/embed/";
const FAKE_ORIGIN = "https://hyper.hyperappz.site/";
const FAKE_REFERER = "https://hyper.hyperappz.site/";

module.exports = async (req, res) => {
  // ================= PEGAR ID DA URL =================
  const requestUri = req.url || '/';
  const pathParts = requestUri.split('/').filter(p => p);
  const id = pathParts[0] || '';
  
  // Se acessar a raiz sem ID
  if (!id) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8'
    });
    res.end(`Acesse com um ID: https://${req.headers.host}/12345`);
    return;
  }
  
  // Validação simples
  if (!/^[0-9]+$/.test(id)) {
    res.writeHead(400, {
      'Content-Type': 'text/html; charset=UTF-8'
    });
    res.end("ID inválido! Use apenas números.");
    return;
  }
  
  const playerUrl = BASE_PLAYER_URL + id;
  
  // ================= ENVIAR HEADERS APENAS =================
  try {
    // Fazer requisição apenas para enviar headers
    await fetch(playerUrl, {
      headers: {
        "Origin": FAKE_ORIGIN,
        "Referer": FAKE_REFERER,
        "User-Agent": "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Connection": "keep-alive"
      },
      method: 'HEAD', // Apenas envia headers, não baixa conteúdo
      redirect: 'follow',
      timeout: 10000
    });
    
    console.log(`Headers enviados para: ${playerUrl}`);
    
  } catch (error) {
    console.log('Erro ao enviar headers:', error.message);
    // Continua mesmo com erro
  }
  
  // ================= REDIRECIONAMENTO DIRETO =================
  console.log(`Redirecionando para: ${playerUrl}`);
  
  res.writeHead(302, {
    'Location': playerUrl,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.end();
};
