// src/pages/Projetos/components/NavBar/Notifications/index.js
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { FiBell, FiCheck, FiExternalLink, FiRefreshCw } from "react-icons/fi";
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
  TabsBar,
  TabButton,
} from "./style";
import { Spinner } from "../../Loader";

/* ===== Helpers de HTML seguro (fallback para preview) ===== */
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
  const allowed = new Set([
    "B", "I", "U", "EM", "STRONG", "BR", "P", "DIV", "UL", "OL", "LI", "A",
  ]);
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

/* ===== Utils autor/setor ===== */
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

/* ===== Labels de ação (inclui novas ações do back) ===== */
const ACTION = {
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_STATUS_CHANGED: "PROJECT_STATUS_CHANGED",
  PROJECT_LOCKED: "PROJECT_LOCKED",
  PROJECT_UNLOCKED: "PROJECT_UNLOCKED",
  ROW_ASSIGNED: "ROW_ASSIGNED",
  ROW_COMMENT: "ROW_COMMENT",
  MENTION: "MENTION",
  ROW_STAGE_CHANGED: "ROW_STAGE_CHANGED",
  ROW_SECTORS_CHANGED: "ROW_SECTORS_CHANGED",
  ROW_ASSIGNEE_CHANGED: "ROW_ASSIGNEE_CHANGED",
};

// === Deriva a ação "local" (MENTION_USER x MENTION_SECTOR) a partir do item ===
function localAction(it) {
  const base = String(it?.action || "").toUpperCase();
  if (base !== ACTION.MENTION) return base;

  const p = it?.payload || {};
  const hasUserTarget =
    it?.target_user_id ||
    p.target_user_id ||
    p.user_id ||
    (Array.isArray(p.mention_user_ids) && p.mention_user_ids.length > 0);

  return hasUserTarget ? "MENTION_USER" : "MENTION_SECTOR";
}

const actionLabel = (action) => {
  const a = (action || "").toUpperCase();
  switch (a) {
    case ACTION.PROJECT_CREATED: return "Projeto";
    case ACTION.PROJECT_STATUS_CHANGED: return "Status do projeto";
    case ACTION.PROJECT_LOCKED: return "Projeto bloqueado";
    case ACTION.PROJECT_UNLOCKED: return "Projeto desbloqueado";
    case ACTION.ROW_ASSIGNED: return "Atribuição";
    case ACTION.ROW_ASSIGNEE_CHANGED: return "Responsável";
    case ACTION.ROW_STAGE_CHANGED: return "Etapa";
    case ACTION.ROW_SECTORS_CHANGED: return "Setores";
    case ACTION.ROW_COMMENT: return "Comentário";
    case "MENTION_USER": return "Menção (usuário)";
    case "MENTION_SECTOR": return "Menção (setor)";
    case ACTION.MENTION: return "Menção";
    default: return "Info";
  }
};

const titleFor = (it) => {
  if (it?.title) return it.title;
  const a = localAction(it);
  switch (a) {
      case ACTION.PROJECT_STATUS_CHANGED: return "Status do projeto alterado";
      case ACTION.PROJECT_LOCKED: return "Projeto bloqueado";
      case ACTION.PROJECT_UNLOCKED: return "Projeto desbloqueado";
      case ACTION.ROW_ASSIGNED: return "Linha atribuída";
      case ACTION.ROW_ASSIGNEE_CHANGED: return "Responsável alterado";
      case ACTION.ROW_STAGE_CHANGED: return "Etapa alterada";
      case ACTION.ROW_SECTORS_CHANGED: return "Setores alterados";
      case ACTION.ROW_COMMENT: return "Comentário na linha";
      case "MENTION_USER": return "Você foi mencionado (usuário)";
      case "MENTION_SECTOR": return "Menção ao seu setor";
      case ACTION.MENTION: return "Você foi mencionado";
      case ACTION.PROJECT_CREATED: return "Novo projeto";
    default: return "Atualização";
  }
};

const Notifications = forwardRef(function Notifications(
  { user, onOpenProject, navWidth = 0 },
  ref
) {
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread"); // 'unread' | 'read'

  // contadores / estados
  const [totalUnseen, setTotalUnseen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingRead, setLoadingRead] = useState(false);
  const [working, setWorking] = useState(false);

  // dados por aba
  const [unread, setUnread] = useState([]);
  const [read, setRead] = useState([]);
  const [readLoadedOnce, setReadLoadedOnce] = useState(false);

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  /* =================== POSICIONAMENTO =================== */
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const placePanelInitial = () => {
    const el = triggerRef.current;
    const GAP = 8, MARGIN = 8;
    const vw = window.innerWidth, vh = window.innerHeight;

    let top = 56;
    if (el) {
      const r = el.getBoundingClientRect();
      top = r.bottom + GAP;
    }
    let left = Math.max(MARGIN, navWidth + GAP);

    top = Math.max(MARGIN, Math.min(top, vh - PANEL_HEIGHT - MARGIN));
    left = Math.max(MARGIN, Math.min(left, vw - PANEL_WIDTH - MARGIN));

    setCoords({ top, left });
  };

  const placePanelTopOnly = () => {
    const el = triggerRef.current;
    const GAP = 8, MARGIN = 8;
    const vh = window.innerHeight;

    let top = 56;
    if (el) {
      const r = el.getBoundingClientRect();
      top = r.bottom + GAP;
    }
    top = Math.max(MARGIN, Math.min(top, vh - PANEL_HEIGHT - MARGIN));
    setCoords((prev) => ({ ...prev, top }));
  };

  useEffect(() => {
    if (!open) return;
    placePanelInitial();

    const onScroll = () => placePanelTopOnly();
    window.addEventListener("scroll", onScroll, true);

    const onResize = () => placePanelInitial();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) placePanelInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navWidth, open]);

  // clique fora
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
    const t = setInterval(loadCounters, 120000);
    return () => clearInterval(t);
  }, [userId]);

  // === BUSCA UMA PÁGINA ===
  const fetchPage = async (params) => {
    const r = await apiLocal.getNotifFeed(userId, { limit: 200, ...params });
    const items = r?.data?.items || [];
    const next_before = r?.data?.next_before || null;
    return { items, next_before };
  };

  const loadUnread = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { items } = await fetchPage({ unseenOnly: true });
      setUnread(Array.isArray(items) ? items : []);
    } catch {
      setUnread([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRead = async (force = false) => {
    if (!userId || (readLoadedOnce && !force)) return;
    setLoadingRead(true);
    try {
      const { items } = await fetchPage({ unseenOnly: false });
      const all = Array.isArray(items) ? items : [];
      setRead(all.filter((it) => !!it.seen_at));
      setReadLoadedOnce(true);
    } catch {
      setRead([]);
      setReadLoadedOnce(true);
    } finally {
      setLoadingRead(false);
    }
  };

  /* =================== AÇÕES =================== */
  const openPanel = async () => {
    if (open) return;
    setOpen(true);
    placePanelInitial();
    await Promise.all([loadUnread(), loadRead(true)]);
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

      // move do "Não lidas" -> "Lidas"
      let moved = null;
      setUnread((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        const idx = safe.findIndex(
          (i) => String(i.notification_id) === String(notificationId)
        );
        if (idx >= 0) moved = safe[idx];
        return safe.filter(
          (i) => String(i.notification_id) !== String(notificationId)
        );
      });
      if (moved) setRead((prev) => [moved, ...(Array.isArray(prev) ? prev : [])]);

      setTotalUnseen((n) => Math.max(0, n - 1));
    } catch {
      /* silencioso */
    } finally {
      setWorking(false);
    }
  };

  const markAllSeen = async () => {
    const list = Array.isArray(unread) ? unread : [];
    if (!userId || list.length === 0) return;
    setWorking(true);
    try {
      const ids = list.map((i) => String(i.notification_id));
      await apiLocal.markNotifsSeen(userId, ids);
      setRead((prev) => [...list, ...(Array.isArray(prev) ? prev : [])]);
      setUnread([]);
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
      // 1) marca como visto por projeto no back

      // 2) atualiza localmente: move todas UNREAD do projeto p/ READ
      let moved = [];
      setUnread((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        const keep = [];
        for (const it of safe) {
          if (String(it.project_id) === String(projectId)) moved.push(it);
          else keep.push(it);
        }
        return keep;
      });
      if (moved.length > 0) {
        setRead((prev) => [...moved, ...(Array.isArray(prev) ? prev : [])]);
        setTotalUnseen((n) => Math.max(0, n - moved.length));
      }

      // 3) navega
      onOpenProject?.(projectId);
    } finally {
      setWorking(false);
      setOpen(false);
    }
  };

  /* =================== LABELS =================== */
  const timeStr = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  /* ====== Agrupamento por tipo (inclui menções separadas) ====== */
  const currentList = activeTab === "unread" ? (Array.isArray(unread) ? unread : []) : (Array.isArray(read) ? read : []);

  const groups = {
    MENTION_USER: [],
    MENTION_SECTOR: [],
    PROJECT_STATUS_CHANGED: [],
    PROJECT_LOCKED: [],
    PROJECT_UNLOCKED: [],
    ROW_ASSIGNED: [],
    ROW_ASSIGNEE_CHANGED: [],
    ROW_STAGE_CHANGED: [],
    ROW_SECTORS_CHANGED: [],
    ROW_COMMENT: [],
    PROJECT_CREATED: [],
    OTHER: [],
  };
  for (const it of currentList) {
    const a = localAction(it);
    if (Object.prototype.hasOwnProperty.call(groups, a)) groups[a].push(it);
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
    const a = localAction(it);
    const author = getAuthorName(it);
    const sector = getSectorName(it);
    const creatorSector = getCreatorSector(it);

    if (a === "MENTION_USER" || a === "MENTION_SECTOR") {
      if (author || sector) {
        return (
          <ItemMeta>
            {author ? <>Autor: <strong>{author}</strong></> : null}
            {sector ? <> {" "}• Setor: <strong>{sector}</strong></> : null}
          </ItemMeta>
        );
      }
    } else if (a === ACTION.PROJECT_CREATED) {
      if (creatorSector || author) {
        return (
          <ItemMeta>
            {creatorSector ? <>Setor criador: <strong>{creatorSector}</strong></> : null}
            {author ? <> {" "}• Autor: <strong>{author}</strong></> : null}
          </ItemMeta>
        );
      }
    } else {
      if (author || sector) {
        return (
          <ItemMeta>
            {author ? <>Autor: <strong>{author}</strong></> : null}
            {sector ? <> {" "}• Setor: <strong>{sector}</strong></> : null}
          </ItemMeta>
        );
      }
    }
    return null;
  };

  const renderItem = (it) => {
    // Se o back já retorna message_html (saneado), priorize-o
    const html = String(it?.message_html || "").trim();
    const safePreview = html
      ? html
      : buildSafeHtmlFromMessage(it.message_preview || "");

    const act = localAction(it);

    return (
      <SubCard key={String(it.notification_id)}>
        <ItemMain>
          <RowTop>
            <ItemTitle>{titleFor(it)}</ItemTitle>
            <ActionPill $variant={act}>
              {actionLabel(act)}
            </ActionPill>
          </RowTop>

          {renderAuthorSector(it)}

          {it.project_name && (
            <ItemMeta>
              Projeto: <strong>{it.project_name}</strong>
              {it.row_title ? <> — <em>{it.row_title}</em></> : null}
            </ItemMeta>
          )}

          {!!safePreview && (
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

          {activeTab === "unread" && (
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
          )}
        </ActionsCol>
      </SubCard>
    );
  };

  /* =================== RENDER =================== */
  const renderGroups = () => {
    const list = currentList || [];
    const empty = list.length === 0;
    const isLoading = activeTab === "unread" ? loading : loadingRead;

    if (isLoading && empty) {
      return (
        <div style={{ padding: 16, fontSize: 13, opacity: 0.85 }}>
          <Spinner size={16} /> <span style={{ marginLeft: 8 }}>Carregando…</span>
        </div>
      );
    }
    if (empty) {
      return (
        <div style={{ padding: 16, fontSize: 13, opacity: 0.85 }}>
          {activeTab === "unread" ? "Sem novas notificações." : "Sem notificações lidas."}
        </div>
      );
    }

    return (
      <>
        {(groups.MENTION_USER || []).length > 0 && (
          <>
            <SectionTitle>Menções a usuários</SectionTitle>
            <List>{groups.MENTION_USER.map(renderItem)}</List>
          </>
        )}
        {(groups.MENTION_SECTOR || []).length > 0 && (
          <>
            <SectionTitle>Menções a setores</SectionTitle>
            <List>{groups.MENTION_SECTOR.map(renderItem)}</List>
          </>
        )}

        {(groups.PROJECT_STATUS_CHANGED || []).length > 0 && (
          <>
            <SectionTitle>Status do projeto</SectionTitle>
            <List>{groups.PROJECT_STATUS_CHANGED.map(renderItem)}</List>
          </>
        )}
        {((groups.PROJECT_LOCKED || []).length > 0 || (groups.PROJECT_UNLOCKED || []).length > 0) && (
          <>
            <SectionTitle>Bloqueios</SectionTitle>
            <List>
              {groups.PROJECT_LOCKED.map(renderItem)}
              {groups.PROJECT_UNLOCKED.map(renderItem)}
            </List>
          </>
        )}
        {(groups.ROW_ASSIGNED || []).length > 0 && (
          <>
            <SectionTitle>Atribuições</SectionTitle>
            <List>{groups.ROW_ASSIGNED.map(renderItem)}</List>
          </>
        )}
        {(groups.ROW_ASSIGNEE_CHANGED || []).length > 0 && (
          <>
            <SectionTitle>Responsável</SectionTitle>
            <List>{groups.ROW_ASSIGNEE_CHANGED.map(renderItem)}</List>
          </>
        )}
        {(groups.ROW_STAGE_CHANGED || []).length > 0 && (
          <>
            <SectionTitle>Etapas</SectionTitle>
            <List>{groups.ROW_STAGE_CHANGED.map(renderItem)}</List>
          </>
        )}
        {(groups.ROW_SECTORS_CHANGED || []).length > 0 && (
          <>
            <SectionTitle>Setores</SectionTitle>
            <List>{groups.ROW_SECTORS_CHANGED.map(renderItem)}</List>
          </>
        )}
        {(groups.ROW_COMMENT || []).length > 0 && (
          <>
            <SectionTitle>Comentários</SectionTitle>
            <List>{groups.ROW_COMMENT.map(renderItem)}</List>
          </>
        )}
        {(groups.OTHER || []).length > 0 && (
          <>
            <SectionTitle>Outros</SectionTitle>
            <List>{groups.OTHER.map(renderItem)}</List>
          </>
        )}
                {(groups.PROJECT_CREATED || []).length > 0 && (
          <>
            <SectionTitle>Novos projetos</SectionTitle>
            <List>{groups.PROJECT_CREATED.map(renderItem)}</List>
          </>
        )}
      </>
    );
  };

  const panel = !open
    ? null
    : createPortal(
        <Panel ref={panelRef} style={{ top: coords.top, left: coords.left }}>
          <TabsBar>
            <TabButton
              type="button"
              $active={activeTab === "unread"}
              onClick={async () => setActiveTab("unread")}
            >
              Não lidas {totalUnseen > 0 ? `(${totalUnseen})` : ""}
            </TabButton>

            <TabButton
              type="button"
              $active={activeTab === "read"}
              onClick={async () => {
                setActiveTab("read");
                if (!readLoadedOnce) await loadRead(true);
              }}
            >
              Lidas {Array.isArray(read) && read.length > 0 ? `(${read.length})` : ""}
            </TabButton>
          </TabsBar>

          <Header>
            <HeaderActions>
              {activeTab === "unread" && (Array.isArray(unread) && unread.length > 0) && (
                <TinyButton onClick={markAllSeen} disabled={working || loading}>
                  {working ? <Spinner size={14} /> : "Marcar todos como lidos"}
                </TinyButton>
              )}

              <TinyButton
                onClick={async () => {
                  if (activeTab === "unread") {
                    await loadUnread();
                  } else {
                    await loadRead(true);
                  }
                }}
                disabled={activeTab === "unread" ? loading : loadingRead}
                title="Atualizar"
                aria-label="Atualizar"
              >
                {(activeTab === "unread" ? loading : loadingRead) ? (
                  <Spinner size={14} />
                ) : (
                  <FiRefreshCw aria-label="Atualizar" />
                )}
              </TinyButton>
            </HeaderActions>
          </Header>

          {renderGroups()}
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
