import React, { useState, useRef } from "react";

const CardStack = ({ cards, selectedCardIndex, setSelectedCardIndex, handleClick }) => {
  
  return (
    <div className="container">
      <ul className="pl-0 list-none grid gap-4vw grid-cols-1">
        {cards.map((card, index) => (
          <li
            className={`sticky top-0 z-10 transition-all duration-300 ${
              selectedCardIndex === index ? "-translate-y-[87vh]" : ""
            }`}
            key={index}
            onClick={() => handleClick(index)}
          >
            <div
              className="h-[87vh] rounded-2xl card-body box-border p-30 rounded-50 flex justify-center items-center transition-0.5s shadow-0_0_30px_0_rgba(0,0,0,0.3)"
              style={{ backgroundColor: card.color }}
            >
              <h2 className="text-4xl">{card.title}</h2>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardStack;
