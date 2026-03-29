import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-transparent relative z-10">
      <div className="absolute inset-0 bg-gradient-to-t from-[#16052a] to-transparent pointer-events-none -z-10"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-purple-200/60 leading-relaxed max-w-sm">
              Helping the BMSCE community reconnect with their belongings through a simple, secure, and resilient neural network platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white uppercase tracking-wider text-xs">System Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/" className="text-purple-200/50 hover:text-[#4af8e3] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-[#4af8e3]/50 group-hover:bg-[#4af8e3]"></span>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/directory" className="text-purple-200/50 hover:text-[#4af8e3] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-[#4af8e3]/50 group-hover:bg-[#4af8e3]"></span>
                  Global Directory
                </a>
              </li>
              <li>
                <a href="/post" className="text-purple-200/50 hover:text-[#4af8e3] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-[#4af8e3]/50 group-hover:bg-[#4af8e3]"></span>
                  Report Anomaly
                </a>
              </li>
              <li>
                <a href="/about" className="text-purple-200/50 hover:text-[#4af8e3] transition-all duration-300 flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-[#4af8e3]/50 group-hover:bg-[#4af8e3]"></span>
                  About Mission
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-white uppercase tracking-wider text-xs">Direct Link</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 text-purple-200/60">
                <MapPin className="h-4 w-4 text-[#ff2e97] mt-0.5 flex-shrink-0" />
                <span>
                  BMS College of Engineering<br />
                  Bull Temple Road, Bangalore
                </span>
              </li>
              <li className="flex items-center space-x-3 text-purple-200/60">
                <Mail className="h-4 w-4 text-[#6200EE] flex-shrink-0" />
                <span className="hover:text-white cursor-pointer transition-colors">lostandfound@bmsce.ac.in</span>
              </li>
              <li className="flex items-center space-x-3 text-purple-200/60">
                <Phone className="h-4 w-4 text-[#4af8e3] flex-shrink-0" />
                <span className="hover:text-white cursor-pointer transition-colors">+91 80 2662 0011</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-purple-200/40">
            © {new Date().getFullYear()} BMSCE Campus Intelligence. All systems nominal.
          </p>
          <div className="flex gap-4">
             <span className="w-2 h-2 rounded-full bg-[#4af8e3] shadow-[0_0_10px_rgba(74,248,227,0.8)] animate-pulse"></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
