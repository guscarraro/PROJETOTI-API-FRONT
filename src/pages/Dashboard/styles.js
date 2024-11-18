import styled, { keyframes, css } from 'styled-components';

export const pulseOpacity = keyframes`
0% {
  opacity: 1;
}
50% {
  opacity: 0.6;
}
100% {
  opacity: 1;
}
`;

export const Box = styled.div`
background-color: ${(props) => props.bgColor || 'rgba(0, 0, 0, 0.7)'};
color: #fff;
border-radius: 10px;
padding: 20px;
margin: 10px;
text-align: center;
height: auto;
opacity: 0.9;
display: flex;
flex-direction: column;
justify-content: space-between;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
${(props) => props.isPulsing && css`
  animation: ${pulseOpacity} 2s infinite;
`}
`;

export const ProgressBar = styled.div`
width: 100%;
background-color: rgba(255, 255, 255, 0.1);
border-radius: 5px;
overflow: hidden;
height: 8px;
position: relative;
margin-top: 10px;

&::after {
  content: '';
  display: block;
  height: 100%;
  background-color: #00C49F;
  width: ${(props) => props.progress}%;
}
`;

export const NoteList = styled.div`
margin-top: 10px;
text-align: left;
font-size: 0.9rem;
`;

export const NoteItem = styled.div`
background-color: rgba(255, 255, 255, 0.1);
padding: 5px;
border-radius: 5px;
margin-bottom: 5px;
color: ${(props) => (props.isOpen ? '#b6fff9' : '#fff')};
opacity: ${(props) => (props.isOpen ? 0.9 : 1)};
`;