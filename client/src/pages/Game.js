import { React, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "axios";

const Game = function (props) {
  const [word, setWord] = useState("");
  const [generatedWords, setGeneratedWords] = useState([]);
  const [guess, setGuess] = useState("");
  const [clicked, setClicked] = useState(false);
  const [correctGuess, setCorrectGuess] = useState(null);
  const [errMsg, setErrMsg] = useState(false);

  const generateWord = async () => {
    // get word from word bank in backend
    setClicked(false);
    const url = "http://localhost:3001/getMysteryWord";
    try {
      const response = await axios.get(url);
      const retrievedWord = response.data;

      if (!generatedWords.includes(retrievedWord)) {
        setCorrectGuess(false);
        setErrMsg(false);
        setWord(retrievedWord);
        setGeneratedWords([...generatedWords, retrievedWord]);
        // send to backend
        // backend emits back to other users to save to their state
      } else generateWord();
    } catch (error) {
      throw error;
    }
  };

  const handleChange = (e) => {
    setClicked(false);
    setGuess(e.target.value);
    setCorrectGuess(false);
    setErrMsg(false);
  };

  const checkGuesserWord = (e) => {
    setClicked(true);
    const checkGuess = guess.toLowerCase().trim();
    if (!/^[a-z]+$/.test(checkGuess)) {
      // should not console log if all lower case, one word and no special chars
      setErrMsg(true);
    }
    const checkWord = word.toLowerCase().trim();
    if (checkGuess === checkWord) {
      setGuess(checkGuess);
      setCorrectGuess(true);
    } else {
      setCorrectGuess(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div>
        <h1 className="font-bold text-2xl text-center">Game</h1>
      </div>
      <div className="w-40 text-center">
        <Button
          className="border-2 border-blue-600 text-white"
          onClick={generateWord}
        >
          Generate a Word
        </Button>
      </div>
      {word && (
        <div className="flex flex-col justify-center items-center gap-2">
          <div className="mt-4">Generated Word: {word}</div>
          <br />
          <Label htmlFor="guess">Guess the word</Label>
          <Input
            id="guess"
            value={guess}
            placeholder="mystery word"
            onChange={(e) => {
              handleChange(e);
            }}
          />
          <Button variant="green" htmlFor="guess" onClick={checkGuesserWord}>
            Guess
          </Button>
          {guess && <div>{guess}</div>}
          {correctGuess === true && clicked ? (
            <div className="text-green-600">{`Guesser got the mystery word: ${guess}`}</div>
          ) : correctGuess === false && clicked ? (
            <div className="text-red-600">Guess was incorrect.</div>
          ) : null}
        </div>
      )}
      {errMsg && (
        <div className="text-red-600">
          Guess cannot contain numbers, special characters or spaces.
        </div>
      )}
    </div>
  );
};

export default Game;
