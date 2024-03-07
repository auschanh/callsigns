import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import Button from '../components/Button';

const Home = function(props) {

    return (

        <div className="mt-4 ml-4">

            <h1>Just One</h1>

            <Link to="game">

                <Button btnClass={styles.greenButton} btnID="play-btn" label="Play" />

            </Link>

            <Link to="howToPlay">

                <Button btnClass={styles.redButton} btnID="htp-btn" label="How To Play" />

            </Link>

        </div>
        
    );
}

export default Home;