import { useEffect, useState } from "react";
import useAudioRecorder from "./useAudioRecorder";
import useSocket from "./useSocket";

// IMPORTANT: To ensure proper functionality and microphone access, please follow these steps:
// 1. Access the site using 'localhost' instead of the local IP address.
// 2. When prompted, grant microphone permissions to the site to enable audio recording.
// Failure to do so may result in issues with audio capture and transcription.
// NOTE: Don't use createPortal()

function App() {

  const [buttonText, setbuttonText] = useState("Start Recording");

  const serverURL = "http://localhost:8080";

  const [transcription, setTranscription] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverURL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    socketRef.current.on('transcription', (data) => {
      setTranscription(data);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const { startRecording, stopRecording, isRecording } = useAudioRecorder({
    dataCb: (data) => {
      if (socketRef.current) {
        socketRef.current.emit('audio', data.buffer);
      }
    },
  });

  const onStartRecordingPress = async () => {
    // start recorder and transcriber (send configure-stream)
    if (!isRecording) {
      isRecording=true;
    }
    startRecording;
    setbuttonText("Stop Recording");
  };

  const onStopRecordingPress = async () => {
    if (isRecording) {
      isRecording=false;
    }
    stopRecording;
    setbuttonText("Start Recording");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
  }

  const handleClear = () => {
    document.querySelector("#transcription-display").value = "";
  }

  const textarea = {
    height: "50px",
    weight: "50px"
  }

  const button = {
    height: "30px",
    weight: "40px"
  }
  // ... add more functions
  return (
    <div>
      <h1>Speechify Voice Notes</h1>
      <p>Record or type something in the textbox.</p>
      <div><textarea id="transcription-display" value={transcription} onChange={(e) => setTranscription(e.target.value)} style={textarea}></textarea></div>
      <div><button id="record-button" onClick={isRecording ? onStopRecordingPress : onStartRecordingPress} style={button} >{buttonText}</button><button id="copy-button" onClick={handleCopy} style={button} >{"Copy"}</button><button id="reset-button" onClick={handleClear} style={button} >{"Clear"}</button></div>
    </div>
  );
}

export default App;
