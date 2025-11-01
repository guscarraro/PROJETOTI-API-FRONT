import React, { useMemo, useState } from "react";
import { Card, FlexRow, Muted } from "../../Projetos/style";
import { StatusPill, Row, Col, Field, TinyBtn, DangerBtn, IconBtn } from "../style";
import { STATUS_PEDIDO } from "../constants";
import { printPedidoLabels } from "../print";
import { FiEdit2, FiSave, FiX, FiTrash2, FiUserCheck, FiTag, FiTruck, FiCamera } from "react-icons/fi";

export default function PedidoCard({
  pedido,
  currentUser,
  onUpdate,
  onDelete,
  onOpen,
  onExpedir,
  canExpedir,
  onOpenConferencia
}) {
  const [edit, setEdit] = useState(false);
  const [tmpSep, setTmpSep] = useState(pedido.separador || "");
  const [tmpTransp, setTmpTransp] = useState(pedido.transportador || "");
  const [nomePrimeira, setNomePrimeira] = useState("");
  const [nomeSegunda, setNomeSegunda] = useState("");

  const totalItens = useMemo(() => {
    let total = 0;
    if (Array.isArray(pedido.itens)) {
      for (let i = 0; i < pedido.itens.length; i++) {
        const it = pedido.itens[i];
        const n = Number(it?.qtde || 0);
        total += isNaN(n) ? 0 : n;
      }
    }
    return total;
  }, [pedido.itens]);

  const variant =
    pedido.status === STATUS_PEDIDO.CONCLUIDO
      ? "concluido"
      : pedido.status === STATUS_PEDIDO.PRIMEIRA_CONF
      ? "primeira"
      : "pendente";

  const commitBasics = async () => {
    const updates = {};
    let any = false;

    if ((pedido.separador || "") !== (tmpSep || "")) {
      any = true;
      const log = {
        text: `Separador alterado de "${pedido.separador || "-"}" para "${tmpSep || "-"}"`,
        user: currentUser?.email || "usuário",
        at: new Date().toISOString(),
      };
      updates.separador = tmpSep || null;
      updates.logs = [...(pedido.logs || []), log];
    }

    if ((pedido.transportador || "") !== (tmpTransp || "")) {
      any = true;
      const log = {
        text: `Transportadora alterada de "${pedido.transportador || "-"}" para "${tmpTransp || "-"}"`,
        user: currentUser?.email || "usuário",
        at: new Date().toISOString(),
      };
      updates.transportador = tmpTransp || null;
      updates.logs = [...(updates.logs || pedido.logs || []), log];
    }

    if (!any) {
      setEdit(false);
      return;
    }
    await onUpdate(pedido.nr_pedido, updates);
    setEdit(false);
  };

  const marcarPrimeira = async () => {
    const nome = (nomePrimeira || "").trim();
    if (!nome) return;
    const updates = {
      status: STATUS_PEDIDO.PRIMEIRA_CONF,
      primeiraConferencia: { colaborador: nome, at: new Date().toISOString() },
      logs: [
        ...(pedido.logs || []),
        { text: `Primeira conferência por ${nome}`, user: currentUser?.email || "usuário", at: new Date().toISOString() },
      ],
    };
    await onUpdate(pedido.nr_pedido, updates);
    setNomePrimeira("");
  };

  const marcarSegunda = async () => {
    const nome = (nomeSegunda || "").trim();
    if (!nome) return;
    const updates = {
      status: STATUS_PEDIDO.CONCLUIDO,
      segundaConferencia: { colaborador: nome, at: new Date().toISOString() },
      logs: [
        ...(pedido.logs || []),
        { text: `Segunda conferência por ${nome}`, user: currentUser?.email || "usuário", at: new Date().toISOString() },
      ],
    };
    await onUpdate(pedido.nr_pedido, updates);
    setNomeSegunda("");
  };

  const podeExpedir = !!pedido?.segundaConferencia?.colaborador && canExpedir;

  return (
    <Card role="group" onClick={onOpen} style={{ cursor: "pointer" }}>
      <FlexRow>
        <h3 style={{ margin: 0 }}>Pedido #{pedido.nr_pedido}</h3>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <IconBtn
            title="Imprimir etiquetas"
            onClick={(e) => { e.stopPropagation(); printPedidoLabels(pedido); }}
          >
            <FiTag size={16} />
          </IconBtn>

          <IconBtn
            title="Conferir com câmera"
            onClick={(e) => { e.stopPropagation(); onOpenConferencia(); }}
          >
            <FiCamera size={16} />
          </IconBtn>

          <IconBtn
            title={podeExpedir ? "Marcar como expedido" : "Expedir (precisa 2ª conferência e permissão)"}
            disabled={!podeExpedir || pedido.expedido}
            onClick={(e) => { e.stopPropagation(); if (podeExpedir && !pedido.expedido) onExpedir(pedido.nr_pedido); }}
          >
            <FiTruck size={16} />
          </IconBtn>

          <StatusPill $variant={variant}>
            {variant === "pendente" && "Pendente em separação"}
            {variant === "primeira" && "1ª conferência"}
            {variant === "concluido" && (pedido.expedido ? "Concluído • Expedido" : "Concluído")}
          </StatusPill>
        </div>
      </FlexRow>

      <div style={{ marginTop: 8 }}>
        <Row>
          <strong>Cliente:</strong> <span>{pedido.cliente}</span>
        </Row>
        <Row>
          <strong>Destino:</strong> <span>{pedido.destino}</span>
        </Row>
        <Row>
          <strong>Itens:</strong> <span>{totalItens} embalagem(ns)</span>
        </Row>
        <Row>
          <strong>Nota (NF):</strong> <span>{pedido.nota || <em>—</em>}</span>
        </Row>
      </div>

      <div style={{ marginTop: 10 }}>
        {!edit ? (
          <>
            <Row>
              <strong>Separador:</strong> <span>{pedido.separador || <em>—</em>}</span>
            </Row>
            <Row>
              <strong>Transportadora:</strong>{" "}
              <span>{pedido.transportador || <em>—</em>}</span>
            </Row>

            <Row style={{ marginTop: 8, gap: 6 }}>
              <TinyBtn
                onClick={(e) => { e.stopPropagation(); setEdit(true); }}
                title="Editar separador/transportadora"
              >
                <FiEdit2 /> Editar
              </TinyBtn>
              <DangerBtn
                onClick={(e) => { e.stopPropagation(); onDelete(pedido.nr_pedido); }}
                title="Excluir pedido"
              >
                <FiTrash2 /> Excluir
              </DangerBtn>
            </Row>
          </>
        ) : (
          <>
            <Col>
              <label>Separador</label>
              <Field
                value={tmpSep}
                onChange={(e) => setTmpSep(e.target.value)}
                placeholder="Nome do separador (opcional)"
                onClick={(e) => e.stopPropagation()}
              />
            </Col>
            <Col style={{ marginTop: 6 }}>
              <label>Transportadora</label>
              <Field
                value={tmpTransp}
                onChange={(e) => setTmpTransp(e.target.value)}
                placeholder="Nome da transportadora (opcional)"
                onClick={(e) => e.stopPropagation()}
              />
            </Col>
            <Row style={{ marginTop: 8, gap: 6 }}>
              <TinyBtn onClick={(e) => { e.stopPropagation(); commitBasics(); }}>
                <FiSave /> Salvar
              </TinyBtn>
              <TinyBtn
                onClick={(e) => {
                  e.stopPropagation();
                  setEdit(false);
                  setTmpSep(pedido.separador || "");
                  setTmpTransp(pedido.transportador || "");
                }}
              >
                <FiX /> Cancelar
              </TinyBtn>
            </Row>
          </>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Conferências</strong>
        <div style={{ marginTop: 6 }}>
          <Row>
            <span>1ª conferência: </span>
            <span style={{ fontWeight: 700, marginLeft: 6 }}>
              {pedido.primeiraConferencia?.colaborador || "—"}
            </span>
          </Row>
          <Row>
            <span>2ª conferência: </span>
            <span style={{ fontWeight: 700, marginLeft: 6 }}>
              {pedido.segundaConferencia?.colaborador || "—"}
            </span>
          </Row>
        </div>

        <div style={{ marginTop: 8 }}>
          {pedido.status !== STATUS_PEDIDO.CONCLUIDO && (
            <>
              {pedido.status === STATUS_PEDIDO.PENDENTE && (
                <Row style={{ gap: 6 }}>
                  <Field
                    style={{ maxWidth: 220 }}
                    value={nomePrimeira}
                    onChange={(e) => setNomePrimeira(e.target.value)}
                    placeholder="Nome 1ª conferência"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <TinyBtn onClick={(e) => { e.stopPropagation(); marcarPrimeira(); }}>
                    <FiUserCheck /> Marcar 1ª
                  </TinyBtn>
                  <TinyBtn onClick={(e) => { e.stopPropagation(); onOpenConferencia(); }}>
                    <FiCamera /> Conferir com câmera
                  </TinyBtn>
                </Row>
              )}

              {pedido.status !== STATUS_PEDIDO.PENDENTE && (
                <Row style={{ gap: 6, marginTop: 6 }}>
                  <Field
                    style={{ maxWidth: 220 }}
                    value={nomeSegunda}
                    onChange={(e) => setNomeSegunda(e.target.value)}
                    placeholder="Nome 2ª conferência"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <TinyBtn onClick={(e) => { e.stopPropagation(); marcarSegunda(); }}>
                    <FiUserCheck /> Marcar 2ª (Concluir)
                  </TinyBtn>
                  <TinyBtn onClick={(e) => { e.stopPropagation(); onOpenConferencia(); }}>
                    <FiCamera /> Conferir com câmera
                  </TinyBtn>
                </Row>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Log</strong>
        <div style={{ marginTop: 6 }}>
          {(pedido.logs || [])
            .slice()
            .reverse()
            .map((l, idx) => (
              <div key={idx} style={{ fontSize: 12, opacity: 0.9 }}>
                • {l.text} — <em>{l.user}</em>{" "}
                <Muted>({new Date(l.at).toLocaleString("pt-BR")})</Muted>
              </div>
            ))}
          {(pedido.logs || []).length === 0 && (
            <div style={{ opacity: 0.7, fontSize: 12 }}>Sem alterações.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
