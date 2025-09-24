// src/pages/Projetos/components/StatusFilterDropdown.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

/* ================= styled ================= */
const StatusPickerWrap = styled.div`
  position: relative;
`;

const StatusTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.14);
  background: #fff;
  color: #111827;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: box-shadow .15s ease, border-color .15s ease, background .15s ease;

  &:hover { border-color: rgba(0,0,0,.22); }
  &:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(37,99,235,.18); border-color: #2563eb; }

  svg { width: 16px; height: 16px; opacity: .7; }

  [data-theme="dark"] & {
    background: #0f172a;
    color: #e5e7eb;
    border-color: #334155;
  }
  [data-theme="dark"] &:hover { border-color: #475569; }
  [data-theme="dark"] &:focus-visible { box-shadow: 0 0 0 4px rgba(37,99,235,.25); border-color: #2563eb; }
`;

const StatusMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,.12);
  background: #fff;
  box-shadow: 0 14px 38px rgba(0,0,0,.22), 0 6px 12px rgba(0,0,0,.12);
  padding: 6px;
  z-index: 5;

  [data-theme="dark"] & {
    background: #0b1220;
    border-color: #1f2937;
    box-shadow: 0 14px 38px rgba(0,0,0,.55), 0 6px 12px rgba(0,0,0,.45);
  }
`;

const StatusItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover { background: rgba(31,41,55,.06); }
  &[data-active="true"] {
    background: rgba(37,99,235,.10);
    border-color: rgba(37,99,235,.35);
    color: #1d4ed8;
  }

  [data-theme="dark"] & {
    color: #e5e7eb;
  }
  [data-theme="dark"] &:hover { background: rgba(255,255,255,.06); }
  [data-theme="dark"] &[data-active="true"] {
    background: rgba(37,99,235,.18);
    border-color: rgba(37,99,235,.45);
    color: #93c5fd;
  }
`;

/* ================= component ================= */
export default function StatusFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const OPTIONS = useMemo(
    () => [
      { value: "ANDAMENTO", label: "Em andamento" },
      { value: "STANDBY",   label: "Standby" },
      { value: "CONCLUIDO", label: "Concluídos" },
      { value: "CANCELADO", label: "Cancelados" },
      { value: "TODOS",     label: "Todos" },
    ],
    []
  );

  const current = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <StatusPickerWrap ref={ref}>
      <StatusTrigger
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title="Filtrar por status"
      >
        {current.label}
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.127l3.71-3.896a.75.75 0 111.08 1.04l-4.24 4.46a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/>
        </svg>
      </StatusTrigger>

      {open && (
        <StatusMenu role="listbox">
          {OPTIONS.map((opt) => (
            <StatusItem
              key={opt.value}
              role="option"
              data-active={opt.value === value}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </StatusItem>
          ))}
        </StatusMenu>
      )}
    </StatusPickerWrap>
  );
}
