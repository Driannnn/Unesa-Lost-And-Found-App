import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Send, Info, ShieldCheck, Clock, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../../store/StoreContext";

const QUICK_REPLIES = [
  "Kapan bisa diambil?",
  "Di mana lokasinya?",
  "Apakah masih ada?",
  "Terima kasih!",
];

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, addMessage, getItemById, items, currentUser } = useStore();

  const chatId = id ?? "";
  const chatMessages = messages[chatId] ?? [];

  // Get related item info
  const relatedItem = chatId ? getItemById(chatId) : undefined;
  const matchedItem = relatedItem?.matchedItemId ? getItemById(relatedItem.matchedItemId) : undefined;

  // Find item from found side if chatId is a lost item
  const claimItem = relatedItem ??
    items.find((i) => i.status === "lost" && i.id === chatId) ??
    items.find((i) => i.matchedItemId === chatId);

  const claimStatusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Menunggu Verifikasi Admin", color: "#FFB81C", bg: "#FFF8E6" },
    approved: { label: "Klaim Disetujui ✅", color: "#34C759", bg: "#E8F9EE" },
    rejected: { label: "Klaim Ditolak ❌", color: "#FF3B30", bg: "#FFE8E6" },
    on_hold: { label: "Klaim Ditahan ⏸", color: "#007AFF", bg: "#E6F2FF" },
  };

  const claimStatus = claimItem?.claimStatus
    ? claimStatusLabel[claimItem.claimStatus]
    : claimStatusLabel["pending"];

  const [inputText, setInputText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    addMessage(chatId, {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    });
    setInputText("");

    // Simulate reply after 1-2 seconds
    const replies = [
      "Baik, saya akan segera konfirmasi ke pos satpam.",
      "Sudah saya simpan di pos keamanan Gedung A ya.",
      "Silakan datang dengan membawa KTM untuk verifikasi.",
      "Apakah ada ciri-ciri lain yang bisa dikonfirmasi?",
      "Oke, ditunggu ya. Jam layanan 07.00-17.00 WIB.",
    ];
    setTimeout(() => {
      addMessage(chatId, {
        sender: "other",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      });
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-white truncate" style={{ fontWeight: 600 }}>
                {relatedItem?.title ?? claimItem?.title ?? "Chat Klaim"}
              </h1>
              <ShieldCheck className="h-4 w-4 text-[#34C759] flex-shrink-0" />
            </div>
            <p className="text-white/60 text-xs">Chat Anonim · Terverifikasi</p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Info className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Claim Status */}
        <Card
          className="p-3 border-0"
          style={{ backgroundColor: claimStatus?.bg ?? "#FFF8E6" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: claimStatus?.color ?? "#FFB81C" }} />
              <span className="text-xs" style={{ fontWeight: 600, color: claimStatus?.color ?? "#FFB81C" }}>
                Status Klaim
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${claimStatus?.color ?? "#FFB81C"}20`,
                color: claimStatus?.color ?? "#FFB81C",
                fontWeight: 700,
              }}
            >
              {claimStatus?.label ?? "Menunggu"}
            </span>
          </div>
          {claimItem?.claimStatus === "approved" && (
            <p className="text-xs mt-1" style={{ color: "#34C759" }}>
              Ambil barang di pos keamanan dengan KTM Anda
            </p>
          )}
          {(!claimItem?.claimStatus || claimItem?.claimStatus === "pending") && (
            <p className="text-xs text-muted-foreground mt-1">
              Menunggu verifikasi dari petugas keamanan
            </p>
          )}
        </Card>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#E6F2FF] border-b border-[#003366]/10"
          >
            <div className="px-5 py-3 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-[#003366] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#003366]">
                <span style={{ fontWeight: 600 }}>Chat Anonim:</span> Identitas Anda tidak akan
                dibagikan. Koordinasi pengambilan barang dilakukan melalui pos keamanan.
                Jam layanan: 07.00–17.00 WIB.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Notice (persistent) */}
      {!showInfo && (
        <div className="bg-[#F4F6FB] px-5 py-2 flex items-center gap-2 border-b border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-[#003366] flex-shrink-0" />
          <p className="text-xs text-[#003366]/70">
            Chat anonim · Identitas terlindungi · Koordinasi via pos keamanan
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-muted-foreground">Mulai percakapan dengan penemu barang</p>
          </div>
        )}

        {chatMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3) }}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "admin" ? (
              // Admin system message - centered
              <div className="w-full flex justify-center my-1">
                <div className="bg-[#003366]/10 rounded-full px-4 py-2 max-w-[90%]">
                  <p className="text-xs text-[#003366] text-center" style={{ fontWeight: 500 }}>
                    {message.text}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                  message.sender === "user"
                    ? "bg-[#003366] text-white rounded-br-sm"
                    : "bg-white text-foreground rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div
                  className={`flex items-center gap-1 justify-end mt-1 ${
                    message.sender === "user" ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  <span style={{ fontSize: 10 }}>{message.time}</span>
                  {message.sender === "user" && (
                    <CheckCheck style={{ width: 12, height: 12 }} />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* System message */}
        <div className="flex justify-center my-2">
          <div className="bg-muted/60 rounded-full px-4 py-1.5">
            <p className="text-xs text-center text-muted-foreground">
              🔒 Chat dienkripsi & dipantau sistem untuk keamanan
            </p>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-5 py-2 overflow-x-auto">
        <div className="flex gap-2">
          {QUICK_REPLIES.map((quick) => (
            <button
              key={quick}
              onClick={() => setInputText(quick)}
              className="flex-shrink-0 px-3 py-1.5 bg-[#F4F6FB] hover:bg-[#E6F2FF] rounded-full text-xs text-[#003366] transition-colors"
              style={{ fontWeight: 500 }}
            >
              {quick}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            className="flex-1 bg-[#F4F6FB] border-0 h-11"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-11 w-11 rounded-full bg-[#003366] hover:bg-[#002244] flex-shrink-0"
            disabled={!inputText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
