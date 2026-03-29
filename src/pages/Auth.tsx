import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "AQ.Ab8RN6JGJHrnFOUJT692BSyPLuqOAnmBWgJlD_qWUmDuqAfRLg";

const Auth = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

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
      const ok = await loginWithGoogle(credentialResponse.credential);
      if (ok) {
        toast.success("Google Authentication successful!");
        navigate("/");
      } else {
        toast.error("Google Auth failed. Use your @bmsce.ac.in address.");
      }
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

                <div className="flex justify-center md:justify-start hover-lift">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Sign-In Failed")}
                    shape="pill"
                    size="large"
                    theme="filled_black"
                    text={isLogin ? "signin_with" : "signup_with"}
                  />
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

        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Auth;
