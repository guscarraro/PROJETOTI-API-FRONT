import styled from "styled-components";

export const VideoBox = styled.div`
  position: relative;
  width: 100%;
  
  aspect-ratio: 18/12;
  background: #111;
  border-radius: 12px;
  overflow: hidden;
`;

export const VideoEl = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  aspect-ratio: 18/12;
  height: 100%;
  object-fit: cover;
  z-index: 0;
`;

export const CanvasEl = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`;


export const Banner = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  background: rgba(0,0,0,.55);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

export const Btn = styled.button`
  background: #2563eb;
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: .6;
    cursor: not-allowed;
  }
`;
