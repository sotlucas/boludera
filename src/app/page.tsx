"use client";

import { useState, useEffect } from "react";
import ImgMate from "@/assets/mate.png";
import Image from "next/image";

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
  const [userWords, setUserWords] = useState(["", "", "", ""]);
  const [revealedRows, setRevealedRows] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

  useEffect(() => {
    resetGame();
  }, [currentPuzzle]);

  const resetGame = () => {
    setUserWords(["", "", "", ""]);
    setRevealedRows([false, false, false, false]);
    setGameComplete(false);
    setSelectedRow(0);
  };

  const handleInputChange = (index: number, value: string) => {
    const newWords = [...userWords];
    newWords[index] = value.toUpperCase().slice(0, 5);
    setUserWords(newWords);

    // Check if game is complete
    const isComplete = newWords.every(
      (word, i) => word === currentPuzzle.words[i]
    );
    setGameComplete(isComplete);
  };

  const revealRow = (index: number) => {
    const newRevealed = [...revealedRows];
    newRevealed[index] = true;
    setRevealedRows(newRevealed);

    const newWords = [...userWords];
    newWords[index] = currentPuzzle.words[index];
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

  const getRowStyle = (index: number) => {
    const word = userWords[index];
    const correctWord = currentPuzzle.words[index];

    if (revealedRows[index]) {
      return "bg-blue-100 border-blue-400 text-blue-800";
    } else if (word && word === correctWord) {
      return "bg-green-100 border-green-400 text-green-800";
    } else if (selectedRow === index) {
      return "bg-yellow-50 border-yellow-400 text-gray-800";
    } else {
      return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#74acdf] p-4">
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

          <div className="space-y-4 mb-8">
            {currentPuzzle.words.map((word, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1 flex items-center space-x-4">
                  <input
                    type="text"
                    value={userWords[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onFocus={() => setSelectedRow(index)}
                    className={`w-60 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${getRowStyle(
                      index
                    )}`}
                    maxLength={5}
                    placeholder="_____"
                    disabled={revealedRows[index]}
                  />

                  <button
                    onClick={() => revealRow(index)}
                    disabled={
                      revealedRows[index] ||
                      userWords[index] === currentPuzzle.words[index]
                    }
                    className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 text-white disabled:text-gray-500 rounded-lg transition-colors cursor-pointer"
                  >
                    Revelar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8 min-h-16">
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-700 text-lg">
                {currentPuzzle.clues[selectedRow]}
              </span>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={getRandomHint}
              disabled={revealedRows.every((revealed) => revealed)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
            >
              Pista
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
                Congratulations!
              </h2>
              <p className="text-gray-600">You solved the word ladder!</p>
              <button
                onClick={nextPuzzle}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Next Puzzle
              </button>
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
