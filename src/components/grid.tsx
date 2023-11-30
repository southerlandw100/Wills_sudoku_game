import React from 'react';
import Cell from './cell'; 
import './grid.css';

type CellData = {
  type: 'fixed' | 'dynamic';
  value: string;
  isSelected: boolean;
};

type GridProps = {
  gridData: CellData[][];
  handleCellSelect: (rowIndex: number, colIndex: number) => void;
  handleCellValueChange: (rowIndex: number, colIndex: number, newValue: string) => void;
  incorrectCells: Set<string>;
};

const Grid: React.FC<GridProps> = ({
  gridData,
  handleCellSelect,
  handleCellValueChange,
  incorrectCells
}) => {
  return (
    <div className="grid">
      {gridData.map((row, rowIndex) =>
  row.map((cell, colIndex) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    const isIncorrect = incorrectCells.has(cellKey); // Check if the cell is incorrect

    return (
      <Cell
        key={cellKey}
        type={cell.type}
        value={cell.value}
        isSelected={cell.isSelected}
        isIncorrect={isIncorrect} // Pass this as a prop to Cell
        onSelect={() => handleCellSelect(rowIndex, colIndex)}
        onChange={(newValue) => handleCellValueChange(rowIndex, colIndex, newValue)}
      />
    );
  })
)}
    </div>
  );
};

export default Grid;
