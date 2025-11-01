import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "reactstrap";
import styled from "styled-components";
import NavBar from "../Projetos/components/NavBar";
// import apiLocal from "../../services/apiLocal";
import {
  Page,
  TitleBar,
  H1,
  CardGrid,
  SearchWrap,
  SearchInput,
} from "../Projetos/style";
import { PageLoader } from "../Projetos/components/Loader";
import useLoading from "../../hooks/useLoading";
import UploadCsvModal from "./UploadCsvModal";
import PedidoFormModal from "./PedidoFormModal";
import PedidoCard from "./PedidoCard";
import ModalInfo from "./ModalInfo";
import { StatusPill } from "./style";
import { STATUS_PEDIDO } from "./constants";
import Indicators from "./Indicators";
import ConferenciaModal from "./ConferenciaModal";
import FakeLabelsModal from "./FakeLabelsModal";

const CAN_EXPEDIR_EMAILS = ["expedicao@empresa.com.br"];

function canExpedir(user) {
  const email = String(user?.email || "").toLowerCase();
  for (let i = 0; i < CAN_EXPEDIR_EMAILS.length; i++) {
    if (email === CAN_EXPEDIR_EMAILS[i].toLowerCase()) return true;
  }
  return false;
}

export default function SeparacaoPage() {
  const loading = useLoading();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [pedidos, setPedidos] = useState([]);
  const [query, setQuery] = useState("");

  const [openCsv, setOpenCsv] = useState(false);
  const [openManual, setOpenManual] = useState(false);

  const [activePedido, setActivePedido] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);

  const [openConf, setOpenConf] = useState(false);
  const [confPedido, setConfPedido] = useState(null);
  const [openFake, setOpenFake] = useState(false);
  const normalize = useCallback(
    (s) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim(),
    []
  );

  useEffect(() => {
    (async () => {
      loading.start("fetch");
      try {
        const now = new Date().toISOString();
        const mock = [
          {
            nr_pedido: "11321",
            cliente: "FERSA",
            destino: "CONDOR",
            transportador: "TRANSLOVATO",
            separador: "Lucas Lima",
            itens: [
              {
                cod_prod: "321",
                qtde: 5,
                um_med: "cx",
                bar_code: "7894900012345",
              },
              {
                cod_prod: "123",
                qtde: 12,
                um_med: "un",
                bar_code: "1234567890123",
              },
            ],
            status: STATUS_PEDIDO.PENDENTE,
            created_at: now,
            logs: [],
            expedido: false,
            nota: null,
          },
          {
            nr_pedido: "12331",
            cliente: "PFI",
            destino: "FAGUNDES",
            transportador: "SÃO MIGUEL",
            separador: "Jair Oliveira",
            itens: [
              {
                cod_prod: "32132",
                qtde: 2,
                um_med: "pc",
                bar_code: "123456789012",
              },
            ],
            status: STATUS_PEDIDO.PENDENTE,
            created_at: now,
            logs: [],
            expedido: false,
            nota: null,
          },
          {
            nr_pedido: "11322",
            cliente: "FERSA",
            destino: "BAGGIO",
            transportador: "CARRARO",
            separador: "Miguel Santos",
            itens: [
              {
                cod_prod: "3321",
                qtde: 3,
                um_med: "cx",
                bar_code: "5555555555555",
              },
            ],
            status: STATUS_PEDIDO.PRIMEIRA_CONF,
            created_at: now,
            logs: [
              {
                text: "Primeira conferência por Ana",
                user: "ops@empresa.com",
                at: now,
              },
            ],
            expedido: false,
            nota: null,
          },
        ];
        setPedidos(mock);
      } finally {
        loading.stop("fetch");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsertPedidos = (novos) => {
    const map = new Map();
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      map.set(String(p.nr_pedido), p);
    }
    for (let i = 0; i < novos.length; i++) {
      const np = novos[i];
      map.set(String(np.nr_pedido), np);
    }
    setPedidos(Array.from(map.values()));
  };

  const onImportedCsv = async (novosPedidos) => {
    upsertPedidos(novosPedidos);
    setOpenCsv(false);
  };

  const onCreatedManual = async (pedido) => {
    upsertPedidos([pedido]);
    setOpenManual(false);
  };

  const onUpdatePedido = async (nr_pedido, patch) => {
    const next = [];
    let updatedObject = null;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) === String(nr_pedido)) {
        const up = { ...p, ...patch };
        next.push(up);
        updatedObject = up;
      } else {
        next.push(p);
      }
    }
    setPedidos(next);
    if (activePedido && String(activePedido.nr_pedido) === String(nr_pedido)) {
      setActivePedido(updatedObject);
    }
    if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
      setConfPedido(updatedObject);
    }
  };

  const onDeletePedido = async (nr_pedido) => {
    const next = [];
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) !== String(nr_pedido)) next.push(p);
    }
    setPedidos(next);
    if (activePedido && String(activePedido.nr_pedido) === String(nr_pedido)) {
      setOpenInfo(false);
      setActivePedido(null);
    }
    if (confPedido && String(confPedido.nr_pedido) === String(nr_pedido)) {
      setOpenConf(false);
      setConfPedido(null);
    }
  };

  const onExpedirPedido = async (nr_pedido) => {
    if (!canExpedir(user)) return;
    let alvo = null;
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      if (String(p.nr_pedido) === String(nr_pedido)) {
        alvo = p;
        break;
      }
    }
    if (!alvo) return;
    const pode = !!alvo?.segundaConferencia?.colaborador;
    if (!pode) return;

    const log = {
      text: "Pedido expedido",
      user: user?.email || "usuário",
      at: new Date().toISOString(),
    };
    await onUpdatePedido(nr_pedido, {
      expedido: true,
      logs: [...(alvo.logs || []), log],
    });
  };

  const pedidosFiltrados = useMemo(() => {
    const q = normalize(query);
    if (!q) return pedidos;
    const out = [];
    for (let i = 0; i < pedidos.length; i++) {
      const p = pedidos[i];
      const c = normalize(p.cliente);
      const d = normalize(p.destino);
      const n = normalize(p.nr_pedido);
      if (c.includes(q) || d.includes(q) || n.includes(q)) out.push(p);
    }
    return out;
  }, [pedidos, query, normalize]);

  const openConferencia = (p) => {
    setConfPedido(p);
    setOpenConf(true);
  };

  const handleConfirmConferencia = async (payload) => {
    const name = String(payload?.conferente || "").trim();
    if (!name || !confPedido) return;

    const now = new Date().toISOString();
    const log = {
      text: `Conferência finalizada por ${name}`,
      user: user?.email || "usuário",
      at: now,
    };

    if (confPedido.status === STATUS_PEDIDO.PENDENTE) {
      await onUpdatePedido(confPedido.nr_pedido, {
        status: STATUS_PEDIDO.PRIMEIRA_CONF,
        primeiraConferencia: {
          colaborador: name,
          at: now,
          scans: payload.scans || {},
          evidences: payload.evidences || [],
        },
        logs: [...(confPedido.logs || []), log],
      });
    } else {
      await onUpdatePedido(confPedido.nr_pedido, {
        status: STATUS_PEDIDO.CONCLUIDO,
        segundaConferencia: {
          colaborador: name,
          at: now,
          scans: payload.scans || {},
          evidences: payload.evidences || [],
        },
        logs: [...(confPedido.logs || []), log],
      });
    }

    setOpenConf(false);
    setConfPedido(null);
  };

  const handleOccurrence = async ({ reason, missing, evidences }) => {
    if (!confPedido) return;
    const now = new Date().toISOString();
    const log = {
      text: `Ocorrência na conferência: ${reason}`,
      user: user?.email || "usuário",
      at: now,
    };

    await onUpdatePedido(confPedido.nr_pedido, {
      logs: [...(confPedido.logs || []), log],
      ocorrenciaConferencia: {
        reason,
        missing: Array.isArray(missing) ? missing : [],
        evidences: Array.isArray(evidences) ? evidences : [],
        at: now,
      },
    });

    setOpenConf(false);
    setConfPedido(null);
  };

  return (
    <Page>
      <PageLoader active={loading.any()} text="Carregando..." />
      <NavBar />

      <TitleBar style={{ zIndex: 1100 }}>
        <H1 $accent="#0ea5e9">Separação</H1>

        <RightRow>
          <SearchWrap title="Buscar por Nº pedido, cliente ou destino">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13.477 12.307a6 6 0 11-1.172 1.172l3.327 3.327a.83.83 0 001.172-1.172l-3.327-3.327zM8.5 13a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
            </svg>
            <SearchInput
              placeholder="Buscar pedido..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchWrap>

          <Button color="secondary" onClick={() => setOpenCsv(true)}>
            Importar CSV
          </Button>
          <Button color="primary" onClick={() => setOpenManual(true)}>
            + Novo Pedido
          </Button>
          <Button color="info" onClick={() => setOpenFake(true)}>
            Etiquetas Teste
          </Button>
        </RightRow>
      </TitleBar>

      <Indicators pedidos={pedidos} canExpedir={canExpedir(user)} />

      <Legend>
        <StatusPill $variant="pendente">Pendente em separação</StatusPill>
        <StatusPill $variant="primeira">1ª conferência</StatusPill>
        <StatusPill $variant="concluido">Concluído</StatusPill>
      </Legend>

      <CardGrid>
        {pedidosFiltrados.map((p) => (
          <PedidoCard
            key={p.nr_pedido}
            pedido={p}
            currentUser={user}
            onUpdate={onUpdatePedido}
            onDelete={onDeletePedido}
            onOpen={() => {
              setActivePedido(p);
              setOpenInfo(true);
            }}
            onExpedir={onExpedirPedido}
            canExpedir={canExpedir(user)}
            onOpenConferencia={() => openConferencia(p)}
          />
        ))}
      </CardGrid>

      {!loading.any() && pedidosFiltrados.length === 0 && (
        <div style={{ opacity: 0.7 }}>Nenhum pedido encontrado.</div>
      )}

      <UploadCsvModal
        isOpen={openCsv}
        onClose={() => setOpenCsv(false)}
        onImported={onImportedCsv}
      />
      <PedidoFormModal
        isOpen={openManual}
        onClose={() => setOpenManual(false)}
        onSubmit={onCreatedManual}
      />

      <ModalInfo
        isOpen={openInfo}
        onClose={() => setOpenInfo(false)}
        pedido={activePedido}
        onUpdate={onUpdatePedido}
        onExpedir={onExpedirPedido}
        canExpedir={canExpedir(user)}
        onOpenConferencia={() => {
          if (activePedido) openConferencia(activePedido);
        }}
      />

      <ConferenciaModal
        isOpen={openConf}
        onClose={() => {
          setOpenConf(false);
          setConfPedido(null);
        }}
        pedido={confPedido}
        onConfirm={handleConfirmConferencia}
        onOccurrence={handleOccurrence}
      />
      <FakeLabelsModal isOpen={openFake} onClose={() => setOpenFake(false)} />
    </Page>
  );
}

const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
`;
