import styled from "styled-components";

export const Wrap = styled.section`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 12px;
  margin: 8px 0 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const CardsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(160px, 1fr));
  gap: 10px;

  @media (max-width: 1300px){
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }
  @media (max-width: 900px){
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
`;

export const StatCard = styled.div`
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  border: 1px solid rgba(0,0,0,.06);

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 8px 24px rgba(2,6,23,.5);
  }

  &::before{
    content: "";
    display: block;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: ${(p) => p.$color || "#6366f1"};
    margin-bottom: 10px;
    opacity: .9;
  }
`;

export const StatLabel = styled.div`
  font-size: 12px;
  opacity: .85;
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  margin-top: 2px;
  line-height: 1;
`;

export const PieCard = styled.div`
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  border: 1px solid rgba(0,0,0,.06);

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: rgba(255,255,255,.08);
    box-shadow: 0 8px 24px rgba(2,6,23,.5);
  }
`;

export const PieWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
  margin-top: 8px;
`;

export const LegendItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

export const Dot = styled.span`
  width: 12px; height: 12px; border-radius: 999px;
  background: ${(p) => p.$c || '#999'};
  border: 1px solid rgba(0,0,0,.15);

  [data-theme="dark"] & {
    border-color: rgba(255,255,255,.14);
  }
`;
