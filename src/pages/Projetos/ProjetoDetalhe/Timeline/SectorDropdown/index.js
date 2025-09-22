import styled from "styled-components";
import React, { useState, useRef, useEffect } from "react";

/* ---------- ESTILOS ---------- */

export const SectorFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px;
  flex-wrap: wrap;
  user-select: none;
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02));
  color: #374151;
  border: 1px solid #e5e7eb;
  letter-spacing: 0.2px;

  @media (prefers-color-scheme: dark) {
    color: #e5e7eb;
    border-color: #334155;
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  }
  .dark &,
  [data-theme="dark"] & {
    color: #e5e7eb;
    border-color: #334155;
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  }
`;

const Combo = styled.div`
  position: relative;
  min-width: 220px;
`;

const ComboButton = styled.button`
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(180deg, #ffffff, #fafafa);
  color: #111827;
  font-size: 14px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: box-shadow .15s ease, border-color .15s ease, background .15s ease;

  &:hover { border-color: #d1d5db; }
  &:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.35); }

  @media (prefers-color-scheme: dark) {
    border-color: #334155;
    background: linear-gradient(180deg, #0b1220, #0f172a);
    color: #e5e7eb;
    &:hover { border-color: #475569; }
  }
  .dark &,
  [data-theme="dark"] & {
    border-color: #334155;
    background: linear-gradient(180deg, #0b1220, #0f172a);
    color: #e5e7eb;
    &:hover { border-color: #475569; }
  }
`;

const Arrow = styled.span`
  margin-left: auto;
  opacity: .7;
  transform: translateY(-1px);
`;

const Dot = styled.span`
  width: 10px; height: 10px; border-radius: 999px; flex: 0 0 10px;
  background: ${(p) => p.$color || "#9ca3af"};
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.08);
`;

const ComboList = styled.div`
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: 280px;
  overflow: auto;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0,0,0,.12);

  @media (prefers-color-scheme: dark) {
    background: #0b1220;
    border-color: #334155;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
  .dark &,
  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #334155;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
`;

const ComboItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  font-size: 14px; cursor: pointer; color: #111827;
  background: ${(p)=>p.$active ? "rgba(96,165,250,.15)" : "transparent"};
  outline: none;

  &:hover { background: rgba(0,0,0,.04); }

  @media (prefers-color-scheme: dark) {
    color: #e5e7eb;
    background: ${(p)=>p.$active ? "rgba(96,165,250,.25)" : "transparent"};
    &:hover { background: rgba(255,255,255,.06); }
  }
  .dark &,
  [data-theme="dark"] & {
    color: #e5e7eb;
    background: ${(p)=>p.$active ? "rgba(96,165,250,.25)" : "transparent"};
    &:hover { background: rgba(255,255,255,.06); }
  }
`;

const ItemLabel = styled.span`
  flex: 1 1 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const Kbd = styled.kbd`
  font-size: 11px; opacity: .6;
`;

/* ---------- COMPONENTE ---------- */

export function SectorDropdown({ id, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  // encontra label do selecionado
  let currentLabel = "Todos os setores";
  let currentColor = "#9ca3af";
  for (let i = 0; i < options.length; i++) {
    if (options[i].key === value) {
      currentLabel = options[i].label || options[i].key;
      currentColor = options[i].color || currentColor;
      break;
    }
  }

  const openList = () => {
    setOpen(true);
    // posiciona highlight no item selecionado
    let idx = 0;
    for (let i = 0; i < options.length; i++) { if (options[i].key === value) { idx = i; break; } }
    setHighlight(idx);
    setTimeout(() => {
      if (!listRef.current) return;
      const el = listRef.current.querySelector(`[data-index="${idx}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }, 0);
  };

  const closeList = () => setOpen(false);

  const handleSelect = (k) => {
    if (typeof onChange === "function") onChange(k);
    closeList();
    if (btnRef.current) btnRef.current.focus();
  };

  // clique fora
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      const path = e.composedPath ? e.composedPath() : [];
      if (btnRef.current && path.includes(btnRef.current)) return;
      if (listRef.current && path.includes(listRef.current)) return;
      closeList();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // teclado no botão
  const onButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  };

  // teclado na lista
  const onListKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeList(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlight];
      if (opt) handleSelect(opt.key);
    }
  };

  return (
    <Combo>
      <ComboButton
        id={id}
        ref={btnRef}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onButtonKeyDown}
        title="Abrir seleção de setor"
      >
        <Dot $color={currentColor} />
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {currentLabel}
        </span>
        <Arrow>▾</Arrow>
      </ComboButton>

      {open && (
        <ComboList
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {options.map((opt, i) => (
            <ComboItem
              key={opt.key}
              role="option"
              aria-selected={opt.key === value}
              data-index={i}
              $active={i === highlight || opt.key === value}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => handleSelect(opt.key)}
            >
              <Dot $color={opt.color || "#9ca3af"} />
              <ItemLabel>{opt.label || opt.key}</ItemLabel>
              {opt.key === value ? <Kbd>Selecionado</Kbd> : null}
            </ComboItem>
          ))}
        </ComboList>
      )}
    </Combo>
  );
}
