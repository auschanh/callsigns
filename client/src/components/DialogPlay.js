import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "../components/ui/button";

import CreateGameForm from "./CreateGameForm";
import Lobby from "./Lobby";

const DialogPlay = function ({tailwindStyles, variant, triggerName}) {

	const [gameInfo, setGameInfo] = useState();

	return (

        <Dialog>
            <DialogTrigger>
                <Button className={tailwindStyles} variant={variant}>{triggerName}</Button>
            </DialogTrigger>
            <DialogContent className="h-[80vh] w-[60vw] p-10">
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
		

	);
}

export default DialogPlay;