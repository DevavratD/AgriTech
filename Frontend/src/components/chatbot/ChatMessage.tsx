import React from 'react';
import { Message } from '../../services/chatbotService';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../../lib/utils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex w-full gap-2 p-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/chatbot-avatar.png" alt="KrishiMitra AI" />
          <AvatarFallback className="bg-green-600 text-white">KM</AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          'rounded-lg p-3 max-w-[80%]',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        )}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className={cn(
          'text-xs mt-1',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/user-avatar.png" alt="User" />
          <AvatarFallback className="bg-primary-foreground text-primary">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
