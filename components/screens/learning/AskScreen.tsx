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
  const [isRecording, setIsRecording] = useState<boolean>(false);
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

  // Start voice recording (simulation)
  const handleStartRecording = () => {
    setIsRecording(true);
  };

  // Confirm recording: just show the input
  const handleConfirmRecording = () => {
    setIsRecording(false);
    // Input value remains as is, user can submit it
  };

  // Cancel recording: clear input and stop
  const handleCancelRecording = () => {
    setInputValue("");
    setIsRecording(false);
  };

  // Auto-scroll to bottom when messages change or thinking state changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Bounce animation for bear icon
  useEffect(() => {
    const bearIconElement = document.getElementById("bear-icon");
    if (bearIconElement) {
      bearIconElement.classList.add("animate-bounce");
      setTimeout(() => {
        bearIconElement.classList.remove("animate-bounce");
      }, 1000); // Duration of the bounce animation
    }
  }, []);

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

      {/* Floating controls like ChatGPT when recording */}
      {isRecording && (
        <div className="fixed top-24 left-0 right-0 z-30 flex items-center justify-center gap-4">
          <button
            onClick={handleConfirmRecording}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow"
            aria-label="Confirm voice input"
          >
            {/* Microphone icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 1 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
            </svg>
            Use voice
          </button>
          <button
            onClick={handleCancelRecording}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full shadow"
            aria-label="Cancel voice input"
          >
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6.225 4.811 4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811Z" />
            </svg>
            Cancel
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        // Introductory Section with single bear icon
        <div className="flex flex-1 flex-col items-center justify-center mt-20 z-10 px-4">
          <div className="relative">
            <Image
              id="bear-icon"
              src={bearIcon}
              width={100}
              height={100}
              alt={"Ask Icon"}
            />
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full ring-4 ring-white/70" />
                <span className="absolute inset-0 rounded-full animate-ping ring-4 ring-white/60" />
              </>
            )}
          </div>
          <p className="text-lg max-w-xs text-center mt-5 text-gray-700 font-semibold">
            Ask Zuzuplay any question you have about the topic
          </p>

          {/* Suggested Questions Section */}
          <div className="mt-10 w-full max-w-2xl">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "What is algebra?",
                "How do I solve equations?",
                "Can you explain fractions?",
                "Show me a worked example",
              ].map((question, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="group relative w-full text-left rounded-2xl px-5 py-4 bg-white hover:bg-gradient-to-br hover:from-white hover:to-sky-50 border border-gray-200/60 hover:border-sky-300/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      💬
                    </span>
                    <span className="text-gray-800 text-sm font-medium leading-relaxed pt-1">
                      {question}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/0 via-sky-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

      {/* Input Area: hide while recording */}
      {!isRecording && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-300 bg-white p-4 z-20">
          <AskInput
            value={inputValue}
            onChange={handleInputChange}
            onSubmit={handleSendMessage}
            // recording controls
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
          />
        </div>
      )}
    </div>
  );
};

export default AskScreen;
