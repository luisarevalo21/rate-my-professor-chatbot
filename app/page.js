"use client";
import { useState } from "react";
import { Box, Stack } from "@mui/material";
import { Button, TextField } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the rate my professor support assistant. How can I help you today?" },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessages(messages => {
      return [...messages, { role: "user", content: message }, { role: "assistant", content: "I am sorry " }];
    });

    await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async res => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages(messages => {
          let lastmessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [...otherMessages, { ...lastmessage, content: lastmessage.content + text }];
        });

        return reader.read().then(processText);
      });
    });

    setMessage("");
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Stack direction={"column"} width={"500px"} height={"700px"} border={"1px solid black"} p={2} spacing={3}>
        <Stack direction={"column"} spacing={2} flexGrow={1} overflow={"auto"} maxHeight={"100%"}>
          {messages.map((message, i) => {
            return (
              <Box key={i} display={"flex"} justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}>
                <Box
                  bgcolor={message.role === "assistant" ? "primary.main" : "secondary.main"}
                  borderRadius={16}
                  p={3}
                  color={"white"}
                >
                  {message.content}
                </Box>
              </Box>
            );
          })}
        </Stack>

        <Stack direction={"row"} spacing={2}>
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={event => {
              setMessage(event.target.value);
            }}
          />
          <Button variant={"contained"} onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
