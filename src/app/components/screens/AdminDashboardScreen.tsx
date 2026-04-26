import { useState, useMemo } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Megaphone,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Eye,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  MapPin,
  User,
  Pin,
  Bell,
  Info,
  Check,
  X,
  Search,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../../store/StoreContext";
import type {
  Item,
  ClaimStatus,
  Announcement,
  AnnouncementType,
} from "../../store/StoreContext";
import logoImage from "../../../imports/image.png";

// ─── Tab Type ─────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "claims" | "announcements";

// ─── Config Maps ──────────────────────────────────────────────────────────────

const claimStatusConfig: Record<
  ClaimStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: "Menunggu", color: "#FFB81C", bg: "#FFF8E6", icon: Clock },
  approved: { label: "Disetujui", color: "#34C759", bg: "#E8F9EE", icon: CheckCircle2 },
  rejected: { label: "Ditolak", color: "#FF3B30", bg: "#FFE8E6", icon: XCircle },
  on_hold: { label: "Ditahan", color: "#007AFF", bg: "#E6F2FF", icon: AlertCircle },
};

const announcementConfig: Record<
  AnnouncementType,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  info: { label: "Info", color: "#007AFF", bg: "#E6F2FF", icon: Info },
  warning: { label: "Peringatan", color: "#FF9500", bg: "#FFF3E0", icon: AlertCircle },
  found: { label: "Barang Temuan", color: "#34C759", bg: "#E8F9EE", icon: Package },
  event: { label: "Acara", color: "#003366", bg: "#E6F2FF", icon: Bell },
};

const categoryIcon: Record<string, string> = {
  Dompet: "👛", Tas: "🎒", Kunci: "🔑", Handphone: "📱",
  Laptop: "💻", Kacamata: "👓", Payung: "☂️", "Alat Tulis": "✏️",
  Dokumen: "📄", Lainnya: "📦",
};

// ─── Claim Card ───────────────────────────────────────────────────────────────

function ClaimCard({
  claim,
  foundItem,
  onApprove,
  onReject,
  onHold,
  onChat,
}: {
  claim: Item;
  foundItem?: Item;
  onApprove: () => void;
  onReject: () => void;
  onHold: () => void;
  onChat: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = claim.claimStatus ? claimStatusConfig[claim.claimStatus] : claimStatusConfig.pending;
  const StatusIcon = status.icon;
  const { timeAgo } = useStore();

  const imageUrl = claim.imageUrl ?? foundItem?.imageUrl;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-0 shadow-sm bg-white">
        {/* Match score bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full"
            style={{
              width: `${claim.matchScore ?? 0}%`,
              backgroundColor:
                (claim.matchScore ?? 0) >= 90 ? "#34C759" :
                (claim.matchScore ?? 0) >= 70 ? "#FFB81C" : "#FF3B30",
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {imageUrl ? (
              <img src={imageUrl} alt={claim.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#F4F6FB] flex items-center justify-center text-2xl flex-shrink-0">
                {categoryIcon[claim.category] ?? "📦"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>
                  {claim.title}
                </h4>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: status.bg, color: status.color, fontWeight: 600 }}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {claim.reportedBy} · {claim.reportedNIM}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{claim.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{timeAgo(claim.reportedAtMs)}</span>
                <span
                  className="text-xs"
                  style={{
                    fontWeight: 700,
                    color: (claim.matchScore ?? 0) >= 90 ? "#34C759" :
                           (claim.matchScore ?? 0) >= 70 ? "#FFB81C" : "#FF3B30",
                  }}
                >
                  AI {claim.matchScore ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Description expand */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Deskripsi klaim</span>
            <ChevronRight
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
            />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-[#F4F6FB] rounded-lg p-3">
                  {claim.description}
                </p>
                {foundItem && (
                  <div className="mt-2 bg-[#E8F9EE] rounded-lg p-3">
                    <p className="text-xs text-[#34C759]" style={{ fontWeight: 600 }}>
                      Barang Temuan Cocok:
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{foundItem.title} · {foundItem.location}</p>
                    <p className="text-xs text-muted-foreground">{foundItem.description}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {claim.claimStatus === "pending" && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Button size="sm" onClick={onApprove} className="h-9 bg-[#34C759] hover:bg-[#2DA74A] text-white text-xs gap-1">
                <Check className="h-3.5 w-3.5" /> Setujui
              </Button>
              <Button size="sm" onClick={onHold} className="h-9 bg-[#FFB81C] hover:bg-[#E6A418] text-[#003366] text-xs gap-1">
                <Clock className="h-3.5 w-3.5" /> Tahan
              </Button>
              <Button size="sm" onClick={onReject} className="h-9 bg-[#FF3B30] hover:bg-[#E53529] text-white text-xs gap-1">
                <X className="h-3.5 w-3.5" /> Tolak
              </Button>
            </div>
          )}

          {claim.claimStatus === "on_hold" && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button size="sm" onClick={onApprove} className="h-9 bg-[#34C759] hover:bg-[#2DA74A] text-white text-xs gap-1">
                <Check className="h-3.5 w-3.5" /> Setujui
              </Button>
              <Button size="sm" onClick={onReject} variant="outline" className="h-9 text-[#FF3B30] border-[#FF3B30]/30 text-xs gap-1">
                <X className="h-3.5 w-3.5" /> Tolak
              </Button>
            </div>
          )}

          {(claim.claimStatus === "approved" || claim.claimStatus === "rejected") && (
            <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg"
              style={{ backgroundColor: status.bg }}>
              <StatusIcon className="h-3.5 w-3.5" style={{ color: status.color }} />
              <span className="text-xs" style={{ color: status.color, fontWeight: 600 }}>
                Klaim telah {status.label.toLowerCase()}
              </span>
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={onChat}
            className="w-full mt-2 h-8 text-[#003366] text-xs gap-1.5 hover:bg-[#E6F2FF]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Lihat Chat Klaim
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({
  ann,
  onTogglePin,
  onToggleActive,
  onDelete,
  onEdit,
}: {
  ann: Announcement;
  onTogglePin: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const cfg = announcementConfig[ann.type];
  const TypeIcon = cfg.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-0 shadow-sm bg-white" style={{ opacity: ann.active ? 1 : 0.55 }}>
        <div className="h-1" style={{ backgroundColor: cfg.color }} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: cfg.bg }}
            >
              <TypeIcon className="h-4 w-4" style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ann.pinned && <Pin className="h-3 w-3 text-[#FFB81C] flex-shrink-0" />}
                    <p className="text-sm truncate" style={{ fontWeight: 600 }}>
                      {ann.title}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10 }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: ann.active ? "#E8F9EE" : "#F4F6FB",
                      color: ann.active ? "#34C759" : "#9ca3af",
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    {ann.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                {ann.body}
              </p>
              <p className="text-xs text-muted-foreground">
                oleh {ann.author} · {ann.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onTogglePin}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: ann.pinned ? "#FFF8E6" : "#F4F6FB", color: ann.pinned ? "#FFB81C" : "#9ca3af" }}
            >
              <Pin className="h-3 w-3" />
              {ann.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={onToggleActive}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: ann.active ? "#F4F6FB" : "#E8F9EE", color: ann.active ? "#9ca3af" : "#34C759" }}
            >
              <Eye className="h-3 w-3" />
              {ann.active ? "Nonaktifkan" : "Aktifkan"}
            </button>
            <div className="flex-1" />
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-[#E6F2FF] flex items-center justify-center text-[#003366] hover:bg-[#003366] hover:text-white transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg bg-[#FFE8E6] flex items-center justify-center text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Announcement Form ────────────────────────────────────────────────────────

function AnnouncementForm({
  initial,
  adminUser,
  onSave,
  onCancel,
}: {
  initial?: Partial<Announcement>;
  adminUser: string;
  onSave: (data: Omit<Announcement, "id" | "createdAtMs" | "createdAt" | "active">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [type, setType] = useState<AnnouncementType>(initial?.type ?? "info");
  const [pinned, setPinned] = useState(initial?.pinned ?? false);

  const valid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="p-4 border-0 shadow-md bg-white">
        <h4 className="text-[#003366] mb-4" style={{ fontWeight: 700, fontSize: 14 }}>
          {initial?.id ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1" style={{ fontWeight: 600 }}>
              Judul Pengumuman *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul pengumuman..."
              className="h-10 bg-[#F4F6FB] border-0 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1" style={{ fontWeight: 600 }}>
              Isi Pengumuman *
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi pengumuman secara lengkap..."
              className="bg-[#F4F6FB] border-0 text-sm resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2" style={{ fontWeight: 600 }}>
              Tipe Pengumuman
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(announcementConfig) as [AnnouncementType, typeof announcementConfig["info"]][]).map(
                ([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: type === key ? cfg.color : "transparent",
                        backgroundColor: type === key ? cfg.bg : "#F4F6FB",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cfg.color }} />
                      <span className="text-xs" style={{ color: cfg.color, fontWeight: type === key ? 700 : 400 }}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#F4F6FB] rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Pin className="h-3.5 w-3.5 text-[#FFB81C]" />
              <span className="text-xs" style={{ fontWeight: 500 }}>Sematkan di atas (Pin)</span>
            </div>
            <button
              onClick={() => setPinned(!pinned)}
              className="w-10 h-6 rounded-full transition-colors relative"
              style={{ backgroundColor: pinned ? "#FFB81C" : "#d1d5db" }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: pinned ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onCancel} className="flex-1 h-10 text-xs">
              Batal
            </Button>
            <Button
              onClick={() => valid && onSave({ title, body, type, pinned, author: adminUser })}
              disabled={!valid}
              className="flex-1 h-10 bg-[#003366] hover:bg-[#002244] text-white text-xs"
            >
              {initial?.id ? "Simpan" : "Publikasikan"}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const {
    items,
    announcements,
    adminUser,
    adminLogout,
    updateClaimStatus,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getItemById,
    addMessage,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [showForm, setShowForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [claimFilter, setClaimFilter] = useState<ClaimStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Claims = lost items that have a match
  const claims = useMemo(
    () => items.filter((i) => i.status === "lost" && i.matchedItemId),
    [items]
  );

  const pendingCount = useMemo(() => claims.filter((c) => c.claimStatus === "pending").length, [claims]);
  const approvedCount = useMemo(() => claims.filter((c) => c.claimStatus === "approved").length, [claims]);
  const rejectedCount = useMemo(() => claims.filter((c) => c.claimStatus === "rejected").length, [claims]);
  const holdCount = useMemo(() => claims.filter((c) => c.claimStatus === "on_hold").length, [claims]);
  const activeAnnCount = useMemo(() => announcements.filter((a) => a.active).length, [announcements]);

  const filteredClaims = useMemo(() => {
    return claims
      .filter((c) => {
        const matchFilter = claimFilter === "all" || c.claimStatus === claimFilter;
        const matchSearch =
          searchQuery === "" ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.reportedNIM.includes(searchQuery);
        return matchFilter && matchSearch;
      })
      .sort((a, b) => b.reportedAtMs - a.reportedAtMs);
  }, [claims, claimFilter, searchQuery]);

  const sortedAnnouncements = useMemo(
    () => [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)),
    [announcements]
  );

  const handleClaimAction = (itemId: string, status: ClaimStatus) => {
    updateClaimStatus(itemId, status);
    const statusMessages: Record<ClaimStatus, string> = {
      approved: "✅ Klaim telah DISETUJUI oleh Admin. Silakan ambil barang di pos satpam dengan KTM Anda.",
      rejected: "❌ Klaim telah DITOLAK oleh Admin. Deskripsi tidak sesuai dengan barang yang ditemukan.",
      on_hold: "⏸ Klaim sedang DITAHAN untuk verifikasi lebih lanjut. Mohon bawa dokumen pendukung ke pos satpam.",
      pending: "🔄 Status klaim dikembalikan ke pending.",
    };
    addMessage(itemId, {
      sender: "admin",
      text: statusMessages[status],
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    });
  };

  const handleSaveAnn = (data: Omit<Announcement, "id" | "createdAtMs" | "createdAt" | "active">) => {
    if (editingAnn) {
      updateAnnouncement(editingAnn.id, data);
      setEditingAnn(null);
    } else {
      addAnnouncement(data);
    }
    setShowForm(false);
  };

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Ringkasan", icon: Shield },
    { id: "claims", label: "Klaim", icon: Package, badge: pendingCount },
    { id: "announcements", label: "Pengumuman", icon: Megaphone, badge: activeAnnCount },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-5 pt-12 pb-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center p-1">
              <img src={logoImage} alt="UNESA" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-white" style={{ fontWeight: 700, fontSize: 16 }}>
                  {adminUser ?? "Admin"}
                </h1>
                <Shield className="h-4 w-4 text-[#FFB81C]" />
              </div>
              <p className="text-white/60 text-xs">Portal Admin · PSDKU Magetan</p>
            </div>
          </div>
          <button
            onClick={() => { adminLogout(); navigate("/"); }}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors"
          >
            <LogOut className="h-4 w-4 text-white/80" />
            <span className="text-xs text-white/80">Keluar</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-t-xl transition-all"
                style={{ backgroundColor: isActive ? "#F4F6FB" : "transparent" }}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" style={{ color: isActive ? "#003366" : "rgba(255,255,255,0.6)" }} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#FF3B30] rounded-full text-white flex items-center justify-center"
                      style={{ fontSize: 9, fontWeight: 700 }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className="text-xs"
                  style={{ color: isActive ? "#003366" : "rgba(255,255,255,0.6)", fontWeight: isActive ? 700 : 400 }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="px-4 py-4 space-y-4">
            {/* Greeting card */}
            <div className="bg-gradient-to-br from-[#003366] to-[#004488] rounded-2xl p-4 text-white">
              <p className="text-white/70 text-xs mb-1">Selamat bertugas,</p>
              <p className="text-lg" style={{ fontWeight: 700 }}>
                {adminUser ?? "Admin"} 👮
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: "Klaim Pending", value: pendingCount, color: "#FFB81C" },
                  { label: "Disetujui", value: approvedCount, color: "#34C759" },
                  { label: "Pengumuman Aktif", value: activeAnnCount, color: "#fff" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-2 py-2 text-center">
                    <p className="text-xl" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
                    <p className="text-xs text-white/60 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Laporan", value: items.length, color: "#003366", bg: "#E6F2FF", icon: Package,
                  onClick: () => {} },
                { label: "Berhasil Kembali", value: approvedCount, color: "#34C759", bg: "#E8F9EE", icon: TrendingUp,
                  onClick: () => { setClaimFilter("approved"); setActiveTab("claims"); } },
                { label: "Klaim Ditahan", value: holdCount, color: "#007AFF", bg: "#E6F2FF", icon: AlertCircle,
                  onClick: () => { setClaimFilter("on_hold"); setActiveTab("claims"); } },
                { label: "Klaim Ditolak", value: rejectedCount, color: "#FF3B30", bg: "#FFE8E6", icon: XCircle,
                  onClick: () => { setClaimFilter("rejected"); setActiveTab("claims"); } },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Card
                      className="p-3 border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
                      onClick={s.onClick}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                          <Icon className="h-5 w-5" style={{ color: s.color }} />
                        </div>
                        <div>
                          <p className="text-2xl" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
                          <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Pending claims preview */}
            {pendingCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#003366]" style={{ fontWeight: 600 }}>
                    Klaim Menunggu Tindakan
                  </p>
                  <button onClick={() => setActiveTab("claims")} className="text-xs text-[#FFB81C]" style={{ fontWeight: 600 }}>
                    Lihat Semua
                  </button>
                </div>
                <div className="space-y-3">
                  {claims
                    .filter((c) => c.claimStatus === "pending")
                    .slice(0, 2)
                    .map((claim) => (
                      <ClaimCard
                        key={claim.id}
                        claim={claim}
                        foundItem={claim.matchedItemId ? getItemById(claim.matchedItemId) : undefined}
                        onApprove={() => handleClaimAction(claim.id, "approved")}
                        onReject={() => handleClaimAction(claim.id, "rejected")}
                        onHold={() => handleClaimAction(claim.id, "on_hold")}
                        onChat={() => navigate(`/chat/${claim.id}`)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Pinned announcements preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#003366]" style={{ fontWeight: 600 }}>
                  Pengumuman Disematkan
                </p>
                <button onClick={() => setActiveTab("announcements")} className="text-xs text-[#FFB81C]" style={{ fontWeight: 600 }}>
                  Kelola
                </button>
              </div>
              {announcements
                .filter((a) => a.pinned && a.active)
                .slice(0, 2)
                .map((ann) => {
                  const cfg = announcementConfig[ann.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={ann.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="p-3 mb-2 border-0 shadow-sm bg-white">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                            <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Pin className="h-3 w-3 text-[#FFB81C]" />
                              <p className="text-xs truncate" style={{ fontWeight: 600 }}>{ann.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{ann.body}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              {announcements.filter((a) => a.pinned && a.active).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada pengumuman disematkan</p>
              )}
            </div>
          </div>
        )}

        {/* ── CLAIMS TAB ── */}
        {activeTab === "claims" && (
          <div className="px-4 py-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIM, atau barang..."
                className="pl-10 h-10 bg-white border-0 shadow-sm text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">✕</button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {([
                { key: "all", label: "Semua", count: claims.length },
                { key: "pending", label: "Pending", count: pendingCount },
                { key: "approved", label: "Disetujui", count: approvedCount },
                { key: "on_hold", label: "Ditahan", count: holdCount },
                { key: "rejected", label: "Ditolak", count: rejectedCount },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setClaimFilter(f.key as ClaimStatus | "all")}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    backgroundColor: claimFilter === f.key ? "#003366" : "#fff",
                    color: claimFilter === f.key ? "#fff" : "#6c757d",
                    fontWeight: claimFilter === f.key ? 600 : 400,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {f.label}
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: claimFilter === f.key ? "rgba(255,255,255,0.2)" : "#F4F6FB",
                      fontWeight: 700,
                      fontSize: 10,
                    }}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Claims list */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredClaims.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Tidak ada klaim ditemukan</p>
                  </motion.div>
                ) : (
                  filteredClaims.map((claim) => (
                    <ClaimCard
                      key={claim.id}
                      claim={claim}
                      foundItem={claim.matchedItemId ? getItemById(claim.matchedItemId) : undefined}
                      onApprove={() => handleClaimAction(claim.id, "approved")}
                      onReject={() => handleClaimAction(claim.id, "rejected")}
                      onHold={() => handleClaimAction(claim.id, "on_hold")}
                      onChat={() => navigate(`/chat/${claim.id}`)}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS TAB ── */}
        {activeTab === "announcements" && (
          <div className="px-4 py-4 space-y-3">
            {/* New / Form toggle */}
            <AnimatePresence mode="wait">
              {!showForm && !editingAnn ? (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full h-11 bg-[#003366] hover:bg-[#002244] text-white gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Pengumuman Baru
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AnnouncementForm
                    initial={editingAnn ?? undefined}
                    adminUser={adminUser ?? "Admin"}
                    onSave={handleSaveAnn}
                    onCancel={() => { setShowForm(false); setEditingAnn(null); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats bar */}
            <div className="flex gap-2">
              {[
                { label: "Aktif", value: announcements.filter((a) => a.active).length, color: "#34C759" },
                { label: "Disematkan", value: announcements.filter((a) => a.pinned).length, color: "#FFB81C" },
                { label: "Nonaktif", value: announcements.filter((a) => !a.active).length, color: "#9ca3af" },
              ].map((s) => (
                <Card key={s.label} className="flex-1 p-2 border-0 shadow-sm bg-white text-center">
                  <p className="text-base" style={{ fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </Card>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3">
              <AnimatePresence>
                {sortedAnnouncements.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Megaphone className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Belum ada pengumuman</p>
                  </motion.div>
                ) : (
                  sortedAnnouncements.map((ann) => (
                    <AnnouncementCard
                      key={ann.id}
                      ann={ann}
                      onTogglePin={() => updateAnnouncement(ann.id, { pinned: !ann.pinned })}
                      onToggleActive={() => updateAnnouncement(ann.id, { active: !ann.active })}
                      onDelete={() => deleteAnnouncement(ann.id)}
                      onEdit={() => { setEditingAnn(ann); setShowForm(false); }}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}