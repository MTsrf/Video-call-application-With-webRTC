/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { Divider } from "antd";
import io, { Socket } from "socket.io-client";
import { SOCKET_SERVER } from "../utils/shared";
import Chat from "./Chat";
import Controls from "./Control";
export interface Message {
  content: string;
  sender: string;
  timestamp: number;
}

interface UserType {
  id: string;
  socketId: string;
}

const AppLayout = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<string>("");
  const [otherSocketId, setOtherSocketId] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  console.log(otherSocketId);
  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        newSocket.emit("join-room", user?.roomId, user?.username);
        createPeerConnection(newSocket);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      newSocket.disconnect();
    };
  }, [user]);

  const createPeerConnection = (socket: Socket): void => {
    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = peerConnection;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (localStreamRef.current) {
          peerConnection.addTrack(track, localStreamRef.current);
        }
      });
    }

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate);
      }
    };
    socket.on("existing-users", (users: UserType[]) => {
      if (users.length > 0) {
        setOtherUser(users[0].id);
        setOtherSocketId(users[0].socketId);
      }
    });
    socket.on(
      "user-connected",
      async (otherUserId: string, otherSocketId: string) => {
        console.log("User connected:", otherUserId);
        setOtherUser(otherUserId);
        setOtherSocketId(otherSocketId);
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit("offer", offer);
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    );

    socket.on(
      "offer",
      async (offer: RTCSessionDescriptionInit, offererId: string) => {
        console.log("Received offer", offererId);
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("answer", answer);
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    );

    socket.on(
      "answer",
      async (answer: RTCSessionDescriptionInit, answererId: string) => {
        console.log("Received answer", answererId);
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    );

    socket.on(
      "ice-candidate",
      async (candidate: RTCIceCandidateInit, candidateUserId: string) => {
        console.log("Received ICE candidate", candidateUserId);
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding received ice candidate", error);
        }
      }
    );

    socket.on("user-disconnected", (disconnectedUserId: string) => {
      console.log("User disconnected:", disconnectedUserId);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on("receive-message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("get-messages", (existingMessages: Message[]) => {
      setMessages(existingMessages);
    });
  };

  const toggleMute = (): void => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = (): void => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = (message: string): void => {
    console.log({ message });
    if (socket && message.trim()) {
      socket.emit("send-message", message);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      tracks.forEach((track) => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });

      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (socket) {
      socket.emit("end-call");
    }

    setIsVideoOff(true);
    setIsMuted(true);

    logout();
    location.reload();
  };

  return (
    <div className="bg-white w-full shadow-2xl">
      <div className="flex justify-between items-center p-3">
        <h1>Username: {user?.username}</h1>
        <Button onClick={logout}>Logout</Button>
      </div>
      <Divider />
      <div className="flex flex-col gap-5">
        <div className="flex gap-5 flex-wrap">
          <div className="relative flex-1 rounded-md overflow-hidden shadow-md">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`local-video ${isVideoOff ? "video-off" : ""}`}
            />
            <div className="absolute top-0 left-0 bg-black text-white p-2">
              You
            </div>
          </div>
          <div className="relative flex-1 rounded-md overflow-hidden shadow-md">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            <div className="absolute top-0 left-0 bg-black text-white p-2">
              {otherUser}
            </div>
          </div>
        </div>
        <div>
          <Controls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onEndCall={endCall}
          />
          <Chat
            messages={messages}
            userId={user?.username || ""}
            onSendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
