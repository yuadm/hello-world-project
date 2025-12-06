import { NavLink } from "@/components/NavLink";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold font-poppins text-logo mb-4">
              ReadyKids
            </h3>
            <p className="text-muted-foreground text-sm">
              Empowering families and childminders across England with safe, flexible and educational childcare solutions.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f text-lg"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <i className="fa-brands fa-instagram text-lg"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in text-lg"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <i className="fa-brands fa-twitter text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold font-poppins mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </NavLink>
              </li>
              <li>
                <NavLink to="/parents" className="text-muted-foreground hover:text-primary transition-colors">
                  Parents
                </NavLink>
              </li>
              <li>
                <NavLink to="/childminders" className="text-muted-foreground hover:text-primary transition-colors">
                  Childminders
                </NavLink>
              </li>
              <li>
                <NavLink to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Services
                </NavLink>
              </li>
            </ul>
          </div>

          {/* For Families */}
          <div>
            <h4 className="font-semibold font-poppins mb-4 text-foreground">For Families</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/parents" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Childcare
                </NavLink>
              </li>
              <li>
                <NavLink to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold font-poppins mb-4 text-foreground">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} className="text-primary flex-shrink-0" />
                admin@readykids.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} className="text-primary flex-shrink-0" />
                (123) 456‑7890
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} className="text-primary flex-shrink-0" />
                9 am – 6 pm (Mon–Fri)
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                108 Regent Studio, 1 Thane Villas, London, N7 7PH
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReadyKids. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
