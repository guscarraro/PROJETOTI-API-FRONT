import React, { useState } from "react";
import { Box, ProgressBar, NoteList, NoteItem } from "../styles";
import { FaClipboardCheck, FaEye, FaExclamationTriangle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdHeight } from "react-icons/md";

const DeliveryStatusBox = ({ status, title, progress, count, groupedData = [] }) => {
  const [dropdownOpen, setDropdownOpen] = useState({});

  const icons = {
    inTwoDays: <FaClipboardCheck size={30} color="#FFA500" />,
    tomorrow: <FaClipboardCheck size={30} color="#00FF7F" />,
    today: <FaEye size={30} color="#FFD700" />,
    overdue: <FaExclamationTriangle size={30} color="#FF4500" />,
  };

  const colors = {
    today: "rgba(255, 215, 0, 0.35)",
    tomorrow: "rgba(0, 255, 127, 0.35)",
    inTwoDays: "rgba(255, 165, 0, 0.35)",
    overdue: "rgba(255, 69, 0, 0.35)",
  };

  const toggleDropdown = (remetente) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [remetente]: !prev[remetente],
    }));
  };

  return (
    <Box bgColor={colors[status]} style={{height:'min-content'}}>
      {icons[status]}
      <h5>{title}</h5>
      <p className="lead">{count}</p>
      <ProgressBar progress={progress} />
      <NoteList>
        {groupedData.length > 0 ? (
          groupedData.map((item, idx) => (
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
                  {dropdownOpen[item.remetente] ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              {dropdownOpen[item.remetente] && (
                <ul style={{ paddingLeft: "15px" }}>
                  {item.notas.map((nf, noteIdx) => (
                    <li key={noteIdx}>NF: {nf}</li>
                  ))}
                </ul>
              )}
            </NoteItem>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>Nenhum dado disponível</p>
        )}
      </NoteList>
    </Box>
  );
};

export default DeliveryStatusBox;
