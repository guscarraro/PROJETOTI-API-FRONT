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

function parseNFs(nfStr) {
  if (!nfStr) return [];
  return String(nfStr)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

// NOVO: helper único para checar tomadores ignorados
function isIgnorado(nome) {
  if (!nome) return false;
  const up = String(nome).toUpperCase();
  return tomadoresIgnorados.some((t) => up.includes(t));
}

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
  totalNotasDashboard,   // fallback para compatibilidade
  totalCtesDashboard,    // total geral de CTEs (opcional)
}) => {
  // ===== Helpers baseados em ocorrências =====
  const findOcorrenciaByNF = (nf) =>
    ocorrenciasPorNota?.find((o) =>
      parseNFs(o?.NF).includes(String(nf).trim())
    );

  const getCteByNF = (nf, itemIndice = null) => {
    const o = findOcorrenciaByNF(nf);
    if (o?.cte) return String(o.cte).trim();
    // fallback para índice
    const cteIndice =
      itemIndice?.CTE || itemIndice?.cte || itemIndice?.cte_num || null;
    return cteIndice ? String(cteIndice).trim() : null;
  };

  const isNotaAguardandoAgendamento = (nf) => {
    const info = findOcorrenciaByNF(nf);
    const aguardando =
      info?.Ocorren?.some(
        (oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE"
      ) && !info?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");
    return Boolean(aguardando);
  };

  // ===== Construção de grupos por CTE para cada status =====
  // Estrutura: cteGroups: { [cte]: { cte, nfs:Set, remetentes:Set, itens:[], ocorrencias:[] } }
  const cteGroups = {};

  const addToGroup = (cteKey, { nfs = [], remetente = null, item = null, ocorr = null }) => {
    if (!cteKey) return;
    if (!cteGroups[cteKey]) {
      cteGroups[cteKey] = {
        cte: cteKey,
        nfs: new Set(),
        remetentes: new Set(),
        itens: [],
        ocorrencias: [],
      };
    }
    nfs.forEach((n) => cteGroups[cteKey].nfs.add(n));
    if (remetente) cteGroups[cteKey].remetentes.add(remetente);
    if (item) cteGroups[cteKey].itens.push(item);
    if (ocorr) cteGroups[cteKey].ocorrencias.push(ocorr);
  };

  if (status === "semPrevisao") {
    // 1) Índice (sem previsão + não entregue + NÃO ignorado)
    for (const item of filteredData || []) {
      const remetente = item?.remetente || "DESCONHECIDO";
      const deveIncluir =
        item?.cte_entregue === 0 &&
        (!item?.previsao_entrega || item?.previsao_entrega.trim() === "") &&
        !isIgnorado(remetente);

      if (!deveIncluir || !item?.NF) continue;

      const nfs = parseNFs(item.NF);
      for (const nf of nfs) {
        const cte = getCteByNF(nf, item);
        addToGroup(cte || `SEM_CTE_${remetente}`, {
          nfs: [nf],
          remetente,
          item,
        });
      }
    }

    // 2) Ocorrências (sem prevE + não entregue + NÃO ignorado)
    for (const o of ocorrenciasPorNota || []) {
      const remetente = o?.remetente || o?.tom || "DESCONHECIDO";
      if (isIgnorado(remetente)) continue;

      const entregou = o?.cte_entregue && o?.cte_entregue !== 0;
      const prevE = o?.prevE || "";
      const deveIncluir = !entregou && (!prevE || prevE.trim() === "");

      if (!deveIncluir || !o?.NF) continue;

      const nfs = parseNFs(o.NF);
      const cte = o?.cte ? String(o.cte).trim() : null;

      if (cte) {
        addToGroup(cte, { nfs, remetente, ocorr: o });
      } else {
        // fallback por NF -> cte (caso exista por outra fonte)
        for (const nf of nfs) {
          const cteNF = getCteByNF(nf);
          addToGroup(cteNF || `SEM_CTE_${remetente}`, {
            nfs: [nf],
            remetente,
            ocorr: o,
          });
        }
      }
    }
  } else if (status === "aguardandoAgendamento") {
    // Ocorrências com aguardando agendamento (NÃO ignorado) e sem "ENTREGA AGENDADA"
    for (const o of ocorrenciasPorNota || []) {
      const tomador = o?.tom || o?.remetente || "DESCONHECIDO";
      if (isIgnorado(tomador)) continue;

      const temAA =
        o?.Ocorren?.some(
          (oc) => oc.tipo === "AGUARDANDO AGENDAMENTO DO CLIENTE"
        ) && !o?.Ocorren?.some((oc) => oc.tipo === "ENTREGA AGENDADA");
      if (!temAA || !o?.NF) continue;

      const nfs = parseNFs(o.NF);
      const cte = o?.cte ? String(o.cte).trim() : null;

      if (cte) {
        addToGroup(cte, { nfs, remetente: tomador, ocorr: o });
      } else {
        // fallback por NF
        for (const nf of nfs) {
          const cteNF = getCteByNF(nf);
          addToGroup(cteNF || `SEM_CTE_${tomador}`, {
            nfs: [nf],
            remetente: tomador,
            ocorr: o,
          });
        }
      }
    }
  } else {
    // Outros status (today/tomorrow/inTwoDays/inThreeDays/overdue)
    const grupoAtual = filteredDataByStatus?.[status] || [];
    for (const item of grupoAtual) {
      const remetente = item?.remetente || "Desconhecido";
      if (isIgnorado(remetente)) continue;

      const nfs = parseNFs(item.NF);
      for (const nf of nfs) {
        const cte = getCteByNF(nf, item);
        addToGroup(cte || `SEM_CTE_${remetente}`, {
          nfs: [nf],
          remetente,
          item,
        });
      }
    }
  }

  // ===== Filtragem de NFs visíveis por grupo (mantém exclusões) =====
  let groupsSorted = Object.values(cteGroups)
    .map((g) => {
      const nfsVisiveis =
        status === "aguardandoAgendamento" || status === "semPrevisao"
          ? Array.from(g.nfs)
          : Array.from(g.nfs).filter((nf) => !isNotaAguardandoAgendamento(nf));
      return { ...g, nfsVisiveis };
    })
    .filter((g) => g.nfsVisiveis.length > 0);

  // NOVO: salvaguarda extra — se todas as fontes de remetente do grupo forem ignoradas, remove o grupo
  groupsSorted = groupsSorted.filter((g) => {
    const rems = Array.from(g.remetentes || []);
    if (rems.length === 0) return true; // sem remetente associado -> não filtra
    return rems.some((r) => !isIgnorado(r)); // mantém se houver pelo menos 1 NÃO ignorado
  });

  // Ordena por qtd de NFs visíveis (visual)
  groupsSorted.sort((a, b) => b.nfsVisiveis.length - a.nfsVisiveis.length);

  // ===== Total do card por CTE =====
  const quantidadeCtes = groupsSorted.length;

  const baseTotalCtes =
    typeof totalCtesDashboard === "number"
      ? totalCtesDashboard
      : (typeof totalNotasDashboard === "number" ? totalNotasDashboard : 0); // fallback

  const percentual =
    baseTotalCtes > 0 ? Math.round((quantidadeCtes / baseTotalCtes) * 100) : 0;

  // ===== Render =====
  return (
    <Box bgColor={bgColor} isPulsing={status === "overdue"}>
      {iconMap[status]}
      <h5>{titleMap[status]}</h5>

      {/* TOTAL DO CARD = TOTAL DE CTES */}
      <p className="lead">{quantidadeCtes}</p>

      {quantidadeCtes > 0 && (
        <>
          <p style={{ marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
            {percentual}%
          </p>
          <ProgressBar progress={percentual} />
        </>
      )}

      <NoteList>
        {loadingOcorrencias && status !== "semPrevisao" && groupsSorted.length === 0 ? (
          <li style={{ color: "#fff", padding: "8px 12px" }}>
            <LoadingDots />
          </li>
        ) : null}

        {groupsSorted.map((group) => {
          const cteKey = group.cte;
          const isOpen = dropdownOpen[cteKey];
          const remetentes = Array.from(group.remetentes);

          // Representante p/ EtapaNota
          let repInfo =
            (ocorrenciasPorNota || []).find(
              (o) => String(o?.cte || "").trim() === String(cteKey).trim()
            ) || null;

          if (!repInfo) {
            for (const nf of group.nfsVisiveis) {
              const o = findOcorrenciaByNF(nf);
              if (o) {
                repInfo = o;
                break;
              }
            }
          }

          // Mesclar ocorrências do mesmo CTE
          let mergedOcorrencias = [];
          if (repInfo) {
            const sameCte = (ocorrenciasPorNota || []).filter(
              (o) => String(o?.cte || "").trim() === String(cteKey).trim()
            );
            if (sameCte.length > 0) {
              sameCte.forEach((o) => {
                if (Array.isArray(o?.Ocorren)) {
                  mergedOcorrencias = mergedOcorrencias.concat(o.Ocorren);
                }
              });
            } else if (Array.isArray(repInfo?.Ocorren)) {
              mergedOcorrencias = repInfo.Ocorren;
            }
          }

          return (
            <NoteItem key={cteKey} isOpen={isOpen}>
              <div
                onClick={() => toggleDropdown(cteKey)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div>
                  <strong>CTE:</strong>{" "}
                  {String(cteKey).replace(/^SEM_CTE_/, "Não informado - ")}
                </div>
                {remetentes.length > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    {remetentes.join(" • ")}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {group.nfsVisiveis.length}{" "}
                  {group.nfsVisiveis.length === 1 ? "nota" : "notas"}
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>

              {isOpen && (
                <div style={{ paddingLeft: 12, marginTop: 8 }}>
                  {/* Etapas por CTE */}
                  <div
                    style={{
                      background: "#1b1b1b",
                      borderRadius: 8,
                      padding: "8px 10px",
                      marginBottom: 8,
                    }}
                  >
                    {!repInfo ? (
                      <div style={{ marginTop: "4px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            fontStyle: "italic",
                            color: "#fff",
                          }}
                        >
                          CTE muito antigo ou sem dados de etapas
                        </p>
                      </div>
                    ) : !mergedOcorrencias || mergedOcorrencias.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <p style={{ color: "#fff" }}>Carregando</p>
                        <LoadingDots />
                      </div>
                    ) : (
                      <EtapaNota
                        tipoViagem={repInfo?.TpVg || "ETPF"}
                        ocorrencias={mergedOcorrencias}
                        cte={repInfo?.cte || null}
                        dtCTE={repInfo?.dtCTE || null}
                        Vg={repInfo?.Vg || null}
                        TpVg={repInfo?.TpVg || null}
                        prevE={repInfo?.prevE || null}
                      />
                    )}
                  </div>

                  {/* Lista de NFs do CTE */}
                  <ul style={{ paddingLeft: "15px", margin: 0 }}>
                    {group.nfsVisiveis.map((nf) => {
                      const notaInfo =
                        (filteredData || []).find((d) =>
                          parseNFs(d?.NF).includes(nf)
                        ) || null;
                      const infoNota = findOcorrenciaByNF(nf);

                      const isAgendadaPorNome =
                        notaInfo?.destinatario?.includes("(AGENDADO)");
                      const isAgendadaPorOcorrencia = infoNota?.Ocorren?.some(
                        (oc) => oc.tipo === "ENTREGA AGENDADA"
                      );
                      const isAgendada =
                        isAgendadaPorNome || isAgendadaPorOcorrencia;
                      const ehForaSJP = notaInfo?.praca_destino !== "SJP";

                      const background =
                        isAgendada && ehForaSJP
                          ? "linear-gradient(90deg, #cb8300, #cb8300, #007BFF ,#007BFF, #007BFF )"
                          : isAgendada
                          ? "#007BFF"
                          : ehForaSJP
                          ? "#cb8300"
                          : "transparent";

                      return (
                        <li
                          key={nf}
                          style={{
                            background,
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
                          {notaInfo?.praca_destino
                            ? ` - (${notaInfo?.praca_destino}) ${
                                notaInfo?.destino || ""
                              }`
                            : ""}
                          {isAgendada && (
                            <strong style={{ marginLeft: 6 }}>A</strong>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </NoteItem>
          );
        })}
      </NoteList>
    </Box>
  );
};

export default Card;
