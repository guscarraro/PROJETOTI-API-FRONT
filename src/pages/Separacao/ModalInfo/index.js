import React, { useEffect, useMemo, useState,useCallback  } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import {
  ModalResponsiveStyles,
  InfoGrid,
  TwoColGrid,
  ScrollTableWrap,
  FooterActions,
  SelectField,
  Row,
  Col,
  Field,
  SmallMuted,
  TinyBtn,
  OccurrenceBadge,
} from "./style";
import { STATUS_PEDIDO } from "../constants";
import { FiSave, FiCheckSquare, FiEdit2, FiX, FiTrash2, FiTag } from "react-icons/fi";
import { printPedidoLabels } from "../print";
import ModalImpressao from "./ModalImpressao";
import apiLocal from "../../../services/apiLocal";
import InfoOcorren from "./InfoOcorren";
import { Muted } from "../../Projetos/style";

export default function ModalInfo({
  isOpen,
  onClose,
  pedido,
  onUpdate,
  onOpenConferencia,
  onDeleted,
}) {
  // ------- user -------
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });
const isRestrictedUser = Number(user?.setor_ids) === 23;
const isRestrictedColetorUser = Number(user?.setor_ids) === 25;
 // mantém mesma regra do seu código

  // ------- NF -------
  const [nota, setNota] = useState(pedido?.nota || "");
  const [savingNF, setSavingNF] = useState(false);

  // ------- Basics -------
  const [editBasics, setEditBasics] = useState(false);
  const [tmpSep, setTmpSep] = useState(pedido?.separador || "");
  const [tmpTransp, setTmpTransp] = useState(pedido?.transportador || "");
  const [savingBasics, setSavingBasics] = useState(false);

  // ------- Conferente -------
  const [editConf, setEditConf] = useState(false);
  const [tmpConf, setTmpConf] = useState(
    pedido?.conferente || pedido?.primeiraConferencia?.colaborador || ""
  );
  const [savingConf, setSavingConf] = useState(false);

  // ------- Impressão -------
  const [showLabelModal, setShowLabelModal] = useState(false);

  // ------- Exclusão -------
  const [askDelete, setAskDelete] = useState(false);
  const [motivoDel, setMotivoDel] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ------- Conferência/ocorrências (exibição) -------
  const [ocorrRows, setOcorrRows] = useState([]);
  const [ultimaConf, setUltimaConf] = useState(null);

  // ------- Integrantes (validação de nomes) -------
  const [integrantesList, setIntegrantesList] = useState([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);

  // ------- efeitos -------
  useEffect(() => {
    setNota(pedido?.nota || "");
    setTmpSep(pedido?.separador || "");
    setTmpTransp(pedido?.transportador || "");
    setTmpConf(pedido?.conferente || pedido?.primeiraConferencia?.colaborador || "");
  }, [
    pedido?.nr_pedido,
    pedido?.nota,
    pedido?.separador,
    pedido?.transportador,
    pedido?.conferente,
    pedido?.primeiraConferencia?.colaborador
  ]);

  // se abrir sem itens/eventos, buscar detalhe
  useEffect(() => {
    (async () => {
      if (!isOpen || !pedido) return;
      const needItens = !Array.isArray(pedido.itens);
      const needEventos = !Array.isArray(pedido.eventos);
      if (!needItens && !needEventos) return;
      try {
        const resp = await apiLocal.getPedidoByNr(pedido.nr_pedido);
        const detail = resp?.data || {};
        const merged = {
          ...(detail.pedido || pedido),
          itens: Array.isArray(detail.itens) ? detail.itens : (pedido.itens || []),
          eventos: Array.isArray(detail.eventos) ? detail.eventos : (pedido.eventos || []),
          eventos_preview: Array.isArray(detail.eventos) ? detail.eventos.slice(0, 5) : (pedido.eventos_preview || []),
        };
        await onUpdate(pedido.nr_pedido, merged);
      } catch (e) {
        console.error("Falha ao buscar detalhe dentro do modal:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // carregar ocorrências + última conferência para fotos/tempo
  useEffect(() => {
    (async () => {
      if (!isOpen || !pedido?.nr_pedido) {
        setOcorrRows([]);
        setUltimaConf(null);
        return;
      }
      try {
        const r = await apiLocal.getOcorrenciasConferencia(pedido.nr_pedido);
        const arr = Array.isArray(r?.data?.ocorrencias) ? r.data.ocorrencias : [];
        setOcorrRows(arr);
      } catch (e) {
        console.error("Falha ao carregar ocorrências da conferência:", e);
        setOcorrRows([]);
      }
      try {
        const u = await apiLocal.getUltimaConferencia(pedido.nr_pedido);
        setUltimaConf(u?.data || null);
      } catch (e) {
        console.error("Falha ao carregar última conferência:", e);
        setUltimaConf(null);
      }
    })();
  }, [isOpen, pedido?.nr_pedido]);

  // carregar integrantes (para validar nomes)
  useEffect(() => {
    (async () => {
      if (!isOpen) return;
      try {
        setLoadingIntegrantes(true);
        const r = await apiLocal.getIntegrantes();
        const items = Array.isArray(r?.data?.items) ? r.data.items : (r?.data || []);
        setIntegrantesList(items);
      } catch (e) {
        console.error("Falha ao carregar integrantes:", e);
        setIntegrantesList([]);
      } finally {
        setLoadingIntegrantes(false);
      }
    })();
  }, [isOpen]);

const isValidName = useCallback((name) => {
  const v = String(name || "").trim();
  if (!v) return false;
  for (let i = 0; i < integrantesList.length; i++) {
    const it = integrantesList[i];
    const nomeCompleto = `${it?.nome || ""} ${it?.sobrenome || ""}`.trim();
    if (nomeCompleto === v) return true;
  }
  return false;
}, [integrantesList]);

const isValidConf = useMemo(() => isValidName(tmpConf), [tmpConf, isValidName]);
const isValidSep  = useMemo(() => isValidName(tmpSep),  [tmpSep,  isValidName]);


  // recarrega após alterações
  async function refreshDetail() {
    if (!pedido) return;
    try {
      const resp = await apiLocal.getPedidoByNr(pedido.nr_pedido);
      const detail = resp?.data || {};
      const merged = {
        ...(detail.pedido || pedido),
        itens: Array.isArray(detail.itens) ? detail.itens : (pedido.itens || []),
        eventos: Array.isArray(detail.eventos) ? detail.eventos : (pedido.eventos || []),
        eventos_preview: Array.isArray(detail.eventos) ? detail.eventos.slice(0, 5) : (pedido.eventos_preview || []),
      };
      await onUpdate(pedido.nr_pedido, merged);
    } catch (e) {
      console.error("Falha ao recarregar detalhe:", e);
    }
  }

  // ------- totais -------
  const totalItens = useMemo(() => {
    let t = 0;
    if (Array.isArray(pedido?.itens)) {
      for (let i = 0; i < pedido.itens.length; i++) {
        t += Number(pedido.itens[i]?.qtde || 0);
      }
    }
    return t;
  }, [pedido]);

  // ------- dedupe eventos -------
  const eventosDedupe = useMemo(() => {
    const arr = Array.isArray(pedido?.eventos) ? pedido.eventos : [];
    const seen = new Set();
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const ev = arr[i] || {};
      const key = [
        (ev.tipo || "").trim(),
        (ev.texto || "").trim(),
        (ev.user_ref || "").trim(),
        String(ev.created_at || "").slice(0, 19),
      ].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(ev);
    }
    return out;
  }, [pedido?.eventos]);

  // ------- badge de ocorrência -------
  const hasOcorrenciaConferencia = useMemo(() => {
    if (Array.isArray(ocorrRows) && ocorrRows.length > 0) return true;
    function matchArray(arr) {
      if (!Array.isArray(arr)) return false;
      for (let i = 0; i < arr.length; i++) {
        const ev = arr[i] || {};
        const tipo = String(ev.tipo || "").toLowerCase();
        const texto = String(ev.texto || "").toLowerCase();
        if (tipo.includes("ocorr") || texto.includes("ocorr") || texto.includes("diverg") || texto.includes("falta") || texto.includes("avaria")) {
          return true;
        }
      }
      return false;
    }
    if (matchArray(pedido?.eventos)) return true;
    if (matchArray(pedido?.eventos_preview)) return true;
    return false;
  }, [ocorrRows, pedido?.eventos, pedido?.eventos_preview]);

  if (!pedido) return null;

  // ------- helpers de regra -------
  const hasSeparador = !!(pedido?.separador && String(pedido.separador).trim());
  const currentConferente = (pedido?.conferente && String(pedido.conferente).trim())
    || (pedido?.primeiraConferencia?.colaborador && String(pedido.primeiraConferencia.colaborador).trim())
    || "";
  const canStartConferencia = !!currentConferente;
  const canPrintLabels =
    // !!currentConferente &&
    !!(pedido?.nota && String(pedido.nota).trim()) &&
    !!(pedido?.separador && String(pedido.separador).trim());
    //  &&
    // !!(pedido?.conferente && String(pedido.conferente).trim());

  // ------- ações -------
  async function saveNota() {
    if (savingNF) return;
    const next = String(nota || "").trim();
    if ((pedido.nota || "") === next) return;

    setSavingNF(true);
    try {
      await apiLocal.updatePedidoNF(pedido.nr_pedido, {
        nota: next || null,
        by: user?.email || "usuario",
      });
      await refreshDetail();
    } catch (e) {
      console.error("Falha ao salvar NF no back:", e);
    } finally {
      setSavingNF(false);
    }
  }

  async function saveBasics() {
    if (savingBasics) return;

    const updates = {};
    let any = false;

    if ((pedido.separador || "") !== (tmpSep || "")) {
      any = true;
      updates.separador = tmpSep || null;
    }
    if ((pedido.transportador || "") !== (tmpTransp || "")) {
      any = true;
      updates.transportador = tmpTransp || null;
    }

    if (!any) {
      setEditBasics(false);
      return;
    }

    setSavingBasics(true);
    try {
      await apiLocal.updatePedidoBasics(pedido.nr_pedido, {
        separador: tmpSep ?? null,
        transportador: tmpTransp ?? null,
        by: user?.email || "usuario",
      });
      await refreshDetail();
      setEditBasics(false);
    } catch (e) {
      console.error("Falha ao salvar básicos:", e);
    } finally {
      setSavingBasics(false);
    }
  }

  async function saveConferente() {
    if (savingConf) return;
    if (!hasSeparador) return;
    const nome = (tmpConf || "").trim();
    if (!nome) return;

    setSavingConf(true);
    try {
      await apiLocal.updatePedidoBasics(pedido.nr_pedido, {
        conferente: nome,
        by: user?.email || "usuario",
      });
      await refreshDetail();
    } catch (e) {
      console.error("Falha ao salvar conferente:", e);
    } finally {
      setSavingConf(false);
      setEditConf(false);
    }
  }

  async function handlePrintLabels({ caixas }) {
    setShowLabelModal(false);
    const conferente = currentConferente || "-";
    if (!currentConferente) return;

    printPedidoLabels(pedido, { caixas, conferente });
    try {
      await apiLocal.registrarImpressaoEtiquetas(pedido.nr_pedido, {
        caixas,
        conferente,
        by: user?.email || "usuario",
      });
      await refreshDetail();
    } catch (e) {
      console.error("Falha ao registrar impressão no back:", e);
    }
  }

  async function handleDelete() {
    if (deleting || !motivoDel) return;
    setDeleting(true);
    try {
      await apiLocal.deletePedido(pedido.nr_pedido, {
        justificativa: String(motivoDel || "").trim(),
        by: user?.email || "usuario",
      });
      if (typeof onDeleted === "function") {
        onDeleted(pedido.nr_pedido, {
          justificativa: String(motivoDel || "").trim(),
          user: user?.email || "usuário",
        });
      }
      setAskDelete(false);
      onClose();
    } catch (e) {
      console.error("Falha ao excluir pedido:", e);
    } finally {
      setDeleting(false);
      setMotivoDel("");
    }
  }

  const conferenciaConcluida =
    pedido?.status === STATUS_PEDIDO.PRONTO_EXPEDICAO ||
    !!(pedido?.conferente || pedido?.primeiraConferencia?.colaborador);

  // ------- UI -------
  return (
    <>
      <ModalResponsiveStyles />

      <Modal isOpen={isOpen} toggle={onClose} size="lg" contentClassName="project-modal">
        <ModalHeader toggle={onClose}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span>Detalhes do Pedido #{pedido.nr_pedido}</span>
            <Muted style={{ fontSize: 11, marginTop: 2 }}>OV: {pedido.ov || "—"}</Muted>

            {hasOcorrenciaConferencia && (
              <OccurrenceBadge title="Ocorrência registrada na conferência">
                Ocorrência na conferência
              </OccurrenceBadge>
            )}
          </div>
        </ModalHeader>

        <ModalBody>
          <InfoGrid>
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
              <div>
                {pedido.created_at ? new Date(pedido.created_at).toLocaleString("pt-BR") : "—"}
              </div>
            </div>
            <div>
              <SmallMuted>Status</SmallMuted>
              <div>
                {pedido.status === STATUS_PEDIDO.PENDENTE && "Aguardando conferência"}
                {pedido.status === STATUS_PEDIDO.PRONTO_EXPEDICAO && "Pronto para expedir"}
                {pedido.status === STATUS_PEDIDO.CONCLUIDO && "Expedido"}
              </div>
            </div>
          </InfoGrid>

          <div style={{ marginTop: 14 }}>
            <SmallMuted>Nota (NF)</SmallMuted>
            <Row style={{ marginTop: 6 }}>
              <Field
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ex.: 123456"
                disabled={savingNF || isRestrictedUser}
              />
              {!isRestrictedUser && (
                <TinyBtn onClick={saveNota} disabled={savingNF}>
                  <FiSave /> {savingNF ? "Salvando..." : "Salvar NF"}
                </TinyBtn>
              )}
            </Row>
          </div>

          <div style={{ marginTop: 16 }}>
            <SmallMuted>Separação / Transporte</SmallMuted>
            {!editBasics ? (
              <Row style={{ marginTop: 6, gap: 8, flexWrap: "wrap" }}>
                <div><strong>Separador:</strong> {pedido.separador || <em>—</em>}</div>
                <div><strong>Transportadora:</strong> {pedido.transportador || <em>—</em>}</div>
                {!isRestrictedUser && (
                  <TinyBtn onClick={() => setEditBasics(true)} title="Editar separador e transportadora">
                    <FiEdit2 /> Editar
                  </TinyBtn>
                )}
              </Row>
            ) : (
              !isRestrictedUser && editBasics && (
                <TwoColGrid>
                  <Col>
                    <label>Separador</label>
                    <SelectField
                      value={tmpSep}
                      onChange={(e) => setTmpSep(e.target.value)}
                      disabled={savingBasics || loadingIntegrantes}
                    >
                      <option value="">
                        {loadingIntegrantes ? "Carregando..." : "Selecione o separador..."}
                      </option>
                      {integrantesList.map((it) => {
                        const nome = `${it?.nome || ""} ${it?.sobrenome || ""}`.trim();
                        return (
                          <option key={it.id} value={nome}>
                            {nome}
                          </option>
                        );
                      })}
                    </SelectField>
                  </Col>

                  <Col>
                    <label>Transportadora</label>
                    <Field
                      value={tmpTransp}
                      onChange={(e) => setTmpTransp(e.target.value)}
                      placeholder="Transportadora (opcional)"
                      disabled={savingBasics}
                    />
                  </Col>

                  <Row style={{ gap: 6, justifyContent: "flex-end" }}>
                    <TinyBtn onClick={saveBasics} disabled={savingBasics || !isValidSep}>
                      <FiSave /> {savingBasics ? "Salvando..." : "Salvar"}
                    </TinyBtn>
                    <TinyBtn
                      onClick={() => {
                        setEditBasics(false);
                        setTmpSep(pedido.separador || "");
                        setTmpTransp(pedido.transportador || "");
                      }}
                      disabled={savingBasics}
                    >
                      <FiX /> Cancelar
                    </TinyBtn>
                  </Row>
                </TwoColGrid>
              )
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <SmallMuted>Conferência</SmallMuted>

            {!hasSeparador && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#9a3412" }}>
                Informe o <strong>Separador</strong> antes de definir o Conferente.
              </div>
            )}

            {!editConf ? (
              <Row style={{ marginTop: 6, gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <strong>Conferente:</strong>{" "}
                  <span style={{ fontWeight: 700 }}>
                    {currentConferente || "—"}
                  </span>
                </div>
                {!isRestrictedUser && (
                  <TinyBtn
                    onClick={() => hasSeparador && setEditConf(true)}
                    title={hasSeparador ? "Editar conferente" : "Defina um Separador primeiro"}
                    disabled={!hasSeparador}
                  >
                    <FiEdit2 /> Editar
                  </TinyBtn>
                )}
              </Row>
            ) : (
              !isRestrictedUser && editConf && (
                <Row style={{ marginTop: 6, gap: 6, flexWrap: "wrap" }}>
                  <SelectField
                    value={tmpConf}
                    onChange={(e) => setTmpConf(e.target.value)}
                    disabled={savingConf || !hasSeparador || loadingIntegrantes}
                  >
                    <option value="">
                      {loadingIntegrantes ? "Carregando..." : "Selecione o conferente..."}
                    </option>
                    {integrantesList.map((it) => {
                      const nome = `${it?.nome || ""} ${it?.sobrenome || ""}`.trim();
                      return (
                        <option key={it.id} value={nome}>
                          {nome}
                        </option>
                      );
                    })}
                  </SelectField>

                  <TinyBtn onClick={saveConferente} disabled={savingConf || !hasSeparador || !isValidConf}>
                    <FiSave /> {savingConf ? "Salvando..." : "Salvar"}
                  </TinyBtn>
                  <TinyBtn
                    onClick={() => {
                      setEditConf(false);
                      setTmpConf(pedido.conferente || pedido?.primeiraConferencia?.colaborador || "");
                    }}
                    disabled={savingConf}
                  >
                    <FiX /> Cancelar
                  </TinyBtn>
                </Row>
              )
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <SmallMuted>Total de volumes (embalagens)</SmallMuted>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{totalItens}</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <SmallMuted>Itens do Remessa</SmallMuted>
            <ScrollTableWrap>
              <Table responsive hover borderless className="mb-0">
                <thead>
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>Cód. Produto</th>
                    <th>Lote</th>
                    <th>Qtde</th>
                    <th style={{ whiteSpace: "nowrap" }}>UM</th>
                    <th>Barcode</th>
                    <th>Endereço</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedido.itens || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.cod_prod || "—"}</td>
                      <td>{it.lote || "—"}</td>
                      <td style={{ fontWeight: 700 }}>{Number(it.qtde || 0)}</td>
                      <td>{it.um_med || "—"}</td>
                      <td style={{ fontFamily: "monospace" }}>{it.bar_code || "—"}</td>
                                            <td>{pedido.endereco || "—"}</td>

                    </tr>
                  ))}
                  {(pedido.itens || []).length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ opacity: 0.7 }}>
                        Sem itens.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </ScrollTableWrap>
          </div>

          <div style={{ marginTop: 16 }}>
            <InfoOcorren conferencia={ultimaConf} ocorrencias={ocorrRows} />
          </div>

          {(!isRestrictedUser && !isRestrictedColetorUser) &&(
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6, marginBottom: 6 }}>
                <Button
                  color={askDelete ? "danger" : "outline-danger"}
                  onClick={() => setAskDelete((v) => !v)}
                  title="Excluir pedido"
                  style={{ width: 150 }}
                >
                  <FiTrash2 style={{ marginRight: 6 }} />
                  Excluir pedido
                </Button>
              </div>

              {askDelete && (
                <div
                  style={{
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                    Confirme a exclusão do pedido #{pedido.nr_pedido}
                  </div>

                  <TwoColGrid style={{ gridTemplateColumns: "1fr" }}>
                    <label style={{ fontSize: 12, color: "#374151" }}>Motivo da exclusão</label>
                    <SelectField
                      value={motivoDel}
                      onChange={(e) => setMotivoDel(e.target.value)}
                      disabled={deleting}
                    >
                      <option value="">Selecione um motivo...</option>
                      <option value="Faltou item na listagem do Excel">Faltou item na listagem do Excel</option>
                      <option value="Foi acrescentado item ao pedido">Foi acrescentado item ao pedido</option>
                      <option value="Pedido criado por engano">Pedido criado por engano</option>
                    </SelectField>

                    <Row style={{ justifyContent: "flex-end", gap: 8 }}>
                      <Button color="secondary" outline onClick={() => setAskDelete(false)} disabled={deleting}>
                        <FiX style={{ marginRight: 6 }} />
                        Cancelar
                      </Button>
                      <Button color="danger" onClick={handleDelete} disabled={deleting || !motivoDel}>
                        <FiTrash2 style={{ marginRight: 6 }} />
                        {deleting ? "Excluindo..." : "Confirmar exclusão"}
                      </Button>
                    </Row>
                  </TwoColGrid>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <SmallMuted>Eventos</SmallMuted>
            <div style={{ marginTop: 6 }}>
              {eventosDedupe.length > 0 ? (
                eventosDedupe.map((ev, i) => {
                  const when = ev.created_at ? new Date(ev.created_at).toLocaleString("pt-BR") : "";
                  return (
                    <div key={ev.id || `${ev.tipo}-${i}`} style={{ fontSize: 12, opacity: 0.9 }}>
                      • {ev.texto || ev.tipo} — <em>{ev.user_ref || "sistema"}</em>{" "}
                      <SmallMuted>({when})</SmallMuted>
                    </div>
                  );
                })
              ) : (
                <div style={{ opacity: 0.7, fontSize: 12 }}>Sem eventos.</div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <FooterActions>
            <div className="right">
              <Button color="secondary" onClick={onClose}>
                Fechar
              </Button>

              {!isRestrictedUser && (
                <>
                  <Button
                    color="info"
                    onClick={onOpenConferencia}
                    title={
                      canStartConferencia
                        ? (conferenciaConcluida ? "Realizar uma nova conferência" : "Iniciar conferência de itens")
                        : "Informe o Conferente para iniciar"
                    }
                    disabled={!canStartConferencia}
                  >
                    <FiCheckSquare style={{ marginRight: 6 }} />
                    {conferenciaConcluida ? "Realizar uma nova conferência" : "Iniciar conferência de itens"}
                  </Button>

                  <Button
                    color="primary"
                    disabled={!canPrintLabels}
                    onClick={() => setShowLabelModal(true)}
                    title={canPrintLabels ? "Imprimir etiquetas" : "Informe o Conferente para imprimir etiquetas"}
                  >
                    <FiTag style={{ marginRight: 6 }} />
                    Imprimir etiquetas
                  </Button>
                </>
              )}
            </div>
          </FooterActions>
        </ModalFooter>
      </Modal>

      {showLabelModal && (
        <ModalImpressao
          isOpen={showLabelModal}
          onClose={() => setShowLabelModal(false)}
          onConfirm={handlePrintLabels}
          pedido={pedido}
        />
      )}
    </>
  );
}
