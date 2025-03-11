import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sakcwetcknulwugphhft.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha2N3ZXRja251bHd1Z3BoaGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDIzNDMsImV4cCI6MjA0ODM3ODM0M30.Qjm_-RaDZuUxkxmuJglZ-y5h-fM3PAqTzhnpIzfBgY0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const API_AUTH_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/authorization';
const API_INDICE_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/painel/IndiceAtendimentoPraca';
const API_OCORRENCIAS_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/ocorrencia/ExportarOcorrencias';
const API_NOTA_FISCAL_URL = 'https://cloud.escalasoft.com.br:8055/escalasoft/operacional/originario/consulta';
const API_CONSULTA_VIAGEM = "https://cloud.escalasoft.com.br:8055/escalasoft/operacional/viagem/consultaviagem";
const API_CONSULTA_DOCUMENTO = "https://cloud.escalasoft.com.br:8055/escalasoft/operacional/documento/consulta";


const SHARED_TOKEN_ID = 'shared-token'; // ID fixo para o token compartilhado

export const getAuthToken = async () => {
  try {
    // Busca o token do Supabase
    const { data, error } = await supabase
      .from('auth_api')
      .select('token, expiration')
      .eq('id', SHARED_TOKEN_ID)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar token do Supabase:', error.message);
      throw error;
    }

    // Verifica se o token existe e é válido
    if (data && data.token && data.token !== 'placeholder-token' && new Date(data.expiration) > new Date()) {
      
      return data.token;
    }

    // Gera um novo token se o atual for inválido
    console.warn('Token inválido ou expirado. Gerando um novo...');
    return await generateAndSaveToken();
  } catch (error) {
    console.error('Erro ao obter token do Supabase:', error.message);
    throw new Error('Falha ao obter o token.');
  }
};

const generateAndSaveToken = async () => {
  try {
    // Gera o token via API de autenticação
    const credentials = btoa('gustavo.carraro:hatuna10');
    const response = await axios.post(
      API_AUTH_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    const tokenData = response.data?.retorno?.[0]?.token;
    if (!tokenData) {
      throw new Error('Token não encontrado na resposta da API.');
    }

    const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora de validade

    // Salva o novo token no Supabase
    const { error } = await supabase
      .from('auth_api')
      .upsert(
        {
          id: SHARED_TOKEN_ID,
          token: tokenData,
          expiration: expiration,
          criado_em: new Date().toISOString(),
        },
        { onConflict: ['id'] }
      );

    if (error) {
      console.error('Erro ao salvar token no Supabase:', error.message);
      throw error;
    }

    return tokenData;
  } catch (error) {
    console.error('Erro ao gerar e salvar novo token:', error.message);
    throw new Error('Não foi possível gerar um novo token.');
  }
};

export const fetchViagem = async (numeroViagem) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_CONSULTA_VIAGEM}?viagem=${numeroViagem}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || {};
  } catch (error) {
    console.error("Erro ao buscar viagem:", error.message);
    return {};
  }
};

export const fetchDocumento = async (chave) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${API_CONSULTA_DOCUMENTO}?chave=${chave}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data || {};
  } catch (error) {
    console.error("Erro ao buscar documento:", error.message);
    return {};
  }
};


// Funções de API usando o token
export const fetchIndiceAtendimento = async (dataInicial, dataFinal) => {
  try {
    const token = await getAuthToken();

    const response = await axios.get(API_INDICE_URL, {
      params: { dataInicial, dataFinal },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.indiceAtendimentoPraca || [];
  } catch (error) {
    if (
      error.response?.status === 401 &&
      error.response?.data?.retorno?.[0]?.mensagem === 'Token vencido'
    ) {
      console.warn('Token vencido. Tentando renovar o token...');

      try {
        const newToken = await generateAndSaveToken();
        const retryResponse = await axios.get(API_INDICE_URL, {
          params: { dataInicial, dataFinal },
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        return retryResponse.data.indiceAtendimentoPraca || [];
      } catch (retryError) {
        return [];
      }
    }

    console.error('Erro ao buscar índice de atendimento:', error.message);
    return [];
  }
};

export const fetchNotaFiscal = async (notaFiscal) => {
  try {
    const token = await getAuthToken();
    
    const response = await axios.get(`${API_NOTA_FISCAL_URL}?notafiscal=${notaFiscal}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    let rawData;
    let jsonData; // ✅ Declaramos jsonData antes do bloco try

    try {
      rawData = typeof response.data === "string" ? response.data : JSON.stringify(response.data);

      // ✅ Corrige valores inválidos antes de fazer o parse
      rawData = rawData.replace(/"CTE":\s*,/g, '"CTE":"" ,'); // Garante que campos vazios fiquem com aspas
      rawData = rawData.replace(/: ,/g, ': "" ,'); // Corrige qualquer outro valor vazio sem aspas


      jsonData = JSON.parse(rawData); // ✅ Agora jsonData está definido
    } catch (parseError) {
      return [];
    }


    // Verifica se a estrutura esperada está presente
    if (!jsonData || !jsonData.nota || !Array.isArray(jsonData.nota)) {
      return [];
    }

    // Filtra e limpa os dados removendo notas inválidas
    const notasValidas = jsonData.nota.filter(n => {
      if (!n.NF || isNaN(n.NF)) {
        return false;
      }
      return true;
    });


    return notasValidas;
  } catch (error) {
    return [];
  }
};
  



export const fetchOcorrencias = async (dataInicial) => {
  try {
    const token = await getAuthToken();

    const response = await axios.get(API_OCORRENCIAS_URL, {
      params: { dataInicial },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.ocorrencia || [];
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error.message);
    return [];
  }
};
