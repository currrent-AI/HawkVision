import { useState } from "react";
import {
  Bot,
  Send,
  MapPin,
  Paperclip,
  Zap,
  ShieldAlert,
  Navigation,
  Phone,
  AlertTriangle,
  ChevronRight,
  Activity,
  Wifi,
  LocateFixed,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/chat/message";

function EmergencyChatbot() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello. I'm HawkVision Emergency AI. I'm ready to assist with disaster response, evacuation guidance, shelter discovery and emergency coordination.",
      time: "Now",
    },
  ]);

  const emergencyActions = [
    {
      icon: MapPin,
      title: "Find nearby shelter",
      subtitle: "Locate safe evacuation centers",
    },
    {
      icon: AlertTriangle,
      title: "Report a disaster",
      subtitle: "Report an active incident",
    },
    {
      icon: Phone,
      title: "Emergency contacts",
      subtitle: "View response contacts",
    },
    {
      icon: ShieldAlert,
      title: "Send SOS",
      subtitle: "Escalate critical emergency",
    },
  ];

  // Fetch chatbot reply from the backend
  const fetchChatReply = async (text) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`
      );
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error("Invalid response from the chatbot service");
    }

    return result.data.reply;
  };

  // Send message
  const handleSend = async (customMessage = null) => {
    const text = customMessage || message.trim();

    if (!text || isTyping) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      text,
      time: "Now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const reply = await fetchChatReply(text);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: reply,
        time: "Now",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "Connection error: HawkVision AI is unavailable right now. Please check that the backend is running and try again.",
        time: "Now",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-end justify-between">

        <div>
          <div className="flex items-center gap-2 mb-2">

            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />

            <p className="text-[10px] tracking-[0.2em] font-semibold text-[#22C55E]">
              AI SYSTEM ONLINE
            </p>

          </div>

          <h1 className="text-3xl font-bold text-[#F8FAFC]">
            Emergency Chatbot
          </h1>

          <p className="text-sm text-[#8FA4C7] mt-2">
            AI-powered emergency guidance and disaster response coordination.
          </p>
        </div>


        {/* RESPONSE SYSTEM */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0B1425] border border-[#1D304D]">

          <Activity
            size={15}
            className="text-[#22C55E]"
          />

          <div>

            <p className="text-[9px] uppercase tracking-wider text-[#64748B]">
              Response System
            </p>

            <div className="flex items-center gap-1.5 mt-0.5">

              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />

              <span className="text-[11px] text-[#22C55E] font-medium">
                Active
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5">


        {/* CHAT PANEL */}
        <div className="min-w-0">

          <div className="h-[650px] bg-[#0B1425] border border-[#1D304D] rounded-2xl overflow-hidden flex flex-col">


            {/* CHAT HEADER */}
            <div className="h-[68px] shrink-0 px-5 border-b border-[#1D304D] flex items-center justify-between bg-[#0D172A]">

              <div className="flex items-center gap-3">

                <div className="relative w-10 h-10 rounded-xl bg-[#EF3340]/10 border border-[#EF3340]/30 flex items-center justify-center">

                  <Bot
                    size={19}
                    className="text-[#EF3340]"
                  />

                  <span className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full bg-[#22C55E] border-2 border-[#0D172A]" />

                </div>


                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-sm font-semibold text-[#F8FAFC]">
                      HawkVision Emergency AI
                    </h2>

                    <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#EF3340]/10 text-[#EF3340] border border-[#EF3340]/20">
                      AI
                    </span>

                  </div>

                  <div className="flex items-center gap-2 mt-1">

                    <span className="text-[10px] text-[#22C55E]">
                      Online
                    </span>

                    <span className="text-[#334155]">
                      •
                    </span>

                    <span className="text-[10px] text-[#64748B]">
                      Emergency response assistant
                    </span>

                  </div>

                </div>

              </div>


              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EF3340]/5 border border-[#EF3340]/20">

                <Zap
                  size={13}
                  className="text-[#EF3340]"
                />

                <span className="text-[9px] uppercase tracking-wider text-[#EF3340] font-medium">
                  Intelligent Response
                </span>

              </div>

            </div>


            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {messages.map((msg) => {

                const isUser = msg.type === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`flex gap-3 max-w-[78%] ${
                        isUser
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >

                      {/* AVATAR */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isUser
                            ? "bg-[#243A59] border-[#315074]"
                            : "bg-[#EF3340]/10 border-[#EF3340]/25"
                        }`}
                      >

                        {isUser ? (
                          <span className="text-[9px] text-[#AFC1DC] font-semibold">
                            YOU
                          </span>
                        ) : (
                          <Bot
                            size={15}
                            className="text-[#EF3340]"
                          />
                        )}

                      </div>


                      {/* MESSAGE */}
                      <div>

                        <div
                          className={`px-4 py-3 rounded-xl text-xs leading-relaxed ${
                            isUser
                              ? "bg-[#EF3340] text-white rounded-tr-sm"
                              : "bg-[#16243A] text-[#D8E2F0] border border-[#243A59] rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>

                        <p
                          className={`text-[9px] text-[#526783] mt-1.5 ${
                            isUser
                              ? "text-right"
                              : ""
                          }`}
                        >
                          ◷ {msg.time}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}


              {/* TYPING INDICATOR */}
              {isTyping && (
                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/25 flex items-center justify-center">

                    <Bot
                      size={15}
                      className="text-[#EF3340]"
                    />

                  </div>

                  <div className="px-4 py-3 rounded-xl rounded-tl-sm bg-[#16243A] border border-[#243A59]">

                    <div className="flex gap-1">

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce" />

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce [animation-delay:150ms]" />

                      <span className="w-1.5 h-1.5 rounded-full bg-[#7186A8] animate-bounce [animation-delay:300ms]" />

                    </div>

                  </div>

                </div>
              )}

            </div>


            {/* CHAT COMPOSER */}
            <div className="shrink-0 p-4 border-t border-[#1D304D] bg-[#0A1324]">

              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#080F1D] border border-[#243A59] focus-within:border-[#36557A] transition-colors">

                {/* ATTACHMENT */}
                <button
                  type="button"
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#AFC1DC] hover:bg-[#16243A] transition-all"
                  title="Attach"
                >
                  <Paperclip size={16} />
                </button>


                {/* LOCATION */}
                <button
                  type="button"
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[#64748B] hover:text-[#22C55E] hover:bg-[#16243A] transition-all"
                  title="Share location"
                >
                  <LocateFixed size={16} />
                </button>


                {/* INPUT */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={(e) => {

                    if (e.key === "Enter") {
                      handleSend();
                    }

                  }}
                  placeholder="Describe your emergency..."
                  className="flex-1 min-w-0 bg-transparent outline-none border-none text-xs text-[#E2E8F0] placeholder:text-[#526783] px-2"
                />


                {/* SEND */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isTyping}
                  className="w-10 h-10 shrink-0 rounded-lg bg-[#EF3340] hover:bg-[#D92D39] disabled:opacity-50 flex items-center justify-center text-white shadow-[0_0_18px_rgba(239,51,64,0.15)] transition-all"
                  title="Send"
                >
                  <Send size={16} />
                </button>

              </div>


              <div className="flex items-center justify-between px-1 mt-2">

                <span className="text-[9px] text-[#526783]">
                  Press Enter to send
                </span>

                <div className="flex items-center gap-1.5">

                  <Zap
                    size={10}
                    className="text-[#526783]"
                  />

                  <span className="text-[9px] text-[#526783]">
                    AI-generated emergency guidance
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div className="space-y-4">


          {/* EMERGENCY ACTIONS */}
          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-sm font-semibold text-[#F8FAFC]">
                  Emergency Actions
                </h2>

                <p className="text-[9px] text-[#64748B] mt-1">
                  Instant response commands
                </p>

              </div>

              <div className="w-7 h-7 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/20 flex items-center justify-center">

                <ShieldAlert
                  size={13}
                  className="text-[#EF3340]"
                />

              </div>

            </div>


            <div className="space-y-2">

              {emergencyActions.map((action, index) => {

                const Icon = action.icon;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleSend(action.title)
                    }
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#080F1D] border border-[#1D304D] hover:border-[#315074] hover:bg-[#101C30] transition-all text-left group"
                  >

                    <div className="w-8 h-8 shrink-0 rounded-lg bg-[#16243A] border border-[#243A59] flex items-center justify-center">

                      <Icon
                        size={14}
                        className={
                          action.title === "Send SOS"
                            ? "text-[#EF3340]"
                            : "text-[#7EA5D8]"
                        }
                      />

                    </div>


                    <div className="flex-1 min-w-0">

                      <p className="text-[10px] font-medium text-[#E2E8F0]">
                        {action.title}
                      </p>

                      <p className="text-[8px] text-[#526783] mt-0.5">
                        {action.subtitle}
                      </p>

                    </div>


                    <ChevronRight
                      size={13}
                      className="text-[#3D526F] group-hover:text-[#8FA4C7] transition-colors"
                    />

                  </button>
                );
              })}

            </div>

          </div>


          {/* AI SYSTEM STATUS */}
          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-sm font-semibold text-[#F8FAFC]">
                AI System Status
              </h2>

              <Wifi
                size={13}
                className="text-[#22C55E]"
              />

            </div>


            <div className="space-y-3">

              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  AI Engine
                </span>

                <span className="flex items-center gap-1.5 text-[9px] text-[#22C55E]">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />

                  Operational

                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  Response Network
                </span>

                <span className="text-[9px] text-[#22C55E]">
                  Connected
                </span>

              </div>


              <div className="flex items-center justify-between">

                <span className="text-[10px] text-[#7186A8]">
                  Location Services
                </span>

                <span className="text-[9px] text-[#F59E0B]">
                  Awaiting
                </span>

              </div>

            </div>

          </div>


          {/* LOCATION ASSISTANCE */}
          <div className="bg-[#0B1425] border border-[#1D304D] rounded-2xl p-4">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-8 h-8 rounded-lg bg-[#16243A] border border-[#243A59] flex items-center justify-center">

                <Navigation
                  size={14}
                  className="text-[#3B82F6]"
                />

              </div>

              <div>

                <h2 className="text-xs font-semibold text-[#F8FAFC]">
                  Location Assistance
                </h2>

                <p className="text-[8px] text-[#526783] mt-0.5">
                  Enable location for precise guidance
                </p>

              </div>

            </div>


            <button className="w-full h-8 rounded-lg border border-[#243A59] text-[9px] text-[#8FA4C7] hover:bg-[#16243A] hover:text-[#F8FAFC] transition-all">
              Enable Location
            </button>

          </div>


          {/* CRITICAL EMERGENCY */}
          <div className="bg-[#1A101A] border border-[#6B2534] rounded-2xl p-4">

            <div className="flex items-center gap-2">

              <AlertTriangle
                size={13}
                className="text-[#EF3340]"
              />

              <h2 className="text-xs font-semibold text-[#F8FAFC]">
                Critical Emergency
              </h2>

            </div>


            <p className="text-[9px] leading-relaxed text-[#7186A8] mt-2">
              For life-threatening situations, use SOS to escalate the incident to the emergency response network.
            </p>


            <button className="w-full h-8 mt-3 rounded-lg bg-[#EF3340]/10 border border-[#EF3340]/40 text-[9px] text-[#EF5965] hover:bg-[#EF3340]/20 transition-all">
              Open SOS Control
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EmergencyChatbot;