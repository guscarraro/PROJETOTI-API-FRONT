import React, { useEffect, useMemo, useRef, useState } from "react";
import { VideoBox, VideoEl, CanvasEl, Banner, Actions, Btn } from "./style";
import apiLocal from "../../../../services/apiLocal";

const SUPPORTED_FORMATS = ["code_128","ean_13","ean_8","upc_a","upc_e","itf","qr_code","codabar"];
const COLOR_OK = "#10b981";
const COLOR_ERR = "#ef4444";
const COLOR_HINT = "rgba(0,0,0,.55)";
const BOX_LINE_W = 3;
const BOX_PAD = 24;
const BOX_PAD_REVIEW = 8;

export default function CameraVideo({ targetItem, onConfirmPhoto }) {
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const photoRef = useRef(null);
  const rafRef = useRef(0);

  const [running, setRunning] = useState(false);
  const [supported, setSupported] = useState(false);
  const [mode, setMode] = useState("live");
  const [frozenImg, setFrozenImg] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewCounts, setReviewCounts] = useState({ okCount: 0, wrongCount: 0, total: 0 });

  const item = useMemo(() => {
    if (!targetItem) return null;
    return {
      cod: String(targetItem.cod || "").trim(),
      bar: String(targetItem.bar || "").trim(),
      qtd: Number(targetItem.qtd || 0),
      scanned: Number(targetItem.scanned || 0),
    };
  }, [targetItem]);

  useEffect(() => {
    if (!item) return;
    let mounted = true;

    async function init() {
      const sup = "BarcodeDetector" in window;
      setSupported(sup);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      }).catch(() => null);

      if (!mounted || !boxRef.current) return;

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        await new Promise(res => {
          videoRef.current.onloadedmetadata = async () => {
            try { await videoRef.current.play(); } catch {}
            res();
          };
        });
      }
      setRunning(true);

      if (!sup) return;
      const detector = new window.BarcodeDetector({ formats: SUPPORTED_FORMATS });

      const loop = async () => {
        if (!mounted) return;
        if (mode !== "live") { rafRef.current = requestAnimationFrame(loop); return; }

        const v = videoRef.current, ctn = boxRef.current, c = overlayRef.current;
        if (!v || !ctn || !c) { rafRef.current = requestAnimationFrame(loop); return; }

        const vw = ctn.clientWidth || 640;
        const vh = ctn.clientHeight || 480;
        const dpr = window.devicePixelRatio || 1;
        if (c.width !== Math.floor(vw*dpr)) c.width = Math.floor(vw*dpr);
        if (c.height !== Math.floor(vh*dpr)) c.height = Math.floor(vh*dpr);
        c.style.width = `${vw}px`; c.style.height = `${vh}px`;

        const ctx = c.getContext("2d");
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr, dpr);
        ctx.clearRect(0,0,vw,vh);
        ctx.font = "bold 14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

        try {
          const dets = v ? await detector.detect(v) : [];
          const ann = [];
          if (Array.isArray(dets) && dets.length) {
            for (let i=0;i<dets.length;i++) {
              const raw = String(dets[i]?.rawValue || "").trim();
              if (!raw) continue;
              const bb = dets[i]?.boundingBox || null;
              const box = bb ? mapVideoBoxToOverlay(bb, v, ctn) : null;
              const match = raw === item.bar;
              ann.push(expandBox({ box, color: match ? COLOR_OK : COLOR_ERR, label: match ? `OK (${item.cod})` : `ERRADO (${raw})`, pad: BOX_PAD }));
            }
          } else {
            ctx.setLineDash([6,6]);
            ctx.strokeStyle = "rgba(255,255,255,.7)";
            const gw = vw*0.72, gh = 120, gx = (vw-gw)/2, gy = (vh-gh)/2;
            ctx.lineWidth = 2; ctx.strokeRect(gx, gy, gw, gh); ctx.setLineDash([]);
            const tip = supported ? "Aproxime os códigos" : "Capture a foto para leitura múltipla";
            const tw = ctx.measureText(tip).width;
            ctx.fillStyle = COLOR_HINT; ctx.fillRect((vw - tw)/2 - 12, gy - 28, tw + 24, 22);
            ctx.fillStyle = "#fff"; ctx.fillText(tip, (vw - tw)/2, gy - 12);
          }
          drawOverlay(ann, []);
        } catch {}
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    }

    init();
    return () => {
      try {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const v = videoRef.current, s = v?.srcObject;
        if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
        if (v) v.srcObject = null;
      } catch {}
      setRunning(false);
      clearOverlay();
    };
  }, [item, mode]);

  // video -> overlay
  function mapVideoBoxToOverlay(bb, videoEl, containerEl) {
    if (!videoEl || !containerEl) return null;
    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 720;
    const cw = containerEl.clientWidth || 640;
    const ch = containerEl.clientHeight || 480;
    const scale = Math.max(cw / vw, ch / vh);
    const dispW = vw * scale, dispH = vh * scale;
    const offsetX = (cw - dispW) / 2, offsetY = (ch - dispH) / 2;
    return { x: offsetX + bb.x * scale, y: offsetY + bb.y * scale, width: bb.width * scale, height: bb.height * scale };
  }

  // ponto da imagem congelada -> overlay
  function mapImagePointToOverlayFromImgEl(pt, imgEl, containerEl) {
    if (!containerEl || !imgEl) return null;
    const imgW = imgEl.naturalWidth, imgH = imgEl.naturalHeight;
    if (!imgW || !imgH) return null;
    const cw = containerEl.clientWidth || 640;
    const ch = containerEl.clientHeight || 480;
    const scale = Math.max(cw / imgW, ch / imgH);
    const dispW = imgW * scale, dispH = imgH * scale;
    const offsetX = (cw - dispW) / 2, offsetY = (ch - dispH) / 2;
    return { x: offsetX + pt.x * scale, y: offsetY + pt.y * scale };
  }

  function expandBox(a) {
    if (!a?.box) return { ...a, x: 20, y: 20, w: 280, h: 96 };
    const pad = a.pad ?? BOX_PAD;
    const x = (a.box.x || 0) - pad;
    const y = (a.box.y || 0) - pad;
    const w = (a.box.width || 0) + pad*2;
    const h = (a.box.height || 0) + pad*2;
    return { ...a, x: Math.max(0,x), y: Math.max(0,y), w: Math.max(60,w), h: Math.max(60,h) };
  }

  function clearOverlay() {
    const c = overlayRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width||0,c.height||0);
  }

  // desenha boxes e/ou polígonos
  function drawOverlay(annBoxes, polys) {
    const ctn = boxRef.current, c = overlayRef.current;
    if (!ctn || !c) return;

    const vw = ctn.clientWidth || 640, vh = ctn.clientHeight || 480;
    const dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.floor(vw*dpr)) c.width = Math.floor(vw*dpr);
    if (c.height !== Math.floor(vh*dpr)) c.height = Math.floor(vh*dpr);
    c.style.width = `${vw}px`; c.style.height = `${vh}px`;

    const ctx = c.getContext("2d");
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,vw,vh);
    ctx.font = "bold 14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

    // polígonos (melhor alinhamento)
    let okSeenPoly = 0;
    const okTotalPoly = polys.filter(p => p.ok).length;
    for (const p of polys) {
      const pts = p.pts;
      if (!pts || pts.length < 3) continue;
      ctx.lineWidth = BOX_LINE_W;
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.stroke();

      // label no topo-esquerdo do polígono
      const minx = Math.min(...pts.map(pt => pt.x));
      const miny = Math.min(...pts.map(pt => pt.y));
      let text = p.ok ? `OK #${(++okSeenPoly)}/${okTotalPoly}` : p.label;
      const tw = ctx.measureText(text).width;
      const lbx = minx, lby = Math.max(0, miny - 26);
      ctx.fillStyle = p.color;
      ctx.fillRect(lbx, lby, tw + 16, 22);
      ctx.fillStyle = "#fff";
      ctx.fillText(text, lbx + 8, lby + 16);
    }

    // fallback: boxes retangulares (se vierem)
    if (annBoxes && annBoxes.length) {
      let okSeen = 0;
      const okTotal = annBoxes.filter(a => a.label.startsWith("OK")).length;
      for (const a of annBoxes) {
        let text = a.label;
        if (text.startsWith("OK")) text = `OK #${(++okSeen)}/${okTotal}`;
        ctx.lineWidth = BOX_LINE_W;
        ctx.strokeStyle = a.color;
        ctx.strokeRect(a.x, a.y, a.w, a.h);
        const tw = ctx.measureText(text).width;
        const lbx = a.x, lby = Math.max(0, a.y - 26);
        ctx.fillStyle = a.color; ctx.fillRect(lbx, lby, tw + 16, 22);
        ctx.fillStyle = "#fff"; ctx.fillText(text, lbx + 8, lby + 16);
      }
    }
  }

  async function decodeSnapshotOnServer(dataUrl) {
    const res = await apiLocal.decodeBarcodes(dataUrl).then(r => r.data).catch(() => null);
    if (!res || !Array.isArray(res.detections)) return { boxes: [], polys: [] };

    const ctn = boxRef.current, imgEl = imgRef.current;
    const boxes = [], polys = [];

    for (const d of res.detections) {
      // mapeia polígono se existir
      if (Array.isArray(d.poly) && d.poly.length >= 3 && ctn && imgEl) {
        const pts = d.poly.map(pt => mapImagePointToOverlayFromImgEl({x: pt.x, y: pt.y}, imgEl, ctn));
        polys.push({
          pts,
          color: d.raw === (item?.bar || "") ? COLOR_OK : COLOR_ERR,
          label: d.raw === (item?.bar || "") ? `OK (${item?.cod})` : `ERRADO (${d.raw})`,
          ok: d.raw === (item?.bar || ""),
        });
      } else if (d.box && ctn && imgEl) {
        // fallback: box
        const scalePt = (x,y,w,h) => {
          const p1 = mapImagePointToOverlayFromImgEl({x, y}, imgEl, ctn);
          const p2 = mapImagePointToOverlayFromImgEl({x:x+w, y:y+h}, imgEl, ctn);
          return { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y };
        };
        const m = scalePt(d.box.x, d.box.y, d.box.w, d.box.h);
        boxes.push({
          ...expandBox({ box: m, pad: BOX_PAD_REVIEW }),
          color: d.raw === (item?.bar || "") ? COLOR_OK : COLOR_ERR,
          label: d.raw === (item?.bar || "") ? `OK (${item?.cod})` : `ERRADO (${d.raw})`,
        });
      }
    }
    return { boxes, polys };
  }

  async function handleSnap() {
    if (!item) return;
    const v = videoRef.current, c = photoRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.92);

    setFrozenImg(data);
    setMode("review");
    stopStream();
    clearOverlay();
    setIsAnalyzing(true);

    const { boxes, polys } = await decodeSnapshotOnServer(data);
    drawOverlay(boxes, polys);

    const okCount = polys.filter(p => p.ok).length || boxes.filter(b => b.label.startsWith("OK")).length;
    const total = polys.length || boxes.length;
    setReviewCounts({ okCount, wrongCount: total - okCount, total });
    setIsAnalyzing(false);
  }

  function stopStream() {
    const v = videoRef.current, s = v?.srcObject;
    if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
    if (v) v.srcObject = null;
    setRunning(false);
  }

  async function handleRetake() {
    setMode("live");
    setFrozenImg("");
    setReviewCounts({ okCount: 0, wrongCount: 0, total: 0 });
    clearOverlay();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    }).catch(() => null);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      await new Promise(res => {
        videoRef.current.onloadedmetadata = async () => {
          try { await videoRef.current.play(); } catch {}
          res();
        };
      });
      setRunning(true);
    }
  }

  function handleConfirmPhoto() {
    if (!onConfirmPhoto) return;
    onConfirmPhoto({
      image: frozenImg,
      okCount: reviewCounts.okCount,
      wrongCount: reviewCounts.wrongCount,
      total: reviewCounts.total
    });
  }

  return (
    <>
      <VideoBox ref={boxRef}>
        {mode === "live" && <VideoEl ref={videoRef} autoPlay playsInline muted style={{ zIndex: 0 }} />}
        {mode === "review" && (
          <img
            ref={imgRef}
            src={frozenImg}
            alt="captura"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
          />
        )}
        <CanvasEl ref={overlayRef} style={{ zIndex: 2 }} />
        {!supported && mode === "live" && <Banner>Leitura automática indisponível. Capture a foto.</Banner>}
        {mode === "review" && isAnalyzing && <Banner>🔎 Analisando…</Banner>}
      </VideoBox>

      <Actions>
        {mode === "live" && <Btn onClick={handleSnap} disabled={!running || !item}>Capturar evidência</Btn>}
        {mode === "review" && (<><Btn onClick={handleRetake} disabled={isAnalyzing}>Refazer</Btn><Btn onClick={handleConfirmPhoto} disabled={isAnalyzing}>Confirmar foto</Btn></>)}
        <canvas ref={photoRef} style={{ display: "none" }} />
      </Actions>
    </>
  );
}
