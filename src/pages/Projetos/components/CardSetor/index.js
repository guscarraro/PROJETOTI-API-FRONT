// src/pages/Projetos/components/CardSetor.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CardSetor({
  sector,                 // { id, nome }
  users = [],             // [{ id, email, nome?... }]
  sectorChecked,          // boolean
  selectedUserIds = [],   // string[] (uuids)
  disabled = false,
  onToggleSector,         // () => void
  onToggleUser,           // (userId: string, checked: boolean) => void
}) {
  // --- Detecta dark mode olhando o ancestral com data-theme="dark" (modal) ---
  const rootRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // acha o ancestral que controla o tema (ex.: body[data-theme="dark"] ou o container do modal)
    const themeRoot =
      el.closest?.("[data-theme]") ||
      document.querySelector("[data-theme]");

    const readTheme = () => {
      const val =
        themeRoot?.getAttribute?.("data-theme") ||
        document.documentElement.getAttribute("data-theme") ||
        document.body.getAttribute("data-theme");
      setIsDark(String(val).toLowerCase() === "dark");
    };

    readTheme();

    // observa mudanças do atributo data-theme nesse container
    let mo;
    if (themeRoot) {
      mo = new MutationObserver(readTheme);
      mo.observe(themeRoot, { attributes: true, attributeFilter: ["data-theme"] });
    } else {
      // fallback: observar no documentElement/body
      mo = new MutationObserver(readTheme);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      mo.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    }

    return () => {
      mo && mo.disconnect();
    };
  }, []);

  // --- Tokens de cor dependentes do tema ---
  const styles = useMemo(() => {
    const border = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.10)";
    const baseBg = isDark ? "rgba(15, 23, 42, 0.9)" : "#fff"; // #0f172a ~ slate-900
    const highlightBg = isDark ? "rgba(56, 189, 248, 0.14)" : "rgba(0,120,255,0.06)"; // ciano claro no dark
    const highlightInset = isDark
      ? "0 0 0 2px rgba(56, 189, 248, 0.35) inset"
      : "0 0 0 2px rgba(0,120,255,0.20) inset";
    const text = isDark ? "#e5e7eb" : "#111";               // slate-200 vs near-black
    const subtext = isDark ? "rgba(229,231,235,0.75)" : "rgba(0,0,0,0.65)";
    const muted = isDark ? "rgba(229,231,235,0.6)" : "rgba(0,0,0,0.55)";
    // cor do texto quando selecionado no dark (azul claro/ciano p/ contraste)
    const selectedText = isDark ? "rgb(186, 230, 253)" : text;        // sky-200
    const selectedSubtext = isDark ? "rgba(186, 230, 253, 0.85)" : subtext;
    const checkboxAccent = isDark ? "rgb(56, 189, 248)" : "rgb(0,120,255)"; // sky-400
    return {
      border, baseBg, highlightBg, highlightInset,
      text, subtext, muted, selectedText, selectedSubtext, checkboxAccent
    };
  }, [isDark]);

  const allUserIds = users.map((u) => String(u.id));
  const total = allUserIds.length;
  const selectedCount = selectedUserIds.filter((id) => allUserIds.includes(id)).length;
  const partially = selectedCount > 0 && selectedCount < total;

  return (
    <div
      ref={rootRef}
      role="button"
      onClick={() => !disabled && onToggleSector?.()}
      style={{
        border: `1px solid ${styles.border}`,
        borderRadius: 10,
        padding: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        background: sectorChecked ? styles.highlightBg : styles.baseBg,
        boxShadow: sectorChecked ? styles.highlightInset : "none",
        transition: "background 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: (isDark && sectorChecked) ? styles.selectedText : styles.text,
      }}
    >
      {/* cabeçalho do card (toggle setor) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleSector?.()}
          checked={sectorChecked}
          ref={(el) => { if (el) el.indeterminate = partially && !sectorChecked; }}
          disabled={disabled}
          style={{ accentColor: styles.checkboxAccent }}
        />
        <div style={{ fontWeight: 600 }}>
          {sector?.nome || `Setor #${sector?.id}`}
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: (isDark && sectorChecked) ? styles.selectedSubtext : styles.subtext,
          }}
        >
          {selectedCount}/{total} selecionados
        </div>
      </div>

      {/* lista de usuários */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 6,
          paddingLeft: 6,
          maxHeight: 160,
          overflow: "auto",
        }}
      >
        {users.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: (isDark && sectorChecked) ? styles.selectedSubtext : styles.muted,
              paddingLeft: 4,
            }}
          >
            Nenhum usuário neste setor.
          </div>
        ) : (
          users.map((u) => {
            const uid = String(u.id);
            const checked = selectedUserIds.includes(uid);
            return (
              <label
                key={uid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: sectorChecked ? 1 : 0.55,
                  color: (isDark && sectorChecked) ? styles.selectedText : styles.text,
                }}
              >
                <input
                  type="checkbox"
                  disabled={disabled || !sectorChecked}
                  checked={checked}
                  onChange={(e) => onToggleUser?.(uid, e.target.checked)}
                  style={{ accentColor: styles.checkboxAccent }}
                />
                <span style={{ fontSize: 14 }}>
                  {u.nome || u.email || uid}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
