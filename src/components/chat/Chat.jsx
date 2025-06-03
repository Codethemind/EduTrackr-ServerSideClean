import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { io } from 'socket.io-client';
import ChatMessage from './ChatMessage';

const Chat = ({ chatId, currentUser, receiver, receiverModel }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        userId: currentUser.id,
        userModel: currentUser.model
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('getMessages', { chatId });
    });

    newSocket.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('messageReaction', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), { user: data.userId, reaction: data.reaction }] }
          : msg
      ));
    });

    newSocket.on('messageDeleted', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, isDeleted: true }
          : msg
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [chatId, currentUser.id, currentUser.model]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files[0]) return;

    const formData = new FormData();
    if (fileInputRef.current?.files[0]) {
      formData.append('media', fileInputRef.current.files[0]);
    }
    formData.append('chatId', chatId);
    formData.append('sender', currentUser.id);
    formData.append('senderModel', currentUser.model);
    formData.append('receiver', receiver);
    formData.append('receiverModel', receiverModel);
    formData.append('message', newMessage);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/send`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflowY: 'auto',
          backgroundColor: '#f0f2f5'
        }}
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isSender={message.sender === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          backgroundColor: '#ffffff'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0]) {
              handleSendMessage(e);
            }
          }}
        />
        <IconButton onClick={handleFileSelect} color="primary">
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f0f2f5'
            }
          }}
        />
        <IconButton 
          type="submit" 
          color="primary"
          disabled={!newMessage.trim() && !fileInputRef.current?.files[0]}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default Chat; 