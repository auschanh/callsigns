import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import DialogHTP from '../components/DialogHTP';

const Home = function(props) {

    const location = useLocation();

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

                <DialogHTP />

            </div>

        </div>
        
    );
}

export default Home;