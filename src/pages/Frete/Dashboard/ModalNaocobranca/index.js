import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from "reactstrap";
import ChartClientesAtrasos from "./ChartClientesAtrasos";
import apiLocal from "../../../../services/apiLocal";
import { toast } from "react-toastify";

const ModalNaoCobranca = ({ data, onClose, onRefresh }) => {
  const [selectedNota, setSelectedNota] = useState(null);
  const [isCteModalOpen, setIsCteModalOpen] = useState(false);
  const [cteValue, setCteValue] = useState("");

  const toggleCteModal = () => setIsCteModalOpen(!isCteModalOpen);

  const handleCheckboxChange = (nf) => {
    setSelectedNota(nf === selectedNota ? null : nf);
  };

  const handleSaveCte = async () => {
    if (!selectedNota || !cteValue.trim()) {
      toast.error("Por favor, selecione uma nota e insira o número do CTE.");
      return;
    }

    try {
      const payload = {
        nf: selectedNota, // Número da nota fiscal
        cobranca_adicional: "S", // Marca como cobrança adicional
        cte_gerado: cteValue, // Número do CTE informado pelo usuário
      };

      const response = await apiLocal.updateCobrancaAdicional(payload);

      if (response.status === 200) {
        toast.success("Cobrança adicional registrada com sucesso!");

        // Atualiza os dados da tabela no componente pai
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
      toast.error("Erro ao registrar cobrança adicional. Verifique os dados e tente novamente.");
    }
  };

  const calcularTempoPermanencia = (chegada, saida) => {
    const chegadaDate = new Date(chegada);
    const saidaDate = new Date(saida);
    if (!chegadaDate || !saidaDate || chegadaDate > saidaDate) return "Indisponível";

    const diffMs = saidaDate - chegadaDate;
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60);
    const minutos = diffMin % 60;

    return `${horas}h ${minutos}min`;
  };

  // Contar atrasos de clientes sem o uso de reduce
  const contarClientesAtrasos = (data) => {
    const clientesMap = {};

    for (let i = 0; i < data.length; i++) {
      const cliente = data[i].cliente;
      if (clientesMap[cliente]) {
        clientesMap[cliente]++;
      } else {
        clientesMap[cliente] = 1;
      }
    }

    return Object.entries(clientesMap).map(([name, quantidade]) => ({
      name,
      quantidade,
    }));
  };

  const clientesAtrasos = contarClientesAtrasos(data);

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
        <h4>Ocorrências Sem Cobrança Adicional</h4>
        <div style={{ marginBottom: 20 }}>
          <h5>Top 7 Clientes com Mais Atrasos</h5>
          <ChartClientesAtrasos data={clientesAtrasos.slice(0, 7)} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={cellStyle}></th>
              <th style={cellStyle}>Nota</th>
              <th style={cellStyle}>Cliente</th>
              <th style={cellStyle}>Hora de Chegada</th>
              <th style={cellStyle}>Hora de Saída</th>
              <th style={cellStyle}>Tempo de Permanência</th>
              <th style={cellStyle}>Motorista</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <input
                    type="checkbox"
                    checked={item.nf === selectedNota}
                    onChange={() => handleCheckboxChange(item.nf)}
                  />
                </td>
                <td style={cellStyle}>{item.nf}</td>
                <td style={cellStyle}>{item.cliente}</td>
                <td style={cellStyle}>
                  {new Date(item.horario_chegada).toLocaleTimeString()}
                </td>
                <td style={cellStyle}>
                  {new Date(item.horario_saida).toLocaleTimeString()}
                </td>
                <td style={cellStyle}>
                  {calcularTempoPermanencia(item.horario_chegada, item.horario_saida)}
                </td>
                <td style={cellStyle}>{item.motorista}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button color="secondary" onClick={onClose}>
          Fechar
        </Button>
        {selectedNota && (
          <Button color="primary" onClick={toggleCteModal} style={{marginLeft:10}}>
            Gerar Cobrança
          </Button>
        )}
      </div>

      {/* Modal para inserir o número do CTE */}
      <Modal isOpen={isCteModalOpen} toggle={toggleCteModal} backdrop="static" centered>
        <ModalHeader toggle={toggleCteModal}>Gerar Cobrança</ModalHeader>
        <ModalBody>
          <p>Informe o número do CTE para a nota selecionada:</p>
          <Input
            type="number"
            value={cteValue}
            onChange={(e) => setCteValue(e.target.value)}
            placeholder="Número do CTE"
          />
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

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

export default ModalNaoCobranca;
