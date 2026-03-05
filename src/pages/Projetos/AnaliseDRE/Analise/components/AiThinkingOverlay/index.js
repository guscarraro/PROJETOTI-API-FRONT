// src/pages/DRE/Analise/components/AiThinkingOverlay/index.js
import React, { useEffect, useMemo, useState } from "react";
import { Overlay, Card, Title, Sub, WaveRow, Pill } from "./style";

export default function AiThinkingOverlay({ active, title, subtitle }) {
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setReverse((p) => !p), 1600);
    return () => clearInterval(t);
  }, [active]);

  const pills = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 11; i++) arr.push(i);
    return arr;
  }, []);

  if (!active) return null;

  return (
    <Overlay>
      <Card>
        <WaveRow className={reverse ? "rev" : ""} aria-hidden="true">
          {pills.map((i) => (
            <Pill key={i} style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </WaveRow>

        <Title>{title || "IA trabalhando…"}</Title>
        <Sub>{subtitle || "Só um instante — tô fazendo a mágica acontecer ✨"}</Sub>
      </Card>
    </Overlay>
  );
}