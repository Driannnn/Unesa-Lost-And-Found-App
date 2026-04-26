import {
  AlertCircle,
  PackagePlus,
  Search as SearchIcon,
  TrendingUp,
  Clock,
  MapPin,
  Bell,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { BottomNav } from "../BottomNav";
import { Badge } from "../ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../../store/StoreContext";

type Filter = "all" | "lost" | "found";

export function HomeScreen() {
  const navigate = useNavigate();
  const { items, announcements, currentUser, timeAgo } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const activeAnnouncements = useMemo(
    () => announcements.filter((a) => a.active && a.pinned).slice(0, 2),
    [announcements]
  );

  const displayItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchFilter = filter === "all" || item.status === filter;
        const matchSearch =
          search === "" ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
      })
      .sort((a, b) => b.reportedAtMs - a.reportedAtMs);
  }, [items, filter, search]);

  const lostCount = items.filter((i) => i.status === "lost").length;
  const foundCount = items.filter((i) => i.status === "found").length;
  const returnedCount = items.filter((i) => i.claimStatus === "approved").length;

  const stats = [
    { label: "Barang Hilang", value: lostCount.toString(), color: "#FF3B30", icon: AlertCircle },
    { label: "Barang Temuan", value: foundCount.toString(), color: "#34C759", icon: PackagePlus },
    { label: "Berhasil Kembali", value: returnedCount.toString(), color: "#FFB81C", icon: TrendingUp },
  ];

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

  return (
    <div className="flex flex-col h-full bg-background pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-xl" style={{ fontWeight: 700 }}>
              Lost &amp; Found
            </h1>
            <p className="text-white/70 text-sm">
              Halo, {currentUser?.name?.split(" ")[0] ?? "Mahasiswa"} 👋
            </p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-[#FFB81C] flex items-center justify-center shadow">
              <span className="text-[#003366] text-base" style={{ fontWeight: 700 }}>
                {currentUser?.name?.[0] ?? "U"}
              </span>
            </div>
            {activeAnnouncements.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#003366] flex items-center justify-center text-white" style={{ fontSize: 9, fontWeight: 700 }}>
                {activeAnnouncements.length}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md flex items-center px-4 py-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground mr-3 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barang hilang atau temuan..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground ml-2">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 -mt-4">
        {/* Announcements Banner */}
        {activeAnnouncements.length > 0 && (
          <div className="mb-4 space-y-2 pt-2">
            {activeAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#FFF8E6] border border-[#FFB81C]/30 rounded-xl px-3 py-2 flex items-start gap-2"
              >
                <Bell className="h-3.5 w-3.5 text-[#FFB81C] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#003366]" style={{ fontWeight: 600 }}>
                    {ann.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{ann.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-4 mb-5 shadow-md bg-white border-0">
          <h3 className="mb-3 text-[#003366]" style={{ fontWeight: 600 }}>
            Laporkan Barang
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("/report/lost")}
              className="bg-[#FF3B30] hover:bg-[#E53529] text-white h-20 flex flex-col gap-1.5"
            >
              <AlertCircle className="h-7 w-7" />
              <span className="text-sm">Barang Hilang</span>
            </Button>
            <Button
              onClick={() => navigate("/report/found")}
              className="bg-[#34C759] hover:bg-[#2DA74A] text-white h-20 flex flex-col gap-1.5"
            >
              <PackagePlus className="h-7 w-7" />
              <span className="text-sm">Barang Temuan</span>
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="mb-5">
          <h3 className="mb-3 text-[#003366]" style={{ fontWeight: 600 }}>
            Statistik
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="p-3 text-center shadow-sm border-0">
                    <div
                      className="w-9 h-9 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}18` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: stat.color }} />
                    </div>
                    <p className="text-xl" style={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["all", "lost", "found"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs transition-all"
              style={{
                backgroundColor: filter === f ? "#003366" : "#F4F6FB",
                color: filter === f ? "#fff" : "#6c757d",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f === "all" ? "Semua" : f === "lost" ? "Hilang" : "Temuan"}
            </button>
          ))}
        </div>

        {/* Recent Items Feed */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#003366]" style={{ fontWeight: 600 }}>
              {search ? `Hasil Pencarian "${search}"` : "Laporan Terbaru"}
            </h3>
            <span className="text-xs text-muted-foreground">{displayItems.length} item</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {displayItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-muted-foreground">Tidak ada item ditemukan</p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-xs text-[#003366] mt-2"
                      style={{ fontWeight: 600 }}
                    >
                      Hapus pencarian
                    </button>
                  )}
                </motion.div>
              ) : (
                displayItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Card
                      className="p-3 cursor-pointer hover:shadow-md transition-all border-0 shadow-sm bg-white"
                      onClick={() =>
                        item.matchedItemId ? navigate(`/match/${item.id}`) : null
                      }
                    >
                      <div className="flex gap-3">
                        {/* Image or emoji placeholder */}
                        <div className="relative flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-[#F4F6FB] flex items-center justify-center text-3xl">
                              {categoryIcon[item.category] ?? "📦"}
                            </div>
                          )}
                          {item.matchScore && (
                            <div
                              className="absolute -top-1.5 -right-1.5 text-white text-xs px-1.5 py-0.5 rounded-full shadow"
                              style={{
                                backgroundColor: item.matchScore >= 90 ? "#34C759" : "#FFB81C",
                                fontWeight: 700,
                                fontSize: 10,
                              }}
                            >
                              {item.matchScore}%
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="truncate" style={{ fontWeight: 600 }}>
                              {item.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="flex-shrink-0 text-xs"
                              style={{
                                backgroundColor:
                                  item.status === "lost" ? "#FFE8E6" : "#E8F9EE",
                                color: item.status === "lost" ? "#FF3B30" : "#34C759",
                              }}
                            >
                              {item.status === "lost" ? "Hilang" : "Temuan"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">{item.category}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeAgo(item.reportedAtMs)}
                            </span>
                          </div>
                          {item.matchedItemId && (
                            <p className="text-xs text-[#34C759] mt-1.5" style={{ fontWeight: 600 }}>
                              ✨ AI menemukan kecocokan • Tap untuk lihat
                            </p>
                          )}
                          {item.claimStatus === "approved" && (
                            <p className="text-xs text-[#003366] mt-1.5" style={{ fontWeight: 600 }}>
                              ✅ Klaim disetujui
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
