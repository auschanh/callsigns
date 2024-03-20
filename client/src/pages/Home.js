import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import DialogHTP from '../components/DialogHTP';
import Button from '../components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import CreateGameForm from "../components/CreateGameForm";
import Lobby from "../components/Lobby";

const Home = function () {

  const location = useLocation();

  const [gameInfo, setGameInfo] = useState();

  return (
    <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">
      <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">
        Just One
      </h1>

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

            <Dialog>
              <DialogTrigger className="px-16 py-1 text-xl bg-green-600 text-slate-50 shadow-[7px_8px_rgb(0,0,0)] hover:bg-green-700/90 duration-300 dark:bg-green-900 dark:text-slate-50 dark:hover:bg-green-900/90 inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                Play
              </DialogTrigger>
              <DialogContent className="h-[75vh] w-[60vw] p-8">
                {(!gameInfo && (
                  <DialogHeader>
                    <DialogTitle className="mb-4">Create A Room</DialogTitle>
                    <DialogDescription>
                      <CreateGameForm setGameInfo={setGameInfo} />
                    </DialogDescription>
                  </DialogHeader>
                )) || <Lobby gameInfo={gameInfo} />}
              </DialogContent>
            </Dialog>

                <DialogHTP />

            </div>

        </div>
        
    );
}

export default Home;