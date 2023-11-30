import React, { useState, useEffect } from "react";
import Grid from "./components/grid";
import "./App.css";
import { getSudoku } from "sudoku-gen";

type CellData = {
  type: "fixed" | "dynamic";
  value: string;
  isSelected: boolean;
};

type difficulty = "easy" | "medium" | "hard";

const App = () => {
  const initialGrid: CellData[][] = Array(9)
    .fill(null)
    .map(() =>
      Array(9).fill({
        type: "dynamic",
        value: "",
        isSelected: false,
      })
    );

  const [gridData, setGridData] = useState(initialGrid);
  const [history, setHistory] = useState<CellData[][][]>([]);
  const [redoHistory, setRedoHistory] = useState<CellData[][][]>([]);
  const sudoku = getSudoku("easy");
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [solution, setSolution] = useState("");
  const [hints, setHints] = useState(3);
  const [gameSolved, setGameSolved] = useState(false);
  const [incorrectCells, setIncorrectCells] = useState<Set<string>>(new Set());

  useEffect(() => {
    let interval: NodeJS.Timeout | number | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [timerActive]);

  useEffect(() => {
    if (gameSolved) {
      const playAgain = window.confirm(
        `Congratulations! You solved the puzzle in ${formatTime(
          timer
        )}. Would you like to play a new game?`
      );
      if (playAgain) {
        setGameStarted(false);
        setGameSolved(false);
      } else {
        // Close the message and let the user view the solved puzzle
      }
    }
  }, [gameSolved, timer]);

  // Convert seconds to a time format (e.g., mm:ss)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startGame = (difficulty: difficulty) => {
    const sudoku = getSudoku(difficulty);
    setSolution(sudoku.solution); // Store the solution
    // Transform the generated puzzle to your grid format
    const newGridData = transformPuzzleToGrid(sudoku.puzzle);
    setGridData(newGridData);
    setGameStarted(true);
    setTimer(0);
    setTimerActive(true);
  };

  const transformPuzzleToGrid = (puzzle: string): CellData[][] => {
    const grid: CellData[][] = [];
    for (let row = 0; row < 9; row++) {
      const gridRow: CellData[] = [];
      for (let col = 0; col < 9; col++) {
        const char = puzzle[row * 9 + col];
        gridRow.push({
          type: char === "-" ? "dynamic" : "fixed", // Ensure type is either 'dynamic' or 'fixed'
          value: char !== "-" ? char : "",
          isSelected: false,
        });
      }
      grid.push(gridRow);
    }
    return grid;
  };

  const checkGameCompletion = () => {
    const currentGridString = gridData
      .map((row) => row.map((cell) => cell.value).join(""))
      .join("");
    if (currentGridString === solution) {
      setGameSolved(true);
    }
  };

  const makeChange = (newGridData: CellData[][]) => {
    setHistory((prevHistory) => [...prevHistory, gridData]);
    setRedoHistory([]);
    setGridData(newGridData);
  };

  const handleCellSelect = (rowIndex: number, colIndex: number) => {
    const newGridData = gridData.map((row, rIndex) =>
      row.map((cell, cIndex) => ({
        ...cell,
        isSelected: rIndex === rowIndex && cIndex === colIndex,
      }))
    );
    makeChange(newGridData);
  };

  const handleCellValueChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    const newGridData = gridData.map((row, rIndex) =>
      row.map((cell, cIndex) => {
        if (rIndex === rowIndex && cIndex === colIndex) {
          return { ...cell, value: newValue };
        }
        return cell;
      })
    );
    incorrectCells.delete(`${rowIndex}-${colIndex}`);
    setIncorrectCells(new Set(incorrectCells)); // Trigger a state update
    makeChange(newGridData);
    checkGameCompletion();
  };

  const clearGrid = () => {
    const clearedGridData = gridData.map((row) =>
      row.map((cell) => ({
        ...cell,
        value: cell.type === "dynamic" ? "" : cell.value,
      }))
    );
    makeChange(clearedGridData);
  };

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setRedoHistory((prevRedoHistory) => [...prevRedoHistory, gridData]); // Add current state to redo history
      setGridData(previousState);
      setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
    }
  };

  const redo = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[redoHistory.length - 1];
      setHistory((prevHistory) => [...prevHistory, gridData]); // Add current state to history for potential future undos
      setGridData(nextState);
      setRedoHistory((prevRedoHistory) =>
        prevRedoHistory.slice(0, prevRedoHistory.length - 1)
      );
    }
  };

  const checkGrid = () => {
    const newIncorrectCells = new Set<string>(); 
    gridData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const correctValue = solution[rowIndex * 9 + colIndex];
        if (cell.value !== correctValue && cell.value !== "") {
          newIncorrectCells.add(`${rowIndex}-${colIndex}`);
        }
      });
    });
    setIncorrectCells(newIncorrectCells);
  };

  const useHint = () => {
    if (
      hints > 0 &&
      gridData.some((row) => row.some((cell) => cell.isSelected))
    ) {
      const newGridData = gridData.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell.isSelected && cell.type === "dynamic") {
            const solutionChar = solution[rowIndex * 9 + colIndex];
            return { ...cell, value: solutionChar };
          }
          return cell;
        })
      );
      setGridData(newGridData);
      setHints(hints - 1);
    }
  };
// change these to modals ( abandon game and solve puzzle )
  const abandonGame = () => {
    const confirmAbandon = window.confirm(
      "Are you sure you'd like to abandon this game?"
    );
    if (confirmAbandon) {
      setGameStarted(false);
      setGridData(initialGrid);
      // Reset any other states if necessary
    }
  };

  const solvePuzzle = () => {
    const confirmSolve = window.confirm(
      "Are you sure you'd like to solve the puzzle?"
    );
    if (confirmSolve) {
      const solvedGridData = transformPuzzleToGrid(solution);
      setGridData(solvedGridData);
      // Optionally, you might want to disable further edits
    }
  };

  return (
    <div className="App">
      <h1>My Custom Sudoku Game</h1>
      {!gameStarted ? (
        <div>
          <button onClick={() => startGame("easy")}>Easy</button>
          <button onClick={() => startGame("medium")}>Medium</button>
          <button onClick={() => startGame("hard")}>Hard</button>
        </div>
      ) : (
        <>
          <div className="timer">Time: {formatTime(timer)}</div>
          <Grid
            gridData={gridData}
            handleCellSelect={handleCellSelect}
            handleCellValueChange={handleCellValueChange}
            incorrectCells={incorrectCells}
          />
          <button onClick={clearGrid}>Clear Grid</button>
          <button onClick={undo}>&#8634; Undo</button>
          <button onClick={redo}>&#8635; Redo</button>
          <button onClick={checkGrid}>Check Grid</button>
          <button onClick={useHint}>Hints: {hints}</button>
          <button onClick={abandonGame}>New Game</button>
          <button onClick={solvePuzzle}> Solve Puzzle</button>
        </>
      )}
    </div>
  );
};

export default App;
