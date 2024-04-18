import { keyboardImplementationWrapper } from "@testing-library/user-event/dist/keyboard";
import React, { useState } from "react";
import ReactSlider from "react-slider";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function Slider({ onChange, currentIndex, numCards, cards }) {

	const [hoveredCard, setHoveredCard] = useState(null);

	const handleHover = i => {

		setHoveredCard(i);

	}

	const handleBeforeChange = () => {

		return false;

	}

	const handleLeave = (value) => {

		setHoveredCard(null);

	}

	return (

		<div>

			<ReactSlider
				disabled
				className="vertical-slider"
				markClassName="example-mark"
				onChange={onChange}
				onClick={(e) => e.preventDefault()}
				trackClassName="example-track"
				onBeforeChange={handleBeforeChange}
				defaultValue={0}
				value={currentIndex}
				min={0}
				max={numCards}
				marks
				orientation="vertical"
				renderMark={(props) => {

					const index = props.key;
					const isHovered = hoveredCard === index;
					const card = cards[index];

					if (index < currentIndex) {

						props.className = "example-mark example-mark-completed";

					} else if (index === currentIndex) {

						props.className = isHovered ? "hovered example-mark example-mark-active" : "example-mark example-mark-active animate-pulse";
						
					}

					return (
						<span
							key={index}
							onMouseEnter={() => handleHover(index)}
							onMouseLeave={handleLeave}
							{...props}>
							{(isHovered && card) && (
								<div className="absolute top-0 left-full translate-y-[-50%] ml-4 min-w-72 rounded-lg shadow-lg">
									<Card className="border-none p-5 bg-slate-50 space-y-2">
										<CardHeader className="p-0">
											<CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
										</CardHeader>
										<CardContent className="text-xs p-0">
											{card.phase}
										</CardContent>
									</Card>
								</div>
							)}
						</span>
					)
				}}

			/>

		</div>

	);

};

export default Slider;
