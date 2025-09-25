import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Title,
  StyledForm,
  FormGroup,
  Label,
  Input,
  TextArea,
  SubmitButton,
} from "./style";
import { FaDollarSign, FaUser, FaBuilding, FaStickyNote, FaFileImage, FaFileInvoice } from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import ModalImage from "./ModalImage";
import LoadingDots from "../../../components/Loading"; // Altere o caminho conforme necessário
import {  fetchNotaFiscal } from "../../../services/api";


const LancarFalta = ({ onActionComplete }) => {
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [clienteNome, setClienteNome] = useState("");
  const [destinoNome, setDestinoNome] = useState("");
  const [motoristas, setMotoristas] = useState([]);
  const [motoristaId, setMotoristaId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNota, setLoadingNota] = useState(false);
  const [falta, setFalta] = useState({
    nf: "",
    cliente_id: "",
    destino_id: "",
    cidade: "",
    valor_falta: "",
    obs: "",
    foto_anexo: "",
    tipo_ocorren: "",
    filial: "",
    responsavel: "",
    autor_por: "",
    conferente: "",
  });

  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [clientesDuplicados, setClientesDuplicados] = useState([]);
  const [modal, setModal] = useState(false);

  const filiais = ["SJP", "MGA", "PTO", "CAS", "NPP", "GUA", "SC", "SP"];
  const responsavel = ["SJP", "MGA", "PTO", "CAS", "NPP", "GUA", "SC", "SP","MOTORISTA","CLIENTE"]
  const autores = ["Maicon", "Fernanda", "Gean", "Michelen","Mikael", "Vinicius","Ademir","Lucas"];


  const toggleModalImage = () => {
    setModalImageOpen(!modalImageOpen);
  };
  const fetchMotoristas = async () => {
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      console.error(error);
    }
  };
  

  const handleImageUpload = (file) => {
    if (!(file instanceof Blob)) {
      console.error("O arquivo não é do tipo Blob:", file);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setUploadedImage(base64String);
      setFalta((prev) => ({
        ...prev,
        foto_anexo: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    Promise.all([fetchClientes(), fetchDestinos(), fetchMotoristas()]);
  }, []);
  

  const fetchClientes = async () => {
    try {
      const response = await apiLocal.getClientes();
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao buscar clientes.");
      console.error(error);
    }
  };
  const handleMotoristaChange = (e) => {
    setMotoristaId(e.target.value);
    setFalta((prev) => ({
      ...prev,
      motorista_id: e.target.value, // Atualiza o campo motorista_id no objeto falta
    }));
  };
  
  

  const fetchDestinos = async () => {
    try {
      const response = await apiLocal.getDestinos();
      setDestinos(response.data);
    } catch (error) {
      toast.error("Erro ao buscar destinos.");
      console.error(error);
    }
  };

  const handleNotaFiscalChange = (e) => {
    const nf = e.target.value;
    setFalta({ ...falta, nf });
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Tab" && falta.nf) {
      setLoadingNota(true);
      try {
        // Busca os dados da API externa
        const response = await fetchNotaFiscal(falta.nf.trim());
  
        if (!response || !Array.isArray(response)) {
          throw new Error("Resposta inválida da API.");
        }
  
        // Filtra as notas que correspondem à NF digitada
        const notasFiltradas = response.filter((n) => {
          if (!n.NF || isNaN(n.NF)) {
            return false;
          }
          return n.NF.toString().trim() === falta.nf.trim();
        });
  
        if (notasFiltradas.length === 1) {
          const nota = notasFiltradas[0];
  
          const clienteEncontrado = clientes.find((c) => c.nome === nota.remetente);
const destinoEncontrado = destinos.find((d) => d.nome === nota.destinatario);

setFalta((prev) => ({
  ...prev,
  cliente_id: clienteEncontrado ? clienteEncontrado.id : "",
  destino_id: destinoEncontrado ? destinoEncontrado.id : "",
  cidade: nota.destino,
}));

setClienteNome(nota.remetente);
setDestinoNome(nota.destinatario);

        } else if (notasFiltradas.length > 1) {
          setClientesDuplicados(notasFiltradas);
          setModal(true);
        } else {
          toast.warning("Nenhuma informação encontrada para a NF digitada.");
        }
      } catch (error) {
        toast.error("Erro ao buscar informações da nota fiscal.");
      } finally {
        setLoadingNota(false);
      }
    }
  };
  
  
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFalta({ ...falta, [name]: value });
  };

  const handleValueChange = (e) => {
    let value = e.target.value;
  
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "");
  
    // Formata como moeda
    const formattedValue = (Number(numericValue) / 100).toFixed(2).replace(".", ",");
  
    setFalta((prev) => ({
      ...prev,
      valor_falta: formattedValue, // Exibição formatada
      valor_falta_num: Number(numericValue) / 100, // Valor numérico para envio
    }));
  };
  
  
  

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      // Validação de todos os campos obrigatórios
      if (!falta.tipo_ocorren) {
        toast.error("O campo Tipo da Ocorrência é obrigatório.");
        return;
      }
      if (!falta.filial) {
        toast.error("O campo Tipo da Filial é obrigatório.");
        return;
      }
      if (!falta.responsavel) {
        toast.error("O campo Tipo da Responsavel pelo debito é obrigatório.");
        return;
      }
      if (!falta.autor_por) {
        toast.error("O campo Tipo da Autorizado por é obrigatório.");
        return;
      }
      if (!falta.conferente) {
        toast.error("O campo Tipo da Conferente é obrigatório.");
        return;
      }
      if (!falta.nf) {
        toast.error("O campo Nota Fiscal é obrigatório.");
        return;
      }
      if (!falta.cliente_id) {
        toast.error("O cliente não foi carregado corretamente.");
        return;
      }
      if (!falta.valor_falta_num || falta.valor_falta_num <= 0) {
        toast.error("O valor da falta deve ser maior que zero.");
        return;
      }
      setIsLoading(true);
  
      let clienteID = falta.cliente_id;
      let destinoID = falta.destino_id;
  
      // Verifica e cria cliente, se necessário
      if (!clienteID) {
        const novoCliente = { nome: clienteNome };
        const response = await apiLocal.createOrUpdateCliente(novoCliente);
        clienteID = response.data.data.id;
        setClientes((prev) => [...prev, response.data.data]);
      }
  
      // Verifica e cria destino, se necessário
      if (!destinoID) {
        const novoDestino = {
          nome: destinoNome,
          endereco: null, // Preencha conforme necessário
          cidade: falta.cidade,
        };
        const response = await apiLocal.createOrUpdateDestino(novoDestino);
        
        // Verifica se o destino foi criado com sucesso
        if (response.data && response.data.data && response.data.data.id) {
          destinoID = response.data.data.id;
          setDestinos((prev) => [...prev, response.data.data]);
        } else {
          toast.error("Erro ao criar o destino. Verifique os dados enviados.");
          return;
        }
      }
  
      // Atualiza falta com os IDs corretos
      const faltaFormatada = {
        ...falta,
        cliente_id: clienteID,
        destino_id: destinoID,
        motorista_id: motoristaId,
        valor_falta: falta.valor_falta_num, // Valor numérico para a API
      };
  
  
      // Salva a falta na API
      const response = await apiLocal.createOrUpdateFalta(faltaFormatada);
  
      if (response.data) {
        toast.success("Falta registrada com sucesso!");
        setFalta({
          data_inclusao: new Date().toISOString().split("T")[0],
          nf: "",
          cliente_id: "",
          destino_id: "",
          cidade: "",
          valor_falta: "",
          valor_falta_num: 0,
          obs: "",
          foto_anexo: "",
          filial: "",
          responsavel: "",
          autor_por: "",
          conferente: "",
        });
        setClienteNome("");
        setDestinoNome("");
        setMotoristaId("");
        setUploadedImage(null);
        if (onActionComplete) onActionComplete("Falta registrada com sucesso!");
      } else {
        throw new Error("Erro ao salvar a falta.");
      }
    } catch (error) {
      console.error("Erro ao salvar a falta:", error);
      toast.error(error.message || "Erro ao lançar a falta.");
    }finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };
  
  
  useEffect(() => {
  }, [falta]);
  
  useEffect(() => {
  }, [clientes, destinos]);
  
  

  return (
    <Container>
        <Modal isOpen={modal} toggle={() => setModal(!modal)}>
  <ModalHeader toggle={() => setModal(!modal)}>Selecionar Cliente</ModalHeader>
  <ModalBody>
  <p>Mais de um cliente foi encontrado para esta nota fiscal:</p>
  <ul>
    {clientesDuplicados.map((cliente, index) => (
      <li
        key={index}
        style={{ cursor: "pointer", padding: "5px 0" }}
        onClick={() => {
          const clienteEncontrado = clientes.find((c) => c.nome === cliente.remetente);
          const destinoEncontrado = destinos.find((d) => d.nome === cliente.destinatario);
        
          setClienteNome(cliente.remetente);
          setDestinoNome(cliente.destinatario);
          setFalta((prev) => ({
            ...prev,
            cliente_id: clienteEncontrado ? clienteEncontrado.id : "",
            destino_id: destinoEncontrado ? destinoEncontrado.id : "",
            cidade: cliente.destino,
          }));
          setModal(false);
        }}
        
      >
        Cliente: {cliente.remetente} | Destinatário: {cliente.destinatario} | Cidade: {cliente.destino}
      </li>
    ))}
  </ul>
</ModalBody>

  <ModalFooter>
    <Button color="secondary" onClick={() => setModal(false)}>
      Cancelar
    </Button>
  </ModalFooter>
</Modal>

      <ModalImage isOpen={modalImageOpen} toggle={toggleModalImage} onImageUpload={handleImageUpload} />
      <Title>Lançar Falta</Title>
      <StyledForm onSubmit={handleSave}>
      <FormGroup>
  <Label>
    <FaStickyNote /> Data de Inclusão
  </Label>
  <Input
    type="date"
    name="data_inclusao"
    value={falta.data_inclusao}
    onChange={handleInputChange}
    required
  />
</FormGroup>

      <FormGroup>
  <Label>
    <FaStickyNote /> Tipo de Ocorrência
  </Label>
  <select
    name="tipo_ocorren"
    value={falta.tipo_ocorren || ""}
    onChange={handleInputChange}
    style={{
      width: "100%",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
    }}
  >
    <option value="" disabled>
      Selecione o tipo de ocorrência
    </option>
    <option value="F">Falta</option>
    <option value="A">Avaria</option>
    <option value="I">Inversão</option>
  </select>
</FormGroup>

      <FormGroup>
  <Label>
    <FaFileInvoice /> Nota Fiscal
  </Label>
  <div style={{ position: "relative" }}>
    <Input
      type="text"
      name="nf"
      value={falta.nf}
      onChange={handleNotaFiscalChange}
      onKeyDown={handleKeyDown}
      placeholder="Informe a nota fiscal"
      style={{ paddingRight: "30px" }} // Espaço extra para o ícone
    />
    {loadingNota && (
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          pointerEvents: "none", // Evita interferir na interação do input
        }}
      >
        <LoadingDots />
      </div>
    )}
  </div>
</FormGroup>


        <FormGroup>
          <Label>
            <FaUser /> Cliente
          </Label>
          <Input type="text" value={clienteNome} readOnly placeholder="Cliente carregado automaticamente" />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaBuilding /> Destino
          </Label>
          <Input type="text" value={destinoNome} readOnly placeholder="Destino carregado automaticamente" />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaBuilding /> Cidade
          </Label>
          <Input
            type="text"
            name="cidade"
            value={falta.cidade}
            readOnly
            onChange={handleInputChange}
            placeholder="Digite a cidade"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaBuilding /> Filial onde houve falta
          </Label>
          <select name="filial" value={falta.filial} onChange={handleInputChange}  style={{
      width: "250px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize:'14px'
    }}>
            <option value="" disabled>Selecione a filial</option>
            {filiais.map((filial) => (
              <option key={filial} value={filial}>{filial}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Responsável pelo débito
          </Label>
          <select name="responsavel" value={falta.responsavel} onChange={handleInputChange}  style={{
      width: "250px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize:'14px'
    }}>
            <option value="" disabled>Selecione o responsável</option>
            {responsavel.map((responsavel) => (
              <option key={responsavel} value={responsavel}>{responsavel}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Autorizado Por
          </Label>
          <select name="autor_por" value={falta.autor_por} onChange={handleInputChange}  style={{
      width: "250px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize:'14px'
    }}>
            <option value="" disabled>Selecione quem autorizou</option>
            {autores.map((autor) => (
              <option key={autor} value={autor}>{autor}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Conferente
          </Label>
          <Input type="text" name="conferente" value={falta.conferente} onChange={handleInputChange} placeholder="Digite o nome do conferente" />
        </FormGroup>
        <FormGroup>
  <Label>
    <FaUser /> Motorista
  </Label>
  <select
    name="motorista_id"
    value={motoristaId}
    onChange={handleMotoristaChange}
    style={{
      width: "250px",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize:'14px'
    }}
  >
    <option value="">Selecione um motorista</option>
    {motoristas.map((motorista) => (
      <option key={motorista.id} value={motorista.id}>
        {motorista.nome} - {motorista.placa}
      </option>
    ))}
  </select>
</FormGroup>


        <FormGroup>
          <Label>
            <FaDollarSign /> Valor da Falta
          </Label>
          <Input
            type="text"
            name="valor_falta"
            value={falta.valor_falta}
            onChange={handleValueChange}
            placeholder="Digite o valor da falta"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaStickyNote /> Qtde / Item faltante
          </Label>
          <TextArea
            name="obs"
            value={falta.obs}
            onChange={handleInputChange}
            placeholder="Observações"
          />
        </FormGroup>
        <FormGroup>
          <Label>
            <FaFileImage /> Selecione a NFD/ Recibo pago
          </Label>
          <div>
            <button
              type="button"
              onClick={toggleModalImage}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "10px",
                fontSize:'15px'              }}
            >
              {uploadedImage ? "Imagem Selecionada" : "Selecionar Imagem"}
            </button>
            {uploadedImage && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                {uploadedImage.startsWith("data:image") ? (
                  <img
                    src={uploadedImage}
                    alt="Prévia"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                ) : (
                  <p>Arquivo JSON anexado.</p>
                )}
              </div>
            )}
          </div>
        </FormGroup>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingDots /> : "Adicionar Falta"}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarFalta;
