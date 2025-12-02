import styled from "styled-components";
export const DisabledOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.85);
    color: #facc15;
  }
`;