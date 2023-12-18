"use client";
import { useChat } from "ai/react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useEffect } from "react";
import Link from "next/link";

// Function to speak text chunks
async function speakTextChunks(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  return new Promise((resolve) => {
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
}

export default function ChatComponent() {
  const { input, handleInputChange, handleSubmit, messages } = useChat();

  // Use useEffect to handle speech synthesis on messages change
  useEffect(() => {
    // Speak messages on mount or when messages update
    messages.forEach(async (message) => {
      const contentBlocks = message.content.split("\n");
      for (const currentTextBlock of contentBlocks) {
        if (currentTextBlock.trim() !== "") {
          await speakTextChunks(currentTextBlock);
        }
      }
    });
  }, [messages]);

  return (
    <Container>
      <Link href="https://aksara-bumi.vercel.app/">
        <Button
          variant="contained"
          color="warning"
          size="medium"
          sx={{ mt: 2 }}
        >
          Balik ke Homepage
        </Button>
      </Link>
      {messages.map((message, index) => (
        <div key={index}>
          <Typography
            variant="h5"
            component="h3"
            className={
              message.role === "assistant"
                ? "text-lg font-semibold mt-2"
                : "text-lg font-semibold mt-2"
            }
          >
            {message.role === "assistant" ? "Maira" : "Kamu"}
          </Typography>

          {message.content.split("\n").map((currentTextBlock, textIndex) => (
            <p key={textIndex}>
              {currentTextBlock === "" ? "\u00A0" : currentTextBlock}
            </p>
          ))}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="mt-12">
        <TextField
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          placeholder="Materi yang ingin kamu pelajari"
          value={input}
          onChange={handleInputChange}
          sx={{ mt: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="medium"
          sx={{ mt: 2 }}
        >
          Send message
        </Button>
      </form>
    </Container>
  );
}
