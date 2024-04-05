import { React, useState } from "react";

const CardStack = ({cards}) => {
    const numCards = cards.length
    // const cardHeight = '87vh';
    const cardTopPadding = "1.5em";
    const cardMargin = "4vw";

  return (
    <div className="container">
        <ul id="cards" className={`pb-[calc(${numCards} * ${cardTopPadding})] mb-[${cardMargin}] pl-0 list-none grid gap-[4vw] grid-row-[repeat(${numCards}, 87vh)] grid-cols-[1fr]`}>
            {cards.map((card, i) => {
                return(
                    <li className={`sticky top-0 pt-[calc(${i+1} * ${cardTopPadding})]`} id={`card${i+1}`}>
                    <div className={`card-body box-border p-[30px] rounded-[50px] h-[87vh] flex justify-center items-center transition-[0.5s] shadow-[0_0_30px_0_rgba(0,0,0,0.3)]`} style={{ backgroundColor: `${card.color}`}}>
                        <h2 className="text-4xl">{card.title}</h2>
                    </div>
                </li>
                )
            })
            }
        </ul>
    </div>
    );
};

export default CardStack;
