import React from "react";

export default function LoaderOverlay({ visible, text = "Processando..." }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,.6)",
        backdropFilter: "blur(2px)",
        display: "grid",
        placeItems: "center",
        zIndex: 3,
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 18,
            height: 18,
            border: "3px solid rgba(0,0,0,.2)",
            borderTopColor: "rgba(0,0,0,.7)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ fontSize: 13, color: "#111827" }}>{text}</span>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
