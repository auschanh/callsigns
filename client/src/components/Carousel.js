import React, { useEffect, useState } from 'react';

function Carousel({ children: slides }) {

    const [currentSlide, setCurrentSlide] = useState(0);

    const previousSlide = () => setCurrentSlide(curr => curr === 0 ? slides.length - 1 : currentSlide - 1);
    const nextSlide = () => setCurrentSlide(curr => curr === slides.length - 1 ? 0 : currentSlide + 1);

    return (

        <>
            <div className="flex transition-transform ease-out duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>{slides}</div>
            <div className="absolute inset-0 flex items-center justify-between p-4">
                <button onClick={previousSlide} className="p-1 rounded-full shadow bg-white-80 text-gray-800 hover:bg-white">
                    {'<'}
                </button>
                <button onClick={nextSlide} className="p-1 rounded-full shadow bg-white-80 text-gray-800 hover:bg-white">
                    {'>'}
                </button>
            </div>

            <div className="absolute bottom-4 right-0 left-0">
                <div className="flex items-center justify-center gap-2">

                    {slides.map((_, i) => (

                        <div className={`
                            transition-all w-3 h-3 bg-white rounded-full
                            ${currentSlide === i ? "p-2" : "bg-opacity-50"}
                        
                        `} />


                    ))}

                </div>
            </div>
        </>

    );

}

export default Carousel;