import React, { useMemo } from "react";
import { Button } from "reactstrap";
import * as XLSX from "xlsx";
import Bloco from "./Bloco";
import PieResumoCte from "./PieResumoCte";
import { backdropStyle, modalStyle, headerStyle, gridStyle } from "./styles";
import { formatarDataHora, ehNumeroCobranca } from "./utils";

const ModalCteCobrado = ({ data, onClose }) => {
  const { acordoComercial, cargaLotacao, clienteNaoAutorizou, numeroCobranca } =
    useMemo(() => {
      const buckets = {
        acordoComercial: [],
        cargaLotacao: [],
        clienteNaoAutorizou: [],
        numeroCobranca: [],
      };

      (data ?? []).forEach((item) => {
        const v = (item?.cte ?? "").toString().trim();
        if (v === "ACORDO COMERCIAL VIGENTE")
          buckets.acordoComercial.push(item);
        else if (v === "CARGA LOTAÇÃO NO DESTINATARIO")
          buckets.cargaLotacao.push(item);
        else if (v === "CLIENTE NÃO AUTORIZOU PERMANÊNCIA")
          buckets.clienteNaoAutorizou.push(item);
        else if (ehNumeroCobranca(v)) buckets.numeroCobranca.push(item);
      });

      return buckets;
    }, [data]);

  // 🔹 Série por cliente (usada no gráfico de cada bloco)
  const seriePorCliente = (arr) => {
    const map = new Map();
    arr.forEach((i) => {
      const k = i?.cliente ?? "Indefinido";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map, ([name, quantidade]) => ({ name, quantidade }));
  };

  // 🔹 Dados do gráfico de pizza geral (4 fatias)
  const pizzaResumo = useMemo(
    () => [
      { name: "ACORDO COMERCIAL VIGENTE", value: acordoComercial.length },
      { name: "CARGA LOTAÇÃO NO DESTINATARIO", value: cargaLotacao.length },
      {
        name: "CLIENTE NÃO AUTORIZOU PERMANÊNCIA",
        value: clienteNaoAutorizou.length,
      },
      { name: "NÚMERO DA COBRANÇA", value: numeroCobranca.length },
    ],
    [acordoComercial, cargaLotacao, clienteNaoAutorizou, numeroCobranca]
  );
  
  // 🧾 Exportação em 1 única aba com coluna "Status CTE"
 
  const exportarParaExcel = () => {
    const wb = XLSX.utils.book_new();

    const montarLinhas = (arr, statusNome) =>
      arr.map((item) => ({
        "Status CTE": statusNome,
        "Nota Fiscal": item.nf,
        Cliente: item.cliente,
        Destinatário: item.destinatario ?? item.destino ?? "",
        "CTE / Justificativa / Nº Cobrança": item.cte,
        "Hora da Ocorrência": formatarDataHora(item.horario_ocorrencia),
        "Hora de Encerramento": formatarDataHora(item.horario_saida),
        "Hora de Permanência": (() => { const o = new Date(item.horario_ocorrencia), s = new Date(item.horario_saida); const d = s - o; if (isNaN(d) || d < 0) return "Indisponível"; const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000); return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; })(),

        Motorista: item.motorista,
      }));

    const todas = [
      ...montarLinhas(acordoComercial, "ACORDO COMERCIAL VIGENTE"),
      ...montarLinhas(cargaLotacao, "CARGA LOTAÇÃO NO DESTINATARIO"),
      ...montarLinhas(clienteNaoAutorizou, "CLIENTE NÃO AUTORIZOU PERMANÊNCIA"),
      ...montarLinhas(numeroCobranca, "NÚMERO DA COBRANÇA"),
    ];

    const ws = XLSX.utils.json_to_sheet(todas);
    XLSX.utils.book_append_sheet(wb, ws, "CTEs Cobrados (Geral)");
    XLSX.writeFile(wb, "CTEs_Cobrados_Geral.xlsx");
  };
  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h4 style={{ margin: 0 }}>CTEs Cobrados</h4>
          <div style={{ display: "flex", gap: 8 }}>
            <Button color="success" onClick={exportarParaExcel} size="sm">
              Exportar Excel (geral)
            </Button>
            <Button color="secondary" onClick={onClose} size="sm">
              Fechar
            </Button>
          </div>
        </div>

        {/* Gráfico de pizza geral */}
        <div style={{ marginBottom: 16 }}>
          <PieResumoCte data={pizzaResumo} />
        </div>

        {/* Grid 2x2 */}
        <div style={gridStyle}>
          <Bloco
            titulo="ACORDO COMERCIAL VIGENTE"
            data={acordoComercial}
            serie={seriePorCliente(acordoComercial)}
          />
          <Bloco
            titulo="CARGA LOTAÇÃO NO DESTINATARIO"
            data={cargaLotacao}
            serie={seriePorCliente(cargaLotacao)}
          />
          <Bloco
            titulo="CLIENTE NÃO AUTORIZOU PERMANÊNCIA"
            data={clienteNaoAutorizou}
            serie={seriePorCliente(clienteNaoAutorizou)}
          />
          <Bloco
            titulo="NÚMERO DA COBRANÇA"
            data={numeroCobranca}
            serie={seriePorCliente(numeroCobranca)}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalCteCobrado;
