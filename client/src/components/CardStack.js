import React from "react";

const CardStack = ({ cards, currentIndex, handleNext }) => {

  return (
    <div className="mx-auto h-screen items-center justify-center overflow-hidden w-4/5 relative">
      <ul className="pl-0 list-none grid gap-0 grid-cols-1">
        {cards.map((card, index) => (
          <li
            key={index}
            className={`absolute top-0 mt-[5vh] mb-[5vh] left-0 w-full h-full transition-all duration-500 transform`}
            style={{

                height: "100vh",
                transform: `translateY(${(index - currentIndex) * 100}vh)`,
                                zIndex: index === currentIndex ? "1" : "0"
            }}
          >
            <div
              className="h-[90vh] rounded-2xl card-body box-border p-30 rounded-50 flex justify-center items-center transition-0.5s shadow-0_0_30px_0_rgba(0,0,0,0.3)"
              style={{ backgroundColor: card.color }}
              onClick={() => handleNext(index)}
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
