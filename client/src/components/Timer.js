import React, { useState, useEffect, useRef } from 'react';

function Timer({ timeLimit, setTimeLimitReached, setStartFade, slideIndex }) {

    const [timeRemaining, setTimeRemaining] = useState("0:00");

    const [isRed, setIsRed] = useState(false);

    const timerIntervalRef = useRef(null);

    const timerRef = useRef(null);

    const getTimeRemaining = (futureTimestamp) => {

        const total = Date.parse(futureTimestamp) - Date.parse(new Date());

        const seconds = Math.floor((total / 1000) % 60);

        const minutes = Math.floor((total / 1000 / 60) % 60);

        if (total <= 10000) {

            setIsRed(true);

        }

        return { total, minutes, seconds };

    }

    const startTimer = (futureTimestamp) => {

        let { total, minutes, seconds } = getTimeRemaining(futureTimestamp);

        if (total > 0) {

            setTimeRemaining(

                minutes + ":" + (seconds < 10 ? "0" + seconds : seconds)

            );

        } else if (total === 0) {

            setStartFade(true);

            setTimeRemaining(

                minutes + ":" + (seconds < 10 ? "0" + seconds : seconds)

            );

        } else {

            

            setTimeLimitReached(true);

            setStartFade(false);

            clearInterval(timerIntervalRef.current);

        }

    }

    const resetTimer = (futureTimestamp) => {

        setTimeRemaining(`${Math.floor(timeLimit / 60)}:${(timeLimit % 60) < 10 ? "0" + (timeLimit % 60) : (timeLimit % 60)}`);

        if (timerIntervalRef.current) {

            clearInterval(timerIntervalRef.current);

        }

        timerIntervalRef.current = setInterval(() => {

            startTimer(futureTimestamp);

        }, 1000);

    }

    const setTimer = () => {

        const currentTime = new Date();

        currentTime.setSeconds(currentTime.getSeconds() + timeLimit);

        return currentTime;

    }

    useEffect(() => {

        

        resetTimer(setTimer());

        return () => {

            if (timerIntervalRef.current) {
    
                clearInterval(timerIntervalRef.current);
    
            }

        }

    }, []);

    return (

        <div className="absolute right-8 top-6">

            <h3 className={`text-xs font-mono ${isRed ? "text-red-600" : ""}`} ref={timerRef}>{`Timer: ${timeRemaining}`}</h3>

        </div>

    );

}

export default Timer;