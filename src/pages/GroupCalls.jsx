import { useEffect, useRef, useState } from "react";
import {
  FaVideo,
  FaMicrophone,
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaVideoSlash,
} from "react-icons/fa";

const GroupCalls = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [inCall, setInCall] = useState(false);
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    if (inCall) {
      startCall();
    } else {
      stopCall();
    }
  }, [inCall]);

  // ✅ Start the Call (WebRTC)
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      // Add logic to establish a WebRTC peer connection (Signaling required)
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  // ✅ Stop the Call
  const stopCall = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setInCall(false);
  };

  // ✅ Toggle Video
  const toggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoOn;
    }
  };

  // ✅ Toggle Audio
  const toggleAudio = () => {
    setIsAudioOn((prev) => !prev);
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isAudioOn;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Group Video Call
      </h2>

      <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        {inCall ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Click "Join Call" to start
          </p>
        )}
      </div>

      {/* ✅ Call Controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            isVideoOn ? "bg-green-600" : "bg-gray-500"
          } text-white`}
        >
          {isVideoOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            isAudioOn ? "bg-blue-600" : "bg-gray-500"
          } text-white`}
        >
          {isAudioOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button
          onClick={() => setInCall(false)}
          className="p-3 rounded-full bg-red-600 text-white"
        >
          <FaPhoneSlash />
        </button>
      </div>

      {/* ✅ Join/Leave Call Button */}
      <button
        onClick={() => setInCall(!inCall)}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
      >
        {inCall ? "Leave Call" : "Join Call"}
      </button>
    </div>
  );
};

export default GroupCalls;
