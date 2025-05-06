
import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Map,
  Compass,
  ClipboardList,
  Bookmark,
  User,
  LogIn,
  MenuIcon,
  X
} from "lucide-react";
import AuthModal from "./auth/AuthModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

const NavigationBar = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const handleLoginClick = () => {
    setAuthModalOpen(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavItem = ({ to, icon, label, active }: NavItemProps) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-gray-100 text-visitvibe-primary font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {icon}
      <span className={isMobile ? "text-sm" : ""}>{label}</span>
    </Link>
  );

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/lovable-uploads/facf83df-7352-4bf9-a188-0c877403dcc1.png"
            alt="MunchMapper Logo"
            className="w-10 h-10"
          />
          <span className="font-bold text-xl text-gray-800 hidden sm:block" style={{ color: '#ff4d94' }}>
            MunchMapper
          </span>
        </Link>

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center space-x-1">
            <NavItem
              to="/"
              icon={<Map size={20} />}
              label="Map"
              active={pathname === "/"}
            />
            <NavItem
              to="/explore"
              icon={<Compass size={20} />}
              label="Explore"
              active={pathname === "/explore"}
            />
            <NavItem
              to="/visits"
              icon={<ClipboardList size={20} />}
              label="Visits"
              active={pathname === "/visits"}
            />
            <NavItem
              to="/wishlist"
              icon={<Bookmark size={20} />}
              label="Wishlist"
              active={pathname === "/wishlist"}
            />
            <NavItem
              to="/profile"
              icon={<User size={20} />}
              label="Profile"
              active={pathname === "/profile"}
            />
          </div>
        )}

        {/* Auth Button */}
        {!isMobile && !isAuthenticated && (
          <Button
            onClick={handleLoginClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <LogIn size={16} />
            <span>Login</span>
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute inset-x-0 top-[56px] bg-white border-b border-gray-200 py-2 shadow-md">
          <div className="flex flex-col space-y-1 px-3">
            <NavItem
              to="/"
              icon={<Map size={20} />}
              label="Map"
              active={pathname === "/"}
            />
            <NavItem
              to="/explore"
              icon={<Compass size={20} />}
              label="Explore"
              active={pathname === "/explore"}
            />
            <NavItem
              to="/visits"
              icon={<ClipboardList size={20} />}
              label="Visits"
              active={pathname === "/visits"}
            />
            <NavItem
              to="/wishlist"
              icon={<Bookmark size={20} />}
              label="Wishlist"
              active={pathname === "/wishlist"}
            />
            <NavItem
              to="/profile"
              icon={<User size={20} />}
              label="Profile"
              active={pathname === "/profile"}
            />
            {!isAuthenticated && (
              <Button
                onClick={handleLoginClick}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 mt-2"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default NavigationBar;
