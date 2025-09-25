// src/pages/Projetos/components/NavBar/Notifications/index.js
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { FiBell, FiCheck, FiExternalLink } from "react-icons/fi";
import apiLocal from "../../../../../services/apiLocal";
import {
  PANEL_WIDTH,
  PANEL_HEIGHT,
  Panel,
  Container,
  BellButton,
  Badge,
  Header,
  HeaderActions,
  TinyButton,
  List,
  SubCard,
  ItemMain,
  RowTop,
  ItemTitle,
  ActionPill,
  ItemMeta,
  ItemTime,
  ActionsCol,
  IconButton,
  RichHtml,
} from "./style";
import { Spinner } from "../../Loader";

/* Helpers de HTML seguro */
function decodeEntities(input) {
  const doc = new DOMParser().parseFromString(String(input || ""), "text/html");
  return doc.documentElement.textContent || "";
}
function stripDataUrls(html) {
  return String(html || "")
    .replace(/(?:^|[\s,])data:(?:image|application)\/[^"'\s)]+/gi, "")
    .trim();
}
function sanitizeBasicHtml(dirty) {
  const allowed = new Set(["B", "I", "U", "EM", "STRONG", "BR", "P", "DIV", "UL", "OL", "LI", "A"]);
  const doc = new DOMParser().parseFromString(dirty, "text/html");
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 1) {
        const tag = child.tagName.toUpperCase();
        if (!allowed.has(tag)) {
          const text = doc.createTextNode(child.textContent || "");
          child.replaceWith(text);
        } else {
          [...child.attributes].forEach((attr) => {
            const n = attr.name.toLowerCase();
            const v = attr.value || "";
            if (tag === "A" && n === "href") {
              const safe = /^https?:\/\//i.test(v);
              if (!safe) child.removeAttribute(attr.name);
            } else {
              child.removeAttribute(attr.name);
            }
          });
          walk(child);
        }
      } else if (child.nodeType === 8) {
        child.remove();
      }
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
function buildSafeHtmlFromMessage(raw) {
  const decoded = decodeEntities(raw);
  const cut = stripDataUrls(decoded);
  const needsBR = !/[<>]/.test(cut);
  const br = needsBR ? cut.replace(/(\r\n|\n|\r)/g, "<br/>") : cut;
  return sanitizeBasicHtml(br);
}

/* ====== Utils para autor/setor (tentam vários campos possíveis) ====== */
function getAuthorName(it) {
  return (
    it?.author_name ||
    it?.author ||
    it?.created_by_name ||
    it?.user_name ||
    it?.mention_by_name ||
    it?.commented_by_name ||
    it?.assigned_by_name ||
    ""
  );
}
function getSectorName(it) {
  return (
    it?.author_sector ||
    it?.sector_name ||
    it?.sector ||
    it?.mention_by_sector ||
    it?.project_sector_name ||
    it?.origin_sector_name ||
    (Array.isArray(it?.sectors) ? it.sectors[0] : "") ||
    ""
  );
}
function getCreatorSector(it) {
  return it?.project_sector_name || it?.origin_sector_name || getSectorName(it) || "";
}

const Notifications = forwardRef(function Notifications(
  { user, onOpenProject, navWidth = 0 }, // navWidth vem da NavBar
  ref
) {
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [totalUnseen, setTotalUnseen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [feed, setFeed] = useState([]);

  const triggerRef = useRef(null); // ancora visual (sino) usada para calcular top
  const panelRef = useRef(null);

  /* =================== POSICIONAMENTO =================== */
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // calcula top/left (usado ao abrir e quando a navbar muda de largura)
  const placePanelInitial = () => {
    const el = triggerRef.current;
    const GAP = 8,
      MARGIN = 8;
    const vw = window.innerWidth,
      vh = window.innerHeight;

    // top segue o sino
    let top = 56;
    if (el) {
      const r = el.getBoundingClientRect();
      top = r.bottom + GAP;
    }

    // left travado pela largura atual da navbar
    let left = Math.max(MARGIN, navWidth + GAP);

    // limites viewport
    top = Math.max(MARGIN, Math.min(top, vh - PANEL_HEIGHT - MARGIN));
    left = Math.max(MARGIN, Math.min(left, vw - PANEL_WIDTH - MARGIN));

    setCoords({ top, left });
  };

  // atualiza somente o TOP (para não "saltar" lateralmente no scroll)
  const placePanelTopOnly = () => {
    const el = triggerRef.current;
    const GAP = 8,
      MARGIN = 8;
    const vh = window.innerHeight;

    let top = 56;
    if (el) {
      const r = el.getBoundingClientRect();
      top = r.bottom + GAP;
    }
    top = Math.max(MARGIN, Math.min(top, vh - PANEL_HEIGHT - MARGIN));

    setCoords((prev) => ({ ...prev, top }));
  };

  /* =================== LISTENERS =================== */
  // reposiciona ao abrir
  useEffect(() => {
    if (!open) return;

    // ao abrir: fixa left e top
    placePanelInitial();

    // scroll: mexe só no top
    const onScroll = () => placePanelTopOnly();
    window.addEventListener("scroll", onScroll, true);

    // resize: recalcula ambos (layout pode mudar)
    const onResize = () => placePanelInitial();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // se a largura da navbar mudar, re-fixa left/top
  useEffect(() => {
    if (open) placePanelInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navWidth, open]);

  // clique fora para fechar
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      const panel = panelRef.current;
      const t = e.target;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      if (panel && panel.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  /* =================== DADOS =================== */
  const loadCounters = async () => {
    if (!userId) return;
    try {
      const r = await apiLocal.getNotifCounters(userId);
      const total = Number(r?.data?.total_unseen || 0);
      setTotalUnseen(Number.isFinite(total) ? total : 0);
    } catch {
      setTotalUnseen(0);
    }
  };
  useEffect(() => {
    loadCounters();
    const t = setInterval(loadCounters, 30000);
    return () => clearInterval(t);
  }, [userId]);

  const loadFeed = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let before = undefined;
      const all = [];
      do {
        const r = await apiLocal.getNotifFeed(userId, {
          unseenOnly: true,
          limit: 200,
          ...(before ? { before } : {}),
        });
        const items = r?.data?.items || [];
        const cursor = r?.data?.next_before || null;
        all.push(...items);
        before = cursor || undefined;
      } while (before);
      setFeed(all);
    } catch {
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  /* =================== AÇÕES =================== */
  const openPanel = async () => {
    if (open) return;
    setOpen(true);
    placePanelInitial();
    await loadFeed();
  };
  const closePanel = () => setOpen(false);
  const togglePanel = async () => {
    if (open) closePanel();
    else await openPanel();
  };

  useImperativeHandle(ref, () => ({
    open: openPanel,
    close: closePanel,
    toggle: togglePanel,
  }));

  const onBellClick = async (e) => {
    e.stopPropagation();
    await togglePanel();
  };

  const markOneSeen = async (notificationId) => {
    if (!userId || !notificationId) return;
    setWorking(true);
    try {
      await apiLocal.markNotifsSeen(userId, [notificationId]);
      setFeed((prev) =>
        prev.filter((i) => String(i.notification_id) !== String(notificationId))
      );
      setTotalUnseen((n) => Math.max(0, n - 1));
    } catch {
      /* silencioso */
    } finally {
      setWorking(false);
    }
  };

  const markAllSeen = async () => {
    if (!userId || feed.length === 0) return;
    setWorking(true);
    try {
      const ids = feed.map((i) => String(i.notification_id));
      await apiLocal.markNotifsSeen(userId, ids);
      setFeed([]);
      setTotalUnseen(0);
    } catch {
      /* silencioso */
    } finally {
      setWorking(false);
    }
  };

  const openProject = async (projectId) => {
    setWorking(true);
    try {
      onOpenProject?.(projectId);
    } finally {
      setWorking(false);
      setOpen(false);
    }
  };

  /* =================== LABELS =================== */
  const titleFor = (it) => {
    if (it?.title) return it.title;
    const a = (it?.action || "").toUpperCase();
    if (a === "PROJECT_CREATED") return "Novo projeto";
    if (a === "ROW_ASSIGNED") return "Linha atribuída";
    if (a === "ROW_COMMENT") return "Comentário na linha";
    if (a === "MENTION") return "Você foi mencionado";
    return "Atualização";
  };
  const actionLabel = (action) => {
    const a = (action || "").toUpperCase();
    if (a === "PROJECT_CREATED") return "Projeto";
    if (a === "ROW_ASSIGNED") return "Atribuição";
    if (a === "ROW_COMMENT") return "Comentário";
    if (a === "MENTION") return "Menção";
    return "Info";
  };
  const timeStr = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  /* ====== Agrupamento por tipo ====== */
  const groups = {
    MENTION: [],
    PROJECT_CREATED: [],
    ROW_ASSIGNED: [],
    ROW_COMMENT: [],
    OTHER: [],
  };
  for (const it of feed) {
    const a = String(it.action || "").toUpperCase();
    if (a === "MENTION") groups.MENTION.push(it);
    else if (a === "PROJECT_CREATED") groups.PROJECT_CREATED.push(it);
    else if (a === "ROW_ASSIGNED") groups.ROW_ASSIGNED.push(it);
    else if (a === "ROW_COMMENT") groups.ROW_COMMENT.push(it);
    else groups.OTHER.push(it);
  }

  const SectionTitle = ({ children }) => (
    <div
      style={{
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "var(--muted)",
        padding: "6px 12px",
        borderTop: "1px dashed var(--soft-outline)",
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );

  /* =================== ITEM =================== */
  const renderAuthorSector = (it) => {
    const a = (it?.action || "").toUpperCase();
    const author = getAuthorName(it);
    const sector = getSectorName(it);
    const creatorSector = getCreatorSector(it);

    // frase por tipo (quando disponível)
    if (a === "MENTION") {
      // quem mencionou e de qual setor
      if (author || sector) {
        return (
          <ItemMeta>
            {author ? <>Autor: <strong>{author}</strong></> : null}
            {sector ? <> • Setor: <strong>{sector}</strong></> : null}
          </ItemMeta>
        );
      }
    } else if (a === "PROJECT_CREATED") {
      if (creatorSector || author) {
        return (
          <ItemMeta>
            {creatorSector ? <>Setor criador: <strong>{creatorSector}</strong></> : null}
            {author ? <> • Autor: <strong>{author}</strong></> : null}
          </ItemMeta>
        );
      }
    } else {
      // comentários/atribuições/outros
      if (author || sector) {
        return (
          <ItemMeta>
            {author ? <>Autor: <strong>{author}</strong></> : null}
            {sector ? <> • Setor: <strong>{sector}</strong></> : null}
          </ItemMeta>
        );
      }
    }
    return null;
  };

  const renderItem = (it) => {
    const safePreview = buildSafeHtmlFromMessage(it.message_preview || "");
    return (
      <SubCard key={String(it.notification_id)}>
        <ItemMain>
          <RowTop>
            <ItemTitle>{titleFor(it)}</ItemTitle>
            <ActionPill $variant={(it.action || "").toUpperCase()}>
              {actionLabel(it.action)}
            </ActionPill>
          </RowTop>

          {/* autor / setor */}
          {renderAuthorSector(it)}

          {/* projeto / linha */}
          {it.project_name && (
            <ItemMeta>
              Projeto: <strong>{it.project_name}</strong>
              {it.row_title ? (
                <>
                  {" "}
                  — <em>{it.row_title}</em>
                </>
              ) : null}
            </ItemMeta>
          )}

          {!!(it.message_preview || "").trim() && (
            <RichHtml dangerouslySetInnerHTML={{ __html: safePreview }} />
          )}

          <ItemTime>{timeStr(it.delivered_at || it.created_at)}</ItemTime>
        </ItemMain>

        <ActionsCol>
          <IconButton
            title="Abrir projeto"
            aria-label="Abrir projeto"
            onClick={() => openProject(it.project_id)}
            style={{
              "--button-bg-hover": "rgba(59,130,246,.15)",
              "--button-border-hover": "rgba(59,130,246,.45)",
            }}
          >
            <FiExternalLink />
          </IconButton>

          <IconButton
            title="Marcar como lida"
            aria-label="Marcar como lida"
            onClick={() => markOneSeen(it.notification_id)}
            style={{
              "--button-bg-hover": "rgba(34,197,94,.15)",
              "--button-border-hover": "rgba(34,197,94,.45)",
            }}
          >
            <FiCheck />
          </IconButton>
        </ActionsCol>
      </SubCard>
    );
  };

  /* =================== RENDER =================== */
  const panel = !open
    ? null
    : createPortal(
        <Panel ref={panelRef} style={{ top: coords.top, left: coords.left }}>
          <Header>
            <strong>Notificações</strong>
            <HeaderActions>
              <TinyButton onClick={loadFeed} disabled={loading}>
                {loading ? <Spinner size={14} /> : "Atualizar"}
              </TinyButton>
              {feed.length > 0 && (
                <TinyButton onClick={markAllSeen} disabled={working || loading}>
                  {working ? <Spinner size={14} /> : "Marcar todos como lidos"}
                </TinyButton>
              )}
            </HeaderActions>
          </Header>

          {loading && feed.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, opacity: 0.85 }}>
              <Spinner size={16} /> <span style={{ marginLeft: 8 }}>Carregando…</span>
            </div>
          ) : feed.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, opacity: 0.85 }}>
              Sem novas notificações.
            </div>
          ) : (
            <>
              {groups.MENTION.length > 0 && (
                <>
                  <SectionTitle>Menções</SectionTitle>
                  <List>{groups.MENTION.map(renderItem)}</List>
                </>
              )}
              {groups.PROJECT_CREATED.length > 0 && (
                <>
                  <SectionTitle>Novos projetos</SectionTitle>
                  <List>{groups.PROJECT_CREATED.map(renderItem)}</List>
                </>
              )}
              {groups.ROW_ASSIGNED.length > 0 && (
                <>
                  <SectionTitle>Atribuições</SectionTitle>
                  <List>{groups.ROW_ASSIGNED.map(renderItem)}</List>
                </>
              )}
              {groups.ROW_COMMENT.length > 0 && (
                <>
                  <SectionTitle>Comentários</SectionTitle>
                  <List>{groups.ROW_COMMENT.map(renderItem)}</List>
                </>
              )}
              {groups.OTHER.length > 0 && (
                <>
                  <SectionTitle>Outros</SectionTitle>
                  <List>{groups.OTHER.map(renderItem)}</List>
                </>
              )}
            </>
          )}
        </Panel>,
        document.body
      );

  return (
    <Container ref={triggerRef} onClick={(e) => e.stopPropagation()}>
      <BellButton onClick={onBellClick} title="Notificações" aria-label="Notificações">
        <FiBell />
        {totalUnseen > 0 && <Badge>{totalUnseen > 99 ? "99+" : totalUnseen}</Badge>}
      </BellButton>
      {panel}
    </Container>
  );
});

export default Notifications;
