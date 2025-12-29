import express from "express";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "API yt-dlp online" });
});

app.get("/download", (req, res) => {
  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL obrigatória" });
  }

  const format =
    type === "mp3"
      ? "-x --audio-format mp3"
      : "-f best";

  const cmd = `yt-dlp ${format} -g "${url}"`;

  exec(cmd, (err, stdout) => {
    if (err) {
      return res.status(500).json({ error: "Falha ao processar vídeo" });
    }

    res.json({
      success: true,
      download_url: stdout.trim()
    });
  });
});

app.listen(PORT, () => {
  console.log("API rodando na porta " + PORT);
});
