import React, { useMemo } from "react";
import {
  RightScroller,
  HeaderLayer,
  MonthsRow,
  MonthCell,
  DaysRow,
  DayCellHeader,
  GridRows,
  GridRow,
  DayCell,
  CommentBadge,
  BaselineMark,
} from "../../../style";
import { toLocalDate, isWeekendLocal } from "../utils/date";
import { FiFlag, FiCheckCircle } from "react-icons/fi";

export default function RightGrid({
  days,
  monthSegments,
  monthBgTones,
  rows,
  openPalette,
  baselineColor,
  syncLeftScroll,
  dropIndicatorStyle,
  showTooltip,
  hideTooltip,
  draggingId,
  isBusy,
  onDragOverRow,
  onDropRow,
  scrollerRef,
  DeleteZone,
  completedRowIds = new Set(),
}) {
  const anim = useMemo(
    () => ({
      DURATION: 420,
      STAGGER: 70,
      CELL_H: 37,
    }),
    []
  );

  return (
    <RightScroller ref={scrollerRef} onScroll={syncLeftScroll}>
      <style>{`
        @keyframes rgFill {
          0%   { transform: scaleX(0); opacity: .35; }
          60%  { opacity: .6; }
          100% { transform: scaleX(1); opacity: .45; }
        }
        @keyframes rgPulse {
          0%   { box-shadow: inset 0 0 0 1px rgba(16,185,129,.22); }
          50%  { box-shadow: inset 0 0 0 1px rgba(16,185,129,.38); }
          100% { box-shadow: inset 0 0 0 1px rgba(16,185,129,.22); }
        }
        @keyframes rgShimmer {
          0%   { transform: translateX(-120%); opacity: .0; }
          20%  { opacity: .10; }
          60%  { opacity: .16; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes rgDustRise {
          0%   { transform: translateY(100%) scale(.96); opacity: 0; }
          10%  { opacity: .18; }
          45%  { opacity: .28; }
          80%  { opacity: .12; }
          100% { transform: translateY(-35%) scale(1.06); opacity: 0; }
        }

        .rg-dust {
          position: absolute;
          left: -6%;
          width: 112%;
          height: 37px;
          bottom: 0;
          pointer-events: none;
          z-index: 2;
          filter: saturate(105%);
          animation: rgDustRise 2400ms ease-out infinite;
          mask-image: linear-gradient(to top, rgba(0,0,0,.0) 0%, rgba(0,0,0,.85) 32%, rgba(0,0,0,.92) 58%, rgba(0,0,0,0) 100%);
          background-image:
            radial-gradient(circle at 10% 88%, rgba(5,150,105,.20) 0 2px, rgba(5,150,105,0) 3px),
            radial-gradient(circle at 26% 94%, rgba(16,185,129,.18) 0 2px, rgba(16,185,129,0) 3px),
            radial-gradient(circle at 40% 86%, rgba(16,185,129,.22) 0 1.8px, rgba(16,185,129,0) 3px),
            radial-gradient(circle at 58% 92%, rgba(5,150,105,.18) 0 2.2px, rgba(5,150,105,0) 3px),
            radial-gradient(circle at 74% 84%, rgba(16,185,129,.20) 0 1.6px, rgba(16,185,129,0) 3px),
            radial-gradient(circle at 90% 90%, rgba(16,185,129,.14) 0 2px, rgba(16,185,129,0) 3px);
          background-repeat: no-repeat;
        }
      `}</style>

      <HeaderLayer>
        <MonthsRow>
          {monthSegments.map((m, i) => (
            <MonthCell
              key={m.key}
              style={{ gridColumn: `span ${m.span}` }}
              $bg={monthBgTones[i % monthBgTones.length]}
            >
              {m.label}
            </MonthCell>
          ))}
        </MonthsRow>
        <DaysRow>
          {days.map((d) => (
            <DayCellHeader key={d} $weekend={isWeekendLocal(d)}>
              {toLocalDate(d).getDate()}
            </DayCellHeader>
          ))}
        </DaysRow>
      </HeaderLayer>

      <GridRows>
        {rows.map((r) => {
          const rowCompleted = completedRowIds.has(r.id);

          return (
            <GridRow
              key={r.id}
              style={{
                ...dropIndicatorStyle(r.id),
                position: "relative",
                background: rowCompleted
                  ? "linear-gradient(90deg, rgba(16,185,129,0.10) 0, rgba(16,185,129,0.06) 80px, transparent 240px)"
                  : undefined,
                animation: rowCompleted ? "rgPulse 1600ms ease-in-out infinite" : undefined,
              }}
              draggable={false}
              onDragOver={(e) => onDragOverRow(r.id, e)}
              onDrop={(e) => onDropRow(r.id, e)}
            >
              {rowCompleted && (
                <>
                  <div
                    title="Linha concluída"
                    style={{
                      position: "absolute",
                      left: 6,
                      bottom: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#065f46",
                      opacity: 0.95,
                      pointerEvents: "none",
                      zIndex: 3,
                    }}
                  >
                    <FiCheckCircle size={12} />
                    <span>Linha concluída</span>
                  </div>

                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: "34%",
                      background:
                        "linear-gradient(90deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.22) 35%, rgba(16,185,129,0) 70%)",
                      filter: "blur(1px)",
                      transform: "translateX(-120%)",
                      animation: "rgShimmer 2200ms ease-in-out 200ms infinite",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  />
                </>
              )}

              {days.map((d, i) => {
                const cell = r?.cells?.[d];
                const color = typeof cell === "string" ? cell : cell?.color;
                const completed =
                  typeof cell === "object" ? !!cell?.completed : false;
                const commentsArr = Array.isArray(cell?.comments)
                  ? cell.comments
                  : [];
                let visibleCount = 0;
                for (let k = 0; k < commentsArr.length; k++) {
                  const c = commentsArr[k];
                  if (!c?.deleted) visibleCount += 1;
                }
                let lastComment = null;
                for (let k = commentsArr.length - 1; k >= 0; k--) {
                  const c = commentsArr[k];
                  if (!c?.deleted) {
                    lastComment = c;
                    break;
                  }
                }
                const commentText = lastComment?.message;
                const authorInitial = (lastComment?.authorInitial || "U").toUpperCase();
                const baseline =
                  typeof cell === "object" ? !!cell?.baseline : false;
                const size = baseline && completed ? 12 : 14;

                return (
                  <div
                    key={d}
                    style={{ position: "relative" }}
                    onMouseEnter={(e) => {
                      if (commentText) showTooltip(e, commentText, authorInitial);
                    }}
                    onMouseLeave={hideTooltip}
                  >
                    <DayCell
                      $weekend={isWeekendLocal(d)}
                      $color={color}
                      onClick={(e) => {
                        if (isWeekendLocal(d)) return;
                        openPalette(r.id, d, e, {
                          comments: commentsArr,
                          baseline,
                          completed,
                        });
                      }}
                      title={
                        isWeekendLocal(d)
                          ? "Fim de semana"
                          : "Clique para cor/comentário"
                      }
                    />

                    {rowCompleted && (
                      <>
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            height: `${anim.CELL_H}px`,
                            transformOrigin: "left center",
                            transform: "scaleX(0)",
                            background: "rgba(16,185,129,0.68)",
                            borderRadius: 2,
                            pointerEvents: "none",
                            zIndex: 1,
                            animation: `rgFill ${anim.DURATION}ms ease-out ${i *
                              anim.STAGGER}ms forwards`,
                          }}
                        />
                        <span
                          className="rg-dust"
                          aria-hidden
                          style={{
                            height: `${anim.CELL_H}px`,
                            animationDelay: `${(i % 6) * 120}ms`,
                            bottom: 0,
                          }}
                        />
                      </>
                    )}

                    {visibleCount > 0 && (
                      <CommentBadge style={{ zIndex: 2 }}>
                        {visibleCount}
                      </CommentBadge>
                    )}

                    {baseline && (
                      <BaselineMark
                        $color={baselineColor}
                        title="Marco do plano"
                        style={{ zIndex: 2 }}
                      >
                        <FiFlag size={size} style={{ color: "grey" }} />
                      </BaselineMark>
                    )}

                    {completed && (
                      <span
                        title="Demanda concluída"
                        style={{
                          position: "absolute",
                          right: 2,
                          bottom: 5,
                          width: 18,
                          height: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 4,
                          background: "rgba(16,185,129,0.12)",
                          boxShadow:
                            "inset 0 0 0 1px rgba(16,185,129,0.35)",
                          zIndex: 2,
                        }}
                      >
                        <FiCheckCircle
                          size={size}
                          style={{ color: "#059669", opacity: 0.95 }}
                        />
                      </span>
                    )}
                  </div>
                );
              })}
            </GridRow>
          );
        })}
      </GridRows>

      <DeleteZone draggingId={draggingId} isBusy={isBusy} />
    </RightScroller>
  );
}
