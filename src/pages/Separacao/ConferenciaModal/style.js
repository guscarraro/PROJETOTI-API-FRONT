import styled from "styled-components";

export const Wrap = styled.div`
  width: 100%;
  /* evita “estouro” do conteúdo */
  min-width: 0;
`;

/* controla a rolagem vertical do corpo do modal */
export const BodyScroll = styled.div`
  /* Altura máxima do conteúdo dentro do modal; ajusta se quiser mais/menos */
  max-height: min(72vh, 820px);
  overflow: auto;
  padding-right: 4px;

  /* suaviza o scroll em iOS */
  -webkit-overflow-scrolling: touch;

  /* garante que tudo dentro quebre linha corretamente */
  & * {
    min-width: 0;
  }
`;

/* grid base usada quando precisar dividir em colunas */
export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 16px;
  min-height: 520px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    min-height: unset;
  }
`;

export const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Right = styled.div`
  overflow: auto;
  max-height: 64vh;
  padding-left: 4px;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 1024px) {
    max-height: unset;
    overflow: visible;
  }
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Shots = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(100px, 1fr));
  gap: 8px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ShotThumb = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,.16);
  min-height: 72px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

export const Tag = styled.div`
  position: absolute;
  left: 8px;
  top: 8px;
  background: rgba(0,0,0,.6);
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
`;

export const ProgressPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: #374151;
  color: #e5e7eb;
  &[data-ok="1"] { background: #10b981; color: #062a1e; }
`;

/* bloco para seções com tabelas/inputs: ocupa largura total e não estoura */
export const Section = styled.div`
  width: 100%;
  min-width: 0;
`;

/* linha do cabeçalho da etapa de leitura (conferente + contadores) */
export const HeadRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

/* wrap do scanner para inputs não quebrarem o layout */
export const ScannerWrap = styled.div`
  width: 100%;
  min-width: 0;

  /* qualquer grid/linha interna respeita o container */
  & > * {
    min-width: 0;
  }
`;
