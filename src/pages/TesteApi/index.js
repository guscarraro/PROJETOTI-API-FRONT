import { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState([]); // Dados da API protegida
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // Token da autenticação

  useEffect(() => {
    fetchData();
  }, []);

  const authenticate = async () => {
    try {
      // Chamada ao proxy para autenticação
      const authResponse = await fetch("http://localhost:4000/proxy/authorization");

      if (!authResponse.ok) {
        throw new Error(
          `Erro ao autenticar no proxy: ${authResponse.status} - ${authResponse.statusText}`
        );
      }

      const authData = await authResponse.json();

      // Extrair o token do campo "retorno"
      const token = authData.retorno?.[0]?.token;
      if (!token) {
        throw new Error("Token não encontrado na resposta da autenticação");
      }

      setToken(token); // Armazena o token no estado
      return token;
    } catch (error) {
      console.error("Erro ao autenticar no proxy:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Garantir que temos um token válido
      const validToken = token || (await authenticate());

      // Chamada ao proxy para a API protegida
      const response = await fetch(`http://localhost:4000/proxy/dados?token=${validToken}`);

      if (!response.ok) {
        throw new Error(
          `Erro ao buscar os dados no proxy: ${response.status} - ${response.statusText}`
        );
      }

      const jsonData = await response.json();

      setData(jsonData); // Atualiza os dados no estado
    } catch (error) {
      console.error("Erro ao buscar os dados no proxy:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          <h1>Dados</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
