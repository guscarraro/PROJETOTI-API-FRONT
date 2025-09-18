import React from "react";
import { ColorsRow, ColorDot, ClearBtn, BaselineMark } from "../../../../style";
import { FiFlag } from "react-icons/fi";
import { toast } from "react-toastify";

export default function PaletteHeader({
  colors,
  canEditColorHere,
  onPickColor,
  canToggleBaseHere,
  baselineColor,
  palette,
  setPalette,
}) {
  return (
    <div style={{ paddingBottom: 6 }}>
      <ColorsRow>
        {colors.map((c) => (
          <ColorDot
            key={c}
            $color={c}
            style={{
              opacity: canEditColorHere ? 1 : 0.4,
              cursor: canEditColorHere ? "pointer" : "not-allowed",
            }}
            onClick={async () => {
              if (!canEditColorHere) {
                toast.error("Sem permissão para alterar a cor.");
                return;
              }
              try {
                const r = onPickColor?.(c);
                if (r && typeof r.then === "function") await r;
              } catch (err) {
                const s = err?.response?.status;
                const d = err?.response?.data?.detail;
                if (s === 403) toast.error("Sem permissão para alterar a cor.");
                else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
                else toast.error(d || "Falha ao alterar a cor.");
              }
            }}
          />
        ))}

        <ClearBtn
          type="button"
          style={{
            opacity: canEditColorHere ? 1 : 0.4,
            cursor: canEditColorHere ? "pointer" : "not-allowed",
          }}
          onClick={async () => {
            if (!canEditColorHere) {
              toast.error("Sem permissão para limpar a cor.");
              return;
            }
            try {
              const r = onPickColor?.(undefined);
              if (r && typeof r.then === "function") await r;
            } catch (err) {
              const s = err?.response?.status;
              const d = err?.response?.data?.detail;
              if (s === 403) toast.error("Sem permissão para limpar a cor.");
              else if (s === 423) toast.error("Projeto bloqueado. Ação não permitida.");
              else toast.error(d || "Falha ao limpar a cor.");
            }
          }}
        >
          Limpar
        </ClearBtn>
      </ColorsRow>

      {canToggleBaseHere && (
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            margin: "6px 0 4px",
          }}
        >
          <input
            type="checkbox"
            checked={!!palette.baseline}
            onChange={(e) =>
              setPalette((prev) => ({ ...prev, baseline: e.target.checked }))
            }
          />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>Marco do plano</span>
            <span style={{ position: "relative", width: 18, height: 18 }}>
              <span style={{ position: "absolute", inset: 0, display: "inline-block" }}>
                <BaselineMark $color={baselineColor}>
                  <FiFlag size={12} style={{ color: "grey" }} />
                </BaselineMark>
              </span>
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
