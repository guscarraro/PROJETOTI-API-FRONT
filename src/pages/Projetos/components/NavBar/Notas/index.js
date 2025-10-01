import React, { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { MODAL_CLASS, GlobalModalStyles } from "../../../style"; // respeita darkmode
import opcaoSelecao from "../../../../../images/opcao-selecao.png";
import responsaveis from "../../../../../images/responsaveis-linhas.png";
import comentario from "../../../../../images/comentario.png";

export default function Notas({ version = "1.2" }) {
  const [open, setOpen] = useState(false);

  const toggle = (e) => {
    if (e) e.stopPropagation();
    setOpen((v) => !v);
  };

  return (
    <>
      <GlobalModalStyles />

      {/* Botão/Icone na navbar */}
      <button
        type="button"
        onClick={toggle}
        title={`Notas da versão ${version}`}
        style={{
          all: "unset",
          cursor: "pointer",
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
        }}
      >
        <FiAlertTriangle
          style={{ width: 18, height: 18, color: "#f59e0b" }} // laranja
          aria-label="Notas de atualização"
        />
        {/* Pill da versão */}
        <span
          style={{
            position: "absolute",
            right: -14,
            top: -6,
            fontSize: 10,
            padding: "1px 4px",
            borderRadius: 6,
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.45)",
            color: "#f59e0b",
            fontWeight: 700,
            lineHeight: 1.2,
            userSelect: "none",
          }}
        >
          v{version}
        </span>
      </button>

      {/* Modal com as notas */}
      <Modal
        isOpen={open}
        toggle={toggle}
        size="md"
        contentClassName={MODAL_CLASS}
      >
        <ModalHeader toggle={toggle}>Novidades (v{version})</ModalHeader>
        <ModalBody>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>
              <strong>Menções por @</strong>: chame um <em>usuário</em> ou um{" "}
              <em>setor</em> com @ para avisar quem precisa ver.
                <img
      src={comentario}
      alt="Exemplo de opção de seleção"
      style={{ maxWidth: "100%", height: "auto", borderRadius: 6, display: "block" }}
    />
            </li>
            <li>
              <strong>Etapas por demanda</strong>: cada linha agora pode ter
              número e rótulo de etapa.
            </li>
           
            <li>
  <strong>Participantes por setor</strong>: escolha quais usuários
              de cada setor entram no projeto.

  {/* Imagem abaixo deste li */}
  
    <img
      src={opcaoSelecao}
      alt="Exemplo de opção de seleção"
      style={{ maxWidth: "100%", height: "auto", borderRadius: 6, display: "block" }}
    />
 
</li>

            <li>
              <strong>Login individual</strong>: cada pessoa usa sua própria
              conta.(caso alguem da sua equipe precise de um login contate o
              Gustavo)
            </li>

            <li>
              <strong>Notificações</strong> (apenas saem da lista quando você
              marcar como lidas):
              <ul style={{ margin: "6px 0 0 16px" }}>
                <li>
                  Menção a <em>usuário</em> e a <em>setor</em>.
                </li>
                <li>
                  Projeto criado, status alterado, bloqueado/desbloqueado.
                </li>
                <li>
                  Atribuição de linha, mudança de responsável, mudança de etapa
                  e de setores.
                </li>
                <li>Novo comentário na linha.</li>
              </ul>
             
            </li>

            <li>
              <strong>Leitura</strong>: marque item a item (✓) ou use “Marcar
              todos como lidos”.
            </li>
            <li>
              <strong>Abrir projeto</strong> não marca mais como lido
              automaticamente.
            </li>

            <li>
              <strong>Responsável da linha</strong>: defina exatamente quem fará
              a demanda (mostra as iniciais do e-mail).
                <img
      src={responsaveis}
      alt="Exemplo de opção de seleção"
      style={{ maxWidth: "100%", height: "auto", borderRadius: 6, display: "block" }}
    />
            </li>
            <li>
              <strong>Minha demanda</strong>: filtro que exibe só o que está
              atribuído a você.
            </li>
            <li>
              <strong>Destaque visual</strong>: suas demandas aparecem com um
              realce na lista.
            </li>

            <li>
              <strong>Etapas com dica</strong>: passe o mouse no subtítulo para
              ver o texto completo.
            </li>
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Ok, entendi
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
