import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  // 🔐 TOKEN DE TESTE
  const TOKEN = "1234";
  const { token } = req.query;

  if (token !== TOKEN) {
    return res.status(401).json({
      status: false,
      message: "Token inválido"
    });
  }

  try {
    const response = await axios.get(
      "https://appzin.cineverseapp.store",
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const $ = cheerio.load(response.data);
    const lista = [];

    $("div#genre_lancamentos article.item.movies").each((i, el) => {
      const id = $(el).attr("id") || "";
      const imagem = $(el).find("div.poster img").attr("src") || "";
      const rating = $(el).find("div.rating").text().trim() || "";
      const link = $(el).find("div.poster a").attr("href") || "";
      const titulo = $(el).find("div.data h3 a").text().trim() || "";
      const data = $(el).find("div.data span").text().trim() || "";

      let tipo = "Desconhecido";
      if (link.includes("/trailer-m/")) tipo = "Filme";
      else if (link.includes("/trailer-s/")) tipo = "Série";

      lista.push({
        id,
        titulo,
        imagem,
        rating,
        data,
        link,
        tipo
      });
    });

    return res.status(200).json({
      status: true,
      total: lista.length,
      resultados: lista
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Erro interno",
      error: err.message
    });
  }
  }
