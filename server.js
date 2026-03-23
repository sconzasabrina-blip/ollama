const http = require('http');

const OLLAMA = 'http://127.0.0.1:11434';

const server = http.createServer((req, res) => {
  // CORS headers - allow everything
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse Ollama URL
  const target = new URL(OLLAMA + req.url);

  const options = {
    hostname: target.hostname,
    port: target.port || 11434,
    path: target.pathname + target.search,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const proxy = http.request(options, (ollamaRes) => {
    res.writeHead(ollamaRes.statusCode, {
      'Content-Type': ollamaRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    ollamaRes.pipe(res);
  });

  proxy.on('error', (e) => {
    console.error('Error conectando a Ollama:', e.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'No se pudo conectar a Ollama: ' + e.message }));
  });

  req.pipe(proxy);
});

const PORT = 3100;
server.listen(PORT, () => {
  console.log(`✓ Proxy corriendo en http://localhost:${PORT}`);
  console.log(`  Redirigiendo pedidos a ${OLLAMA}`);
  console.log(`\n  Ahora corré en otra ventana:`);
  console.log(`  ngrok http ${PORT}`);
});
