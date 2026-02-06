import styled, { css, keyframes } from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;


export const CompactTop3 = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1.15fr 1fr 0.85fr;
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Label = styled.label`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #111827;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 1000;
  letter-spacing: 0.2px;
  color: rgba(11, 18, 32, 0.9);
  margin: 2px 0 4px;

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.9);
  }
`;

const baseControl = css`
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #fff;
  color: #111827;
  padding: 7px 10px;
  font-size: 13px;
  font-weight: 800;
  outline: none;
  height: 36px;

  &:focus {
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
    border-color: #60a5fa;
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const Input = styled.input`
  ${baseControl}
`;

export const MiniInput = styled.input`
  ${baseControl}
`;

export const MicroSelect = styled.select`
  ${baseControl}
`;

export const Select = styled.select`
  ${baseControl}
`;

export const TextArea = styled.textarea`
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #fff;
  color: #111827;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 700;
  outline: none;
  min-height: 80px;

  &:focus {
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.35);
    border-color: #60a5fa;
  }

  [data-theme="dark"] & {
    background: #0b1220;
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

export const Hint = styled.small`
  font-size: 11px;
  color: rgba(17, 24, 39, 0.62);

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.62);
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Pill = styled.button`
  border-radius: 999px;
  padding: 5px 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;

  ${(p) =>
    p.$active &&
    css`
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.35);
      color: #4338ca;
    `}

  [data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.5);
    border-color: rgba(255, 255, 255, 0.12);
    color: #e5e7eb;

    ${(p) =>
      p.$active &&
      css`
        background: rgba(99, 102, 241, 0.22);
        border-color: rgba(99, 102, 241, 0.35);
        color: #c7d2fe;
      `}
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
  margin: 12px 0;

  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const InlineBtn = styled.button`
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: #111827;
  color: #fff;
  font-weight: 1000;
  cursor: pointer;

  &:hover {
    filter: brightness(0.96);
  }
  &:active {
    transform: translateY(1px);
  }

  [data-theme="dark"] & {
    background: #1f2937;
    border-color: rgba(255, 255, 255, 0.14);
  }
`;

export const Inline2 = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const CompactGrid4 = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const CompactField = styled.div`
  display: flex;
  width: 20%;
  flex-direction: column;
  gap: 5px;

  @media (max-width: 1100px) {
    width: 100%;
  }
  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const SearchSelectWrap = styled.div`
  position: relative;
`;

export const OptionsList = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 9999;

  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
  padding: 6px;
  max-height: 220px;
  overflow: auto;

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.12);
    background: #0b1220;
    box-shadow: 0 14px 34px rgba(2, 6, 23, 0.55);
  }
`;

export const OptionItem = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  border-radius: 10px;
  padding: 9px 10px;
  background: transparent;
  cursor: pointer;
  font-weight: 900;
  font-size: 13px;
  color: #0b1220;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
  }

  [data-theme="dark"] & {
    color: #e5e7eb;

    &:hover {
      background: rgba(37, 99, 235, 0.18);
    }
  }
`;

export const ChipsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

export const Chip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  background: rgba(255, 255, 255, 0.85);
  color: #0b1220;
  font-weight: 900;
  font-size: 12px;

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(15, 23, 42, 0.65);
    color: #e5e7eb;
  }
`;

export const ChipX = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-weight: 1000;
  font-size: 16px;
  line-height: 1;
  padding: 0 2px;
  color: rgba(11, 18, 32, 0.85);

  &:active {
    transform: translateY(1px);
  }

  [data-theme="dark"] & {
    color: rgba(229, 231, 235, 0.85);
  }
`;

export const LogBox = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.65);
  padding: 10px;
  max-height: 200px;
  overflow: auto;

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(15, 23, 42, 0.35);
  }
`;

export const LogItem = styled.div`
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  margin-bottom: 8px;
  font-size: 12px;

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.1);
    background: #0b1220;
  }
`;

export const MiniNote = styled.div`
  font-size: 12px;
  font-weight: 700;
  opacity: 0.75;
  margin-top: 4px;
`;

/* ============================
   ADIÇÕES NOVAS (IMPORTAÇÃO)
   ============================ */

export const DropZoneTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`;

export const DropCounter = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

export const DropZone = styled.div`
  width: 100%;
  padding: 14px 12px;
  border: 2px dashed rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  text-align: center;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.03);

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
`;

export const DocMetaBox = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);

  [data-theme="dark"] & {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

export const DocMetaRow = styled.div`
  line-height: 1.35;
  color: #0b1220;

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
`;

export const SourceBadge = styled.span`
  font-size: 11px;
  font-weight: 1000;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: ${(p) => (p.$src === "xml" ? "rgba(46, 204, 113, 0.18)" : "rgba(241, 196, 15, 0.22)")};

  [data-theme="dark"] & {
    border-color: rgba(255, 255, 255, 0.16);
    background: ${(p) => (p.$src === "xml" ? "rgba(46, 204, 113, 0.22)" : "rgba(241, 196, 15, 0.24)")};
  }
`;
