import React, { useState, useEffect } from "react";
import styled from "styled-components";

const DotsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Dot = styled.div`
  width: 7px;
  height: 7px;
  margin: 0 2px;
  background-color: ${(props) => (props.active ? "#007bff" : "#ccc")};
  border-radius: 50%;
  transition: background-color 0.3s, transform 0.3s;
  transform: ${(props) => (props.active ? "translateY(-5px)" : "translateY(0)")};
`;

const LoadingDots = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 300); // Change active dot every 300ms

    return () => clearInterval(interval);
  }, []);

  return (
    <DotsWrapper>
      {[0, 1, 2].map((index) => (
        <Dot key={index} active={index === activeIndex} />
      ))}
    </DotsWrapper>
  );
};

export default LoadingDots;
