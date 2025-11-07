import styled from "styled-components";

export const TableWrap = styled.div`
  position: relative;
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: var(--table-bg, #fff);

  table {
    margin: 0;
    min-width: 760px;
  }

  thead.sticky {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .thead-default {
    background: #f8fafc;
    box-shadow: inset 0 -1px 0 #e5e7eb;
  }

  .thead-warn {
    background: #fff7ed;
    box-shadow: inset 0 -1px 0 #fdba74;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
  }

  .actions-cell {
    vertical-align: middle;
  }

  .btn-label-hide-sm {
    display: inline;
  }

  @media (max-width: 640px) {
    table {
      min-width: 620px;
    }

    .col-hide-sm {
      display: none;
    }

    .btn-label-hide-sm {
      display: inline;
      font-weight: 600;
    }

    .mobile-inline-actions {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      margin-left: 8px;
    }

    .mobile-row-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 6px;
      flex-wrap: wrap;
    }
  }
`;

export const modernTableStyles = {
  theadClass: "thead-default",
  th: { whiteSpace: "nowrap", fontWeight: 700, fontSize: 12, color: "#334155" },
};

export const loteChipStyles = {
  display: "inline-flex",
  padding: "2px 8px",
  borderRadius: 999,
  background: "#eef2ff",
  color: "#3730a3",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid #c7d2fe",
};

export const occTableStyles = {
  theadClass: "thead-warn",
  th: { whiteSpace: "nowrap", fontWeight: 800, fontSize: 12, color: "#9a3412" },
  rowBg: "rgba(251, 146, 60, .08)",
};
