import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  Sparkles,
  MessageCircle,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { motion } from "motion/react";
import { useStore } from "../../store/StoreContext";

const categoryIcon: Record<string, string> = {
  Dompet: "👛",
  Tas: "🎒",
  Kunci: "🔑",
  Handphone: "📱",
  Laptop: "💻",
  Kacamata: "👓",
  Payung: "☂️",
  "Alat Tulis": "✏️",
  Dokumen: "📄",
  Lainnya: "📦",
};

function ItemImage({ url, title, category }: { url: string | null; title: string; category: string }) {
  if (url) {
    return <img src={url} alt={title} className="w-full h-48 object-cover rounded-xl" />;
  }
  return (
    <div className="w-full h-48 rounded-xl bg-[#F4F6FB] flex items-center justify-center text-6xl">
      {categoryIcon[category] ?? "📦"}
    </div>
  );
}

export function MatchDetailsScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItemById, items, timeAgo } = useStore();
  const [activeTab, setActiveTab] = useState<"details" | "comparison">("details");

  const lostItem = id ? getItemById(id) : undefined;
  const foundItem = lostItem?.matchedItemId ? getItemById(lostItem.matchedItemId) : undefined;

  // Also try if id is a found item - find the linked lost item
  const altLostItem =
    !lostItem
      ? items.find((i) => i.status === "lost" && i.matchedItemId === id)
      : undefined;
  const altFoundItem = !foundItem && id ? getItemById(id) : undefined;

  const displayLost = lostItem?.status === "lost" ? lostItem : altLostItem;
  const displayFound = lostItem?.status === "found" ? lostItem : (foundItem ?? altFoundItem);

  if (!displayLost && !displayFound) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center px-6">
        <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground text-center">Data match tidak ditemukan</p>
        <Button onClick={() => navigate("/home")} className="mt-4 bg-[#003366] text-white">
          Kembali
        </Button>
      </div>
    );
  }

  const matchPercentage = displayLost?.matchScore ?? displayFound?.matchScore ?? 0;
  const chatId = displayLost?.id ?? id ?? "1";

  const matchFactors = [
    {
      label: "Kategori",
      score: displayLost?.category === displayFound?.category ? 100 : 50,
      match: displayLost?.category ?? "-",
    },
    {
      label: "Lokasi",
      score: displayLost?.location === displayFound?.location ? 100 : 60,
      match: displayLost?.location ?? "-",
    },
    {
      label: "Waktu",
      score: 88,
      match: "Rentang yang dekat",
    },
    {
      label: "Visual AI",
      score: matchPercentage,
      match: matchPercentage >= 90 ? "Sangat mirip" : matchPercentage >= 70 ? "Mirip" : "Cukup mirip",
    },
    {
      label: "Deskripsi",
      score: Math.min(100, matchPercentage + 5),
      match: "Kata kunci cocok",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-xl" style={{ fontWeight: 700 }}>
              AI Match Details
            </h1>
            <p className="text-white/70 text-sm">Detail kecocokan barang</p>
          </div>
        </div>

        {/* Match Percentage */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="h-7 w-7 text-[#FFB81C]" />
            <div className="text-center">
              <div
                className="text-5xl"
                style={{
                  fontWeight: 700,
                  color: matchPercentage >= 90 ? "#34C759" : matchPercentage >= 70 ? "#FFB81C" : "#FF3B30",
                }}
              >
                {matchPercentage}%
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">AI Match Confidence</p>
            </div>
          </div>
          <Progress value={matchPercentage} className="h-2.5" />
          <p
            className="text-center text-sm mt-3"
            style={{
              color: matchPercentage >= 90 ? "#34C759" : "#FFB81C",
              fontWeight: 600,
            }}
          >
            {matchPercentage >= 90
              ? "✨ Kemungkinan tinggi ini adalah barang Anda!"
              : matchPercentage >= 70
              ? "👀 Kemungkinan sedang — perlu verifikasi lebih lanjut"
              : "🤔 Kemungkinan rendah — periksa detail dengan seksama"}
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white sticky top-0 z-10">
        {(["details", "comparison"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm transition-colors"
            style={{
              color: activeTab === tab ? "#003366" : "#9ca3af",
              borderBottom: activeTab === tab ? "2px solid #003366" : "none",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab === "details" ? "Detail Barang" : "Perbandingan"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-28 space-y-4">
        {activeTab === "details" ? (
          <>
            {/* Lost Item */}
            {displayLost && (
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#FF3B30] text-white text-xs">Barang Hilang</Badge>
                  <h3 style={{ fontWeight: 600 }}>{displayLost.title}</h3>
                </div>
                <ItemImage url={displayLost.imageUrl} title={displayLost.title} category={displayLost.category} />
                <div className="space-y-2 text-sm mt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>Dilaporkan oleh: {displayLost.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Tanggal hilang: {displayLost.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{displayLost.location}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p style={{ fontWeight: 600 }} className="mb-1">
                      Deskripsi:
                    </p>
                    <p className="text-muted-foreground">{displayLost.description}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Found Item */}
            {displayFound && (
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#34C759] text-white text-xs">Barang Temuan</Badge>
                  <h3 style={{ fontWeight: 600 }}>{displayFound.title}</h3>
                </div>
                <ItemImage url={displayFound.imageUrl} title={displayFound.title} category={displayFound.category} />
                <div className="space-y-2 text-sm mt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>Dilaporkan oleh: {displayFound.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Ditemukan: {timeAgo(displayFound.reportedAtMs)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{displayFound.location}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p style={{ fontWeight: 600 }} className="mb-1">
                      Deskripsi:
                    </p>
                    <p className="text-muted-foreground">{displayFound.description}</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Side by Side */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="mb-3" style={{ fontWeight: 600 }}>
                Perbandingan Visual
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Barang Hilang</p>
                  {displayLost ? (
                    <ItemImage url={displayLost.imageUrl} title={displayLost.title} category={displayLost.category} />
                  ) : (
                    <div className="h-32 bg-[#F4F6FB] rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                      Tidak ada foto
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">Barang Temuan</p>
                  {displayFound ? (
                    <ItemImage url={displayFound.imageUrl} title={displayFound.title} category={displayFound.category} />
                  ) : (
                    <div className="h-32 bg-[#F4F6FB] rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                      Tidak ada foto
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Match Factors */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="mb-4" style={{ fontWeight: 600 }}>
                Faktor Kecocokan
              </h3>
              <div className="space-y-4">
                {matchFactors.map((factor, index) => (
                  <motion.div
                    key={factor.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ fontWeight: 500 }}>
                        {factor.label}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          fontWeight: 600,
                          color: factor.score >= 90 ? "#34C759" : factor.score >= 70 ? "#FFB81C" : "#FF3B30",
                        }}
                      >
                        {factor.score}%
                      </span>
                    </div>
                    <Progress value={factor.score} className="h-1.5" />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#34C759]" />
                      {factor.match}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* AI Analysis */}
            <Card className="p-4 bg-gradient-to-br from-[#003366]/5 to-[#FFB81C]/5 border-2 border-[#FFB81C]/20 shadow-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-[#FFB81C] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[#003366] mb-2" style={{ fontWeight: 600 }}>
                    Analisis AI
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sistem AI menganalisis kesamaan visual, lokasi, waktu, dan deskripsi. Dengan tingkat
                    kecocokan{" "}
                    <span style={{ fontWeight: 600, color: "#003366" }}>{matchPercentage}%</span>, kami{" "}
                    {matchPercentage >= 90
                      ? "sangat yakin"
                      : matchPercentage >= 70
                      ? "cukup yakin"
                      : "memperkirakan"}{" "}
                    ini adalah barang yang Anda cari. Silakan hubungi penemu untuk verifikasi lebih lanjut.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border px-6 py-4 shadow-lg">
        <Button
          onClick={() => navigate(`/chat/${chatId}`)}
          className="w-full bg-[#003366] hover:bg-[#002244] h-13"
          size="lg"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Hubungi Penemu via Chat
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Chat anonim untuk koordinasi pengambilan barang
        </p>
      </div>
    </div>
  );
}
