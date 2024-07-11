import Transcriber from "./transcriber.js";

/**
 * Events to subscribe to:
 * - connection: Triggered when a client connects to the server.
 * - configure-stream: Requires an object with a 'sampleRate' property.
 * - incoming-audio: Requires audio data as the parameter.
 * - stop-stream: Triggered when the client requests to stop the transcription stream.
 * - disconnect: Triggered when a client disconnects from the server.
 *
 *
 * Events to emit:
 * - transcriber-ready: Emitted when the transcriber is ready.
 * - final: Emits the final transcription result (string).
 * - partial: Emits the partial transcription result (string).
 * - error: Emitted when an error occurs.
 */

const deepgramApiKey = 'YOUR_DEEPGRAM_API_KEY'; // Deepgram API key
const deepgram = new Deepgram(deepgramApiKey);

const initializeWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`connection made (${socket.id})`);

    // ... add needed event handlers and logic
    let deepgramSocket;

    deepgram.transcription.live({
      punctuate: true,
      interim_results: false,
    }).then((dgSocket) => {
      deepgramSocket = dgSocket;

      deepgramSocket.on('open', () => {
        console.log('Connected to Deepgram');
      });

      deepgramSocket.on('close', () => {
        console.log('Disconnected from Deepgram');
      });

      deepgramSocket.on('transcriptReceived', (transcription) => {
        if (transcription.channel.alternatives[0]) {
          const transcriptText = transcription.channel.alternatives[0].transcript;
          socket.emit('transcription', transcriptText);
        }
      });

      socket.on('audio', (data) => {
        deepgramSocket.send(data);
      });

      socket.on('disconnect', () => {
        deepgramSocket.finish();
        console.log('Client disconnected');
      });

    }).catch((err) => {
      console.error('Error connecting to Deepgram:', err);
    });
  });
};

export default initializeWebSocket;
