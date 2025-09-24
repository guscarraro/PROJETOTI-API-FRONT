import React, { useMemo } from "react";
import * as XLSX from "xlsx"; // <-- ADD
import { parseMessageParts } from "../PaletteMenu/utils";
import {
  Backdrop,
  Card,
  Header,
  Title,
  Body,
  GroupBlock,
  GroupTitle,
  GroupDivider,
  RowHeader,
  Bubble,
  BubbleHeader,
  Dot,
  RichHtml,
  AttachInfo,
  Footer,
  Btn,
} from "./style";

// --------- helpers ----------
function formatDayBR(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}
function formatTimeBR(iso) {
  if (!iso) return "";
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "";
  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
// remove dataURL dos textos (mesma ideia do Tooltip)
function extractHtmlFromMessage(msg) {
  const s = String(msg || "");
  const m = /(?:^|[, \n\r])data:(?:image|application)\//.exec(s);
  if (!m) return s.trim();
  const dataStart = m.index + m[0].indexOf("data:");
  return s.slice(0, dataStart).trim();
}

// <-- ADD
const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, "")
    .trim();

// <-- ADD
const buildExportRows = (items) =>
  items.map((it) => {
    const raw = String(it.message || "");
    const parts = parseMessageParts(raw);
    const hasAttachment =
      (parts.images?.length || 0) +
        (parts.pdfs?.length || 0) +
        (parts.sheets?.length || 0) >
      0;

    const html = extractHtmlFromMessage(raw);
    const plain = stripHtml(html);

    return {
      Demanda: it.rowTitle || "Atividade",
      "Dia da célula": formatDayBR(it.dayISO),
      "Horário do comentário": `${formatDayBR(
        it.created_at?.slice(0, 10)
      )} ${formatTimeBR(it.created_at)}`,

      Comentário: plain,
      Anexo: hasAttachment ? "Sim" : "",
    };
  });

// <-- ADD
const exportToXlsx = (items) => {
  const rows = buildExportRows(items);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 40 }, // Demanda
    { wch: 14 }, // Dia da célula
    { wch: 18 }, // Horário do comentário
    { wch: 80 }, // Comentário
    { wch: 10 }, // Anexo
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Meus Comentários");
  const name = `meus_comentarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
};

export default function ModalDetalheComment({
  isOpen,
  onClose,
  items = [], // [{id,rowId,rowTitle,dayISO,created_at,message,authorInitial,sector_id}]
  onJumpToCell, // (rowId, dayISO) => void
}) {
  // 1) agrupa por rowId
  // 2) ordena os itens de cada grupo: created_at desc
  // 3) ordena os grupos pela data mais recente do grupo
  const groups = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const key = it.rowId || "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }
    const arr = Array.from(map.entries()).map(([rowId, arr]) => {
      const sorted = arr
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const rowTitle = sorted[0]?.rowTitle || "Atividade";
      const newest = sorted[0]?.created_at || "";
      return { rowId, rowTitle, items: sorted, newest };
    });
    arr.sort((a, b) => new Date(b.newest) - new Date(a.newest));
    return arr;
  }, [items]);

  if (!isOpen) return null;

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Meus comentários ({items.length})</Title>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn $kind="primary" onClick={() => exportToXlsx(items)}>
              Exportar Excel
            </Btn>
          </div>
        </Header>

        <Body>
          {groups.length === 0 && (
            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Sem comentários do seu setor neste projeto.
            </div>
          )}

          {groups.map((g, idx) => (
            <GroupBlock key={g.rowId}>
              <GroupTitle title={g.rowTitle}><span>Demanda: </span>{g.rowTitle}</GroupTitle>

              {g.items.map((it) => {
                const raw = String(it.message || "");
                const parts = parseMessageParts(raw);
                const html = extractHtmlFromMessage(raw);
                const htmlWithBR = html.replace(/(\r\n|\n|\r)/g, "<br/>");

                const imgCount = parts.images?.length || 0;
                const pdfCount = parts.pdfs?.length || 0;
                const xlsCount = parts.sheets?.length || 0;

                return (
                  <div key={it.id} style={{ marginBottom: 12 }}>
                    <RowHeader>
                      Coluna do dia: <strong>{formatDayBR(it.dayISO)}</strong>
                    </RowHeader>

                    <Bubble
                      onClick={() => onJumpToCell?.(it.rowId, it.dayISO)}
                      title="Abrir no quadro"
                    >
                      <BubbleHeader>
                        <Dot>{(it.authorInitial || "U").toUpperCase()}</Dot>
                        <div>
                          <span style={{ fontWeight: 700 }}>Comentário</span>{" "}
                          <span style={{ opacity: 0.75 }}>
                            •{" "}
                            {formatDayBR(
                              it.created_at?.slice(0, 10) || it.dayISO
                            )}{" "}
                            às {formatTimeBR(it.created_at)}
                          </span>
                        </div>
                      </BubbleHeader>

                      {html && (
                        <RichHtml
                          dangerouslySetInnerHTML={{ __html: htmlWithBR }}
                        />
                      )}

                      {(imgCount > 0 || pdfCount > 0 || xlsCount > 0) && (
                        <AttachInfo>
                          {imgCount > 0 && (
                            <div>
                              + {imgCount} {imgCount > 1 ? "imagens" : "imagem"}{" "}
                              anexada{imgCount > 1 ? "s" : ""}
                            </div>
                          )}
                          {pdfCount > 0 && (
                            <div>
                              + {pdfCount} {pdfCount > 1 ? "PDFs" : "PDF"}{" "}
                              anexado{pdfCount > 1 ? "s" : ""}
                            </div>
                          )}
                          {xlsCount > 0 && (
                            <div>
                              + {xlsCount}{" "}
                              {xlsCount > 1 ? "planilhas" : "planilha"} anexada
                              {xlsCount > 1 ? "s" : ""}
                            </div>
                          )}
                        </AttachInfo>
                      )}
                    </Bubble>
                  </div>
                );
              })}

              {idx < groups.length - 1 && <GroupDivider />}
            </GroupBlock>
          ))}
        </Body>

        <Footer>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Clique em um comentário para abrir a célula no painel.
          </div>
          <Btn onClick={onClose}>Fechar</Btn>
        </Footer>
      </Card>
    </Backdrop>
  );
}
