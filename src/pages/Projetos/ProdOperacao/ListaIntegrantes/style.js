import styled from "styled-components";

export const Wrap = styled.div`
  margin: 12px 0 10px;
  background: #fff;
  border-radius: 16px;
  padding: 12px 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border: 1px solid rgba(255,255,255,.06);
    box-shadow: 0 8px 24px rgba(2,6,23,0.45);
  }
`;

export const Title = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  font-weight: 1000;
  font-size: 13px;
  color: #111827;

  span {
    opacity: 0.7;
    font-weight: 900;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const Chips = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 8px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 12px;

  background: rgba(99,102,241,.10);
  color: #4338ca;
  border: 1px solid rgba(99,102,241,.22);

  svg {
    width: 14px;
    height: 14px;
  }

  [data-theme="dark"] & {
    background: rgba(99,102,241,.18);
    color: #c7d2fe;
    border-color: rgba(99,102,241,.28);
  }
`;
