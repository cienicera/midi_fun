import React, { useState } from 'react';
import styles from './styles/ParameterGrid.module.css';

const ParameterGrid = () => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const gridSize = 6;

  const handleSquareClick = (x, y) => {
    setSelectedSquare({ x, y });
    console.log(`Clicked square at position (${x}, ${y})`);
  };

  return (
    <div className={styles.gridContainer}>
      {Array.from({ length: gridSize }, (_, y) => (
        <div key={y} className={styles.row}>
          {Array.from({ length: gridSize }, (_, x) => (
            <div
              key={`${x}-${y}`}
              className={`${styles.square} ${
                selectedSquare?.x === x && selectedSquare?.y === y ? styles.selected : ''
              }`}
              onClick={() => handleSquareClick(x, y)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ParameterGrid;
