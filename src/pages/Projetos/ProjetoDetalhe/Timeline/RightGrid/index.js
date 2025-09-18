import React from "react";
import {
  RightScroller, HeaderLayer, MonthsRow, MonthCell, DaysRow, DayCellHeader,
  GridRows, GridRow, DayCell, CommentBadge, BaselineMark
} from "../../../style";
import { toLocalDate, isWeekendLocal } from "../utils/date";
import { FiFlag } from "react-icons/fi";

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
}) {
  return (
    <RightScroller ref={scrollerRef} onScroll={syncLeftScroll}>
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
        {rows.map((r) => (
          <GridRow
            key={r.id}
            style={dropIndicatorStyle(r.id)}
            draggable={false}
            onDragOver={(e) => onDragOverRow(r.id, e)}
            onDrop={(e) => onDropRow(r.id, e)}
          >
            {days.map((d) => {
              const cell = r?.cells?.[d];
              const color = typeof cell === "string" ? cell : cell?.color;

              const commentsArr = Array.isArray(cell?.comments) ? cell.comments : [];
              let visibleCount = 0;
              for (let i = 0; i < commentsArr.length; i++) {
                const c = commentsArr[i];
                if (!c?.deleted) visibleCount = visibleCount + 1;
              }

              let lastComment = null;
              for (let i = commentsArr.length - 1; i >= 0; i--) {
                const c = commentsArr[i];
                if (!c?.deleted) { lastComment = c; break; }
              }
              const commentText = lastComment?.message;
              const authorInitial = (lastComment?.authorInitial || "U").toUpperCase();
              const baseline = typeof cell === "object" ? !!cell?.baseline : false;

              return (
                <div
                  key={d}
                  style={{ position: "relative" }}
                  onMouseEnter={(e) => { if (commentText) showTooltip(e, commentText, authorInitial); }}
                  onMouseLeave={hideTooltip}
                >
                  <DayCell
                    $weekend={isWeekendLocal(d)}
                    $color={color}
                    onClick={(e) => {
                      if (isWeekendLocal(d)) return;
                      openPalette(r.id, d, e, { comments: commentsArr, baseline });
                    }}
                    title={isWeekendLocal(d) ? "Fim de semana" : "Clique para cor/comentário"}
                  />
                  {visibleCount > 0 && <CommentBadge>{visibleCount}</CommentBadge>}
                  {baseline && (
                    <BaselineMark $color={baselineColor} title="Marco do plano">
                      <FiFlag size={14} style={{color:"grey"}}/>
                    </BaselineMark>
                  )}
                </div>
              );
            })}
          </GridRow>
        ))}
      </GridRows>

      <DeleteZone draggingId={draggingId} isBusy={isBusy} />
    </RightScroller>
  );
}
