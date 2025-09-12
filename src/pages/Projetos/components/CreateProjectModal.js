// src/pages/Projetos/components/CreateProjectModal.js
import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { STATUS, formatDate } from "../utils";
import apiLocal from "../../../services/apiLocal";
import useLoading from "../../../hooks/useLoading";
import { MODAL_CLASS, GlobalModalStyles  } from "../style";

export default function CreateProjectModal({
  isOpen,
  toggle,
  actorSectorId, // setor do usuário criador (int)
  onCreated, // callback com projeto criado (opcional)
}) {
  const loading = useLoading();

  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState(formatDate(new Date()));
  const [fim, setFim] = useState(
    formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
  );
  // ⚠️ Usar a CHAVE do enum do back
  const [status, setStatus] = useState("ANDAMENTO");
  const [setoresSel, setSetoresSel] = useState([]); // IDs (int) SEM ADM
  const [allSectors, setAllSectors] = useState([]); // lista sem ADM

  useEffect(() => {
    (async () => {
      try {
        const res = await apiLocal.getSetores();
        const raw = res.data || [];
        // remove ADM/Admin da seleção
        const list = raw.filter((s) => {
          const n = (s.nome || "").trim().toLowerCase();
          return n !== "adm" && n !== "admin";
        });
        setAllSectors(list);
      } catch {
        setAllSectors([]);
      }
    })();
  }, []);

  const resetForm = () => {
    setNome("");
    setInicio(formatDate(new Date()));
    setFim(formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)));
    setStatus("ANDAMENTO");
    setSetoresSel([]);
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.warn("Informe o nome do projeto.");
      return;
    }
    if (new Date(fim) < new Date(inicio)) {
      toast.warn("A data de término deve ser após a data de início.");
      return;
    }
    if (!actorSectorId) {
      toast.error("Setor do criador não identificado.");
      return;
    }

    try {
      const res = await loading.wrap("createProject", async () => {
        const payload = {
          nome: nome.trim(),
          inicio,
          fim,
          status, // ANDAMENTO|STANDBY|CANCELADO|CONCLUIDO
          descricao: null,
          created_by_sector_id: Number(actorSectorId),
          setores: setoresSel.map(Number), // sem ADM; trigger inclui automaticamente
        };
        return apiLocal.createProjeto(payload);
      });

      const data = res?.data?.data || res?.data;
      toast.success("Projeto criado com sucesso!");
      onCreated?.(data);
      resetForm();
      toggle?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar projeto.";
      toast.error(msg);
    }
  };

  return (
    <>
    <GlobalModalStyles />
    <Modal isOpen={isOpen} toggle={loading.any() ? undefined : toggle} size="md" contentClassName={MODAL_CLASS}>
      <ModalHeader toggle={loading.any() ? undefined : toggle}>
        Novo Projeto
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Nome do projeto</Label>
            <Input
              disabled={loading.any()}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Implantação ERP"
              />
          </FormGroup>

          <div style={{ display: "flex", gap: 12 }}>
            <FormGroup style={{ flex: 1 }}>
              <Label>Início</Label>
              <Input
                disabled={loading.any()}
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                />
            </FormGroup>
            <FormGroup style={{ flex: 1 }}>
              <Label>Previsão de término</Label>
              <Input
                disabled={loading.any()}
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Status</Label>
            <Input
              disabled={loading.any()}
              type="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              >
              {Object.entries(STATUS).map(([key, label]) => (
                  <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label>Setores envolvidos</Label>
            <div
              style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 8,
                }}
                >
              {allSectors.map((s) => {
                  const idNum = Number(s.id);
                  const checked = setoresSel.includes(idNum);
                  return (
                  <label
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="checkbox"
                      disabled={loading.any()}
                      checked={checked}
                      onChange={(e) => {
                          setSetoresSel((prev) =>
                            e.target.checked
                          ? [...prev, idNum]
                          : prev.filter((x) => x !== idNum)
                        );
                    }}
                    />
                    <span>{s.nome}</span>
                  </label>
                );
            })}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading.any()}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={loading.any() || !nome.trim()}
          >
          <FaPlus style={{ marginRight: 6 }} />
          {loading.is("createProject") ? "Criando..." : "Criar"}
        </Button>
      </ModalFooter>
    </Modal>
            </>
  );
}
