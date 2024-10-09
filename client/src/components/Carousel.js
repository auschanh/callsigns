import React, { useEffect, useState, forwardRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Carousel = forwardRef(function({ children: slides, slideState, spaceBetweenSlides, handleSubmit, example, handleRemove }, ref) {

    const [currentSlide, setCurrentSlide] = slideState;

    useEffect(() => {

        const listenForKeydown = (event) => {

            if (event.key === "ArrowLeft") {

                event.preventDefault();

                previousSlide();

            } else if (currentSlide === 2 && event.key === "Enter") {

                if (document.activeElement.name === "hint" && !example[1]) {

                    handleSubmit(event);

                } else {

                    event.preventDefault();

                    nextSlide();

                }

            } else if (currentSlide === 3 && event.key === "Enter") {

                if (document.activeElement.innerText.match(`^[a-zA-Z]+$`)) {

                    handleRemove();

                } else {

                    event.preventDefault();

                    nextSlide();

                }

            } else if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {

                event.preventDefault();

                nextSlide();

            }

        }

        document.addEventListener("keydown", listenForKeydown);

        return () => document.removeEventListener("keydown", listenForKeydown);

    }, [currentSlide, document.activeElement, example]);

    const previousSlide = () => setCurrentSlide(curr => curr === 0 ? slides.length - 1 : currentSlide - 1);
    const nextSlide = () => setCurrentSlide(curr => curr === slides.length - 1 ? 0 : currentSlide + 1);

    const scrollToMarker = (index) => {

        setCurrentSlide(index);

    }

    return (

        <div className="flex h-full items-center">

            <button onClick={previousSlide} className="mr-6 p-1 border border-slate-400 rounded-full shadow bg-white/80 text-gray-800 outline-none hover:bg-white">
                <div className="flex items-center justify-center h-6 w-6">
                    <ChevronLeft className="h-4 w-4" />
                </div>
            </button>

            <div className="overflow-hidden relative h-full p-1">

                <div className="flex transition-transform ease-in-out duration-700 h-full" style={{ transform: `translateX(calc(-${currentSlide * 100}% - ${currentSlide * spaceBetweenSlides}rem))`}}>{slides}</div>

                <div className="absolute bottom-6 right-0 left-0">

                    <div className="flex items-center justify-center gap-2">

                        {slides.map((_, index) => (

                            <div key={index} onClick={() => {scrollToMarker(index)}} className={`
                                transition-all w-1.5 h-1.5 bg-white rounded-full cursor-pointer
                                ${currentSlide === index ? "p-1" : "bg-opacity-50"}
                            `} />

                        ))}


                    </div>

                </div>

            </div>

            <button onClick={nextSlide} className="ml-6 p-1 border border-slate-400 rounded-full shadow bg-white/80 text-gray-800 outline-none hover:bg-white">
                <div className="flex items-center justify-center h-6 w-6">
                    <ChevronRight className="h-4 w-4" />
                </div>
            </button>
            
        </div>

    );

});

export default Carousel;