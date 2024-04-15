import React, { useEffect } from "react";

const CardStack = ({ cards, currentIndex, handleNext }) => {

	useEffect(() => {

		const listenForKeydown = (event) => {

            if (event.key === "ArrowDown") {

                event.preventDefault();

                handleNext();

            }

        }

        document.addEventListener("keydown", listenForKeydown);

        return () => document.removeEventListener("keydown", listenForKeydown);

	}, []);

	return (

		// #fffaec
		<div className="flex mt-[5vh] h-[75vh] w-[65vw] items-center justify-center overflow-hidden relative rounded-3xl shadow-[0rem_0rem_2rem_0.5rem_#0d0d0d]">

			<ul className="pl-0 h-full w-full list-none bg-black">

				{cards.map((card, index) => (

					<li
						key={index}
						className={`flex justify-center absolute top-0 left-0 w-full h-full transition-all ease-in-out duration-500 transform`}
						style={{

							transform: `translateY(${(index - currentIndex) * 85}vh)`,
							zIndex: index === currentIndex ? "1" : "0"
						}}
					>

						<div
							className={`h-full w-full card-body box-border flex transition-0.5s shadow-0_0_30px_0_rgba(0,0,0,0.3) p-16 rounded-3xl`}
						>

							{card.content}

						</div>

					</li>

				))}

			</ul>

		</div>
	);
};

export default CardStack;
