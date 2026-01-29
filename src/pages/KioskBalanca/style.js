import styled from "styled-components";

export const Full = styled.div`
  height: 100vh;
  width: 100vw;
  background: #0b0f19;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Shell = styled.div`
  width: 320px;
  height: 240px;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 16px;
  color: #fff;

  background: radial-gradient(
        320px 220px at 30% 10%,
        rgba(96, 165, 250, 0.14),
        transparent
      ),
      radial-gradient(
        260px 200px at 80% 30%,
        rgba(34, 197, 94, 0.12),
        transparent
      ),
      rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Top = styled.div`
  display: grid;
  grid-template-columns: 0.22fr 0.78fr;
  gap: 8px;
  align-items: start;
`;

export const HeadLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-right: 2px;
`;

export const Title = styled.div`
  font-size: 12px;
  font-weight: 950;
  letter-spacing: -0.3px;
`;

export const Badge = styled.div`
  font-weight: 950;
  font-size: 9px;
  padding: 5px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);

  ${({ $status }) =>
    $status === "on" &&
    `
    border-color: rgba(34,197,94,0.35);
    background: rgba(34,197,94,0.18);
  `}
  ${({ $status }) =>
    $status === "off" &&
    `
    border-color: rgba(239,68,68,0.35);
    background: rgba(239,68,68,0.18);
  `}
  ${({ $status }) =>
    $status === "loading" &&
    `
    border-color: rgba(96,165,250,0.35);
    background: rgba(96,165,250,0.18);
  `}
`;

export const Mini3D = styled.div`
  position: relative;
  width: 100%;
  height: 92px;
  border-radius: 12px;
  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.22);

  /* fundo quadriculado "simulador" */
  background-image: linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 10px 10px;
  background-position: center;

  /* vinheta pra dar profundidade */
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 -18px 30px rgba(0, 0, 0, 0.55);
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const Grid4 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

export const Tile = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 7px 9px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

export const TLabel = styled.div`
  font-size: 10px;
  opacity: 0.82;
  font-weight: 850;
  white-space: nowrap;
`;

export const TValue = styled.div`
  font-size: 12px;
  font-weight: 950;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const BigRow = styled.div`
  margin-top: 2px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 12px;
  padding: 8px 10px;

  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
`;

export const BigLabel = styled.div`
  font-size: 10px;
  letter-spacing: 0.8px;
  font-weight: 950;
  opacity: 0.88;
`;

export const BigValue = styled.div`
  font-size: 16px;
  font-weight: 980;
  font-variant-numeric: tabular-nums;
`;

export const Footer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
`;

export const Small = styled.div`
  font-size: 10px;
  opacity: 0.85;

  b {
    font-weight: 950;
  }
`;
