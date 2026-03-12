import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Briefcase, Moon, Sun, Loader2, Eye, EyeOff, Zap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please enter your email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      toast({ title: "Invalid credentials. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-background">
      {/* Theme toggle - floating top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2 rounded-lg bg-white/10 dark:bg-black/20 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-black/30 transition-colors text-white"
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Left panel — Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background with brand colors */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(200 85% 45%) 0%, hsl(210 55% 25%) 50%, hsl(210 60% 15%) 100%)',
          }}
        />
        
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(circle at 30% 70%, hsl(20 90% 55%) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(45 95% 55%) 0%, transparent 50%)',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.06 }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 3) * 100}px`,
                height: `${(i + 3) * 100}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white"
        >
          {/* Logo */}
          <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl ring-2 ring-white/30">
            <img
              src="/images/JTlogo.png"
              alt="JT Energy Limited Logo"
              className="h-40 w-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-3 tracking-tight text-center">
            JT Energy Limited
          </h1>
          
          <div className="w-20 h-1 rounded-full mb-6" style={{ background: 'hsl(45 95% 60%)' }} />

          <p className="text-lg text-white/80 max-w-md text-center leading-relaxed mb-12">
            Empowering your workforce with comprehensive HR management solutions
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-8 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3 ring-1 ring-white/20">
                <Zap className="w-7 h-7" style={{ color: 'hsl(45 95% 60%)' }} />
              </div>
              <p className="text-2xl font-bold mb-1">Fast</p>
              <p className="text-sm text-white/60">Lightning speed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3 ring-1 ring-white/20">
                <Users className="w-7 h-7" style={{ color: 'hsl(20 90% 60%)' }} />
              </div>
              <p className="text-2xl font-bold mb-1">Secure</p>
              <p className="text-sm text-white/60">Data protected</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3 ring-1 ring-white/20">
                <TrendingUp className="w-7 h-7" style={{ color: 'hsl(200 85% 70%)' }} />
              </div>
              <p className="text-2xl font-bold mb-1">Efficient</p>
              <p className="text-sm text-white/60">Streamlined</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background dark:bg-[hsl(210,60%,8%)]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-primary to-accent/20">
              <img
                src="/images/JTlogo.png"
                alt="JT Energy Limited Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">JT Energy Limited</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              Use any email with password <span className="font-mono font-semibold text-foreground">password</span> to sign in
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © 2026 JT Energy Limited. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

