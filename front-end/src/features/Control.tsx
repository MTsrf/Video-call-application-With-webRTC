import { Button } from "antd";
import React from "react";

interface ControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onEndCall,
}) => {
  return (
    <div className="flex justify-center gap-5 py-2.5">
      <Button type="primary" onClick={onToggleMute}>
        {isMuted ? "Unmute" : "Mute"}
      </Button>

      <Button type="primary" onClick={onToggleVideo}>
        {isVideoOff ? "Start Video" : "Stop Video"}
      </Button>
      <Button type="primary" danger onClick={onEndCall}>
        End Call
      </Button>
    </div>
  );
};

export default Controls;
