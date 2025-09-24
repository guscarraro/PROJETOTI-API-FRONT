import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import ChartClientesAtrasos from "./ChartClientesAtrasos";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import * as XLSX from "xlsx"; // ✅ Importa XLSX para exportação

const ModalNaoCobranca = ({ data, clientes = [], onClose, onRefresh, onContagemVermelhas }) => {
  const [sortedData, setSortedData] = useState([...data]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedNota, setSelectedNota] = useState(null);
  const [isCteModalOpen, setIsCteModalOpen] = useState(false);
  const [cteValue, setCteValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const toggleCteModal = () => setIsCteModalOpen(!isCteModalOpen);

  useEffect(() => {
    const vermelhas = sortedData.filter((item) => {
      const clienteInfo = getClienteInfo(item.cliente_id);
      const permanencia = calcularTempoPermanencia(
        item.horario_chegada,
        item.horario_saida,
        item.horario_ocorrencia
      );
      const cobranca = calcularValorCobranca(clienteInfo, permanencia);
      return !cobranca.dentroDoPrazo && cobranca.excedente > 0;
    });

    if (onContagemVermelhas) {
      onContagemVermelhas(vermelhas.length);
    }
  }, [sortedData, onContagemVermelhas]);


  const parseHorasPermitidas = (str) => {
    if (!str) return 0;
    const [h, m] = str.split(":").map(Number);
    return h + m / 60;
  };


  const getClienteInfo = (clienteId) => {
    const found = clientes.find((c) => c.value === clienteId);
    return found || {};
  };


  const calcularValorCobranca = (clienteInfo, tempoReal) => {
    const tde = clienteInfo?.tde?.toUpperCase?.() === "SIM";
    const hrPermitida = parseHorasPermitidas(clienteInfo?.hr_permanencia);

    const valorHora = Number(clienteInfo?.valor_permanencia || 0);

    const tempoTotalHoras = tempoReal.horas + tempoReal.minutos / 60;

    if (tempoReal.formatado === "Indisponível" || !clienteInfo?.hr_permanencia) {
      return { excedente: 0, valorCobrado: 0, dentroDoPrazo: true };
    }

    const excedente = tempoTotalHoras - hrPermitida;
    const dentroDoPrazo = excedente <= 0 || tde;

    return {
      excedente: excedente > 0 ? excedente : 0,
      valorCobrado: excedente > 0 ? excedente * valorHora : 0,
      dentroDoPrazo,
    };
  };



  const handleCheckboxChange = (nf) => {
    setSelectedNota(nf === selectedNota ? null : nf);
  };
  const exportarParaExcel = () => {
    const dadosFormatados = sortedData.map((item) => ({
      "Nota Fiscal": item.nf,
      Cliente: item.cliente,
      "Hora da Chegada": formatarDataHora(item.horario_chegada),
      "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
      "Hora de Saída": formatarDataHora(item.horario_saida),
      "Permanência Após Ocorrências": calcularTempoPermanencia(
        item.horario_chegada,
        item.horario_saida,
        item.horario_ocorrencia
      ).formatado,
      Motorista: item.motorista,
    }));

    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrencias_Sem_Cobranca");
    XLSX.writeFile(wb, "Ocorrencias_Sem_Cobranca.xlsx");
  };

  const handleChange = (e) => {
    const value = e.target.value;

    if (value === 'ACORDO COMERCIAL VIGENTE' || value === 'CARGA LOTAÇÃO NO DESTINATARIO') {
      setCteValue(value);
      setIsValid(true);
    } else if (/^\d+$/.test(value)) {
      setCteValue(value);
      setIsValid(true);
    } else {
      setCteValue(value);
      setIsValid(false);
    }
  };

  const handleSaveCte = async () => {
    if (!selectedNota || !cteValue.trim()) {
      toast.error("Por favor, selecione uma nota e insira o número do CTE.");
      return;
    }

    try {
      const payload = {
        nf: selectedNota,
        cobranca_adicional: "S",
        cte_gerado: cteValue,
      };

      const response = await apiLocal.updateCobrancaAdicional(payload);

      if (response.status === 200) {
        toast.success("Cobrança adicional registrada com sucesso!");

        if (onRefresh) {
          onRefresh();
        }

        setSelectedNota(null);
        setCteValue("");
        toggleCteModal();
      } else {
        throw new Error("Erro ao registrar cobrança adicional.");
      }
    } catch (error) {
      console.error("Erro ao registrar cobrança adicional:", error);
      toast.error(
        "Erro ao registrar cobrança adicional. Verifique os dados e tente novamente."
      );
    }
  };

  const calcularTempoPermanencia = (chegada, saida, ocorren) => {
    const chegadaDate = new Date(chegada);
    const saidaDate = new Date(saida);
    const ocorrenDate = new Date(ocorren);
    if (!ocorrenDate || !saidaDate || ocorrenDate > saidaDate)
      return { horas: 0, minutos: 0, formatado: "Indisponível" };

    const diffMs = saidaDate - ocorrenDate;
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;

    return { horas, minutos, formatado: `${horas}h ${minutos}min` };
  };

 const handleSort = (key) => {
  let direction = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }

  const sorted = [...sortedData].sort((a, b) => {
    const clienteA = getClienteInfo(a.cliente_id);
    const clienteB = getClienteInfo(b.cliente_id);
    const permanenciaA = calcularTempoPermanencia(a.horario_chegada, a.horario_saida, a.horario_ocorrencia);
    const permanenciaB = calcularTempoPermanencia(b.horario_chegada, b.horario_saida, b.horario_ocorrencia);
    const cobrancaA = calcularValorCobranca(clienteA, permanenciaA);
    const cobrancaB = calcularValorCobranca(clienteB, permanenciaB);

    switch (key) {
      case "tempoPermanencia":
        return direction === "asc"
          ? permanenciaA.horas - permanenciaB.horas || permanenciaA.minutos - permanenciaB.minutos
          : permanenciaB.horas - permanenciaA.horas || permanenciaB.minutos - permanenciaA.minutos;

      case "hr_permanencia":
        const hpA = parseHorasPermitidas(clienteA?.hr_permanencia);
        const hpB = parseHorasPermitidas(clienteB?.hr_permanencia);
        return direction === "asc" ? hpA - hpB : hpB - hpA;

      case "excedente":
        return direction === "asc"
          ? cobrancaA.excedente - cobrancaB.excedente
          : cobrancaB.excedente - cobrancaA.excedente;

      case "valorCobrado":
        return direction === "asc"
          ? cobrancaA.valorCobrado - cobrancaB.valorCobrado
          : cobrancaB.valorCobrado - cobrancaA.valorCobrado;

      default:
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
    }
  });

  setSortedData(sorted);
  setSortConfig({ key, direction });
};


  const clientesAtrasos = [];
  data.forEach((item) => {
    const cliente = clientesAtrasos.find((c) => c.name === item.cliente);
    if (cliente) {
      cliente.quantidade += 1;
    } else {
      clientesAtrasos.push({ name: item.cliente, quantidade: 1 });
    }
  });

  const formatarDataHora = (dataHora) => {
    const data = new Date(dataHora);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, "0");
    const minutos = String(data.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
  };
  const filteredRows = sortedData.filter((item) => {
    const clienteInfo = getClienteInfo(item.cliente_id);
    const permanencia = calcularTempoPermanencia(
      item.horario_chegada,
      item.horario_saida,
      item.horario_ocorrencia
    );

    const cobranca = calcularValorCobranca(clienteInfo, permanencia);
    return (
      permanencia.formatado === "Indisponível" &&
      !cobranca.dentroDoPrazo &&
      cobranca.excedente > 0
    );
  });

  const formatarHrPerm = (valor) => {
    if (!valor) return "N/A";
    const [h, m] = valor.split(":");
    return `${h}h ${m}min`;
  };
  const receitaTotal = sortedData.reduce((total, item) => {
    const clienteInfo = getClienteInfo(item.cliente_id);
    const permanencia = calcularTempoPermanencia(
      item.horario_chegada,
      item.horario_saida,
      item.horario_ocorrencia
    );
    const cobranca = calcularValorCobranca(clienteInfo, permanencia);

    if (!cobranca.dentroDoPrazo && cobranca.excedente > 0) {
      return total + cobranca.valorCobrado;
    }

    return total;
  }, 0);



  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          minWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
          color: "black",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h4 style={{ margin: 0 }}>Ocorrências Sem Cobrança Adicional</h4>
            <div
              style={{
                backgroundColor: "rgba(0, 128, 0, 0.3)",
                color: "green",
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              Receita estimada: {receitaTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}

            </div>
          </div>
          <Button color="success" onClick={exportarParaExcel} size="sm">
            Exportar para Excel
          </Button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h5>Top 10 Clientes com Mais Atrasos</h5>
          <ChartClientesAtrasos data={clientesAtrasos.slice(0, 10)} />

        </div>
        {selectedNota && (
          <div
            style={{
              position: 'sticky',
              top: -20,
              right: 10,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'flex-end',
              padding: 10,
              background: '#fff',
            }}
          >
            <Button
              color="primary"
              onClick={toggleCteModal}
              size="sm"
            >
              Gerar Cobrança
            </Button>
          </div>
        )}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 20,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={cellStyle}></th>
              <th style={cellStyle} onClick={() => handleSort("nf")}>
                Nota
              </th>
              <th style={cellStyle} onClick={() => handleSort("cliente")}>
                Cliente
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("horario_ocorrencia")}
              >
                Hora da Ocorrência
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("horario_chegada")}
              >
                Hora da Chegada
              </th>
              <th style={cellStyle} onClick={() => handleSort("horario_saida")}>
                Hora de Saída
              </th>
              <th
                style={cellStyle}
                onClick={() => handleSort("tempoPermanencia")}
              >
                Permanência Após Ocorrências
              </th>
              <th style={cellStyle}>TDE</th>

              <th style={cellStyle} onClick={() => handleSort("hr_permanencia")}>
  Tempo Acordado
</th>
<th style={cellStyle} onClick={() => handleSort("excedente")}>
  Excedente
</th>
<th style={cellStyle} onClick={() => handleSort("valorCobrado")}>
  Valor a Cobrar
</th>


              <th style={cellStyle} onClick={() => handleSort("motorista")}>
                Motorista
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData
.filter((item) => {
  const clienteInfo = getClienteInfo(item.cliente_id);
  const permanencia = calcularTempoPermanencia(
    item.horario_chegada,
    item.horario_saida,
    item.horario_ocorrencia
  );
  const cobranca = calcularValorCobranca(clienteInfo, permanencia);
  return !cobranca.dentroDoPrazo && cobranca.excedente > 0;
})

              .map((item, index) => {
                const permanencia = calcularTempoPermanencia(
                  item.horario_chegada,
                  item.horario_saida,
                  item.horario_ocorrencia
                );
                const clienteInfo = getClienteInfo(item.cliente_id);
                const cobranca = calcularValorCobranca(clienteInfo, permanencia);

                const isIndisponivel = permanencia.formatado === "Indisponível";
                const isAtrasado = !cobranca.dentroDoPrazo && cobranca.excedente > 0;

                return (
                  <tr
                    key={index}
                    style={
                      isAtrasado && !isIndisponivel
                        ? {
                          background: "#f8d7da",
                          color: "#721c24",
                          border: "1px solid #721c24",
                        }
                        : {}
                    }
                  >
                    <td style={cellStyle}>
                      <input
                        type="checkbox"
                        checked={item.nf === selectedNota}
                        onChange={() => handleCheckboxChange(item.nf)}
                      />
                    </td>
                    <td style={cellStyle}>{item.nf}</td>
                    <td style={cellStyle}>{item.cliente}</td>
                    <td style={cellStyle}>{formatarDataHora(item.horario_ocorrencia)}</td>
                    <td style={cellStyle}>{formatarDataHora(item.horario_chegada)}</td>
                    <td style={cellStyle}>{formatarDataHora(item.horario_saida)}</td>
                    <td style={cellStyle}>{permanencia.formatado}</td>
                    <td style={cellStyle}>
                      {clienteInfo?.tde?.toUpperCase() === "SIM" ? (
                        <FaCheckCircle color="green" title="Aceita TDE" />
                      ) : (
                        <FaTimesCircle color="red" title="Não aceita TDE" />
                      )}
                    </td>

                    <td>{formatarHrPerm(clienteInfo?.hr_permanencia)}</td>
                    <td style={cellStyle}>
                      {isIndisponivel ? "N/A" : `${cobranca.excedente.toFixed(2)}h`}
                    </td>
                    <td style={cellStyle}>
                      {isIndisponivel ? "N/A" : `R$ ${cobranca.valorCobrado.toFixed(2)}`}
                    </td>
                    <td style={cellStyle}>{item.motorista}</td>
                  </tr>
                );
              })}
          </tbody>


        </table>
        <Button color="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>

      {/* Modal para gerar CTE */}
      <Modal
        isOpen={isCteModalOpen}
        toggle={toggleCteModal}
        backdrop="static"
        centered
      >
        <ModalHeader toggle={toggleCteModal}>Gerar Cobrança</ModalHeader>
        <ModalBody>
          <p>Informe o número do CTE para a nota selecionada:</p>
          <Input
            type="text"
            value={cteValue}
            onChange={handleChange}
            placeholder="Número do CTE ou selecione"
            list="cte-options"
            invalid={!isValid}
          />
          <datalist id="cte-options">
            <option value="ACORDO COMERCIAL VIGENTE" />
            <option value="CARGA LOTAÇÃO NO DESTINATARIO" />
            <option value="CLIENTE NÃO AUTORIZOU PERMANÊNCIA" />
          </datalist>

        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveCte}>
            Salvar
          </Button>
          <Button color="secondary" onClick={toggleCteModal}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Função para formatar data e hora no formato "dd/MM/yyyy hh:mm"
const formatarDataHora = (dataHora) => {
  if (!dataHora) return "Indisponível";
  const data = new Date(dataHora);
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
  cursor: "pointer",
};

export default ModalNaoCobranca;
