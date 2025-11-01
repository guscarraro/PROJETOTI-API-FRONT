import styled from "styled-components";

export const Wrap = styled.div`
  width: 100%;
`;
export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 16px;
  min-height: 520px;
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
