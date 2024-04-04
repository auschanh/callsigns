import { createContext, useContext } from "react";

const GameInfoContext = createContext();

export default GameInfoContext;

export function useGameInfoContext() {
  const gameInfo = useContext(GameInfoContext);

  if (gameInfo === undefined) {
    throw new Error("useGameInfo must be used with a GameInfoContext");
  }

  return gameInfo;
}
