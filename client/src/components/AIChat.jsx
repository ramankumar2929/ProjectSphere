import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, AlertTriangle, RotateCcw } from "lucide-react";
import api from "../services/api"; // pre-configured axios instance

/* ===========================================================
   CONSTANTS
=========================================================== */

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm ProjectSphere AI. Ask me anything about your projects, programming, or hackathons.",
};

/* ===========================================================
   ANIMATION VARIANTS
=========================================================== */

const bubbleVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ===========================================================
   PURE HELPER FUNCTIONS
=========================================================== */

function createMessage(role, content) {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content };
}

/* ===========================================================
   TYPING INDICATOR
   Three animated dots shown while waiting for the AI reply.
=========================================================== */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white/50"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ===========================================================
   MAIN COMPONENT
=========================================================== */

export default function AIChat() {
  /* ----------------------- Chat state ----------------------- */
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const scrollAnchorRef = useRef(null);

  /* ===========================================================
     AUTO SCROLL
     Keeps the latest message in view as the conversation grows.
  =========================================================== */

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  /* ===========================================================
     SEND MESSAGE
     Posts only the current message to /ai/aiAssistant, per the
     backend contract — no conversation history is sent.
  =========================================================== */

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError(null);
    setIsSending(true);

    try {
      const response = await api.post("/ai/aiAssistant", { message: trimmed });
      const reply = response.data?.data?.reply ?? response.data?.reply ?? response.data?.data ?? "";
      setMessages((prev) => [...prev, createMessage("assistant", reply || "I couldn't generate a response.")]);
    } catch (err) {
      setError("Something went wrong while reaching ProjectSphere AI.");
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleRetry = useCallback(() => {
    setError(null);
    handleSend();
  }, [handleSend]);

  /* ===========================================================
     MAIN RENDER
  =========================================================== */

  return (
    <div className="flex h-128 flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-cyan-400">
          <Bot className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/90">ProjectSphere AI</p>
          <p className="text-[11px] text-white/40">Always happy to help</p>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={bubbleVariants}
              initial="hidden"
              animate="show"
              className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-white/10 border border-white/15"
                    : "bg-linear-to-br from-purple-500 to-cyan-400"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-white/70" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-br-sm bg-linear-to-r from-purple-500/25 to-cyan-500/25 border border-white/10 text-white/90"
                    : "rounded-bl-sm border border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing / loading dots while waiting for a reply */}
        {isSending && (
          <motion.div variants={bubbleVariants} initial="hidden" animate="show" className="flex items-end gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-cyan-400">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <TypingIndicator />
          </motion.div>
        )}

        {/* Error + retry, inline within the conversation */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
            <p className="flex-1 text-xs text-red-200">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 rounded-full border border-red-400/30 px-2.5 py-1 text-[11px] font-medium text-red-200 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </motion.div>
        )}

        <div ref={scrollAnchorRef} />
      </div>

      {/* Input box */}
      <div className="flex items-center gap-2.5 border-t border-white/10 p-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder="Ask about projects, programming, or hackathons..."
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/90 placeholder:text-white/25 outline-none backdrop-blur-md transition-colors focus:border-purple-400/50 focus:bg-white/[0.07] disabled:opacity-60"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isSending || !inputValue.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-500/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}