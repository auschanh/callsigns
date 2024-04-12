import { createContext, useContext } from 'react';

const MessageContext = createContext();

export default MessageContext;

export function useMessageContext() {

    const messageList = useContext(MessageContext);

    if (messageList === undefined) {

        throw new Error('useMessageContext must be used with a MessageContext');

    }

    return messageList;

}