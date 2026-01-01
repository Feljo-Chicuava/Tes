const fetch = require("node-fetch");

exports.handler = async (event) => {
  const id = event.queryStringParameters.id;

  if (!id) {
    return {
      statusCode: 400,
      body: "ID inválido"
    };
  }

  const base = "https://hyper.hyperappz.site/";
  const playerUrl = `https://player.fimoo.site/embed/${id}`;

  try {
    const response = await fetch(playerUrl, {
      headers: {
        "Referer": base,
        "Origin": base,
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html"
      },
      body: html
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: "Erro ao carregar player"
    };
  }
};