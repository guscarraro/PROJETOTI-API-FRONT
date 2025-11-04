import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Button } from "reactstrap";
import NavBar from "../../Projetos/components/NavBar";
import { Page, TitleBar, H1, SearchWrap, SearchInput } from "../../Projetos/style";

import ModalCreate from "./ModalCreate";
import ModalEdit from "./ModalEdit";
import ModalDelete from "./ModalDelete";
import apiLocal from "../../../services/apiLocal";

export default function IntegrantesPage() {
  const [integrantes, setIntegrantes] = useState([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Quando o back estiver pronto:
        const res = await apiLocal.getIntegrantes();
        setIntegrantes(res.data || []);
        // Mock temporário:
      
      } catch {
        setIntegrantes([]);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const q = String(query || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (!q) return integrantes;
    const out = [];
    for (let i = 0; i < integrantes.length; i++) {
      const it = integrantes[i];
      const nome = (it.nome || "").toLowerCase();
      const sobrenome = (it.sobrenome || "").toLowerCase();
      const cpf = (it.cpf || "").toLowerCase();
      if (nome.includes(q) || sobrenome.includes(q) || cpf.includes(q)) out.push(it);
    }
    return out;
  }, [integrantes, query]);

  const refresh = async () => {
    try {
      // const res = await apiLocal.getIntegrantes();
      // setIntegrantes(res.data || []);
      // Mock (remove quando ligar o back):
      setIntegrantes((prev) => prev.slice());
    } catch {}
  };

  return (
    <Page>
      <NavBar />

      <TitleBar>
        <H1 $accent="#0ea5e9">Conferência — Integrantes</H1>
        <RightRow>
          <SearchWrap title="Buscar por nome, sobrenome ou CPF">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M13.477 12.307a6 6 0 11-1.172 1.172l3.327 3.327a.83.83 0 001.172-1.172l-3.327-3.327zM8.5 13a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />
            </svg>
            <SearchInput
              placeholder="Buscar integrante..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchWrap>

          <Button color="primary" onClick={() => setShowCreate(true)}>
            + Novo Integrante
          </Button>
        </RightRow>
      </TitleBar>

      <CardLike>
        <Table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Sobrenome</th>
              <th>CPF</th>
              <th style={{ textAlign: "center", width: 140 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={4} style={{ opacity: 0.7, padding: 16 }}>
                  Nenhum integrante encontrado.
                </td>
              </tr>
            )}
            {filtrados.map((i) => (
              <tr key={i.id}>
                <td>{i.nome}</td>
                <td>{i.sobrenome}</td>
                <td>{i.cpf}</td>
                <td style={{display:"flex", textAlign: "center" }}>
                  <ActionBtn
                    onClick={() => {
                      setSelected(i);
                      setShowEdit(true);
                    }}
                  >
                    Editar
                  </ActionBtn>
                  <ActionBtn
                    $danger
                    onClick={() => {
                      setSelected(i);
                      setShowDelete(true);
                    }}
                  >
                    Excluir
                  </ActionBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardLike>

      {showCreate && (
        <ModalCreate
          onClose={() => setShowCreate(false)}
          onSave={async () => {
            await refresh();
            setShowCreate(false);
          }}
        />
      )}
      {showEdit && selected && (
        <ModalEdit
          integrante={selected}
          onClose={() => {
            setSelected(null);
            setShowEdit(false);
          }}
          onSave={async () => {
            await refresh();
            setSelected(null);
            setShowEdit(false);
          }}
        />
      )}
      {showDelete && selected && (
        <ModalDelete
          integrante={selected}
          onClose={() => {
            setSelected(null);
            setShowDelete(false);
          }}
          onDelete={async () => {
            await refresh();
            setSelected(null);
            setShowDelete(false);
          }}
        />
      )}
    </Page>
  );
}

/* ===== estilos locais no mesmo padrão visual ===== */
const RightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardLike = styled.div`
  /* controla a cor dos textos do conteúdo inteiro */
  color: #0f172a;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

  [data-theme="dark"] & {
    color: #fff;
    background: #0f172a;
    border-color: rgba(255, 255, 255, 0.08);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    color: inherit; /* herda preto/branco do CardLike */
  }

  th {
    background: #f8fafc;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.3px;
  }

  tr:hover td {
    background: #f9fafb;
  }

  [data-theme="dark"] & th {
    background: #0b1220;
    border-color: rgba(255, 255, 255, 0.08);
    color: inherit; /* branco no dark */
  }
  [data-theme="dark"] & td {
    border-color: rgba(255, 255, 255, 0.08);
  }
  [data-theme="dark"] & tr:hover td {
    background: #0b1220;
  }
`;

const ActionBtn = styled.button`
  border: 1px solid ${(p) => (p.$danger ? "rgba(239,68,68,.35)" : "#e5e7eb")};
  background: #fff;
  color: ${(p) => (p.$danger ? "#b91c1c" : "#111827")};
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 4px;
  transition: 0.15s ease;

  &:hover {
    background: ${(p) => (p.$danger ? "rgba(239,68,68,.08)" : "#f9fafb")};
  }

  [data-theme="dark"] & {
    background: #0f172a;
    color: ${(p) => (p.$danger ? "#fecaca" : "#e5e7eb")};
    border-color: ${(p) =>
      p.$danger ? "rgba(239,68,68,.45)" : "rgba(255,255,255,.18)"};
    &:hover {
      background: #0b1220;
    }
  }
`;
