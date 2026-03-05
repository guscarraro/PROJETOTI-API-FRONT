import React, { useEffect, useMemo, useRef } from "react";
import { Overlay, Card, Title, Sub, CanvasWrap } from "./style";
import { FiCpu } from "react-icons/fi";

function clamp(n, a, b) {
  if (n < a) return a;
  if (n > b) return b;
  return n;
}

export default function AiSiriOverlay({ active, title, subtitle }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  // “bolhas” que viram um fluido luminoso (Siri vibes)
  const blobs = useMemo(() => {
    const arr = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      arr.push({
        phase: Math.random() * Math.PI * 2,
        speed: 0.45 + Math.random() * 0.65,
        r: 48 + Math.random() * 58,
        ampX: 90 + Math.random() * 90,
        ampY: 34 + Math.random() * 40,
        hue: 195 + Math.random() * 120, // azul → roxo → verde
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      tRef.current += 0.016;
      const t = tRef.current;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // fundo transparente (overlay já tem o “glass”)
      ctx.clearRect(0, 0, w, h);

      // brilho difuso no centro
      const cx = w * 0.5;
      const cy = h * 0.5;

      // camada 1: “neon fog”
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(14px)";

      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const local = t * b.speed + b.phase;

        // movimento orgânico
        const x = cx + Math.sin(local) * b.ampX + Math.sin(local * 0.7) * 26;
        const y = cy + Math.cos(local * 1.05) * b.ampY + Math.sin(local * 0.9) * 14;

        const rr = b.r + Math.sin(local * 1.2) * 10;
        const alpha = 0.36 + (Math.sin(local * 1.1) + 1) * 0.12;

        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, `hsla(${b.hue}, 92%, 62%, ${alpha})`);
        g.addColorStop(0.55, `hsla(${b.hue + 20}, 92%, 56%, ${alpha * 0.55})`);
        g.addColorStop(1, `hsla(${b.hue + 40}, 92%, 52%, 0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // camada 2: “core” mais definido
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.filter = "blur(3px)";

      const pulse = 0.55 + (Math.sin(t * 1.8) + 1) * 0.12;
      const coreR = clamp(Math.min(w, h) * 0.18 * pulse, 54, 120);

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, "rgba(255,255,255,0.85)");
      core.addColorStop(0.25, "rgba(147,197,253,0.55)");
      core.addColorStop(0.55, "rgba(167,139,250,0.35)");
      core.addColorStop(1, "rgba(52,211,153,0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, blobs]);

  if (!active) return null;

  return (
    <Overlay>
      <Card>
        <CanvasWrap>
          <canvas ref={canvasRef} />
        </CanvasWrap>

        <Title>
          <FiCpu /> {title || "IA analisando seu DRE…"}
        </Title>
        <Sub>{subtitle || "Processando divergências, duplicidades e classificação de setor"}</Sub>
      </Card>
    </Overlay>
  );
}