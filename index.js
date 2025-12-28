const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const response = await axios.get(
      "https://appzin.cineverseapp.store",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const $ = cheerio.load(response.data);
    const lista = [];

    $("div#genre_lancamentos article.item.movies").each((_, el) => {
      const link = $(el).find("div.poster a").attr("href") || "";

      let tipo = "Desconhecido";
      if (link.includes("/trailer-m/")) tipo = "Filme";
      else if (link.includes("/trailer-s/")) tipo = "Série";

      lista.push({
        id: $(el).attr("id") || "",
        titulo: $(el).find("div.data h3 a").text().trim(),
        imagem: $(el).find("div.poster img").attr("src") || "",
        rating: $(el).find("div.rating").text().trim() || "",
        data: $(el).find("div.data span").text().trim() || "",
        link,
        tipo
      });
    });

    // 💡 Header obrigatório para JSON
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      status: true,
      total: lista.length,
      resultados: lista
    }));

  } catch (e) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(JSON.stringify({
      status: false,
      error: e.message
    }));
  }
};
