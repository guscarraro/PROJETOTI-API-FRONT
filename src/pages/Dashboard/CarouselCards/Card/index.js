import React from "react";
import {
  FaClipboardCheck,
  FaEye,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaCalendarTimes,
  FaQuestionCircle,
} from "react-icons/fa";
import { Box, ProgressBar, NoteList, NoteItem } from "../../styles";
import EtapaNota from "./EtapaNota";
import LoadingDots from "../../../../components/Loading";

const tomadoresIgnorados = [
  "SC DISTRIBUICAO LTDA",
  "FAST SHOP",
  "RAIADROGASIL",
  "HEINZ",
  "HYPOFARMA"
];


const iconMap = {
  aguardandoAgendamento: <FaCalendarTimes size={30} color="#A9A9A9" />,
  semPrevisao: <FaQuestionCircle size={30} color="#696969" />,
  inThreeDays: <FaClipboardCheck size={30} color="#20B2AA" />,
  inTwoDays: <FaClipboardCheck size={30} color="#FFA500" />,
  tomorrow: <FaClipboardCheck size={30} color="#00FF7F" />,
  today: <FaEye size={30} color="#FFD700" />,
  overdue: <FaExclamationTriangle size={30} color="#FF4500" />,
};

const titleMap = {
  aguardandoAgendamento: "Aguardando Agendamento(15 d)",
  semPrevisao: "Sem Previsão de Entrega (15 d)",
  inThreeDays: "Entregas em 3 Dias",
  inTwoDays: "Entregas em 2 Dias",
  tomorrow: "Entregas em 1 Dia",
  today: "Entregas Hoje",
  overdue: "Atrasadas",
};

const Card = ({
  status,
  bgColor,
  data,
  calculateTotalNotesByStatus,
  dropdownOpen,
  toggleDropdown,
  filteredDataByStatus,
  filteredData,
  ocorrenciasPorNota,
  loadingOcorrencias
}) => {

  const getTotalNotesRenderizadas = () => {
    let total = 0;

    // Adiciona as notas dos cards baseados em ocorrências
    const aguardandoAgendamento = ocorrenciasPorNota.filter(
      (o) =>
        o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
        !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA")
    ).length;

    const semPrevisao = ocorrenciasPorNota.filter(
      (o) =>
        o.prevE === "" &&
        !tomadoresIgnorados.some((t) => o.tom?.toUpperCase()?.includes(t))
    ).length;

    total += aguardandoAgendamento + semPrevisao;

    // Adiciona as notas dos outros status
    const statusKeys = ["inThreeDays", "inTwoDays", "tomorrow", "today", "overdue"];
    statusKeys.forEach((key) => {
      if (filteredDataByStatus[key]) {
        total += calculateTotalNotesByStatus(filteredDataByStatus[key], key);
      }
    });

    return total;
  };

  const quantidadeNotas = status === "aguardandoAgendamento"
    ? ocorrenciasPorNota.filter(
      (o) =>
        o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
        !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA")
    ).length
    : status === "semPrevisao"
      ? ocorrenciasPorNota.filter(
        (o) =>
          o.prevE === "" &&
          !tomadoresIgnorados.some((t) => o.tom?.toUpperCase()?.includes(t))
      ).length
      : calculateTotalNotesByStatus(data, status);


  return (
    <Box bgColor={bgColor} isPulsing={status === "overdue"}>
      {iconMap[status]}
      <h5>{titleMap[status]}</h5>

      <p className="lead">
        {status === "aguardandoAgendamento"
          ? ocorrenciasPorNota.filter(
            (o) =>
              o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
              !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA")
          ).length
          : status === "semPrevisao"
            ? ocorrenciasPorNota.filter(
              (o) =>
                o.prevE === "" &&
                !tomadoresIgnorados.some((t) => o.tom?.toUpperCase()?.includes(t))
            ).length
            : calculateTotalNotesByStatus(data)}
      </p>

      {quantidadeNotas > 0 && (
        <p style={{ marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
          {Math.round((quantidadeNotas / getTotalNotesRenderizadas()) * 100)}%
        </p>
      )}

      {quantidadeNotas > 0 && (
        <ProgressBar
          progress={(quantidadeNotas / getTotalNotesRenderizadas()) * 100}
        />
      )}


      <NoteList>
        {(() => {
          if (status !== "aguardandoAgendamento" && status !== "semPrevisao") {
            return data.map((item, idx) => (
              <NoteItem key={idx} isOpen={dropdownOpen[item.remetente]}>
                <div onClick={() => toggleDropdown(item.remetente)} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                  {item.remetente}:<br />
                  <span style={{ fontSize: "20px", fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {item.count} {item.count === 1 ? "nota" : "notas"}
                    {dropdownOpen[item.remetente] ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>

                {dropdownOpen[item.remetente] && (
                  <ul style={{ paddingLeft: "15px" }}>
                    {item.notas.map((nf, noteIdx) => {
                      const notaInfo = filteredData.find(
                        (d) =>
                          d.NF?.split(",").map((n) => n.trim()).includes(nf) &&
                          d.remetente === item.remetente
                      );
                      const infoNota = ocorrenciasPorNota.find((o) => String(o.NF) === nf);

                      const devePular =
                        infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                        !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

                      if (devePular) return null;


                      const isAgendadaPorNome = notaInfo?.destinatario?.includes("(AGENDADO)");
                      const isAgendadaPorOcorrencia = infoNota?.Ocorren?.some(
                        (oc) => oc.tipo === "ENTREGA AGENDADA"
                      );
                      const isAgendada = isAgendadaPorNome || isAgendadaPorOcorrencia;

                      const ehForaSJP = notaInfo?.praca_destino !== "SJP";

                      return (
                        <li
                          key={noteIdx}
                          style={{
                            background:
                              isAgendada && ehForaSJP
                                ? "linear-gradient(90deg, #cb8300, #cb8300, #007BFF ,#007BFF, #007BFF )"
                                : isAgendada
                                  ? "#007BFF"
                                  : ehForaSJP
                                    ? "#cb8300"
                                    : "transparent",
                            color: "#fff",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            marginBottom: "6px",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                            listStyle: "none",
                            maxWidth: "100%",
                          }}
                        >
                          NF: {nf} - ({notaInfo?.praca_destino}) {notaInfo?.destino}
                          {isAgendada && <strong style={{ marginLeft: 6 }}>A</strong>}

                          {!infoNota ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: "4px" }}>
                              <p style={{ margin: 0, fontSize: "13px", fontStyle: "italic" }}>
                                nota muito antiga para consulta de etapas
                              </p>
                            </div>
                          ) : !infoNota?.Ocorren ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <p>Carregando</p>
                              <LoadingDots />
                            </div>
                          ) : (
                            <EtapaNota
                              tipoViagem={infoNota?.TpVg || "ETPF"}
                              ocorrencias={infoNota?.Ocorren}
                              cte={infoNota?.cte || null}
                              dtCTE={infoNota?.dtCTE || null}
                              Vg={infoNota?.Vg || null}
                              TpVg={infoNota?.TpVg || null}
                              prevE={infoNota?.prevE || null}
                            />
                          )}
                        </li>

                      );
                    })}
                  </ul>
                )}
              </NoteItem>
            ));
          }

          // Se está carregando
          if (loadingOcorrencias) {
            return (
              <li style={{ color: "#fff", padding: "8px 12px" }}>
                <LoadingDots />
              </li>
            );
          }

          // Agrupamento por tomador
          const agrupado = [];
          ocorrenciasPorNota.forEach((o) => {
            const tomador = o.tom || "DESCONHECIDO";
            const existe = agrupado.find((g) => g.remetente === tomador);

            const deveIncluir =
              status === "aguardandoAgendamento"
                ? o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA")
                : o.prevE === "" &&
                !tomadoresIgnorados.some((t) => o.tom?.toUpperCase()?.includes(t));

            if (!deveIncluir) return;

            if (existe) {
              existe.notas.push(String(o.NF));
              existe.ocorrencias.push(o);
            } else {
              agrupado.push({
                remetente: tomador,
                notas: [String(o.NF)],
                ocorrencias: [o],
              });
            }
          });

          return agrupado.map((item, idx) => (
            <NoteItem key={idx} isOpen={dropdownOpen[item.remetente]}>
              <div
                onClick={() => toggleDropdown(item.remetente)}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
              >
                {item.remetente}:<br />
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {item.notas.length} {item.notas.length === 1 ? "nota" : "notas"}
                  {dropdownOpen[item.remetente] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              {dropdownOpen[item.remetente] && (
                <ul style={{ paddingLeft: "15px" }}>
                  {item.notas.map((nf, noteIdx) => {
                    const infoNota = item.ocorrencias.find((o) => String(o.NF) === nf);

                    return (
                      <li
                        key={noteIdx}
                        style={{
                          color: "#fff",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          marginBottom: "6px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: 1.4,
                          listStyle: "none",
                          maxWidth: "100%",
                        }}
                      >
                        NF: {nf} - {infoNota?.prevE || "sem previsão"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </NoteItem>
          ));
        })()}
      </NoteList>

    </Box>
  );

};

export default Card;
