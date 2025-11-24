import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              Helping the BMSCE community reconnect with their belongings through a simple, efficient platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline inline-block">
                  Home
                </a>
              </li>
              <li>
                <a href="/post" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline inline-block">
                  Post Item
                </a>
              </li>
              <li>
                <a href="/my-posts" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline inline-block">
                  My Posts
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-all duration-300 link-underline inline-block">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  BMS College of Engineering<br />
                  Bull Temple Road, Bangalore
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">lostandfound@bmsce.ac.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">+91 80 2662 0011</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BMSCE Lost & Found. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
