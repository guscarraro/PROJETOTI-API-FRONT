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
  "HYPOFARMA",
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
  semPrevisao: "Sem Previsão de Entrega",
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
  loadingOcorrencias,
  totalNotasDashboard
}) => {
  // Agrupa visualmente igual à renderização
  const agrupado = [];

  if (status === "semPrevisao") {
    for (const item of filteredData) {
      const remetente = item.remetente || "DESCONHECIDO";
      const deveIncluir =
        item.cte_entregue === 0 &&
        (!item.previsao_entrega || item.previsao_entrega.trim() === "") &&
        !tomadoresIgnorados.some((t) =>
          remetente.toUpperCase().includes(t)
        );

      if (!deveIncluir || !item.NF) continue;

      const nfs = String(item.NF).split(",").map((nf) => nf.trim());
      const existente = agrupado.find((g) => g.remetente === remetente);

      if (existente) {
        existente.notas = Array.from(new Set([...existente.notas, ...nfs]));

        existente.itens.push(item);
      } else {
        agrupado.push({
          remetente,
          notas: [...nfs],
          itens: [item],
        });
      }
    }
    agrupado.sort((a, b) => b.notas.length - a.notas.length);
  } else if (status === "aguardandoAgendamento") {
    for (const o of ocorrenciasPorNota) {
      const tomador = o.tom || "DESCONHECIDO";
      const deveIncluir =
        o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
        !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

      if (!deveIncluir || !o.NF) continue;

      const nfs = String(o.NF).split(",").map((nf) => nf.trim());
      const existente = agrupado.find((g) => g.remetente === tomador);

      if (existente) {
        existente.notas = Array.from(new Set([...existente.notas, ...nfs]));

        existente.ocorrencias.push(o);
      } else {
        agrupado.push({
          remetente: tomador,
          notas: [...nfs],
          ocorrencias: [o],
        });
      }
    }
    agrupado.sort((a, b) => b.notas.length - a.notas.length);
  } else {
    const grupoAtual = filteredDataByStatus[status] || [];

    grupoAtual.forEach((item) => {
      const remetente = item.remetente || "Desconhecido";
      const nfs = String(item.NF).split(",").map((n) => n.trim());
      const existente = agrupado.find((g) => g.remetente === remetente);

      if (existente) {
        existente.notas = Array.from(new Set([...existente.notas, ...nfs]));

        existente.itens.push(item);
      } else {
        agrupado.push({
          remetente,
          notas: [...nfs],
          itens: [item],
        });
      }
    });
    agrupado.sort((a, b) => b.notas.length - a.notas.length);
  }

  // Calcula com base no que realmente será renderizado
 let quantidadeNotas = 0;

if (status === "semPrevisao") {
  const nfsAdicionadas = new Set();

  // 1. NFs da API de índice
  for (const item of filteredData) {
    const remetente = item.remetente || "DESCONHECIDO";
    const deveIncluir =
      item.cte_entregue === 0 &&
      (!item.previsao_entrega || item.previsao_entrega.trim() === "") &&
      !tomadoresIgnorados.some((t) =>
        remetente.toUpperCase().includes(t)
      );

    if (!deveIncluir || !item.NF) continue;

    const nfs = String(item.NF).split(",").map((nf) => nf.trim());
    nfs.forEach((nf) => nfsAdicionadas.add(nf));
  }

  // 2. NFs da API de ocorrências (prevE vazio e ainda não adicionadas)
  for (const o of ocorrenciasPorNota) {
    const remetente = o.remetente || o.tom || "DESCONHECIDO";
    const entregou = o.cte_entregue && o.cte_entregue !== 0;
    const prevE = o.prevE || "";
    const deveIncluir =
      !entregou &&
      (!prevE || prevE.trim() === "") &&
      !tomadoresIgnorados.some((t) =>
        remetente.toUpperCase().includes(t)
      );

    if (!deveIncluir || !o.NF) continue;

    const nfs = String(o.NF).split(",").map((nf) => nf.trim());

    for (const nf of nfs) {
      if (!nfsAdicionadas.has(nf)) {
        nfsAdicionadas.add(nf);
      }
    }
  }

  quantidadeNotas = nfsAdicionadas.size;
}
 else if (status === "aguardandoAgendamento") {
  const nfsUnicas = new Set();
  for (const grupo of agrupado) {
    for (const nf of grupo.notas) {
      nfsUnicas.add(nf);
    }
  }
  quantidadeNotas = nfsUnicas.size;
} else {
  let contador = 0;
  for (const grupo of agrupado) {
    for (const nf of grupo.notas) {
      const infoNota = ocorrenciasPorNota.find((o) =>
        String(o.NF).split(",").map((x) => x.trim()).includes(nf)
      );

      const devePular =
        infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
        !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

      if (!devePular) {
        contador++;
      }
    }
  }
  quantidadeNotas = contador;
}


  const totalRenderizadas = quantidadeNotas;
  const percentual = totalNotasDashboard > 0
    ? Math.round((quantidadeNotas / totalNotasDashboard) * 100)
    : 0;



  return (
    <Box bgColor={bgColor} isPulsing={status === "overdue"}>
      {iconMap[status]}
      <h5>{titleMap[status]}</h5>
      <p className="lead">{quantidadeNotas}</p>

      {quantidadeNotas > 0 && (
        <>
          <p style={{ marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
            {percentual}%
          </p>
          <ProgressBar progress={percentual} />
        </>
      )}
      <NoteList>
        {(() => {
          if (status !== "aguardandoAgendamento" && status !== "semPrevisao") {
            const agrupado = {};

            data.forEach((item) => {

              const remetente = item.remetente || "Desconhecido";
              const nfs = String(item.NF).split(",").map((n) => n.trim());
              if (!agrupado[remetente]) {
                agrupado[remetente] = { notas: [], objetos: [] };
              }
              agrupado[remetente].notas.push(...nfs);
              agrupado[remetente].objetos.push(item);
            });

            return Object.entries(agrupado)
              .map(([remetente, grupo]) => {
                const notasVisiveis = grupo.notas.filter((nf) => {
                  const infoNota = ocorrenciasPorNota.find((o) =>
                    String(o.NF).split(",").map((x) => x.trim()).includes(nf)
                  );

                  const devePular =
                    infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                    !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

                  return !devePular;
                });

                return {
                  remetente,
                  grupo,
                  notasVisiveisCount: notasVisiveis.length,
                };
              })
              .sort((a, b) => b.notasVisiveisCount - a.notasVisiveisCount)
              .map(({ remetente, grupo }, idx) => (

                <NoteItem key={idx} isOpen={dropdownOpen[remetente]}>
                  <div onClick={() => toggleDropdown(remetente)} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                    {remetente}:<br />
                    {(() => {
                      const notasVisiveis = grupo.notas.filter((nf) => {
                        const infoNota = ocorrenciasPorNota.find((o) =>
                          String(o.NF).split(",").map((x) => x.trim()).includes(nf)
                        );

                        const devePular =
                          infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                          !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

                        return !devePular;
                      });

                      return (
                        <span style={{ fontSize: "20px", fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {notasVisiveis.length} {notasVisiveis.length === 1 ? "nota" : "notas"}
                          {dropdownOpen[remetente] ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      );
                    })()}

                  </div>

                  {dropdownOpen[remetente] && (
                    <ul style={{ paddingLeft: "15px" }}>
                      {grupo.notas.map((nf, noteIdx) => {
                        const notaInfo = filteredData.find((d) =>
                          d.NF?.split(",").map((n) => n.trim()).includes(nf) &&
                          d.remetente === remetente
                        );
                        const infoNota = ocorrenciasPorNota.find((o) =>
                          String(o.NF).split(",").map((x) => x.trim()).includes(nf)
                        );

                        const devePular =
                          infoNota?.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                          !infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

                        if (devePular) return null;

                        const isAgendadaPorNome = notaInfo?.destinatario?.includes("(AGENDADO)");
                        const isAgendadaPorOcorrencia = infoNota?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");
                        const isAgendada = isAgendadaPorNome || isAgendadaPorOcorrencia;
                        const ehForaSJP = notaInfo?.praca_destino !== "SJP";

                        return (
                          <li key={noteIdx}
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
                              <div style={{ marginTop: "4px" }}>
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

          if (loadingOcorrencias && status !== "semPrevisao") {
            return (
              <li style={{ color: "#fff", padding: "8px 12px" }}>
                <LoadingDots />
              </li>
            );
          }

          const agrupado = [];

          if (status === "semPrevisao") {
            const nfsAdicionadas = new Set();

            // Notas da API de índice
            for (const item of filteredData) {
              const remetente = item.remetente || "DESCONHECIDO";
              const deveIncluir =
                item.cte_entregue === 0 &&
                (!item.previsao_entrega || item.previsao_entrega.trim() === "") &&
                !tomadoresIgnorados.some((t) =>
                  remetente.toUpperCase().includes(t)
                );

              if (!deveIncluir || !item.NF) continue;

              const nfs = String(item.NF).split(",").map((nf) => nf.trim());
              const existente = agrupado.find((g) => g.remetente === remetente);

              nfs.forEach((nf) => nfsAdicionadas.add(nf));

              if (existente) {
                existente.notas = Array.from(new Set([...existente.notas, ...nfs]));
                existente.itens.push(item);
              } else {
                agrupado.push({
                  remetente,
                  notas: [...nfs],
                  itens: [item],
                });
              }
            }

            // Notas da API de ocorrências
            for (const o of ocorrenciasPorNota) {
              const remetente = o.remetente || o.tom || "DESCONHECIDO";
              const entregou = o.cte_entregue && o.cte_entregue !== 0;
              const prevE = o.prevE || "";
              const deveIncluir =
                !entregou &&
                (!prevE || prevE.trim() === "") &&
                !tomadoresIgnorados.some((t) =>
                  remetente.toUpperCase().includes(t)
                );

              if (!deveIncluir || !o.NF) continue;

              const nfs = String(o.NF).split(",").map((nf) => nf.trim());

              // Garante que NF ainda não foi adicionada
              const nfsValidas = nfs.filter((nf) => !nfsAdicionadas.has(nf));
              if (nfsValidas.length === 0) continue;

              const existente = agrupado.find((g) => g.remetente === remetente);

              nfsValidas.forEach((nf) => nfsAdicionadas.add(nf));

              if (existente) {
                existente.notas = Array.from(new Set([...existente.notas, ...nfsValidas]));
                if (!existente.ocorrencias) existente.ocorrencias = [];
                existente.ocorrencias.push(o);
              } else {
                agrupado.push({
                  remetente,
                  notas: [...nfsValidas],
                  ocorrencias: [o],
                });
              }
            }

            agrupado.sort((a, b) => b.notas.length - a.notas.length);
          }
          else {
            for (const o of ocorrenciasPorNota) {
              const tomador = o.tom || "DESCONHECIDO";

              const deveIncluir =
                status === "aguardandoAgendamento" &&
                o.Ocorren?.some((oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE") &&
                !o.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");

              if (!deveIncluir || !o.NF) continue;

              const existente = agrupado.find((g) => g.remetente === tomador);
              if (existente) {
                existente.notas.push(String(o.NF));
                existente.ocorrencias.push(o);
              } else {
                agrupado.push({
                  remetente: tomador,
                  notas: [String(o.NF)],
                  ocorrencias: [o],
                });
              }
            }
          }

          return agrupado.map((item, idx) => (
            <NoteItem key={idx} isOpen={dropdownOpen[item.remetente]}>
              <div onClick={() => toggleDropdown(item.remetente)} style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}>
                {item.remetente}:<br />
                <span style={{ fontSize: "20px", fontWeight: 500, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {item.notas.length} {item.notas.length === 1 ? "nota" : "notas"}
                  {dropdownOpen[item.remetente] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {dropdownOpen[item.remetente] && (
                <ul style={{ paddingLeft: "15px" }}>
                  {item.notas.map((nf, noteIdx) => (
                    <li key={noteIdx}
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
                      NF: {nf}
                    </li>
                  ))}
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
