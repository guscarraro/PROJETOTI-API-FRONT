import React from "react";

export default function InlineSpinner({ size = 14 }) {
  const s = {
    width: size,
    height: size,
    border: `${Math.max(2, Math.round(size / 7))}px solid rgba(0,0,0,.15)`,
    borderTopColor: "rgba(0,0,0,.6)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  };
  return (
    <span
      style={{
        display: "inline-block",
        ...s,
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
