import React from 'react';
import './cell.css';

type CellProps = {
  type: 'fixed' | 'dynamic';
  value: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newValue: string) => void;
  isIncorrect: boolean; // Add this prop
};

const Cell: React.FC<CellProps> = ({
  type,
  value,
  isSelected,
  onSelect,
  onChange,
  isIncorrect 
}) => {
  const isFixed = type === 'fixed';

  const handleSelect = () => {
    onSelect();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  // Use the isIncorrect prop to conditionally apply a class
  const cellClassName = `cell ${isFixed ? 'fixed' : 'dynamic'} ${isSelected ? 'selected' : ''} ${isIncorrect ? 'incorrect-cell' : ''}`;


  return (
    <div className={cellClassName} onClick={handleSelect}>
      {isFixed ? (
        <span>{value}</span>
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={1}
          className={isSelected ? 'selected' : ''}
        />
      )}
    </div>
  );
};

export default Cell;
