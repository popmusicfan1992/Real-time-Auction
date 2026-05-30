"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  name: string;
  avatar?: string;
  message: string;
  time: string;
}

export default function HomepageChatbot() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a friendly welcome message in appropriate language
  useEffect(() => {
    const welcomeMsg =
      locale === "vi"
        ? "Xin chào! Tôi là Trợ lý GalleryX AI. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về cách hoạt động của nền tảng, số dư ví, cách đặt giá hoặc thông tin các phiên đấu giá nhé!"
        : "Hello! I am the GalleryX AI Assistant. How can I help you explore Gallery X today? Feel free to ask about bidding rules, wallet deposits, or general auction questions!";

    setMessages([
      {
        id: "welcome",
        sender: "bot",
        name: "GalleryX AI",
        message: welcomeMsg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [locale]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");

    // Add user message to state
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      name: user?.name || (locale === "vi" ? "Khách" : "Guest"),
      avatar: user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100",
      message: userMessageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Query our new chatbot API endpoint
      const response = await api.post("/chatbot", {
        message: userMessageText,
        userName: user?.name || "Guest",
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        name: "GalleryX AI",
        message: response.data.message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Homepage Chatbot Error:", error);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "bot",
        name: "GalleryX AI",
        message:
          locale === "vi"
            ? "Xin lỗi, tôi đang gặp lỗi kết nối với máy chủ. Vui lòng thử lại sau giây lát!"
            : "Sorry, I am having trouble connecting to the server. Please try again in a moment!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body-md flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-[fadeIn_0.25s_ease-out] hover-glow">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-b border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-500">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-label-bold text-sm text-on-surface">GalleryX AI Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-400 font-label-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-slate-400 hover:text-white transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/15 bg-slate-800 flex items-center justify-center">
                  {msg.sender === "bot" ? (
                    <span className="material-symbols-outlined text-[16px] text-amber-500">smart_toy</span>
                  ) : (
                    <img src={msg.avatar} alt={msg.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Message bubble */}
                <div>
                  <div className={`text-[10px] text-on-surface-variant mb-0.5 px-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                    {msg.name} <span className="text-outline text-[9px] ml-1">{msg.time}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-surface-container border border-outline-variant/30 text-on-surface rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/15 bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">smart_toy</span>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant mb-0.5 px-1">
                    GalleryX AI <span className="text-outline text-[9px] ml-1">...</span>
                  </div>
                  <div className="bg-surface-container border border-outline-variant/30 text-on-surface p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input field */}
          <div className="p-3 border-t border-white/10 bg-slate-950/40">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={locale === "vi" ? "Nhập tin nhắn..." : "Ask me anything..."}
                className="flex-grow bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-amber-500 flex items-center justify-center shrink-0 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(238,152,0,0.3)] hover:shadow-[0_12px_40px_rgba(238,152,0,0.5)] transition-all duration-300 transform active:scale-90 ${
          isOpen
            ? "bg-slate-800 border border-white/15 text-white rotate-90"
            : "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105"
        }`}
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-[24px]">close</span>
        ) : (
          <span className="material-symbols-outlined text-[26px]">smart_toy</span>
        )}
      </button>
    </div>
  );
}
