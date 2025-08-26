import React from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import {
  StyledTable,
  TableRowStyled,
  IconCell,
  ActionCell,
  StyledIconButton
} from "./style";
import {
  FaLaptop,
  FaDesktop,
  FaNetworkWired,
  FaWifi,
  FaMobileAlt,
  FaEnvelope,
  FaBarcode
} from "react-icons/fa";
import { LiaMicrochipSolid } from "react-icons/lia";

const getRowColor = (status) => {
  switch (status) {
    case "Em Uso":
      return "rgba(0, 255, 127, 0.35)";
    case "Pendente":
      return "rgba(255, 215, 0, 0.35)";
    case "Manutenção":
      return "rgba(255, 165, 0, 0.35)";
    case "Inativo":
      return "rgba(255, 69, 0, 0.35)";
    default:
      return "rgba(200, 200, 200, 0.35)";
  }
};

const renderIcon = (tipo, descricao = "") => {
  switch (tipo) {
    case "Notebook":
      return <FaLaptop />;
    case "Desktop":
      return <FaDesktop />;
    case "Switch":
      return <FaNetworkWired />;
    case "Celular":
      if (descricao.includes("Celular+Chip")) return <><FaMobileAlt /> <LiaMicrochipSolid /></>;
      if (descricao.includes("Chip") && !descricao.includes("Celular")) return <LiaMicrochipSolid />;
      return <FaMobileAlt />;
    case "Roteador":
      return <FaWifi />;
    case "Coletor":
      return <FaBarcode />;
    case "Licença":
      return <FaEnvelope />;
    default:
      return <FaDesktop />;
  }
};
const formatarData = (dataStr) => {
  if (!dataStr) return "Não informado";

  const date = new Date(dataStr);

  // subtrai 3 horas
  date.setHours(date.getHours() - 3);

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();

  const hora = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} ${hora}:${minutos}`;
};


const TabelaEquipamentos = ({ equipamentos, onEdit, onDelete, onInfo }) => {
  return (
    <StyledTable>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Data Alteração</th>
          <th>Responsável</th>
          <th>Email</th>
          <th>Cloud</th>
          <th>Descrição</th>
          <th>Status</th>
          <th>Obs</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {equipamentos.map((eq) => (
          <TableRowStyled
            key={eq.id}
            $bgColor={getRowColor(eq.status)}
            onClick={() => onInfo(eq)}
          >
            <IconCell>
              {renderIcon(eq.tipo_aparelho, eq.descricao)} {eq.tipo_aparelho}
            </IconCell>
            <td>{formatarData(eq.data_atualizacao)}</td>

            <td>{eq.pessoa_responsavel || "Não informado"}</td>
            <td>{eq.email_utilizado || "Não informado"}</td>
            <td>{eq.cloud_utilizado || "Não informado"}</td>
            <td>{eq.descricao || "Não informado"}</td>
            <td>{eq.status}</td>
            <td>{eq.observacoes}</td>
            <ActionCell onClick={(e) => e.stopPropagation()}>
              <StyledIconButton color="primary" size="sm" onClick={() => onEdit(eq)}>
                <FaPen />
              </StyledIconButton>
              <StyledIconButton color="danger" size="sm" onClick={() => onDelete(eq)}>
                <FaTrash />
              </StyledIconButton>
            </ActionCell>
          </TableRowStyled>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default TabelaEquipamentos;
