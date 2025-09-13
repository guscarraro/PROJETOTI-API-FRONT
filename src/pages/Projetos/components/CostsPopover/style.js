import styled, { css, createGlobalStyle } from "styled-components";

export const CostBox = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fff;

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 8px 24px rgba(2,6,23,.35);
  }
`;

export const HeadRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
  b { font-weight: 800; }
`;

export const ParcelsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px;
`;

export const Chip = styled.span`
  font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px;
  background: rgba(96,165,250,.15); color: #1d4ed8;
  [data-theme="dark"] & { background: rgba(99,102,241,.22); color: #c7d2fe; }
`;

export const ParcelCard = styled.button`
  text-align: left; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px;
  background: #f9fafb; cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, background .12s ease, border-color .12s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(0,0,0,.08); }
  ${(p) => p.$paid && css`
    background: rgba(16,185,129,.12); border-color: #10b981; box-shadow: inset 0 0 0 1px rgba(16,185,129,.35);
  `}
  [data-theme="dark"] & {
    background: #0b1220; color: #e5e7eb; border-color: rgba(255,255,255,.08);
    ${(p) => p.$paid && css`
      background: rgba(16,185,129,.22); border-color: rgba(16,185,129,.6);
      box-shadow: inset 0 0 0 1px rgba(16,185,129,.55);
    `}
  }
`;

export const ParcelHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
  b { font-weight: 800; }
`;

export const PaidMark = styled.span`
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #10b981;
  ${(p) => !p.$visible && css`opacity: 0;`}
  [data-theme="dark"] & { color: #34d399; }
`;

export const DueText = styled.small`
  color: #374151;
  [data-theme="dark"] & { color: #cbd5e1; }
`;