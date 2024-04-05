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

  const cards = [
    {
      title: "Round Start",
      color: "#52B2CF"
    },
    {
      title: "Card 2",
      color: "#E5A36F"
    },
    {
      title: "Card 3",
      color: "#9CADCE"
    },
    {
      title: "Card 4",
      color: "#D4AFB9"
    },
    {
      title: "Card 5",
      color: "#008080"
    },
    {
      title: "Round End",
      color: "#FF0000"
    }
];
  
  return (
    <div className="bg-black">
      <div className="flex pt-2 pl-2">
        <div className="fixed w-[5%] mt-10">
          <Slider onChange={_handleIndexChange} currentIndex={currentIndex} numCards={cards.length-1} />
        </div>
          <CardStack cards={cards} className="w-[95%]"/>
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
