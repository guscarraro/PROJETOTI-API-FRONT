import React from "react";
import {
  FaClipboardCheck,
  FaEye,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { Box, ProgressBar, NoteList, NoteItem } from "../../styles";
import EtapaNota from "./EtapaNota";

const iconMap = {
  inThreeDays: <FaClipboardCheck size={30} color="#20B2AA" />,
  inTwoDays: <FaClipboardCheck size={30} color="#FFA500" />,
  tomorrow: <FaClipboardCheck size={30} color="#00FF7F" />,
  today: <FaEye size={30} color="#FFD700" />,
  overdue: <FaExclamationTriangle size={30} color="#FF4500" />,
};

const titleMap = {
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
}) => {
  const getTotalNotesRenderizadas = () => {
    let total = 0;
    const statusKeys = [
      "inThreeDays",
      "inTwoDays",
      "tomorrow",
      "today",
      "overdue",
    ];

    statusKeys.forEach((key) => {
      if (filteredDataByStatus[key]) {
        for (let i = 0; i < filteredDataByStatus[key].length; i++) {
          total += filteredDataByStatus[key][i].count || 0;
        }
      }
    });

    return total;
  };

  return (
    <Box bgColor={bgColor} isPulsing={status === "overdue"} >
      {/* ... */}

      {iconMap[status]}
      <h5>{titleMap[status]}</h5>

      <p className="lead">{calculateTotalNotesByStatus(data)}</p>
      {data.length > 0 && (
        <p style={{ marginBottom: "4px", fontSize: "14px", fontWeight: 500 }}>
          {Math.round(
            (calculateTotalNotesByStatus(data) / getTotalNotesRenderizadas()) *
              100
          )}
          %
        </p>
      )}
      <ProgressBar
        progress={
          data.length > 0
            ? (calculateTotalNotesByStatus(data) /
                getTotalNotesRenderizadas()) *
              100
            : 0
        }
      />

      {/* resto do conteúdo do card... */}

      <NoteList>
        {data.map((item, idx) => (
          <NoteItem key={idx} isOpen={dropdownOpen[item.remetente]}>
            <div
              onClick={() => toggleDropdown(item.remetente)}
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
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
                {item.count} {item.count === 1 ? "nota" : "notas"}
                {dropdownOpen[item.remetente] ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </span>
            </div>

            {dropdownOpen[item.remetente] && (
              <ul style={{ paddingLeft: "15px" }}>
                {item.notas.map((nf, noteIdx) => {
                  const notaInfo = filteredData.find(
                    (d) =>
                      d.NF?.split(",")
                        .map((n) => n.trim())
                        .includes(nf) && d.remetente === item.remetente
                  );

                  const isAgendada =
                    notaInfo?.destinatario?.includes("(AGENDADO)");
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
                        maxWidth: "100%", // ocupa bem o espaço horizontal
                      }}
                    >
                      NF: {nf} - ({notaInfo?.praca_destino}) {notaInfo?.destino}
                      {isAgendada && (
                        <strong style={{ marginLeft: 6 }}>A</strong>
                      )}
                      {/* <EtapaNota /> */}
                    </li>
                  );
                })}
              </ul>
            )}
          </NoteItem>
        ))}
      </NoteList>
    </Box>
  );
};

export default Card;
