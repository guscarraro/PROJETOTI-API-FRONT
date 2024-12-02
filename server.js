import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 4000;

// Habilita CORS no proxy
app.use(cors());

// Proxy para autenticação
app.get("/proxy/authorization", async (req, res) => {
  try {
    const response = await fetch("http://cloud.escalasoft.com.br:8051/escalasoft/authorization", {
      method: "GET",
      headers: {
        Authorization: "Basic " + Buffer.from("gustavo.carraro:hatuna10").toString("base64"),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro retornado pela API de autenticação:", errorText);
      return res.status(response.status).send(errorText);
    }

    const body = await response.json();
    console.log("Dados recebidos da API de autenticação:", body);
    res.json(body);
  } catch (error) {
    console.error("Erro no proxy ao autenticar:", error.message);
    res.status(500).send("Erro interno do proxy: " + error.message);
  }
});

// Proxy para rota protegida
app.get("/proxy/dados", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Token não fornecido");
    }

    const response = await fetch(
      "http://cloud.escalasoft.com.br:8051/escalasoft/operacional/painel/IndiceAtendimentoPraca",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro retornado pela API protegida:", errorText);
      return res.status(response.status).send(errorText);
    }

    const body = await response.json();
    console.log("Dados recebidos da API protegida:", body);
    res.json(body);
  } catch (error) {
    console.error("Erro no proxy ao buscar dados:", error.message);
    res.status(500).send("Erro interno do proxy: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});
