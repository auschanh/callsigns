import { createContext, useContext } from 'react';

const LobbyContext = createContext();

export default LobbyContext;

export function useLobbyContext() {

    const inLobby = useContext(LobbyContext);

    if (inLobby === undefined) {

        throw new Error('useLobbyContext must be used with a LobbyContext');

    }

    return inLobby;

}