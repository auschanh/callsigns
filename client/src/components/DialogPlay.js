import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "../components/ui/button";

import CreateGameForm from "./CreateGameForm";
import Lobby from "./Lobby";

const DialogPlay = function ({ tailwindStyles, variant, triggerName, isOpen }) {

	const [gameInfo, setGameInfo] = useState();

    const [open, setOpen] = isOpen;

	return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button className={tailwindStyles} variant={variant}>{triggerName}</Button>
            </DialogTrigger>

            <DialogContent className="flex flex-none flex-col h-[80vh] w-[60vw] p-10 overflow-auto gap-4">

                {(!gameInfo && (

                    <>
                        <DialogHeader>
                            <DialogTitle className="mb-4">Create A Room</DialogTitle>
                        </DialogHeader>
                        <CreateGameForm setGameInfo={setGameInfo} />
                    </>
                
                )) || <Lobby gameInfo={gameInfo} />}

            </DialogContent>
            
        </Dialog>
		

	);
}

export default DialogPlay;