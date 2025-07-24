"use client";

import { useState, useEffect, useRef } from "react";
import ImgMate from "@/assets/mate.png";
import Image from "next/image";
import Confetti from "react-confetti";

const GAME_PUZZLES = [
  {
    words: ["GARSO", "GARCO", "GARCA", "GARRA"],
    clues: [
      "Acción de escupir con catarro",
      "Defecar, materia fecal, excremento",
      "Persona que actúa de manera deshonesta o traicionera",
      "Sinónimo de esfuerzo (en deportes)",
    ],
    title: "",
  },
];

export default function WordLadder() {
  const [currentPuzzle, setCurrentPuzzle] = useState(GAME_PUZZLES[0]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [userWords, setUserWords] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);
  const [revealedRows, setRevealedRows] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [gameComplete, setGameComplete] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ]);

  useEffect(() => {
    resetGame();
  }, [currentPuzzle]);

  useEffect(() => {
    if (
      selectedRow >= 0 &&
      selectedCol >= 0 &&
      inputRefs.current[selectedRow][selectedCol] &&
      !revealedRows[selectedRow]
    ) {
      inputRefs.current[selectedRow][selectedCol]?.focus();
    }
  }, [selectedRow, selectedCol, revealedRows]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (selectedRow > 0) {
          setSelectedRow(selectedRow - 1);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (selectedRow < currentPuzzle.words.length - 1) {
          setSelectedRow(selectedRow + 1);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (selectedCol > 0) {
          setSelectedCol(selectedCol - 1);
        }
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        if (selectedCol < 4) {
          setSelectedCol(selectedCol + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRow, selectedCol, currentPuzzle.words.length]);

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowDimensions();
    window.addEventListener("resize", updateWindowDimensions);

    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  const resetGame = () => {
    setUserWords([
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
    ]);
    setRevealedRows([false, false, false, false]);
    setGameComplete(false);
    setSelectedRow(0);
    setSelectedCol(0);
  };

  const handleInputChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (value.length > 1) return; // Only allow single characters

    const newWords = [...userWords];
    newWords[rowIndex][colIndex] = value.toUpperCase();
    setUserWords(newWords);

    // Auto-advance to next input
    if (value && colIndex < 4) {
      setSelectedCol(colIndex + 1);
    }

    // Check if game is complete
    const isComplete = newWords.every(
      (wordArray, i) => wordArray.join("") === currentPuzzle.words[i]
    );
    setGameComplete(isComplete);
  };

  const handleKeyDown = (
    rowIndex: number,
    colIndex: number,
    event: React.KeyboardEvent
  ) => {
    if (
      event.key === "Backspace" &&
      !userWords[rowIndex][colIndex] &&
      colIndex > 0
    ) {
      setSelectedCol(colIndex - 1);
    } else if (event.key === "Delete") {
      // Clear current character and move to next input
      const newWords = [...userWords];
      newWords[rowIndex][colIndex] = "";
      setUserWords(newWords);

      if (colIndex < 4) {
        setSelectedCol(colIndex + 1);
      }
    }
  };

  const handleGridBlur = (event: React.FocusEvent) => {
    // Check if the new focus target is outside the grid
    if (
      gridRef.current &&
      !gridRef.current.contains(event.relatedTarget as Node)
    ) {
      setSelectedRow(-1);
      setSelectedCol(-1);
    }
  };

  const revealRow = (index: number) => {
    const newRevealed = [...revealedRows];
    newRevealed[index] = true;
    setRevealedRows(newRevealed);

    const newWords = [...userWords];
    newWords[index] = currentPuzzle.words[index].split("");
    setUserWords(newWords);
  };

  const getRandomHint = () => {
    const unrevealedRows = revealedRows
      .map((revealed, index) => (revealed ? null : index))
      .filter((index) => index !== null);

    if (unrevealedRows.length === 0) return;

    const randomIndex =
      unrevealedRows[Math.floor(Math.random() * unrevealedRows.length)];
    revealRow(randomIndex);
  };

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % GAME_PUZZLES.length;
    setPuzzleIndex(nextIndex);
    setCurrentPuzzle(GAME_PUZZLES[nextIndex]);
  };

  const getInputStyle = (rowIndex: number, colIndex: number) => {
    const baseStyle =
      "w-12 h-12 text-center text-xl font-bold focus:outline-none focus:z-10";

    // Border radius logic for seamless appearance
    let borderRadius = "";
    if (colIndex === 0) {
      borderRadius = "rounded-l-lg";
    } else if (colIndex === 4) {
      borderRadius = "rounded-r-lg";
    } else {
      borderRadius = "rounded-none";
    }

    // Check if this input or the previous one is focused to handle left border
    const isFocused = selectedRow === rowIndex && selectedCol === colIndex;
    const isPrevFocused =
      selectedRow === rowIndex && selectedCol === colIndex - 1;

    // Border logic to avoid double borders but handle focus
    let borderStyle = "";
    if (colIndex === 0) {
      borderStyle = "border-2";
    } else if (isFocused || isPrevFocused) {
      borderStyle = "border-2";
    } else {
      borderStyle = "border-2 border-l-0";
    }

    if (revealedRows[rowIndex]) {
      return `${baseStyle} ${borderRadius} ${borderStyle} bg-blue-100 border-blue-400 text-blue-800 focus:ring-2 focus:ring-blue-400`;
    } else if (gameComplete) {
      return `${baseStyle} ${borderRadius} ${borderStyle} bg-green-100 border-green-400 text-green-800 focus:ring-2 focus:ring-green-400`;
    } else if (selectedRow === rowIndex && selectedRow >= 0) {
      return `${baseStyle} ${borderRadius} ${borderStyle} bg-yellow-50 border-yellow-400 text-gray-800 focus:ring-2 focus:ring-yellow-400`;
    } else {
      return `${baseStyle} ${borderRadius} ${borderStyle} bg-gray-50 border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-400`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#74acdf] p-4">
      {gameComplete && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          colors={["#74ACDF", "#FFFFFF", "#87CEEB", "#E6F3FF"]}
          numberOfPieces={400}
          recycle={true}
          run={gameComplete}
        />
      )}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">boludera</h1>
            <Image
              className="h-8 w-8 ml-3 cursor-pointer"
              src={ImgMate}
              alt="mate"
              width={32}
              height={32}
              priority
            />
          </div>

          <div ref={gridRef} className="space-y-4 mb-8" onBlur={handleGridBlur}>
            {currentPuzzle.words.map((word, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center">
                {[0, 1, 2, 3, 4].map((colIndex) => (
                  <input
                    key={colIndex}
                    ref={(el) => {
                      inputRefs.current[rowIndex][colIndex] = el;
                    }}
                    type="text"
                    value={userWords[rowIndex][colIndex]}
                    onChange={(e) =>
                      handleInputChange(rowIndex, colIndex, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                    onFocus={() => {
                      setSelectedRow(rowIndex);
                      setSelectedCol(colIndex);
                    }}
                    className={getInputStyle(rowIndex, colIndex)}
                    maxLength={1}
                    disabled={revealedRows[rowIndex]}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8 min-h-16">
            <div className="flex items-center justify-center space-x-3 bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-700 text-lg text-center">
                {selectedRow >= 0
                  ? currentPuzzle.clues[selectedRow]
                  : "Selecciona una fila para ver la pista"}
              </span>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => revealRow(selectedRow)}
              disabled={revealedRows.every((revealed) => revealed)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
            >
              Revelar fila
            </button>
            <button
              onClick={resetGame}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
            >
              Reiniciar
            </button>
          </div>

          {gameComplete && (
            <div className="text-center space-y-4 mb-6">
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-bold text-green-600">
                Felicitaciones!
              </h2>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p className="mt-2 text-xs">
              Cada palabra difiere de la siguiente por exactamente una letra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
