import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Container,
  Title,
  StyledForm,
  FormGroup,
  Label,
  Input,
  SubmitButton,
} from "./style";
import {
  FaUser,
  FaTruck,
  FaBuilding,
  FaClipboardList,
  FaMoneyBill,
  FaCalendarAlt,
} from "react-icons/fa";
import apiLocal from "../../../services/apiLocal";
import LoadingDots from "../../../components/Loading";

const LancarColeta = ({ onActionComplete }) => {
  const [clientes, setClientes] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
//   const [gruposEco, setGruposEco] = useState([]);
  const [coleta, setColeta] = useState({
    data_coleta: "",
    motorista_id: "",
    cliente_id: "",
    grupo_eco_id: "",
    valor: "",
    qtde_pallet: "",
    tp_veiculo: "",
    ordem_ref: "",
    obs: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMotoristas();
    fetchClientes();
    // fetchGruposEco();
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

  const fetchMotoristas = async () => {
    try {
      const response = await apiLocal.getMotoristas();
      setMotoristas(response.data);
    } catch (error) {
      toast.error("Erro ao buscar motoristas.");
      console.error(error);
    }
  };

//   const fetchGruposEco = async () => {
//     try {
//       const response = await apiLocal.getGruposEco();
//       setGruposEco(response.data);
//     } catch (error) {
//       toast.error("Erro ao buscar grupos ECO.");
//       console.error(error);
//     }
//   };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setColeta({ ...coleta, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data_coleta,
        motorista_id,
        cliente_id,
        grupo_eco_id,
        valor,
        qtde_pallet,
        tp_veiculo,
        ordem_ref,
        obs,
      } = coleta;

      // Validação dos campos obrigatórios
      if (!data_coleta) {
        toast.error("A Data da Coleta é obrigatória.");
        return;
      }
      if (!motorista_id) {
        toast.error("O Motorista é obrigatório.");
        return;
      }
      if (!cliente_id) {
        toast.error("O Cliente é obrigatório.");
        return;
      }
    //   if (!grupo_eco_id) {
    //     toast.error("O Grupo ECO é obrigatório.");
    //     return;
    //   }
      if (!valor) {
        toast.error("O Valor da Coleta é obrigatório.");
        return;
      }
      if (!qtde_pallet) {
        toast.error("A Quantidade de Pallets é obrigatória.");
        return;
      }
      if (!tp_veiculo.trim()) {
        toast.error("O Tipo de Veículo é obrigatório.");
        return;
      }

      // Envia o payload ao backend
      const payload = {
        data_coleta,
        motorista_id: Number(motorista_id),
        cliente_id: Number(cliente_id),
        valor: parseFloat(valor),
        qtde_pallet: parseInt(qtde_pallet),
        tp_veiculo: tp_veiculo.trim(),
        ordem_ref: ordem_ref.trim() || null,
        obs: obs.trim() || null,
      };
      
      
      // 🔥 Se grupo_eco_id estiver vazio, remove do objeto antes de enviar
     
      
      const response = await apiLocal.createOrUpdateColeta(payload);
      
      if (response.data) {
        toast.success("Coleta registrada com sucesso!");
        setColeta({
          data_coleta: "",
          motorista_id: "",
          cliente_id: "",
          grupo_eco_id: "",
          valor: "",
          qtde_pallet: "",
          tp_veiculo: "",
          ordem_ref: "",
          obs: "",
        });

        if (onActionComplete)
          onActionComplete("Coleta registrada com sucesso!");
      }
    } catch (error) {
      console.error(
        "Erro ao registrar a coleta:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.detail || "Erro ao registrar a coleta."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Lançar Coleta</Title>
      <StyledForm onSubmit={handleSave}>
        <FormGroup>
          <Label>
            <FaCalendarAlt /> Data da Coleta
          </Label>
          <Input
            type="date"
            name="data_coleta"
            value={coleta.data_coleta}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaUser /> Motorista
          </Label>
          <select
            name="motorista_id"
            value={coleta.motorista_id}
            onChange={handleInputChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "250px",
              fontSize: "14px",
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
            <FaBuilding /> Cliente
          </Label>
          <select
            name="cliente_id"
            value={coleta.cliente_id}
            onChange={handleInputChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "250px",
              fontSize: "14px",
            }}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* <FormGroup>
          <Label>
            <FaClipboardList /> Grupo ECO
          </Label>
          <select
            name="grupo_eco_id"
            value={coleta.grupo_eco_id}
            onChange={handleInputChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "250px",
              fontSize: "14px",
            }}
          >
            <option value="">Selecione um grupo</option>
            {gruposEco.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome_grupo} - {grupo.responsavel}
              </option>
            ))}
          </select>
        </FormGroup> */}

        <FormGroup>
          <Label>
            <FaMoneyBill /> Valor da Coleta
          </Label>
          <Input
            type="number"
            name="valor"
            value={coleta.valor}
            onChange={handleInputChange}
            placeholder="Informe o valor da coleta"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaClipboardList /> Quantidade de Pallets
          </Label>
          <Input
            type="number"
            name="qtde_pallet"
            value={coleta.qtde_pallet}
            onChange={handleInputChange}
            placeholder="Informe a quantidade de pallets"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            <FaTruck /> Tipo de Veículo
          </Label>
          <select
            name="tp_veiculo"
            value={coleta.tp_veiculo}
            onChange={handleInputChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "250px",
              fontSize: "14px",
            }}
          >
            <option value="">Selecione um tipo de veículo</option>
            {[
              { value: "TRUCK", label: "TRUCK" },
              { value: "TOCO", label: "TOCO" },
              { value: "3/4", label: "3/4" },
              { value: "VAN", label: "VAN" },
              { value: "FIORINO", label: "FIORINO" },
              { value: "CARRETA", label: "CARRETA" },
            ].map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>Ordem de Referência</Label>
          <Input
            type="text"
            name="ordem_ref"
            value={coleta.ordem_ref}
            onChange={handleInputChange}
            placeholder="Opcional"
          />
        </FormGroup>

        <FormGroup>
          <Label>Observação</Label>
          <Input
            type="text"
            name="obs"
            value={coleta.obs}
            onChange={handleInputChange}
            placeholder="Opcional"
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <LoadingDots /> : "Registrar Coleta"}
        </SubmitButton>
      </StyledForm>
    </Container>
  );
};

export default LancarColeta;
