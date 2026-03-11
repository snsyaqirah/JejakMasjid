import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, ArrowLeft, LogIn, UserPlus, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ApiError, setTokens } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Step = "login" | "signup" | "otp";

const Auth = () => {
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { authenticate } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      authenticate(data.user as { id: string; email: string; user_metadata: Record<string, unknown> });
      toast({ title: "Selamat datang! ���", description: "Anda berjaya log masuk." });
      navigate("/");
    } catch (err) {
      const msg = err instanceof ApiError && err.status === 403
        ? "Sila sahkan email anda dahulu."
        : "Email atau kata laluan salah.";
      toast({ title: "Gagal log masuk", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({ title: "Nama diperlukan", description: "Sila masukkan nama penuh anda.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.signup({ email, password, fullName });
      if (data.accessToken && data.refreshToken && data.user) {
        // Email confirm is OFF — user is auto-confirmed, log in immediately
        setTokens(data.accessToken, data.refreshToken);
        authenticate(data.user as { id: string; email: string; user_metadata: Record<string, unknown> });
        toast({ title: "Akaun berjaya didaftarkan! 🎉", description: "Selamat datang ke JejakMasjid." });
        navigate("/");
      } else {
        toast({
          title: "Kod pengesahan dihantar!",
          description: `Semak inbox ${email} untuk kod anda.`,
        });
        setStep("otp");
      }
    } catch (err) {
      toast({
        title: "Pendaftaran gagal",
        description: err instanceof ApiError ? err.message : "Sila cuba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      toast({ title: "Kod tidak sah", description: "Masukkan kod pengesahan dari email anda.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp({ email, token: otpCode });
      authenticate(data.user as { id: string; email: string; user_metadata: Record<string, unknown> });
      toast({ title: "Akaun berjaya disahkan! ���", description: "Selamat datang ke JejakMasjid." });
      navigate("/");
    } catch (err) {
      toast({
        title: "Kod tidak sah atau tamat tempoh",
        description: "Sila semak kod sekali lagi atau minta kod baharu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await authApi.resendOtp(email);
      toast({ title: "Kod dihantar semula", description: `Semak inbox ${email}.` });
    } catch {
      toast({ title: "Gagal hantar semula", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Moon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">JejakMasjid</h1>
            </div>

            {/* ── OTP Step ── */}
            {step === "otp" && (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-2 flex justify-center">
                    <KeyRound className="h-8 w-8 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold">Sahkan Email</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Kami hantar kod ke <strong>{email}</strong>
                  </p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Kod Pengesahan</Label>
                    <Input
                      id="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="12345678"
                      maxLength={8}
                      className="mt-1.5 text-center text-2xl tracking-widest font-mono"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || otpCode.length < 6}>
                    {loading ? "Mengesahkan..." : "Sahkan"}
                  </Button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Hantar semula kod
                  </button>
                </div>
              </>
            )}

            {/* ── Login Step ── */}
            {step === "login" && (
              <>
                <div className="mb-6 flex gap-2">
                  <Button variant="default" className="flex-1" size="sm">
                    <LogIn className="mr-1.5 h-4 w-4" /> Log Masuk
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => setStep("signup")}>
                    <UserPlus className="mr-1.5 h-4 w-4" /> Daftar
                  </Button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Kata Laluan</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Memuatkan..." : "Log Masuk"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Belum ada akaun?{" "}
                  <button type="button" onClick={() => setStep("signup")} className="text-primary underline">Daftar sekarang</button>
                </p>
              </>
            )}

            {/* ── Signup Step ── */}
            {step === "signup" && (
              <>
                <div className="mb-6 flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => setStep("login")}>
                    <LogIn className="mr-1.5 h-4 w-4" /> Log Masuk
                  </Button>
                  <Button variant="default" className="flex-1" size="sm">
                    <UserPlus className="mr-1.5 h-4 w-4" /> Daftar
                  </Button>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nama Penuh</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmad bin Abdullah" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="emailSignup">Email</Label>
                    <Input id="emailSignup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="mt-1.5" required />
                  </div>
                  <div>
                    <Label htmlFor="passwordSignup">Kata Laluan</Label>
                    <Input id="passwordSignup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 aksara" minLength={8} className="mt-1.5" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Mendaftar..." : "Daftar & Hantar Kod"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
