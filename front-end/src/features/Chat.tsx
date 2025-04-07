import React, { useState, useEffect, useRef } from "react";
import { Message } from "./AppLayout";
import { TextField } from "../components/TextField";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

interface ChatProps {
  messages: Message[];
  userId: string;
  onSendMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, userId, onSendMessage }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="border border-[#ddd] rounded-md overflow-hidden bg-white h-[300px] flex flex-col">
      <div className="p-3 bg-[#f5f5f5] border-b border-[#ddd]">
        <h3 className="m-0 text-[#333]">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-2.5 rounded-md relative ${
              msg.sender === userId
                ? "self-end bg-[#e3f2fd]"
                : "self-start bg-[#f5f5f5]"
            }`}
          >
            <span className="text-xs text-gray-500">
              {messages[index].sender === user?.username
                ? "You"
                : messages[index].sender}
            </span>
            <div className="break-words">{msg.content}</div>
            <div className="text-[12px] text-[#777] mt-1 text-right">
              {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="flex gap-2.5 p-2.5" onSubmit={handleSend}>
        <TextField
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button htmlType="submit" type="primary">
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
