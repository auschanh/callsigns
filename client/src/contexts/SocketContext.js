import { createContext, useContext } from 'react';

const SocketContext = createContext();

export default SocketContext;

export function useSocketContext() {

    const socket = useContext(SocketContext);

    if (socket === undefined) {

        throw new Error('useSocketContext must be used with a SocketContext');

    }

    return socket;

}