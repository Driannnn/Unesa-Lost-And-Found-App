import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemStatus = "lost" | "found";
export type ClaimStatus = "pending" | "approved" | "rejected" | "on_hold";
export type AnnouncementType = "info" | "warning" | "found" | "event";

export interface Item {
  id: string;
  title: string;
  category: string;
  status: ItemStatus;
  location: string;
  description: string;
  date: string;
  imageUrl: string | null;
  reportedBy: string;
  reportedNIM: string;
  reportedAtMs: number;
  matchedItemId?: string | null;
  matchScore?: number;
  claimStatus?: ClaimStatus | null;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "other" | "admin";
  text: string;
  time: string;
  sentAtMs: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  author: string;
  createdAt: string;
  createdAtMs: number;
  pinned: boolean;
  active: boolean;
}

export interface CurrentUser {
  name: string;
  nim: string;
}

export interface StoreState {
  items: Item[];
  announcements: Announcement[];
  messages: Record<string, ChatMessage[]>;
  userLoggedIn: boolean;
  currentUser: CurrentUser | null;
  adminLoggedIn: boolean;
  adminUser: string | null;
}

interface StoreContextValue extends StoreState {
  // auth
  login: (name: string, nim: string) => void;
  logout: () => void;
  adminLogin: (username: string) => void;
  adminLogout: () => void;
  // items
  addItem: (item: Omit<Item, "id" | "reportedAtMs" | "matchedItemId" | "matchScore" | "claimStatus">) => Item;
  updateClaimStatus: (itemId: string, status: ClaimStatus) => void;
  // announcements
  addAnnouncement: (ann: Omit<Announcement, "id" | "createdAtMs" | "createdAt">) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  // messages
  addMessage: (chatId: string, msg: Omit<ChatMessage, "id" | "sentAtMs">) => void;
  // helpers
  timeAgo: (ms: number) => string;
  getItemById: (id: string) => Item | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  return `${days} hari lalu`;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function computeMatchScore(
  a: { category: string; location: string; description: string },
  b: { category: string; location: string; description: string }
): number {
  let score = 0;
  if (a.category === b.category) score += 50;
  if (a.location === b.location) score += 40;
  const aWords = new Set(a.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const bWords = b.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  for (const w of bWords) if (aWords.has(w)) score += 2;
  return Math.min(100, score);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const NOW = Date.now();
const H = 3600000;
const D = 86400000;

function buildSeedState(): StoreState {
  const items: Item[] = [
    {
      id: "l1",
      title: "Dompet Coklat",
      category: "Dompet",
      status: "lost",
      location: "Gedung A Lt. 2",
      description: "Dompet kulit coklat merk Fossil, berisi KTM, kartu ATM BRI, dan uang tunai Rp150.000",
      date: "2026-04-17",
      imageUrl: "https://images.unsplash.com/photo-1627997394689-e1c6343c91bb?w=400&q=80",
      reportedBy: "Budi Santoso",
      reportedNIM: "21051204011",
      reportedAtMs: NOW - 2 * H,
      matchedItemId: "f1",
      matchScore: 95,
      claimStatus: "pending",
    },
    {
      id: "l2",
      title: "Laptop Asus VivoBook",
      category: "Laptop",
      status: "lost",
      location: "Perpustakaan",
      description: "Laptop Asus VivoBook S14 warna biru navy, ada stiker UNESA di tutupnya",
      date: "2026-04-17",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
      reportedBy: "Siti Rahayu",
      reportedNIM: "22051204033",
      reportedAtMs: NOW - 5 * H,
      matchedItemId: "f2",
      matchScore: 88,
      claimStatus: "pending",
    },
    {
      id: "l3",
      title: "Kunci Motor Honda",
      category: "Kunci",
      status: "lost",
      location: "Parkiran Motor",
      description: "Kunci motor Honda Vario merah, ada remote alarm dan gantungan kunci vespa kecil",
      date: "2026-04-15",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      reportedBy: "Ahmad Fauzi",
      reportedNIM: "23051204055",
      reportedAtMs: NOW - 2 * D,
      matchedItemId: "f3",
      matchScore: 91,
      claimStatus: "approved",
    },
    {
      id: "l4",
      title: "Kacamata Hitam",
      category: "Kacamata",
      status: "lost",
      location: "Lapangan",
      description: "Kacamata hitam frame bulat merk Rayban, lensa anti UV",
      date: "2026-04-15",
      imageUrl: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80",
      reportedBy: "Dewi Kusuma",
      reportedNIM: "21051204078",
      reportedAtMs: NOW - 2 * D,
      matchedItemId: null,
      matchScore: undefined,
      claimStatus: null,
    },
    {
      id: "l5",
      title: "KTM Mahasiswa",
      category: "Dokumen",
      status: "lost",
      location: "Masjid Kampus",
      description: "KTM atas nama Rizky Pratama NIM 24051204099 Prodi Teknik Informatika",
      date: "2026-04-14",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      reportedBy: "Rizky Pratama",
      reportedNIM: "24051204099",
      reportedAtMs: NOW - 3 * D,
      matchedItemId: "f4",
      matchScore: 100,
      claimStatus: "on_hold",
    },
    {
      id: "f1",
      title: "Dompet Kulit Coklat",
      category: "Dompet",
      status: "found",
      location: "Gedung A Lt. 2",
      description: "Dompet kulit coklat dengan logo Fossil di depan, ada beberapa kartu di dalamnya",
      date: "2026-04-17",
      imageUrl: "https://images.unsplash.com/photo-1627997394689-e1c6343c91bb?w=400&q=80",
      reportedBy: "Satpam Gedung A",
      reportedNIM: "SATPAM001",
      reportedAtMs: NOW - 3 * H,
      matchedItemId: "l1",
      matchScore: 95,
      claimStatus: null,
    },
    {
      id: "f2",
      title: "Laptop di Meja Perpustakaan",
      category: "Laptop",
      status: "found",
      location: "Perpustakaan",
      description: "Laptop biru navy Asus ditemukan di meja baca lantai 2 perpustakaan",
      date: "2026-04-17",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
      reportedBy: "Petugas Perpustakaan",
      reportedNIM: "STAFF002",
      reportedAtMs: NOW - 4 * H,
      matchedItemId: "l2",
      matchScore: 88,
      claimStatus: null,
    },
    {
      id: "f3",
      title: "Kunci Motor",
      category: "Kunci",
      status: "found",
      location: "Parkiran Motor",
      description: "Kunci motor Honda ditemukan di area parkir, ada remote alarm merah",
      date: "2026-04-15",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      reportedBy: "Penjaga Parkir",
      reportedNIM: "STAFF003",
      reportedAtMs: NOW - 2 * D - H,
      matchedItemId: "l3",
      matchScore: 91,
      claimStatus: null,
    },
    {
      id: "f4",
      title: "KTM Ditemukan di Masjid",
      category: "Dokumen",
      status: "found",
      location: "Masjid Kampus",
      description: "KTM mahasiswa ditemukan di dalam masjid kampus setelah sholat Jumat",
      date: "2026-04-14",
      imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
      reportedBy: "Pengurus Masjid",
      reportedNIM: "STAFF004",
      reportedAtMs: NOW - 3 * D - H,
      matchedItemId: "l5",
      matchScore: 100,
      claimStatus: null,
    },
    {
      id: "f5",
      title: "Payung Biru",
      category: "Payung",
      status: "found",
      location: "Kantin",
      description: "Payung warna biru tua ditemukan tergantung di kursi kantin utama",
      date: "2026-04-16",
      imageUrl: "https://images.unsplash.com/photo-1624087454380-a798c9b6e635?w=400&q=80",
      reportedBy: "Petugas Kantin",
      reportedNIM: "STAFF005",
      reportedAtMs: NOW - D,
      matchedItemId: null,
      matchScore: undefined,
      claimStatus: null,
    },
    {
      id: "f6",
      title: "Tas Ransel Hitam",
      category: "Tas",
      status: "found",
      location: "Perpustakaan",
      description: "Tas ransel hitam merek Eiger ditemukan di rak buku perpustakaan",
      date: "2026-04-16",
      imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&q=80",
      reportedBy: "Petugas Perpustakaan",
      reportedNIM: "STAFF002",
      reportedAtMs: NOW - D - 2 * H,
      matchedItemId: null,
      matchScore: undefined,
      claimStatus: null,
    },
  ];

  const announcements: Announcement[] = [
    {
      id: "ann1",
      title: "Penemuan Dompet di Perpustakaan",
      body: "Telah ditemukan sebuah dompet warna hitam di area perpustakaan lantai 1. Pemilik dapat menghubungi pos keamanan dengan membawa identitas diri.",
      type: "found",
      author: "Satpam A. Wibowo",
      createdAt: "Hari ini, 08:30",
      createdAtMs: NOW - 4 * H,
      pinned: true,
      active: true,
    },
    {
      id: "ann2",
      title: "Zona Rawan Kehilangan: Kantin",
      body: "Tingkat kehilangan barang di area kantin meningkat minggu ini. Harap selalu menjaga barang bawaan dan tidak meninggalkan tas tanpa pengawasan.",
      type: "warning",
      author: "Admin IT",
      createdAt: "Kemarin, 14:00",
      createdAtMs: NOW - D,
      pinned: true,
      active: true,
    },
    {
      id: "ann3",
      title: "Prosedur Pengambilan Barang",
      body: "Pengambilan barang hilang wajib disertai: (1) KTM asli, (2) Deskripsi barang yang jelas, (3) Konfirmasi AI Match minimal 70%. Jam layanan: 07.00–17.00 WIB.",
      type: "info",
      author: "Koordinator Keamanan",
      createdAt: "3 hari lalu",
      createdAtMs: NOW - 3 * D,
      pinned: false,
      active: true,
    },
    {
      id: "ann4",
      title: "Sosialisasi Aplikasi Lost & Found",
      body: "Akan diadakan sosialisasi penggunaan aplikasi UNESA Lost & Found pada Jumat, 24 April 2026 pukul 10.00 WIB di Aula Gedung B.",
      type: "event",
      author: "Admin IT",
      createdAt: "3 hari lalu",
      createdAtMs: NOW - 3 * D - H,
      pinned: false,
      active: false,
    },
  ];

  const messages: Record<string, ChatMessage[]> = {
    l1: [
      {
        id: "m1",
        sender: "other",
        text: "Halo! Saya menemukan dompet coklat di Gedung A Lt. 2. Apakah ini milik Anda?",
        time: "09:14",
        sentAtMs: NOW - 2 * H,
      },
      {
        id: "m2",
        sender: "user",
        text: "Ya benar! Itu dompet saya. Terima kasih sudah menemukannya!",
        time: "09:16",
        sentAtMs: NOW - 2 * H + 2 * 60000,
      },
      {
        id: "m3",
        sender: "other",
        text: "Saya sudah serahkan ke pos satpam Gedung A. Bisa diambil dengan menunjukkan KTM.",
        time: "09:17",
        sentAtMs: NOW - 2 * H + 3 * 60000,
      },
      {
        id: "m4",
        sender: "user",
        text: "Baik, terima kasih banyak! Saya akan ke sana sekarang.",
        time: "09:18",
        sentAtMs: NOW - 2 * H + 4 * 60000,
      },
    ],
    l2: [
      {
        id: "m5",
        sender: "other",
        text: "Selamat siang! Saya petugas perpustakaan. Ada laptop biru navy ditemukan di meja baca. Apakah milik Anda?",
        time: "11:30",
        sentAtMs: NOW - 5 * H,
      },
      {
        id: "m6",
        sender: "user",
        text: "Iya itu laptop saya! Ada stiker UNESA di tutupnya?",
        time: "11:32",
        sentAtMs: NOW - 5 * H + 2 * 60000,
      },
      {
        id: "m7",
        sender: "other",
        text: "Betul, ada stiker UNESA. Silakan datang ke perpustakaan dengan membawa KTM untuk pengambilan.",
        time: "11:33",
        sentAtMs: NOW - 5 * H + 3 * 60000,
      },
    ],
    l3: [
      {
        id: "m8",
        sender: "other",
        text: "Penjaga parkir menemukan kunci motor Honda di area parkir.",
        time: "13:00",
        sentAtMs: NOW - 2 * D,
      },
      {
        id: "m9",
        sender: "user",
        text: "Alhamdulillah! Itu kunci motor saya. Ada remote alarm merahnya?",
        time: "13:05",
        sentAtMs: NOW - 2 * D + 5 * 60000,
      },
      {
        id: "m10",
        sender: "other",
        text: "Ada. Silakan ke pos satpam parkiran untuk pengambilan.",
        time: "13:06",
        sentAtMs: NOW - 2 * D + 6 * 60000,
      },
      {
        id: "m11",
        sender: "admin",
        text: "✅ Klaim telah DISETUJUI oleh Admin. Silakan ambil barang di pos satpam.",
        time: "14:00",
        sentAtMs: NOW - 2 * D + H,
      },
      {
        id: "m12",
        sender: "user",
        text: "Terima kasih banyak! Sudah saya ambil.",
        time: "14:30",
        sentAtMs: NOW - 2 * D + 1.5 * H,
      },
    ],
    l5: [
      {
        id: "m13",
        sender: "other",
        text: "KTM ditemukan di masjid. Nama di KTM: Rizky Pratama. Apakah ini milik Anda?",
        time: "10:00",
        sentAtMs: NOW - 3 * D,
      },
      {
        id: "m14",
        sender: "user",
        text: "Iya benar itu KTM saya! Saya kehilangan waktu sholat Jumat.",
        time: "10:05",
        sentAtMs: NOW - 3 * D + 5 * 60000,
      },
      {
        id: "m15",
        sender: "admin",
        text: "⏸ Klaim sedang DITAHAN untuk verifikasi lebih lanjut. Mohon bawa dokumen pendukung ke pos satpam.",
        time: "11:00",
        sentAtMs: NOW - 3 * D + H,
      },
    ],
  };

  return {
    items,
    announcements,
    messages,
    userLoggedIn: false,
    currentUser: null,
    adminLoggedIn: false,
    adminUser: null,
  };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "unesa_lf_store_v2";

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      // Ensure all required keys exist (migration safety)
      if (parsed.items && parsed.announcements && parsed.messages) {
        return {
          ...buildSeedState(),
          ...parsed,
          // always start with logged-out state for security
          userLoggedIn: false,
          currentUser: null,
          adminLoggedIn: false,
          adminUser: null,
        };
      }
    }
  } catch {
    // ignore
  }
  return buildSeedState();
}

function saveState(state: StoreState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState());

  // Persist on every change (auth fields excluded intentionally since they reset on load)
  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((updater: (prev: StoreState) => StoreState) => {
    setState((prev) => {
      const next = updater(prev);
      return next;
    });
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    (name: string, nim: string) =>
      update((s) => ({ ...s, userLoggedIn: true, currentUser: { name, nim } })),
    [update]
  );

  const logout = useCallback(
    () => update((s) => ({ ...s, userLoggedIn: false, currentUser: null })),
    [update]
  );

  const adminLogin = useCallback(
    (username: string) =>
      update((s) => ({ ...s, adminLoggedIn: true, adminUser: username })),
    [update]
  );

  const adminLogout = useCallback(
    () => update((s) => ({ ...s, adminLoggedIn: false, adminUser: null })),
    [update]
  );

  // ── Items ──────────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (itemData: Omit<Item, "id" | "reportedAtMs" | "matchedItemId" | "matchScore" | "claimStatus">): Item => {
      const id = uid();
      let newItem: Item = {
        ...itemData,
        id,
        reportedAtMs: Date.now(),
        matchedItemId: null,
        matchScore: undefined,
        claimStatus: null,
      };

      update((s) => {
        // Find best matching item of opposite status
        const oppositeStatus: ItemStatus = itemData.status === "lost" ? "found" : "lost";
        const candidates = s.items.filter(
          (i) => i.status === oppositeStatus && !i.matchedItemId
        );

        let bestMatch: { id: string; score: number } | null = null;
        for (const candidate of candidates) {
          const score = computeMatchScore(
            { category: itemData.category, location: itemData.location, description: itemData.description },
            { category: candidate.category, location: candidate.location, description: candidate.description }
          );
          if (score >= 50 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { id: candidate.id, score };
          }
        }

        if (bestMatch) {
          newItem = {
            ...newItem,
            matchedItemId: bestMatch.id,
            matchScore: bestMatch.score,
            claimStatus: itemData.status === "lost" ? "pending" : null,
          };
          // Update the matched item too
          const updatedItems = s.items.map((i) =>
            i.id === bestMatch!.id
              ? { ...i, matchedItemId: id, matchScore: bestMatch!.score }
              : i
          );
          return { ...s, items: [...updatedItems, newItem] };
        }

        return { ...s, items: [...s.items, newItem] };
      });

      return newItem;
    },
    [update]
  );

  const updateClaimStatus = useCallback(
    (itemId: string, status: ClaimStatus) =>
      update((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === itemId ? { ...i, claimStatus: status } : i
        ),
      })),
    [update]
  );

  // ── Announcements ─────────────────────────────────────────────────────────

  const addAnnouncement = useCallback(
    (ann: Omit<Announcement, "id" | "createdAtMs" | "createdAt">) =>
      update((s) => ({
        ...s,
        announcements: [
          {
            ...ann,
            id: uid(),
            createdAtMs: Date.now(),
            createdAt: "Baru saja",
            active: true,
          },
          ...s.announcements,
        ],
      })),
    [update]
  );

  const updateAnnouncement = useCallback(
    (id: string, updates: Partial<Announcement>) =>
      update((s) => ({
        ...s,
        announcements: s.announcements.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),
    [update]
  );

  const deleteAnnouncement = useCallback(
    (id: string) =>
      update((s) => ({
        ...s,
        announcements: s.announcements.filter((a) => a.id !== id),
      })),
    [update]
  );

  // ── Messages ──────────────────────────────────────────────────────────────

  const addMessage = useCallback(
    (chatId: string, msg: Omit<ChatMessage, "id" | "sentAtMs">) =>
      update((s) => ({
        ...s,
        messages: {
          ...s.messages,
          [chatId]: [
            ...(s.messages[chatId] ?? []),
            { ...msg, id: uid(), sentAtMs: Date.now() },
          ],
        },
      })),
    [update]
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getItemById = useCallback(
    (id: string) => state.items.find((i) => i.id === id),
    [state.items]
  );

  const value: StoreContextValue = {
    ...state,
    login,
    logout,
    adminLogin,
    adminLogout,
    addItem,
    updateClaimStatus,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addMessage,
    timeAgo,
    getItemById,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
