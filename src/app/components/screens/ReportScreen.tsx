import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Camera, Upload, MapPin, ChevronLeft, Check, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useStore } from "../../store/StoreContext";
import type { Item } from "../../store/StoreContext";

const categories = [
  "Dompet",
  "Tas",
  "Kunci",
  "Handphone",
  "Laptop",
  "Kacamata",
  "Payung",
  "Alat Tulis",
  "Dokumen",
  "Lainnya",
];

const locations = [
  "Gedung A",
  "Gedung A Lt. 2",
  "Gedung B",
  "Gedung C",
  "Perpustakaan",
  "Kantin",
  "Lapangan",
  "Parkiran Motor",
  "Masjid Kampus",
  "Koridor",
  "Lainnya",
];

export function ReportScreen() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { addItem, currentUser } = useStore();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [matchFound, setMatchFound] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });

  const isLost = type === "lost";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 500KB by showing error if too large
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto terlalu besar. Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isValid =
    formData.itemName.trim() &&
    formData.category &&
    formData.description.trim() &&
    formData.location &&
    formData.date;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Lengkapi semua field yang diperlukan.");
      return;
    }

    setSubmitting(true);

    // Small delay to simulate processing
    setTimeout(() => {
      const newItem = addItem({
        title: formData.itemName,
        category: formData.category,
        status: isLost ? "lost" : "found",
        location: formData.location,
        description: formData.description,
        date: formData.date,
        imageUrl: selectedImage,
        reportedBy: currentUser?.name ?? "Mahasiswa",
        reportedNIM: currentUser?.nim ?? "000000",
      });

      setSubmitting(false);

      if (newItem.matchedItemId) {
        setMatchFound(newItem);
        toast.success("🎯 AI menemukan kecocokan!", {
          description: `Match score: ${newItem.matchScore}%`,
        });
      } else {
        toast.success(
          isLost
            ? "Laporan barang hilang berhasil dikirim!"
            : "Laporan barang temuan berhasil dikirim!",
          { description: "Tim keamanan akan memverifikasi laporan Anda." }
        );
        setTimeout(() => navigate("/home"), 1200);
      }
    }, 800);
  };

  // If match found, show match result
  if (matchFound) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="bg-gradient-to-r from-[#003366] to-[#002244] px-6 pt-12 pb-6">
          <h1 className="text-white text-xl mb-1" style={{ fontWeight: 700 }}>
            Laporan Berhasil!
          </h1>
          <p className="text-white/70 text-sm">AI telah memproses laporan Anda</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#34C759]/10 to-[#34C759]/5 border-2 border-[#34C759]/30 rounded-2xl p-5 text-center"
          >
            <Sparkles className="h-10 w-10 text-[#FFB81C] mx-auto mb-3" />
            <p className="text-2xl mb-1" style={{ fontWeight: 700, color: "#34C759" }}>
              {matchFound.matchScore}% Match!
            </p>
            <p className="text-sm text-muted-foreground">
              AI menemukan kecocokan dengan laporan yang sudah ada
            </p>
          </motion.div>

          <Card className="p-4 border-0 shadow-sm">
            <p className="text-sm text-muted-foreground mb-3">Barang Anda yang dilaporkan:</p>
            <div className="flex items-center gap-3">
              {matchFound.imageUrl ? (
                <img src={matchFound.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#F4F6FB] flex items-center justify-center text-2xl">📦</div>
              )}
              <div>
                <p style={{ fontWeight: 600 }}>{matchFound.title}</p>
                <p className="text-xs text-muted-foreground">{matchFound.category} · {matchFound.location}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(`/match/${matchFound.id}`)}
              className="w-full h-12 bg-[#003366] hover:bg-[#002244] text-white"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Lihat Detail Kecocokan
            </Button>
            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              className="w-full h-12"
            >
              Kembali ke Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className={`px-6 pt-12 pb-6 ${isLost ? "bg-[#FF3B30]" : "bg-[#34C759]"}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl" style={{ fontWeight: 700 }}>
              {isLost ? "Laporkan Barang Hilang" : "Laporkan Barang Temuan"}
            </h1>
            <p className="text-white/80 text-sm">Isi form dengan lengkap</p>
          </div>
        </div>
      </div>

      {/* AI Matching Info */}
      <div className="bg-[#E6F2FF] px-6 py-2.5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#003366] flex-shrink-0" />
        <p className="text-xs text-[#003366]">
          AI akan otomatis mencocokkan laporan Anda dengan database barang yang ada
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <Card className="p-4 border-0 shadow-sm">
            <Label className="mb-3 block">Foto Barang</Label>
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {selectedImage ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                    >
                      ✕
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    className="border-2 border-dashed border-border rounded-xl p-6"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: isLost ? "#FFE8E6" : "#E8F9EE",
                        }}
                      >
                        <Camera
                          className="h-7 w-7"
                          style={{ color: isLost ? "#FF3B30" : "#34C759" }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Upload foto untuk meningkatkan akurasi AI Matching
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3">
                <label htmlFor="camera-upload">
                  <div className="flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 cursor-pointer hover:bg-muted transition-colors">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Kamera</span>
                  </div>
                  <input
                    id="camera-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <label htmlFor="file-upload">
                  <div className="flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Galeri</span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Item Details */}
          <Card className="p-4 border-0 shadow-sm space-y-4">
            <div>
              <Label htmlFor="itemName">Nama Barang *</Label>
              <Input
                id="itemName"
                placeholder="Contoh: Dompet kulit coklat"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
                className="mt-1.5 bg-[#F4F6FB] border-0"
              />
            </div>

            <div>
              <Label>Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger className="mt-1.5 bg-[#F4F6FB] border-0">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi Detail *</Label>
              <Textarea
                id="description"
                placeholder="Jelaskan ciri-ciri barang: warna, ukuran, merek, isi, dll"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="mt-1.5 min-h-24 bg-[#F4F6FB] border-0 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Semakin detail deskripsi, semakin akurat AI Matching
              </p>
            </div>

            <div>
              <Label htmlFor="date">
                Tanggal {isLost ? "Hilang" : "Ditemukan"} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1.5 bg-[#F4F6FB] border-0"
              />
            </div>
          </Card>

          {/* Location */}
          <Card className="p-4 border-0 shadow-sm">
            <Label className="mb-3 block">
              Lokasi {isLost ? "Terakhir Dilihat" : "Penemuan"} *
            </Label>
            <Select
              value={formData.location}
              onValueChange={(v) => setFormData({ ...formData, location: v })}
            >
              <SelectTrigger className="mb-3 bg-[#F4F6FB] border-0">
                <SelectValue placeholder="Pilih lokasi" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Campus map visual */}
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-xl overflow-hidden h-36">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-[#003366] mx-auto mb-1" />
                  <p className="text-xs text-[#003366]" style={{ fontWeight: 500 }}>
                    Peta Kampus UNESA Magetan
                  </p>
                  {formData.location && (
                    <p className="text-xs text-[#003366] mt-1 bg-white/70 rounded-full px-2 py-0.5" style={{ fontWeight: 600 }}>
                      📍 {formData.location}
                    </p>
                  )}
                </div>
              </div>
              {formData.location && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center animate-bounce">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full h-14"
            style={{
              backgroundColor: isLost ? "#FF3B30" : "#34C759",
              color: "white",
              opacity: isValid ? 1 : 0.5,
            }}
            size="lg"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI sedang memproses...</span>
              </div>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Kirim Laporan
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pb-4">
            Laporan akan diverifikasi oleh tim keamanan dalam 1×24 jam
          </p>
        </form>
      </div>
    </div>
  );
}
