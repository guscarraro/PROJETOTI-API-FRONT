import styled from "styled-components";

export const Container = styled.div`
  background: var(--bg, #f8fafc);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  margin-top: 10px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text, #0f172a);
  }
`;

export const BtnAdd = styled.button`
  background: #2563eb;
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    background: #f1f5f9;
    font-size: 13px;
    text-transform: uppercase;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

export const BtnAction = styled.button`
  border: none;
  background: transparent;
  color: ${(p) => (p.$danger ? "#ef4444" : "#2563eb")};
  cursor: pointer;
  font-size: 18px;
  margin: 0 4px;
  transition: 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;
