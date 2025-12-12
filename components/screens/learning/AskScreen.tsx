"use client";

import AskButton from "@/components/AskButton";
import AskInput from "@/components/AskInput";
import BackButton from "@/components/common/BackButton";
import bearIcon from "../../../assets/icons/zuzuplay.svg";
import thinkingIcon from "../../../assets/icons/zuzuplay.svg";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { apiCaller, apiService } from "@/middleware/apiService";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  text: string;
  sender: "user" | "bot";
}
// const AskScreen = () => {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [inputValue, setInputValue] = useState<string>('')

//   const handleSendMessage = () => {
//     if (inputValue.trim() === '') return

//     const newMessage = { text: inputValue, sender: 'user' }
//     setMessages([...messages, newMessage])

//     // Clear the input
//     setInputValue('')

//     // Simulate a bot response
//     setTimeout(() => {
//       const botResponse = {
//         text: 'Here is the answer to your question.',
//         sender: 'bot',
//       }
//       setMessages((prevMessages) => [...prevMessages, botResponse])
//     }, 1000)
//   }
//   return (
//     <div className="flex flex-col h-screen">
//       <div className="fixed inset-0 top-0 left-0 border-b border-black space-x-3 pl-5 py-3 h-20 flex items-center">
//         <BackButton />
//         <p className="">Go back to your lesson</p>
//       </div>
//       {/* <AskButton /> */}
//       <div className="flex flex-1 items-center justify-center flex-col">
//         <Image src={ask} width={100} height={100} alt={''} />
//         <p className="text-lg max-w-64 text-center mt-5">
//           Ask Zuzuplay any question you have about the topic
//         </p>
//       </div>
//       <AskInput />
//     </div>
//   )
// }

const AskScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [savedGameState, setSavedGameState] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for saved game state on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedGameState");
    if (saved) {
      setSavedGameState(JSON.parse(saved));
    }
  }, []);

  // Handle return to game
  const handleReturnToGame = () => {
    // Give the student 3 more lives and restore their game
    const gameStateWithLives = {
      ...savedGameState,
      lives: 3, // Give them 3 more lives
      hasUsedSaveMe: true, // Mark that they've used the save me feature
    };

    // Store the restored state
    localStorage.setItem(
      "restoredGameState",
      JSON.stringify(gameStateWithLives)
    );
    localStorage.removeItem("savedGameState"); // Clear the saved state

    // Redirect back to the game
    router.push("/game/racer");
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Create a new message object with the correct type for sender
    const newMessage: Message = { text: inputValue, sender: "user" };
    setMessages([...messages, newMessage]);

    // Clear the input
    setInputValue("");

    // Set thinking state to true
    setIsThinking(true);

    // Make API call
    apiCaller
      .post("aiquestion", {
        question: inputValue,
      })
      .then((response: any) => {
        const botResponse: Message = {
          text: response.data.data.answer.replace(/[*#]+/g, "\n"),
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
        setIsThinking(false);
      })
      .catch((error: any) => {
        console.error("Error getting AI response:", error);
        setIsThinking(false);
      });
  };

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  // Auto-scroll to bottom when messages change or thinking state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Bar */}
      <div className="fixed inset-x-0 top-0 border-b border-black space-x-3 pl-5 py-3 h-20 flex items-center justify-between bg-white z-20">
        <div className="flex items-center space-x-3">
          <BackButton />
          <p className="">Go back to your lesson</p>
        </div>

        {/* Return to Game Button - shown when there's saved game state */}
        {savedGameState && (
          <button
            onClick={handleReturnToGame}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold mr-5 transition-colors"
          >
            🎮 Return to Game (+3 Lives)
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        // Introductory Section
        <div className="flex flex-1 flex-col items-center justify-center mt-20 z-10 px-4">
          <Image src={bearIcon} width={100} height={100} alt={"Ask Icon"} />
          <p className="text-lg max-w-xs text-center mt-5 text-gray-700 font-semibold">
            Ask Zuzuplay any question you have about the topic
          </p>

          {/* Suggested Questions Section */}
          {/* Suggested Questions Section */}
          <div className="mt-10 w-full max-w-md">
            <p className="text-sm text-gray-500 mb-3 px-2">Suggested</p>
            <div className="space-y-2">
              {[
                "What is algebra?",
                "How do I solve equations?",
                "Can you explain fractions?",
              ].map((question, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="w-full backdrop-blur-md bg-white/60 hover:bg-white/80 border border-white/40 hover:border-white/60 rounded-xl px-4 py-3 transition-all duration-200 text-left shadow-lg hover:shadow-xl"
                  style={{
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                  }}
                >
                  <span className="text-gray-700 text-sm">{question}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Chat Area
        <div
          ref={chatContainerRef}
          className="flex flex-col flex-1 overflow-y-auto p-4 mt-20 mb-24"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end my-2 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "bot" && (
                <div className="mr-2">
                  <Image
                    src={bearIcon}
                    alt="Bear Icon"
                    width={30}
                    height={30}
                  />
                </div>
              )}
              <div
                className={`max-w-xs py-5 px-7 rounded-tl-[40px] rounded-br-[40px] rounded-tr-[12px] rounded-bl-[12px] ${
                  message.sender === "user"
                    ? "bg-secondary text-black"
                    : "bg-primary text-white"
                }`}
              >
                {message.sender === "user" ? (
                  // For user messages, keep simple text rendering
                  message.text
                    // .replace(/[*#]+/g, "\n")
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, i) => <div key={i}>{line.trim()}</div>)
                ) : (
                  // For bot messages, render HTML content
                  <div
                    className="chat-message-content"
                    dangerouslySetInnerHTML={{
                      __html: message.text
                        // .replace(/[*#]+/g, "\n")
                        .replace(/\n/g, "<br>"),
                    }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex items-end my-2 justify-start">
              <div className="mr-2">
                <Image
                  src={thinkingIcon}
                  alt="Thinking Icon"
                  width={30}
                  height={30}
                />
              </div>
              {/* <div className="bg-gray-200 text-black max-w-xs py-5 px-7 rounded-tl-[40px] rounded-br-[40px] rounded-tr-[12px] rounded-bl-[12px] flex items-center"> */}
              <span className="text-md text-gray-500">Thinking...</span>
              {/* </div> */}
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-300 bg-white p-4 z-20">
        <AskInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default AskScreen;
