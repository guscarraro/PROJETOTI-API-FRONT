import React, { useEffect, useState } from "react";
import apiLocal from "../../services/apiLocal";
import Motorista from "./Motorista";
import Cliente from "./Cliente";
import TipoOcorren from "./TipoOcorren";
import LancarOcorren from "./LancarOcorren";

// Componente Navbar
const Navbar = ({ currentTab, setCurrentTab }) => {
  return (
    <nav style={styles.navbar}>
      <button
        style={currentTab === "ocorrencias" ? styles.activeButton : styles.button}
        onClick={() => setCurrentTab("ocorrencias")}
      >
        Ocorrências em Aberto
      </button>
      <button
        style={currentTab === "motoristas" ? styles.activeButton : styles.button}
        onClick={() => setCurrentTab("motoristas")}
      >
        Motoristas
      </button>
      <button
        style={currentTab === "clientes" ? styles.activeButton : styles.button}
        onClick={() => setCurrentTab("clientes")}
      >
        Clientes
      </button>
      <button
        style={currentTab === "tiposOcorrencias" ? styles.activeButton : styles.button}
        onClick={() => setCurrentTab("tiposOcorrencias")}
      >
        Tipos de Ocorrências
      </button>
      <button
        style={currentTab === "novaOcorrencia" ? styles.activeButton : styles.button}
        onClick={() => setCurrentTab("novaOcorrencia")}
      >
        Lançar Nova Ocorrência
      </button>
    </nav>
  );
};

// Componente Ocorrências em Aberto
const OcorrenciasAbertas = () => {
  const [ocorrencias, setOcorrencias] = useState([]);

  useEffect(() => {
    const fetchOcorrencias = async () => {
      try {
        const response = await apiLocal.getOcorrencias();
        setOcorrencias(response.data.filter((oc) => oc.status === "Aberto"));
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error);
      }
    };

    fetchOcorrencias();
  }, []);

  return (
    <div style={styles.content}>
      <h2>Ocorrências em Aberto</h2>
      {ocorrencias.length > 0 ? (
        <ul>
          {ocorrencias.map((ocorrencia) => (
            <li key={ocorrencia.id}>
              <strong>NF:</strong> {ocorrencia.nf} | <strong>Cliente:</strong>{" "}
              {ocorrencia.cliente_id} | <strong>Status:</strong> {ocorrencia.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma ocorrência em aberto.</p>
      )}
    </div>
  );
};

// Página Principal Frete
const Frete = () => {
  const [currentTab, setCurrentTab] = useState("ocorrencias"); // Aba inicial

  return (
    <div>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div>
        {currentTab === "ocorrencias" && <OcorrenciasAbertas />}
        {currentTab === "motoristas" && <Motorista />}
        {currentTab === "clientes" && <Cliente />}
        {currentTab === "tiposOcorrencias" && <TipoOcorren />}
        {currentTab === "novaOcorrencia" && <LancarOcorren />}
      </div>
    </div>
  );
};

// Estilos inline (pode ser substituído por CSS separado)
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#282c34",
    padding: "10px",
  },
  button: {
    color: "#fff",
    backgroundColor: "#444",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  activeButton: {
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  content: {
    padding: "20px",
  },
};

export default Frete;
