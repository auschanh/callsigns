import React, { useEffect, useState, useRef } from "react";

function CardStack({ cards, currentIndex, handleNext, timeLimitReached, showErrorState, startFade }) {

	const errorRef = useRef(null);

	const [showError, setShowError] = showErrorState;

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

	useEffect(() => {

		setShowError(false);

		if (errorRef.current) {

			clearInterval(errorRef.current);

		}

		if (timeLimitReached) {

			errorRef.current = setInterval(() => {

				setShowError(prev => !prev);

				console.log("running timeout animation");
	
			}, 1000);

		}

	}, [timeLimitReached]);

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
							zIndex: index === currentIndex ? "1" : "0",
							opacity: index === currentIndex? "100" : "0"
						}}
					>

						<div
							className={`h-full w-full`}
						>

							{/* <div className={`w-full transition-all ease-in-out duration-1000 ${timeLimitReached ? "invisible opacity-5" : "h-full"} ${startFade ? "invisible opacity-5" : ""}`}> */}
							<div className={`w-full transition-all ease-in-out duration-1000 ${timeLimitReached ? "opacity-0" : "h-full"} ${startFade ? "opacity-0" : ""}`}>

								{timeLimitReached === false && (

									<div className={`h-full w-full card-body box-border flex shadow-0_0_30px_0_rgba(0,0,0,0.3) p-16 rounded-3xl`}>

										{card.content}

									</div>

								) || timeLimitReached === undefined && (

									<></>

								)}

							</div>

							<div className={`w-full transition-all ease-in-out duration-500 ${timeLimitReached ? "h-full" : "opacity-0"}`}>

								{timeLimitReached && (

									<div className={`flex flex-none w-full h-full justify-center items-center`}>

										<div className={`relative py-12 px-24 bg-gradient-to-tr from-red-600 via-red-700 to-red-600 border border-solid border-red-600 rounded-lg shadow-[0_0_20px_red] transition-all ease-in-out duration-500 ${showError ? "" : "invisible opacity-5"}`}>

											<h1 className="text-slate-50 font-mono font-extrabold text-center text-3xl">CONNECTION TIMED OUT</h1>

										</div>

									</div>

								)}
								
							</div>

						</div>

					</li>

				))}

			</ul>

		</div>
	);
};

export default CardStack;
