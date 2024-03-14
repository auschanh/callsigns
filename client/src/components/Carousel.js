import React, { useEffect, useState } from 'react';

function Carousel({ children: slides, spaceBetweenSlides }) {

    const [currentSlide, setCurrentSlide] = useState(0);

    const previousSlide = () => setCurrentSlide(curr => curr === 0 ? slides.length - 1 : currentSlide - 1);
    const nextSlide = () => setCurrentSlide(curr => curr === slides.length - 1 ? 0 : currentSlide + 1);

    return (

        <div className="flex h-full items-center">

            <button onClick={previousSlide} className="mr-6 p-1 border border-slate-400 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
                <div className="flex items-center justify-center h-6 w-6">
                    {'<'}
                </div>
            </button>

            <div className="overflow-hidden relative h-full">

                <div className="flex transition-transform ease-in-out duration-700 h-full" style={{ transform: `translateX(calc(-${currentSlide * 100}% - ${currentSlide * spaceBetweenSlides}rem))`}}>{slides}</div>

                <div className="absolute bottom-6 right-0 left-0">

                    <div className="flex items-center justify-center gap-2">

                        {slides.map((_, index) => (

                            <div key={index} className={`
                                transition-all w-1.5 h-1.5 bg-black rounded-full
                                ${currentSlide === index ? "p-1" : "bg-opacity-50"}
                            `} />

                        ))}


                    </div>

                </div>

            </div>

            <button onClick={nextSlide} className="ml-6 p-1 border border-slate-400 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white">
                <div className="flex items-center justify-center h-6 w-6">
                    {'>'}
                </div>
            </button>
            
        </div>

    );

}

export default Carousel;