import styled from 'styled-components';

export const Container = styled.div`
  margin-top: 14px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const CountPill = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: rgba(15, 23, 42, 0.06);
  color: #111827;
  border: 1px solid rgba(15, 23, 42, 0.14);

  [data-theme="dark"] & {
    background: rgba(148, 163, 184, 0.12);
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 0.4);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;

  [data-theme="dark"] & {
    background: #1e293b;
  }
`;

export const Wrap = styled.div`
  max-height: 52vh;
  overflow-y: auto;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
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
    border-bottom-color: #1e293b;
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
  padding: 4px 6px;
  white-space: nowrap;
  line-height: 1;
  vertical-align: middle;
`;