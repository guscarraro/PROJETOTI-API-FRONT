import React from "react";
import { Row, Field, SmallMuted } from "../../style";
import { Controls, Shots, ShotThumb, Tag } from "../style";
import BenchPhoto from "../BenchPhoto";

export default function SetupPhase({
  conferente,
  setConferente,
  benchShots,
  onBenchCapture,
  onRemoveBenchShot,
  benchAreaRef,
  SKIP_BENCH_PHOTOS,
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <SmallMuted>
          Conferente <span style={{ color: "#ef4444" }}>* obrigatório</span>
        </SmallMuted>
        <Row style={{ marginTop: 6 }}>
          <Field
            style={{ minWidth: 220, maxWidth: 320 }}
            placeholder="Confirme o nome do conferente"
            value={conferente}
            onChange={(e) => setConferente(e.target.value)}
            disabled
          />
        </Row>
      </div>

      {!SKIP_BENCH_PHOTOS && (
        <div ref={benchAreaRef}>
          <SmallMuted>
            Fotos da bancada (mín. 1 e máx. 7){" "}
            <span style={{ color: "#ef4444" }}>* obrigatório</span>
          </SmallMuted>

          <div style={{ marginTop: 8 }}>
            <BenchPhoto onCapture={onBenchCapture} facing="environment" />
          </div>

          {benchShots.length === 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#9a3412" }}>
              Adicione pelo menos <strong>1 foto</strong> para prosseguir.
            </div>
          )}

          {benchShots.length > 0 && (
            <Controls style={{ marginTop: 8 }}>
              <Shots>
                {benchShots.map((img, idx) => (
                  <ShotThumb key={idx}>
                    <img src={img} alt={`bancada ${idx + 1}`} />
                    <Tag>#{idx + 1}</Tag>
                    <button
                      onClick={() => onRemoveBenchShot(idx)}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        background: "rgba(0,0,0,.6)",
                        color: "#fff",
                        border: 0,
                        borderRadius: 8,
                        padding: "2px 8px",
                        cursor: "pointer",
                      }}
                      title="Remover foto"
                    >
                      Remover
                    </button>
                  </ShotThumb>
                ))}
              </Shots>
            </Controls>
          )}
        </div>
      )}
    </div>
  );
}
