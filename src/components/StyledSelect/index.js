import styled from "styled-components";
import Select from "react-select";

export const StyledSelect = styled(Select).attrs(() => ({
  styles: {
    
    control: (base) => ({
      ...base,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      margin: '15px 10px 0px 15px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#fff',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#fff',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#fff',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: '#000',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isFocused
        ? 'rgba(255, 255, 255, 0.3)'
        : isSelected
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)',
      color: isFocused || isSelected ? '#000' : '#fff',
      ':active': {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
      },
    }),
  },
}))``;
