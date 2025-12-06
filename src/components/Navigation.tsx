import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold font-poppins text-logo">
            ReadyKids
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/"
              className={`font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about"
              className={`font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              About
            </NavLink>
            <NavLink 
              to="/parents"
              className={`font-medium transition-colors ${isActive('/parents') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Parents
            </NavLink>
            <NavLink 
              to="/childminders"
              className={`font-medium transition-colors ${isActive('/childminders') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Childminders
            </NavLink>
            <NavLink 
              to="/services"
              className={`font-medium transition-colors ${isActive('/services') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Services
            </NavLink>
            <NavLink 
              to="/contact"
              className={`font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              Contact
            </NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/admin">
              <Button variant="ghost" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </NavLink>
            <NavLink to="/parents">
              <Button variant="default">Find Childcare</Button>
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-4">
            <NavLink 
              to="/"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/about"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/about') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>
            <NavLink 
              to="/parents"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/parents') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Parents
            </NavLink>
            <NavLink 
              to="/childminders"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/childminders') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Childminders
            </NavLink>
            <NavLink 
              to="/services"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/services') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </NavLink>
            <NavLink 
              to="/contact"
              className={`block w-full text-left py-2 font-medium transition-colors ${isActive('/contact') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
            <div className="pt-4 space-y-3">
              <NavLink to="/admin" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </NavLink>
              <NavLink to="/parents" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">Find Childcare</Button>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
