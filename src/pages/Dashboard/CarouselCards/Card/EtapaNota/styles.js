// EtapaNota/style.js
import styled from "styled-components";

export const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 10px;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LinhaEtapa = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  padding-left: 8px;
`;

export const Bolinha = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ status }) =>
    status === "verde"
      ? "#28a745"
      : status === "vermelha"
      ? "#dc3545"
      : "#fff"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 9px;
  z-index: 1;
`;

export const LinhaVertical = styled.div`
  position: absolute;
  top: 16px;
  left: 14px;
  width: 2px;
  height: calc(100% - 0px);
  background-color: ${({ status }) =>
    status === "verde"
      ? "#28a745"
      : status === "vermelha"
      ? "#dc3545"
      : "#fff"};
`;

export const TextoEtapa = styled.div`
  font-size: 11px;
  color: #fff;
  margin-top: -1px;
  padding-bottom: 4px;

  strong {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: ${({ status }) =>
      status === "verde"
        ? "#28a745"
        : status === "vermelha"
        ? "#dc3545"
        : "#fff"};
  }

  small {
    font-size: 10px;
    color: #fff;
  }
`;
