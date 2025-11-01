import React, { useEffect, useRef, useState } from "react";
import { VideoBox, VideoEl, Actions, Btn } from "../CameraVideo/style";

export default function BenchPhoto({ onCapture, facing = "user" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      }).catch(() => null);

      if (!active) return;
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setRunning(true);
      }
    })();

    return () => {
      active = false;
      const s = videoRef.current?.srcObject;
      if (s && s.getTracks) s.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setRunning(false);
    };
  }, [facing]);

  function handleShot() {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.9);
    if (onCapture) onCapture(data);
  }

  return (
    <>
      <VideoBox style={{ maxWidth: 980 }}>
        <VideoEl ref={videoRef} autoPlay playsInline muted />
      </VideoBox>
      <Actions style={{ marginTop: 8 }}>
        <Btn onClick={handleShot} disabled={!running}>Capturar foto da bancada</Btn>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Actions>
    </>
  );
}
