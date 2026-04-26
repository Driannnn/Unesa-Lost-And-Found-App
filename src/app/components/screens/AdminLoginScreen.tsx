import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Lock, User, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion } from "motion/react";
import { useStore } from "../../store/StoreContext";
import logoImage from "../../../imports/image.png";

const ADMIN_ACCOUNTS = [
  { username: "satpam", password: "admin123", displayName: "A. Wibowo", role: "Satpam" },
  { username: "adminit", password: "admin123", displayName: "Tim IT", role: "Admin IT" },
  { username: "koordinator", password: "admin123", displayName: "Koordinator", role: "Koordinator Keamanan" },
];

export function AdminLoginScreen() {
  const navigate = useNavigate();
  const { adminLogin } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    const account = ADMIN_ACCOUNTS.find(
      (a) => a.username === username.toLowerCase() && a.password === password
    );
    if (!account) {
      setError("Username atau password salah.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      adminLogin(account.displayName);
      navigate("/admin/dashboard");
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#002244] via-[#003366] to-[#004488] text-white relative overflow-hidden">
      {/* Background deco */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FFB81C]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-48 h-48 rounded-full bg-white/5 -translate-x-1/2 pointer-events-none" />

      {/* Back */}
      <div className="pt-12 px-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Kembali ke Login Mahasiswa</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 relative"
        >
          <div className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center p-2 relative">
            <img src={logoImage} alt="Logo UNESA" className="w-full h-full object-contain rounded-full" />
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#FFB81C] flex items-center justify-center shadow-lg border-2 border-white">
              <Shield className="h-4 w-4 text-[#003366]" />
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-[#FFB81C]/30" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl mb-1" style={{ fontWeight: 700 }}>
            Portal Admin
          </h1>
          <p className="text-[#FFB81C] text-sm" style={{ fontWeight: 600 }}>
            UNESA Lost &amp; Found · PSDKU Magetan
          </p>
          <p className="text-white/60 text-xs mt-1">
            Akses khusus petugas keamanan &amp; admin kampus
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 flex-wrap justify-center mb-4"
        >
          {ADMIN_ACCOUNTS.map((a) => (
            <div key={a.username} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <Shield className="h-3 w-3 text-[#FFB81C]" />
              <span className="text-xs text-white/80">{a.role}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-white rounded-t-3xl px-6 py-8 shadow-2xl"
      >
        <h2 className="text-[#003366] mb-5" style={{ fontWeight: 700, fontSize: 17 }}>
          Masuk sebagai Petugas
        </h2>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
              Username / ID Petugas
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Username"
                className="pl-10 h-12 bg-[#F4F6FB] border-0"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Password"
                className="pl-10 pr-12 h-12 bg-[#F4F6FB] border-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-xl px-4 py-3"
            >
              <p className="text-xs text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Demo hint */}
          <div className="bg-[#E6F2FF] rounded-xl px-4 py-3 space-y-1">
            <p className="text-xs text-[#003366]" style={{ fontWeight: 600 }}>
              Demo credentials:
            </p>
            {ADMIN_ACCOUNTS.map((a) => (
              <button
                key={a.username}
                onClick={() => { setUsername(a.username); setPassword(a.password); }}
                className="block text-xs text-[#003366]/70 hover:text-[#003366] transition-colors text-left"
              >
                → <code className="bg-[#003366]/10 px-1 rounded">{a.username}</code> /{" "}
                <code className="bg-[#003366]/10 px-1 rounded">{a.password}</code>{" "}
                ({a.role})
              </button>
            ))}
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-[#003366] hover:bg-[#002244] text-white shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Masuk ke Portal Admin</span>
              </div>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Akses ini terbatas untuk petugas yang berwenang
        </p>
      </motion.div>
    </div>
  );
}
