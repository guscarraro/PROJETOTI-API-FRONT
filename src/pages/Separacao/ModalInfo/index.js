import React, { useMemo, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import { Row, Field, SmallMuted, IconBtn, TinyBtn } from "../style";
import { STATUS_PEDIDO } from "../constants";
import { printPedidoLabels } from "../print";
import { FiTag, FiSave, FiTruck, FiCamera } from "react-icons/fi";

export default function ModalInfo({
  isOpen,
  onClose,
  pedido,
  onUpdate,
  onExpedir,
  canExpedir,
  onOpenConferencia
}) {
  const [nota, setNota] = useState(pedido?.nota || "");

  const totalItens = useMemo(() => {
    let t = 0;
    if (Array.isArray(pedido?.itens)) {
      for (let i = 0; i < pedido.itens.length; i++) {
        t += Number(pedido.itens[i]?.qtde || 0);
      }
    }
    return t;
  }, [pedido]);

  if (!pedido) return null;

  const saveNota = async () => {
    const next = String(nota || "").trim();
    if ((pedido.nota || "") === next) return;
    const log = {
      text: `Nota (NF) alterada de "${pedido.nota || "-"}" para "${next || "-"}"`,
      user: "usuário",
      at: new Date().toISOString(),
    };
    await onUpdate(pedido.nr_pedido, {
      nota: next || null,
      logs: [...(pedido.logs || []), log],
    });
  };

  const podeExpedir = !!pedido?.segundaConferencia?.colaborador && canExpedir;

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      size="lg"
      contentClassName="project-modal"
    >
      <ModalHeader toggle={onClose}>
        Detalhes do Pedido #{pedido.nr_pedido}
        <div style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
          <IconBtn title="Imprimir etiquetas" onClick={() => printPedidoLabels(pedido)}>
            <FiTag size={16} />
          </IconBtn>
          <IconBtn title="Conferir com câmera" onClick={onOpenConferencia}>
            <FiCamera size={16} />
          </IconBtn>
          <IconBtn
            title={podeExpedir ? "Marcar como expedido" : "Expedir (precisa 2ª conferência e permissão)"}
            disabled={!podeExpedir || pedido.expedido}
            onClick={() => { if (podeExpedir && !pedido.expedido) onExpedir(pedido.nr_pedido); }}
          >
            <FiTruck size={16} />
          </IconBtn>
        </div>
      </ModalHeader>

      <ModalBody>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <SmallMuted>Cliente</SmallMuted>
            <div style={{ fontWeight: 700 }}>{pedido.cliente || "—"}</div>
          </div>
          <div>
            <SmallMuted>Destino</SmallMuted>
            <div style={{ fontWeight: 700 }}>{pedido.destino || "—"}</div>
          </div>
          <div>
            <SmallMuted>Transportadora</SmallMuted>
            <div>{pedido.transportador || "—"}</div>
          </div>
          <div>
            <SmallMuted>Separador</SmallMuted>
            <div>{pedido.separador || "—"}</div>
          </div>
          <div>
            <SmallMuted>Data de criação</SmallMuted>
            <div>{pedido.created_at ? new Date(pedido.created_at).toLocaleString("pt-BR") : "—"}</div>
          </div>
          <div>
            <SmallMuted>Status</SmallMuted>
            <div>
              {pedido.status === STATUS_PEDIDO.PENDENTE && "Pendente em separação"}
              {pedido.status === STATUS_PEDIDO.PRIMEIRA_CONF && "1ª conferência"}
              {pedido.status === STATUS_PEDIDO.CONCLUIDO && (pedido.expedido ? "Concluído • Expedido" : "Concluído")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallMuted>Nota (NF) — adicionada depois da conferência</SmallMuted>
          <Row style={{ marginTop: 6 }}>
            <Field
              style={{ maxWidth: 260 }}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ex.: 123456"
            />
            <TinyBtn onClick={saveNota}>
              <FiSave /> Salvar NF
            </TinyBtn>
          </Row>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallMuted>Total de volumes (embalagens)</SmallMuted>
          <div><strong>{totalItens}</strong></div>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallMuted>Itens do Pedido</SmallMuted>
          <Table striped responsive size="sm" className="mt-2">
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Cód. Produto</th>
                <th>Qtde</th>
                <th style={{ whiteSpace: "nowrap" }}>UM</th>
                <th>Barcode</th>
              </tr>
            </thead>
            <tbody>
              {(pedido.itens || []).map((it, idx) => (
                <tr key={idx}>
                  <td>{it.cod_prod || "—"}</td>
                  <td>{Number(it.qtde || 0)}</td>
                  <td>{it.um_med || "—"}</td>
                  <td>{it.bar_code || "—"}</td>
                </tr>
              ))}
              {(pedido.itens || []).length === 0 && (
                <tr>
                  <td colSpan={4} style={{ opacity: 0.7 }}>Sem itens.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallMuted>Conferências</SmallMuted>
          <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
            <div>
              <strong>1ª:</strong> {pedido.primeiraConferencia?.colaborador || "—"}{" "}
              {pedido.primeiraConferencia?.at && (
                <SmallMuted>
                  ({new Date(pedido.primeiraConferencia.at).toLocaleString("pt-BR")})
                </SmallMuted>
              )}
            </div>
            <div>
              <strong>2ª:</strong> {pedido.segundaConferencia?.colaborador || "—"}{" "}
              {pedido.segundaConferencia?.at && (
                <SmallMuted>
                  ({new Date(pedido.segundaConferencia.at).toLocaleString("pt-BR")})
                </SmallMuted>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallMuted>Log</SmallMuted>
          <div style={{ marginTop: 6 }}>
            {(pedido.logs || [])
              .slice()
              .reverse()
              .map((l, idx) => (
                <div key={idx} style={{ fontSize: 12, opacity: 0.9 }}>
                  • {l.text} — <em>{l.user}</em>{" "}
                  <SmallMuted>({new Date(l.at).toLocaleString("pt-BR")})</SmallMuted>
                </div>
              ))}
            {(pedido.logs || []).length === 0 && (
              <div style={{ opacity: 0.7, fontSize: 12 }}>Sem alterações.</div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={onClose}>Fechar</Button>
        <Button color="primary" onClick={() => printPedidoLabels(pedido)}>
          <FiTag style={{ marginRight: 6 }} /> Imprimir etiquetas
        </Button>
        <Button color="info" onClick={onOpenConferencia}>
          <FiCamera style={{ marginRight: 6 }} /> Conferir com câmera
        </Button>
        <Button
          color="success"
          disabled={!podeExpedir || pedido.expedido}
          onClick={() => { if (podeExpedir && !pedido.expedido) onExpedir(pedido.nr_pedido); }}
          title={podeExpedir ? "Marcar como expedido" : "Expedir (precisa 2ª conferência e permissão)"}
        >
          <FiTruck style={{ marginRight: 6 }} /> Expedir
        </Button>
      </ModalFooter>
    </Modal>
  );
}
