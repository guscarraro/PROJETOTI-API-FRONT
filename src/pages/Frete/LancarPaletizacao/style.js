import styled from "styled-components";

/* ====== CONTAINER RESPONSIVO ====== */
export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  /* evita “vazar” horizontal fora do container */
  overflow-x: hidden;

  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 16px;
  }
`;

export const Title = styled.h2`
  text-align: center;
  color: #fff;
  font-size: 24px;
  margin-bottom: 20px;
`;

/* ====== FORM RESPONSIVO ====== */
export const StyledForm = styled.form`
  display: flex;
  gap: 15px;
  background: none;
  padding: 0;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  font-size: 25px;
  color: #fff;
  border-radius: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    font-size: 18px;
    gap: 12px;
    justify-content: center;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* deixa inputs encolherem sem estourar */
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

/* ====== CAMPOS RESPONSIVOS ====== */
const fieldBase = `
  padding: 10px;
  font-size: 14px;
  border: 1px solid #fff;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s ease;
  width: 100%;
  max-width: 260px;   /* similar ao teu 250, mas com folga */
  box-sizing: border-box;
  background: transparent;
  color: #fff;
  min-width: 0;

  /* palavras/strings muito longas não quebram layout */
  overflow-wrap: anywhere;
  word-break: break-word;

  &:focus { border-color: #007bff; }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

export const Input = styled.input`${fieldBase}`;
export const Select = styled.select`${fieldBase}`;
export const TextArea = styled.textarea`
  ${fieldBase}
  resize: vertical;
  min-height: 90px;
`;

/* ====== BOTÃO ====== */
export const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 260px;

  &:hover { background-color: #0056b3; }

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

/* =========================================================
   TABELA: SCROLL HORIZONTAL + QUEBRA DE CONTEÚDO LONGO
   ========================================================= */
export const TableWrapper = styled.div`
  width: 100%;
  margin-top: 16px;

  /* o segredo do scroll horizontal da tabela */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* pra ficar claro quando a tabela é mais larga */
  /* opcional: borda suave no wrapper */
  border-radius: 8px;

  /* evita que o Container corte o scroll interno */
  /* Container tem overflow-x: hidden; o scroll acontece aqui */
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  /* força largura “natural” das colunas e ativa scroll no wrapper */
  table-layout: fixed;
  min-width: 700px; /* garante scroll no mobile quando muitas colunas */

  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

export const Th = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.25);
  font-weight: 600;

  /* evita estouro por textos longos */
  overflow-wrap: anywhere;
  word-break: break-word;
`;

export const Td = styled.td`
  padding: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  vertical-align: top;

  /* evita estouro por textos/IDs grandes (CTE, NF, etc.) */
  overflow-wrap: anywhere;
  word-break: break-word;

  /* se tiver números muito longos (ex: chaves), isso ajuda também */
  white-space: normal;
`;
