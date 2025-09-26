import styled from "styled-components";

export const PANEL_WIDTH = 300;
export const PANEL_HEIGHT = 400;

/* Contêiner do trigger (sino) */
export const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

/* Botão do sino */
export const BellButton = styled.button`
  position: relative;
  display: inline-flex;
  cursor: pointer;
  background: transparent;
  border: 0;
  color: inherit;
  padding: 6px;
  border-radius: 10px;
  outline: none;
  transition: background 0.15s ease, transform 0.08s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: scale(0.98);
  }

  /* Dark */
  [data-theme="dark"] & {
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

/* Badge laranja do contador */
export const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #f59e0b;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
`;

/* Painel (dropdown) – define variáveis de tema e usa em todo o conteúdo */
export const Panel = styled.div`
   position: fixed;
  width: ${PANEL_WIDTH}px;
  height: ${PANEL_HEIGHT}px;
  overflow-y: auto;
  z-index: 9999;
  /* Default = tema claro */
  --panel-bg: #ffffff;
  --panel-fg: #111827;
  --panel-border: #e5e7eb;

  --subcard-bg: #f9fafb;
  --subcard-border: #e5e7eb;
  --subcard-hover-bg: #f3f4f6;

  --muted: #6b7280;
  --soft-outline: rgba(0, 0, 0, 0.06);
  --button-bg: rgba(0, 0, 0, 0.04);
  --button-bg-hover: rgba(0, 0, 0, 0.07);
  --button-border: rgba(0, 0, 0, 0.12);
  --button-border-hover: rgba(0, 0, 0, 0.25);

  background: var(--panel-bg);
  color: var(--panel-fg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);

  /* Dark mode */
  [data-theme="dark"] & {
    --panel-bg: #111827;
    --panel-fg: #e5e7eb;
    --panel-border: rgba(255, 255, 255, 0.12);

    --subcard-bg: #0b1220;
    --subcard-border: rgba(255, 255, 255, 0.08);
    --subcard-hover-bg: #0f172a;

    --muted: rgba(255, 255, 255, 0.6);
    --soft-outline: rgba(255, 255, 255, 0.06);
    --button-bg: rgba(255, 255, 255, 0.04);
    --button-bg-hover: rgba(255, 255, 255, 0.1);
    --button-border: rgba(255, 255, 255, 0.18);
    --button-border-hover: rgba(255, 255, 255, 0.3);
  }

  /* Scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--button-border);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--button-border-hover);
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

/* Cabeçalho fixo */
export const Header = styled.div`
 
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px;
    background: ${({ $active }) =>
    $active
      ? "linear-gradient(to bottom, var(--tab-active-top), var(--tab-active-bot))"
      : "transparent"};
  border-bottom: 1px solid var(--soft-outline);

  strong {
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.2px;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const TinyButton = styled.button`
  font-size: 12px;
  background: transparent;
  color: var(--panel-fg);
  border: 1px solid var(--button-border);
  border-radius: 8px;
  padding: 8px 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--button-bg-hover);
    border-color: var(--button-border-hover);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
  svg{
    font-size: large;
  }
`;

/* Lista de itens */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
`;

/* Subcard de notificação */
export const SubCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--subcard-border);
  border-radius: 10px;
  background: var(--subcard-bg);
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.06s ease;

  &:hover {
    background: var(--subcard-hover-bg);
  }
  &:active {
    transform: scale(0.998);
  }
`;

export const ItemMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const RowTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ItemTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
`;

export const ActionPill = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 3px 6px;
  border-radius: 999px;
  color: var(--panel-fg);
  border: 1px solid var(--button-border);
  background: var(--button-bg);

  position: relative;
  padding-left: 16px;

  &::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    transform: translateY(-50%);
    background: ${({ $variant }) =>
      $variant === "PROJECT_CREATED"
        ? "#22c55e" // green
        : $variant === "ROW_ASSIGNED"
        ? "#3b82f6" // blue
        : $variant === "ROW_COMMENT"
        ? "#a855f7" // purple
        : "#f59e0b"}; // orange (MENTION/other)
  }
`;

export const ItemMeta = styled.div`
  font-size: 12px;
  color: var(--muted);
  em {
    opacity: 0.95;
  }
`;

export const ItemTime = styled.div`
  font-size: 11px;
  color: var(--muted);
`;

export const ActionsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* Botões de ação com hover moderno */
export const IconButton = styled.button`
  background: var(--button-bg);
  color: var(--panel-fg);
  border: 1px solid var(--button-border);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: var(--button-bg-hover);
    border-color: var(--button-border-hover);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/* Conteúdo rico (listas, links, quebras) do preview */
export const RichHtml = styled.div`
  font-size: 12px;
  color: var(--panel-fg);
  opacity: 0.95;
  white-space: normal;

  p, div { margin: 6px 0; }
  ul, ol { padding-left: 18px; margin: 6px 0; }
  li { margin: 2px 0; line-height: 1.35; }

  a {
    color: #2563eb;
    text-decoration: underline;
    word-break: break-word;
  }
  [data-theme="dark"] & a {
    color: #93c5fd;
  }
`;
export const TabsBar = styled.div`
  display: flex;
`;

// Aba/ botão com estado ativo
export const TabButton = styled.button`
  /* tokens base */
  --tab-radius: 10px;
  --tab-border: var(--button-border);
  --tab-border-bottom: none;
  --tab-border-hover: var(--button-border-hover);

  /* gradiente do ativo (topo mais claro) */
  --tab-active-top: rgba(59, 130, 246, 0.18);   /* azul clarinho */
  --tab-active-bot: var(--panel-bg);

  [data-theme="dark"] & {
    --tab-active-top: rgba(59, 130, 246, 0.22);
    --tab-active-bot: rgba(255, 255, 255, 0.03);
  }

  flex: 1 1 0;
  padding: 8px 10px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  border-radius: var(--tab-radius) var(--tab-radius) 0 0;
  border: 1px solid var(--tab-border);
  border-bottom: ${({ $active }) => ($active ? "none" : "1px solid var(--tab-border)")};
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(to bottom, var(--tab-active-top), var(--tab-active-bot))"
      : "transparent"};
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.06s ease;

  /* “encaixa” visualmente na área abaixo quando ativo */
  margin-bottom: -1px; 
  position: relative;
  z-index: ${({ $active }) => ($active ? 2 : 1)};

  &:hover {
    border-color: var(--tab-border-hover);
    background: ${({ $active }) =>
      $active
        ? "linear-gradient(to bottom, var(--tab-active-top), var(--tab-active-bot))"
        : "var(--button-bg-hover)"};
  }

  &:active {
    transform: translateY(1px);
    border-bottom: none;
  }
`;