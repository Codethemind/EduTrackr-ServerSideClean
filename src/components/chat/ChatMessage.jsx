import React from 'react';
import { format } from 'date-fns';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const MessageBubble = styled(Paper)(({ theme, isSender }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '70%',
  marginBottom: theme.spacing(1),
  borderRadius: '15px',
  backgroundColor: isSender ? '#1976d2' : '#f5f5f5',
  color: isSender ? '#ffffff' : '#000000',
  marginLeft: isSender ? 'auto' : '0',
  marginRight: isSender ? '0' : 'auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    width: '20px',
    height: '20px',
    [isSender ? 'right' : 'left']: '-10px',
    backgroundColor: 'inherit',
    clipPath: isSender ? 'polygon(0 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 0 100%)',
  }
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: 'rgba(0, 0, 0, 0.6)',
  marginTop: theme.spacing(0.5),
  textAlign: 'right'
}));

const ChatMessage = ({ message, isSender }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSender ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <MessageBubble elevation={1} isSender={isSender}>
        {message.mediaUrl && (
          <Box sx={{ mb: 1 }}>
            {message.mediaType === 'image' ? (
              <img
                src={message.mediaUrl}
                alt="Message attachment"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <a
                href={message.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit' }}
              >
                View Attachment
              </a>
            )}
          </Box>
        )}
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.message}
        </Typography>
        <MessageTime>
          {format(new Date(message.timestamp), 'HH:mm')}
        </MessageTime>
      </MessageBubble>
    </Box>
  );
};

export default ChatMessage; 