import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Activity,
  BarChart2,
} from "lucide-react";
import { Card } from "../ui/card";
import { BottomNav } from "../BottomNav";
import { motion } from "motion/react";
import { useStore } from "../../store/StoreContext";

const weeklyTrend = [
  { day: "Sen", hilang: 5, temuan: 3, kembali: 2 },
  { day: "Sel", hilang: 8, temuan: 6, kembali: 4 },
  { day: "Rab", hilang: 4, temuan: 7, kembali: 5 },
  { day: "Kam", hilang: 10, temuan: 5, kembali: 3 },
  { day: "Jum", hilang: 6, temuan: 9, kembali: 7 },
  { day: "Sab", hilang: 3, temuan: 4, kembali: 3 },
  { day: "Min", hilang: 2, temuan: 2, kembali: 2 },
];

const monthlyTrend = [
  { day: "Mg 1", hilang: 22, temuan: 18, kembali: 14 },
  { day: "Mg 2", hilang: 30, temuan: 24, kembali: 19 },
  { day: "Mg 3", hilang: 18, temuan: 22, kembali: 17 },
  { day: "Mg 4", hilang: 26, temuan: 20, kembali: 16 },
];

const hotspots = [
  { zone: "Gedung A (Kelas)", lost: 18, found: 12, risk: "high" },
  { zone: "Perpustakaan", lost: 14, found: 16, risk: "medium" },
  { zone: "Kantin Utama", lost: 12, found: 10, risk: "medium" },
  { zone: "Lapangan Olahraga", lost: 10, found: 7, risk: "medium" },
  { zone: "Gedung B (Lab)", lost: 8, found: 9, risk: "low" },
  { zone: "Masjid Kampus", lost: 6, found: 8, risk: "low" },
  { zone: "Parkiran Motor", lost: 9, found: 4, risk: "high" },
  { zone: "Koridor C", lost: 5, found: 6, risk: "low" },
];

const activityColors: Record<string, string> = {
  success: "#34C759",
  lost: "#FF3B30",
  match: "#007AFF",
  found: "#003366",
  verify: "#FFB81C",
};

const riskColors: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "#FFE8E6", text: "#FF3B30", label: "Rawan Tinggi" },
  medium: { bg: "#FFF8E6", text: "#FFB81C", label: "Rawan Sedang" },
  low: { bg: "#E8F9EE", text: "#34C759", label: "Rawan Rendah" },
};

type Period = "week" | "month";

export function DashboardScreen() {
  const [period, setPeriod] = useState<Period>("week");
  const { items, timeAgo } = useStore();

  const trendData = period === "week" ? weeklyTrend : monthlyTrend;

  // Real stats from store
  const totalItems = items.length;
  const lostItems = items.filter((i) => i.status === "lost").length;
  const foundItems = items.filter((i) => i.status === "found").length;
  const approvedItems = items.filter((i) => i.claimStatus === "approved").length;
  const pendingItems = items.filter((i) => i.claimStatus === "pending").length;
  const matchedItems = items.filter((i) => i.matchedItemId).length;
  const returnRate = totalItems > 0 ? Math.round((approvedItems / Math.max(lostItems, 1)) * 100) : 0;

  // Category breakdown from real data
  const categoryData = useMemo(() => {
    const cats: Record<string, { hilang: number; temuan: number }> = {};
    items.forEach((item) => {
      if (!cats[item.category]) cats[item.category] = { hilang: 0, temuan: 0 };
      if (item.status === "lost") cats[item.category].hilang++;
      else cats[item.category].temuan++;
    });
    return Object.entries(cats).map(([name, v]) => ({ name, ...v }));
  }, [items]);

  // Status donut from real data
  const statusData = useMemo(() => [
    { name: "Berhasil Kembali", value: approvedItems, color: "#34C759" },
    { name: "Masih Dicari", value: lostItems - approvedItems - pendingItems, color: "#FF3B30" },
    { name: "Proses Verifikasi", value: pendingItems, color: "#FFB81C" },
    { name: "Temuan Tidak Diklaim", value: foundItems - matchedItems / 2, color: "#007AFF" },
  ].filter((s) => s.value > 0), [approvedItems, lostItems, foundItems, pendingItems, matchedItems]);

  // Recent activity from real items
  const recentActivity = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => b.reportedAtMs - a.reportedAtMs)
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        action:
          item.claimStatus === "approved"
            ? "Barang dikembalikan"
            : item.matchedItemId
            ? `Match AI ${item.matchScore}%`
            : item.status === "lost"
            ? "Laporan baru (hilang)"
            : "Laporan baru (temuan)",
        item: item.title,
        time: timeAgo(item.reportedAtMs),
        type:
          item.claimStatus === "approved"
            ? "success"
            : item.matchedItemId
            ? "match"
            : item.status === "lost"
            ? "lost"
            : "found",
      }));
  }, [items, timeAgo]);

  const kpiCards = [
    {
      label: "Total Laporan",
      value: totalItems.toString(),
      sub: `${lostItems} hilang · ${foundItems} temuan`,
      trend: "up" as const,
      icon: Package,
      color: "#003366",
      bg: "#E6F2FF",
    },
    {
      label: "Berhasil Kembali",
      value: approvedItems.toString(),
      sub: `Rate ${returnRate}%`,
      trend: "up" as const,
      icon: CheckCircle2,
      color: "#34C759",
      bg: "#E8F9EE",
    },
    {
      label: "Masih Hilang",
      value: (lostItems - approvedItems).toString(),
      sub: `${pendingItems} pending klaim`,
      trend: "down" as const,
      icon: AlertCircle,
      color: "#FF3B30",
      bg: "#FFE8E6",
    },
    {
      label: "AI Matched",
      value: Math.floor(matchedItems / 2).toString(),
      sub: "Pasang cocok ditemukan",
      trend: "up" as const,
      icon: TrendingUp,
      color: "#FFB81C",
      bg: "#FFF8E6",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F4F6FB] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl" style={{ fontWeight: 700 }}>
              Dashboard Statistik
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              Monitor tren & titik rawan kehilangan
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <Activity className="h-4 w-4 text-[#FFB81C]" />
            <span className="text-white text-xs">Live</span>
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex bg-white/10 rounded-xl p-1 mt-4">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-1.5 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: period === p ? "#FFB81C" : "transparent",
                color: period === p ? "#003366" : "rgba(255,255,255,0.7)",
                fontWeight: period === p ? 700 : 400,
              }}
            >
              {p === "week" ? "Minggu Ini" : "Bulanan"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-3 bg-white shadow-sm border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: kpi.bg }}
                    >
                      <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                    </div>
                    <span
                      className="text-xs flex items-center gap-0.5"
                      style={{
                        color: kpi.trend === "up" ? "#34C759" : "#FF3B30",
                      }}
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </span>
                  </div>
                  <p
                    className="text-2xl"
                    style={{ fontWeight: 700, color: kpi.color }}
                  >
                    {kpi.value}
                  </p>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ lineHeight: 1.3 }}
                  >
                    {kpi.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: kpi.color, opacity: 0.7 }}>
                    {kpi.sub}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-4 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-[#003366]" />
              <h3 className="text-[#003366]" style={{ fontWeight: 600 }}>
                Tren Laporan
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHilang" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTemuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKembali" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB81C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFB81C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="hilang" name="Hilang" stroke="#FF3B30" strokeWidth={2} fill="url(#colorHilang)" />
                <Area type="monotone" dataKey="temuan" name="Temuan" stroke="#34C759" strokeWidth={2} fill="url(#colorTemuan)" />
                <Area type="monotone" dataKey="kembali" name="Kembali" stroke="#FFB81C" strokeWidth={2} fill="url(#colorKembali)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {[
                { color: "#FF3B30", label: "Hilang" },
                { color: "#34C759", label: "Temuan" },
                { color: "#FFB81C", label: "Kembali" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Status Donut + Category Bar side by side */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status Pie */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="p-3 bg-white shadow-sm border-0 h-full">
              <p className="text-xs text-[#003366] mb-2" style={{ fontWeight: 600 }}>
                Status Barang
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                    formatter={(v: number) => [`${v} item`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-muted-foreground truncate">{s.name}</span>
                    <span className="text-xs ml-auto" style={{ color: s.color, fontWeight: 700 }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Category Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-3 bg-white shadow-sm border-0 h-full">
              <p className="text-xs text-[#003366] mb-2" style={{ fontWeight: 600 }}>
                Kategori Barang
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  barSize={6}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={52} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="hilang" name="Hilang" fill="#FF3B30" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="temuan" name="Temuan" fill="#34C759" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Hotspot Map */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="p-4 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-[#003366]" />
              <h3 className="text-[#003366]" style={{ fontWeight: 600 }}>
                Titik Rawan Kehilangan
              </h3>
            </div>

            {/* Campus Zone Visual */}
            <div className="bg-[#E6F2FF] rounded-2xl p-3 mb-3 relative overflow-hidden">
              <p className="text-xs text-[#003366]/60 mb-2" style={{ fontWeight: 500 }}>
                Peta Zona Kampus UNESA PSDKU Magetan
              </p>
              <div className="grid grid-cols-3 gap-2">
                {hotspots.slice(0, 6).map((h) => {
                  const riskStyle = riskColors[h.risk];
                  const maxLost = Math.max(...hotspots.map((x) => x.lost));
                  const intensity = (h.lost / maxLost) * 100;
                  return (
                    <div
                      key={h.zone}
                      className="rounded-xl p-2 relative"
                      style={{
                        backgroundColor: riskStyle.bg,
                        border: `1.5px solid ${riskStyle.text}40`,
                      }}
                    >
                      <div
                        className="absolute bottom-0 left-0 rounded-b-xl opacity-20"
                        style={{
                          backgroundColor: riskStyle.text,
                          width: "100%",
                          height: `${intensity}%`,
                        }}
                      />
                      <MapPin
                        className="h-3 w-3 mb-1"
                        style={{ color: riskStyle.text }}
                      />
                      <p
                        className="text-xs leading-tight relative z-10"
                        style={{ color: riskStyle.text, fontWeight: 600 }}
                      >
                        {h.zone}
                      </p>
                      <p className="text-xs relative z-10" style={{ color: riskStyle.text, opacity: 0.8 }}>
                        {h.lost} kasus
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2 justify-end">
                {Object.entries(riskColors).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.text }} />
                    <span style={{ fontSize: 9, color: v.text }}>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspot Table */}
            <div className="space-y-2">
              {hotspots.map((h, i) => {
                const riskStyle = riskColors[h.risk];
                return (
                  <div
                    key={h.zone}
                    className="flex items-center gap-3 py-1.5 border-b border-[#f0f0f0] last:border-0"
                  >
                    <span
                      className="text-xs w-5 text-center text-muted-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ fontWeight: 500 }}>
                        {h.zone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "#FF3B30" }}>
                        ↑{h.lost}
                      </span>
                      <span className="text-xs" style={{ color: "#34C759" }}>
                        ↓{h.found}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: riskStyle.bg,
                          color: riskStyle.text,
                          fontWeight: 600,
                          fontSize: 9,
                        }}
                      >
                        {riskStyle.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 bg-white shadow-sm border-0">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-[#003366]" />
              <h3 className="text-[#003366]" style={{ fontWeight: 600 }}>
                Log Aktivitas Terkini
              </h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: activityColors[act.type] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ fontWeight: 500 }}>
                      {act.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{act.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* AI Match Rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="p-4 bg-gradient-to-br from-[#003366] to-[#002244] shadow-sm border-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/70 text-xs">Akurasi AI Matching</p>
                <p className="text-white text-2xl" style={{ fontWeight: 700 }}>
                  87.4%
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#FFB81C]/30 flex items-center justify-center">
                <span className="text-[#FFB81C] text-sm" style={{ fontWeight: 700 }}>
                  A+
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Kecocokan Visual", pct: 91 },
                { label: "Kecocokan Deskripsi", pct: 84 },
                { label: "Kecocokan Lokasi", pct: 78 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-white/70 text-xs">{m.label}</span>
                    <span className="text-[#FFB81C] text-xs" style={{ fontWeight: 600 }}>
                      {m.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FFB81C]"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}