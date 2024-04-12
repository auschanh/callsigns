import { React, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import WordGenerator from "../components/WordGenerator";
import CardStack from "../components/CardStack";
import Slider from "../components/Slider";
// import Step from "../components/Step"
import { useGameInfoContext } from "../contexts/GameInfoContext";

const Game = function (props) {
  const [playerName, selectedPlayers, roomID] = useGameInfoContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const _handleIndexChange = (index) => {
    setCurrentIndex(index);
  };

  const _handleNext = (currentIndex) => {
    setCurrentIndex(currentIndex + 1);
  };

  const _handleComplete = () => {};

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const cards = [
    {
      title: "Round Start",
      color: "#52B2CF",
      phase: "Round Start"
    },
    {
      title: "Card 2",
      color: "#E5A36F",
      phase: "Generate CallSign Phase"
    },
    {
      title: "Card 3",
      color: "#9CADCE",
      phase: "Agents Hint Phase"
    },
    {
      title: "Card 4",
      color: "#D4AFB9",
      phase: "Eliminate Hints Phase"
    },
    {
      title: "Card 5",
      color: "#008080",
      phase: "Guess CallSign Phase"
    },
    {
      title: "Round End",
      color: "#FF0000",
      phase: "Round End"
    }
];
  
  return (
    <div className="bg-black overflow-hidden flex">
        <div className="fixed w-1/5 h-screen mt-10 z-[9999]">
          <Slider onChange={_handleIndexChange} currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
        </div>
        <div className="flex-1">
        <CardStack cards={cards} 
          currentIndex={currentIndex} 
          handleNext={handleNext}/>
        </div>
          
      
      {/* <div className="flex flex-col text-center items-center justify-center">
        <div>
          Room ID: {roomID}
          <br />
          Hello, {playerName}
          <br />
          These are the current players:
          <p>
            {selectedPlayers.map((playerName, index) => {
              if (index !== selectedPlayers.length - 1) {
                return <span>{`${playerName}, `}</span>;
              } else {
                return <span>{`${playerName}`}</span>;
              }
            })}
          </p>
        </div>
      </div>
      <div>
       <WordGenerator />
      </div> */}
    </div>
  
   
  );
};

export default Game;
