import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

const HowToPlay = function(props) {

    const { state } = useLocation();

    const modalRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {

        const listenForEscKey = (event) => {

            if (event.key === 'Escape') {

                console.log("Active");

                navigate(state.previousLocation.pathname);

            }

        }

        document.addEventListener("keydown", listenForEscKey);

        const observerRefValue = modalRef.current;

        disableBodyScroll(observerRefValue);

        return () => {

            document.removeEventListener("keydown", listenForEscKey);

            if (observerRefValue) {

                enableBodyScroll(observerRefValue);

            }
        };

    }, []);

    return (

        <div
            ref={ modalRef }
            className="flex flex-row justify-center items-center fixed z-10 left-0 top-0 w-screen h-screen overflow-auto bg-black/25"
            onClick={() => navigate(state.previousLocation.pathname)}
        >

            <div
                className="flex flex-col bg-white w-[65vw] h-[75vh] border border-solid border-black rounded-3xl shadow-lg p-2"
                onClick={event => event.stopPropagation()}
            >

                <div className="flex flex-row justify-between m-5">

                    <div className="text-2xl font-semibold">
                        <h1>How To Play</h1>
                    </div>

                    <div 
                    
                        className={`

                            flex
                            flex-row
                            justify-center
                            bg-[rgb(218,218,218)]
                            h-8
                            w-8
                            rounded-full
                            duration-300 

                            hover:bg-[#B5B5B5]
                            hover:no-underline
                            hover:cursor-pointer

                            focus:bg-[#B5B5B5]
                            focus:no-underline
                            focus:cursor-pointer

                            group

                        `}
                    
                        onClick={() => navigate(state.previousLocation.pathname)}
                    
                    >
                        
                        <span 
                        
                            className={`

                                group-hover:text-white 
                                group-hover:no-underline 
                                group-hover:cursor-pointer 

                                group-focus:bg-white 
                                group-focus:no-underline 
                                group-focus:cursor-pointer 
                                
                                text-black 
                                text-xl 
                                duration-300
                            
                            `}
                            
                        >
                            
                            &times;
                        
                        </span>

                    </div>

                </div>

            </div>

        </div>
        
    );
}

export default HowToPlay;