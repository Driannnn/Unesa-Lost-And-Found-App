import { useState } from "react";
import { LogIn, ShieldCheck, Shield, User, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useStore } from "../../store/StoreContext";
import logoImage from "../../../imports/image.png";

const DEMO_USERS = [
  { name: "Budi Santoso", nim: "21051204011" },
  { name: "Siti Rahayu", nim: "22051204033" },
  { name: "Ahmad Fauzi", nim: "23051204055" },
  { name: "Dewi Kusuma", nim: "21051204078" },
  { name: "Rizky Pratama", nim: "24051204099" },
];

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSSOLogin = () => {
    setLoading(true);
    // Auto pick first demo user for SSO simulation
    setTimeout(() => {
      const user = DEMO_USERS[0];
      login(user.name, user.nim);
      navigate("/home");
    }, 800);
  };

  const handleManualLogin = () => {
    if (!nim || !password) {
      setError("NIM dan password wajib diisi.");
      return;
    }
    const user = DEMO_USERS.find((u) => u.nim === nim);
    if (!user || password.length < 4) {
      setError(`NIM tidak ditemukan atau password salah.\nCoba NIM: 21051204011 / password: apapun`);
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      login(user.name, user.nim);
      navigate("/home");
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#003366] to-[#002244] text-white">
      {/* Header with Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="mb-8 relative">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl p-2">
            <img src={logoImage} alt="Logo UNESA" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-[#FFB81C]/40" style={{ pointerEvents: "none" }} />
        </div>

        <h1 className="text-3xl text-center mb-1" style={{ fontWeight: 700 }}>
          UNESA Lost &amp; Found
        </h1>
        <p className="text-[#FFB81C] text-base mb-1" style={{ fontWeight: 600 }}>
          PSDKU Magetan
        </p>
        <p className="text-white/70 text-center text-sm px-8 mb-8">
          Sistem pelaporan barang hilang dan temuan berbasis AI Matching
        </p>

        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <ShieldCheck className="h-5 w-5 text-[#FFB81C] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm" style={{ fontWeight: 500 }}>Aman &amp; Terverifikasi</p>
              <p className="text-xs text-white/70">Hanya untuk civitas akademika UNESA</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <svg className="h-5 w-5 text-[#FFB81C] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="text-sm" style={{ fontWeight: 500 }}>AI Matching Otomatis</p>
              <p className="text-xs text-white/70">Rekomendasi kecocokan barang real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="bg-white rounded-t-3xl px-6 py-8 shadow-2xl">
        <Button
          onClick={handleSSOLogin}
          disabled={loading}
          className="w-full bg-[#003366] hover:bg-[#002244] text-white h-14 shadow-lg"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Masuk...</span>
            </div>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Login with SSO UNESA
            </>
          )}
        </Button>

        {/* Manual login toggle */}
        <button
          onClick={() => setShowManual(!showManual)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3 hover:text-[#003366] transition-colors"
        >
          <User className="h-3.5 w-3.5" />
          Login Manual dengan NIM
          {showManual ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showManual && (
          <div className="mt-3 space-y-2">
            <Input
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="NIM (contoh: 21051204011)"
              className="h-10 bg-gray-100 border border-gray-200 text-sm text-black"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-10 bg-gray-100 border border-gray-200 text-sm text-black"
              onKeyDown={(e) => e.key === "Enter" && handleManualLogin()}
            />
            {error && (
              <p className="text-xs text-red-500 whitespace-pre-line">{error}</p>
            )}
            <Button
              onClick={handleManualLogin}
              className="w-full h-10 bg-[#003366] hover:bg-[#002244] text-white text-sm"
            >
              Masuk
            </Button>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Dengan masuk, Anda menyetujui syarat dan ketentuan aplikasi Lost &amp; Found UNESA Magetan
          </p>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#003366] transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              Portal Admin / Satpam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
