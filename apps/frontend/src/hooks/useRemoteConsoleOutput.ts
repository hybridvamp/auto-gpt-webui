import AnsiToHtml from 'ansi-to-html';
import { useEffect, useState } from 'react';

const ansiToHtml = new AnsiToHtml();

type MessageData = {
  fullConsoleOutput: string;
  waitingForInput: boolean;
};

export function useRemoteConsoleOutput(socket: WebSocket | null) {
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    if (!socket) {
      return;
    }

    function onMessage(event: MessageEvent) {
      console.log('WebSocket message received: ', event.data);
      const data = JSON.parse(String(event.data)) as MessageData;
      let output = String(data.fullConsoleOutput);
      // output = output.replace(/.+Thinking\.\.\..*/gm, '')
      // output = output.replace(/^\s*$[\n\r]{1,}/gm, '🧠 -- Thinking --\n');
      const htmlOutput = ansiToHtml.toHtml(output);
      setOutput(htmlOutput);
    }

    socket.addEventListener('message', onMessage);

    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket]);

  return {
    consoleOutput: output,
    isWaitingForInput: output.endsWith('Input:'),
  };
}