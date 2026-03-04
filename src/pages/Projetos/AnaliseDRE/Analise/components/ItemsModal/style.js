import styled from "styled-components";

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const Modal = styled.div`
  width: min(1200px, 96vw);
  max-height: 92vh;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #334155;
    color: #e5e7eb;
  }
`;

export const ModalHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 10px;

  [data-theme="dark"] & {
    border-bottom-color: #334155;
  }
`;

export const ModalTitle = styled.div`
  font-weight: 1000;
  font-size: 14px;
`;

export const CloseBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;

  [data-theme="dark"] & {
    background: #020617;
    border-color: #334155;
    color: #e5e7eb;
  }
`;

export const Body = styled.div`
  padding: 12px 14px;
  overflow: auto;
  max-height: calc(92vh - 120px);
`;

export const TopRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

export const Pill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.14);

  [data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.12);
    border-color: rgba(148, 163, 184, 0.4);
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  height: 34px;
  min-width: 240px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 0 10px;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: #334155;
  }
`;

export const Button = styled.button`
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-weight: 900;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  [data-theme="dark"] & {
    background: #020617;
    border-color: #334155;
    color: #e5e7eb;
  }
`;

export const TableWrap = styled.div`
  margin-top: 12px;
  width: 100%;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  [data-theme="dark"] & {
    border-color: #334155;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

export const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;

  [data-theme="dark"] & {
    background: #020617;
    border-bottom-color: #334155;
  }
`;

export const Td = styled.td`
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;

  [data-theme="dark"] & {
    border-bottom-color: #111827;
  }
`;

export const TdCompact = styled(Td)`
  padding: 6px 8px;
  white-space: nowrap;
  line-height: 1.1;
  vertical-align: middle;
`;

export const Footer = styled.div`
  padding: 10px 14px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;

  [data-theme="dark"] & {
    border-top-color: #334155;
  }
`;