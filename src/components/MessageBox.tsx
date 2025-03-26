
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate, getUserById, Message } from "@/data/mockData";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface MessageBoxProps {
  messages: Message[];
  recipientId: string;
  adId?: string | null;
  onSendMessage: (message: string) => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  messages, 
  recipientId, 
  adId = null,
  onSendMessage 
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const recipient = getUserById(recipientId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    toast.info("Função de anexo será implementada em breve!");
  };

  if (!user || !recipient) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b border-border/30">
        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
          <img
            src={recipient.avatar}
            alt={recipient.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{recipient.name}</h3>
          <p className="text-xs text-muted-foreground">
            Apto {recipient.apartment} · Bloco {recipient.block}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((message) => {
          const isSender = message.senderId === user.id;
          const messageUser = getUserById(message.senderId);

          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${isSender ? "flex-row-reverse" : ""}`}>
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={messageUser?.avatar}
                    alt={messageUser?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isSender
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white border border-border/30 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isSender ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatRelativeDate(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border/30 bg-white">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none min-h-[60px] bg-gray-50"
          />
          <div className="flex-shrink-0 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAttachment}
              className="h-10 w-10 rounded-full"
            >
              <Paperclip size={18} />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={handleSendMessage}
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
