import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import styled from "styled-components";

const SummaryBoxContainer = styled(Card)`
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #fff;
  padding: 20px;
  background-color: ${(props) => props.bgColor || "#fff"};
  color: ${(props) => props.textColor || "#000"};
  transition: all 0.3s ease-in-out;
`;

const IconContainer = styled.div`
  font-size: 40px;
  margin-bottom: 10px;
  color: ${(props) => props.iconColor || "#000"};
`;

const SummaryValue = styled.div`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const SummaryLabel = styled(CardTitle)`
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
`;

const SummaryBox = ({ title, icon: Icon, bgColor, data, iconColor }) => {
  return (
    <SummaryBoxContainer bgColor={bgColor}>
      <CardBody>
        <IconContainer iconColor={iconColor}>
          <Icon />
        </IconContainer>
        <SummaryValue>
          {data?.valor
            ? data.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "N/A"}
        </SummaryValue>
        <SummaryLabel>{title}</SummaryLabel>
      </CardBody>
    </SummaryBoxContainer>
  );
};

export default SummaryBox;
