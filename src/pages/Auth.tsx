import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";

const GOOGLE_CLIENT_ID = "950515933140-hae51v4n4qr94n198g7n7huh02afsqmf.apps.googleusercontent.com";

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, loginWithGoogleMock, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showMockLoginModal, setShowMockLoginModal] = useState(false);
  const [mockEmail, setMockEmail] = useState("demo@bmsce.ac.in");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = loginData;
    if (!email || !password) return toast.error("Fill all fields");
    if (!email.endsWith("@bmsce.ac.in")) return toast.error("Use your BMSCE email");

    const ok = await login(email, password);
    if (!ok) return toast.error("Invalid email or password");
    toast.success("Logged in successfully!");
    navigate("/");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = signupData;
    if (!name || !email || !password || !confirmPassword) return toast.error("Fill all fields");
    if (!email.endsWith("@bmsce.ac.in")) return toast.error("Use your BMSCE email");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    const ok = await signup(name, email, password);
    if (!ok) return toast.error("Signup failed");
    toast.success("Account created! Logging in...");
    navigate("/");
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        toast.success("Google Authentication successful!");
        navigate("/");
      } else {
        toast.error(result.error || "Google Auth failed. Use your @bmsce.ac.in address.");
      }
    }
  };

  const handleMockGoogleLogin = () => {
    setShowMockLoginModal(true);
  };

  const submitMockGoogleLogin = async () => {
    if (!mockEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!mockEmail.endsWith("@bmsce.ac.in")) {
      toast.error("Unauthorized: Use @bmsce.ac.in address ONLY.");
      return;
    }
    const name = mockEmail.split("@")[0].replace(/[._]/g, " ");
    const result = await loginWithGoogleMock(mockEmail, name);
    if (result.success) {
      toast.success("Google Mock Authentication successful!");
      setShowMockLoginModal(false);
      navigate("/");
    } else {
      toast.error(result.error || "Google Mock Authentication failed.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#16052a]">
        {/* Animated background blobs matching Stitch design */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/50 rounded-full blur-[80px] -z-10 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-teal-600/30 rounded-full blur-[80px] -z-10 mix-blend-screen opacity-50"></div>

        <Navbar />

        <main className="flex-1 container mx-auto px-6 py-24 flex items-center justify-center max-w-7xl">
          {/* Main Glass Panel mimicking the Stitch Dashboard/Home split layout */}
          <div className="w-full flex flex-col md:flex-row items-stretch rounded-[2.5rem] bg-[#240e3b]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden min-h-[600px] relative z-10 animate-fade-in">
            
            {/* Left Side: Lumina Campus Image & Branding (Hidden on very small screens, integrated natively mobile-first) */}
            <div className="hidden md:flex w-full md:w-5/12 relative p-8 flex-col justify-end bg-black">
              <img 
                alt="BMSCE Campus Life" 
                className="absolute inset-0 w-full h-full object-cover opacity-60" 
                src="/images/bmsce-campus.png" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16052a] via-[#16052a]/40 to-transparent"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#4af8e3] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border border-white/10 backdrop-blur-md">
                  Smart Campus Concierge
                </span>
                <h2 className="text-3xl font-extrabold text-white mb-2 font-['Plus_Jakarta_Sans']">
                  Welcome to <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b89fff] to-[#4af8e3] italic font-black">BMSCE Reconnect</span>
                </h2>
                <p className="text-purple-200/70 text-sm leading-relaxed max-w-xs">
                  The centralized digital hub for modern BMSCE students. Reclaim what's yours with verified security and instant matching.
                </p>
                
                {/* 3D Decorative Glass Card over Image */}
                <div className="mt-8 glass-card p-4 rounded-2xl backdrop-blur-md inline-block shadow-2xl bg-white/5 border border-white/20 transform hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#4af8e3] rounded-full w-8 h-8 flex items-center justify-center shadow-[0_0_15px_rgba(74,248,227,0.4)]">
                      <span className="material-symbols-outlined text-[#16052a] text-sm">security</span>
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Network Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: The Registration / Login Form */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-[#16052a]/40">
              <header className="mb-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6200EE]/20 border border-[#b89fff]/30 text-[10px] uppercase tracking-[0.2em] font-bold text-[#b89fff] mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4af8e3] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4af8e3]"></span>
                  </span>
                  {isLogin ? "Welcome Back" : "Join the Network"}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white font-['Plus_Jakarta_Sans']">
                  {isLogin ? "Log in to your account" : "Initialize Account"}
                </h1>
                <p className="text-purple-200/60 text-sm">Elevate your campus experience with the next-gen recovery network.</p>
              </header>

              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5 max-w-sm mx-auto md:mx-0 w-full">
                {!isLogin && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/60 ml-2 transition-colors group-focus-within:text-[#b89fff]">Full Name</label>
                    <div className="bg-white/5 rounded-2xl p-0.5 border border-white/5 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#b89fff]/40">
                      <input
                        className="w-full px-5 py-3.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-purple-300/20 text-sm outline-none"
                        placeholder="Ex. Alex Rivers"
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/60 ml-2 transition-colors group-focus-within:text-[#b89fff]">Network Email</label>
                  <div className="bg-white/5 rounded-2xl p-0.5 border border-white/5 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#b89fff]/40">
                    <input
                      className="w-full px-5 py-3.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-purple-300/20 text-sm outline-none"
                      placeholder="name@bmsce.ac.in"
                      type="email"
                      value={isLogin ? loginData.email : signupData.email}
                      onChange={(e) =>
                        isLogin
                          ? setLoginData({ ...loginData, email: e.target.value })
                          : setSignupData({ ...signupData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/60 ml-2 transition-colors group-focus-within:text-[#b89fff]">Access Key</label>
                  <div className="bg-white/5 rounded-2xl p-0.5 border border-white/5 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#b89fff]/40">
                    <input
                      className="w-full px-5 py-3.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-purple-300/20 text-sm outline-none"
                      placeholder="••••••••"
                      type="password"
                      value={isLogin ? loginData.password : signupData.password}
                      onChange={(e) =>
                        isLogin
                          ? setLoginData({ ...loginData, password: e.target.value })
                          : setSignupData({ ...signupData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/60 ml-2 transition-colors group-focus-within:text-[#b89fff]">Verify Key</label>
                    <div className="bg-white/5 rounded-2xl p-0.5 border border-white/5 backdrop-blur-md transition-all focus-within:ring-2 focus-within:ring-[#b89fff]/40">
                      <input
                        className="w-full px-5 py-3.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-purple-300/20 text-sm outline-none"
                        placeholder="••••••••"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6200EE] to-[#ff2e97] hover:from-[#b89fff] hover:to-[#6200EE] text-white font-extrabold py-4 rounded-full flex items-center justify-center gap-3 mt-6 shadow-[0_10px_30px_rgba(255,46,151,0.3)] transition-all duration-300 active:scale-95 group"
                >
                  <span className="tracking-tight uppercase text-sm">{isLogin ? "Authenticate" : "Initialize Account"}</span>
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>

                <div className="relative my-6 flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] font-bold uppercase tracking-widest text-purple-300/40">OR PROTOCOL</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="flex justify-center md:justify-start w-full">
                  {Capacitor.isNativePlatform() ? (
                    <button
                      type="button"
                      onClick={handleMockGoogleLogin}
                      className="flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90 active:scale-95 font-bold py-3 px-6 rounded-full transition-all duration-200 w-full max-w-[240px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-neutral-200"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="text-sm">Sign in with Google</span>
                    </button>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error("Google Sign-In Failed")}
                      shape="pill"
                      size="large"
                      theme="filled_black"
                      text={isLogin ? "signin_with" : "signup_with"}
                    />
                  )}
                </div>
              </form>

              <footer className="mt-8 text-center md:text-left">
                <p className="text-xs text-purple-200/50">
                  {isLogin ? "No neural link established? " : "Neural link already established? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#4af8e3] font-bold hover:text-white transition-all underline decoration-[#4af8e3]/30 underline-offset-4 cursor-pointer"
                  >
                    {isLogin ? "Join the Network" : "Sign In"}
                  </button>
                </p>
              </footer>
            </div>
          </div>
        </main>

        {/* Mock Google Login Modal */}
        {showMockLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md bg-[#240e3b] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
              {/* Decorative Blob matching the background style */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl"></div>
              
              <h3 className="text-xl font-extrabold text-white mb-2 font-['Plus_Jakarta_Sans']">
                Mock Google Sign-In
              </h3>
              <p className="text-sm text-purple-200/60 mb-6 leading-relaxed">
                Enter your Google account email to authenticate. For testing, the email must end in <span className="text-[#4af8e3] font-bold">@bmsce.ac.in</span>.
              </p>
              
              <div className="space-y-5">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-300/60 ml-2">
                    Google Email Address
                  </label>
                  <div className="bg-white/5 rounded-2xl p-0.5 border border-white/5 focus-within:ring-2 focus-within:ring-[#b89fff]/40">
                    <input
                      type="email"
                      className="w-full px-5 py-3.5 bg-transparent border-none focus:ring-0 text-white placeholder:text-purple-300/20 text-sm outline-none"
                      placeholder="user@bmsce.ac.in"
                      value={mockEmail}
                      onChange={(e) => setMockEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          submitMockGoogleLogin();
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowMockLoginModal(false)}
                    className="flex-1 py-3.5 px-4 rounded-full border border-white/10 text-white hover:bg-white/5 active:scale-95 transition-all duration-200 font-bold text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitMockGoogleLogin}
                    className="flex-1 py-3.5 px-4 rounded-full bg-gradient-to-r from-[#6200EE] to-[#ff2e97] hover:from-[#b89fff] hover:to-[#6200EE] text-white active:scale-95 transition-all duration-200 font-extrabold text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(255,46,151,0.25)]"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;
