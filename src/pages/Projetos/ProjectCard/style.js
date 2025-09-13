import styled from "styled-components";

export const DeleteBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #991b1b; /* red-800 */
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease, color 0.18s ease, opacity 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    background: rgba(239, 68, 68, 0.1); /* red-500 @10% */
    border-color: rgba(239, 68, 68, 0.45); /* red-500 */
    color: #7f1d1d; /* red-900 */
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    transition: transform 0.25s ease;
  }

  [data-theme="dark"] & {
    background: #0f172a; /* slate-900 */
    color: #fecaca; /* red-200 */
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 16px rgba(2, 6, 23, 0.4);

    &:hover {
      box-shadow: 0 10px 18px rgba(2, 6, 23, 0.55);
      background: rgba(239, 68, 68, 0.18); /* red-500 @18% */
      border-color: rgba(239, 68, 68, 0.55);
      color: #ffe4e6; /* rose-100 para contraste */
    }

    &:disabled {
      opacity: 0.5;
      box-shadow: none;
    }
  }
`;

export const LockBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease, color 0.18s ease;

  svg {
    transition: transform 0.25s ease;
    transform: ${(p) =>
      p.$locked ? "rotate(-10deg) scale(0.95)" : "rotate(0deg) scale(1)"};
  }

  /* base quando já estiver trancado */
  ${(p) =>
    p.$locked &&
    `
    background: rgba(16,185,129,.12);
    border-color: rgba(16,185,129,.35);
    color: #065f46;
  `}

  /* hover: sempre dá um “toque” de verde (mais forte se já estiver trancado) */
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    background: ${(p) =>
      p.$locked ? "rgba(16,185,129,.16)" : "rgba(16,185,129,.08)"};
    border-color: ${(p) =>
      p.$locked ? "rgba(16,185,129,.50)" : "rgba(16,185,129,.30)"};
    color: ${(p) => (p.$locked ? "#065f46" : "#047857")};
  }

  [data-theme="dark"] & {
    background: ${(p) => (p.$locked ? "rgba(16,185,129,.18)" : "#0f172a")};
    border-color: ${(p) =>
      p.$locked ? "rgba(16,185,129,.50)" : "rgba(255,255,255,.08)"};
    color: ${(p) => (p.$locked ? "#34d399" : "#e5e7eb")};
    box-shadow: 0 8px 16px rgba(2, 6, 23, 0.4);

    &:hover {
      box-shadow: 0 10px 18px rgba(2, 6, 23, 0.55);
      background: ${(p) =>
        p.$locked ? "rgba(16,185,129,.24)" : "rgba(16,185,129,.14)"};
      border-color: ${(p) =>
        p.$locked ? "rgba(16,185,129,.60)" : "rgba(16,185,129,.45)"};
      color: #34d399;
    }
  }
`;

/* fileira de bolinhas com leve sobreposição */
export const OverlapRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 8px;
  max-width: 132px; /* ~3 bolinhas sobrepostas + “+N”  */
  overflow: hidden;
  > * {
    margin-left: -6px; /* sobreposição */
    box-shadow: 0 0 0 2px #fff; /* anel branco para separar */
  }

  > *:first-child {
    margin-left: 0;
  }

  [data-theme="dark"] & > * {
    box-shadow: 0 0 0 2px #0f172a; /* anel no dark */
  }
`;
