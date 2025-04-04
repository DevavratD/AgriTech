
import { User, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-40 h-14">
      <div className="container h-full flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className={cn("text-lg font-bold text-primary mr-2")}>🌱 AgriTech</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size={isMobile ? "sm" : "icon"} className="relative w-8 h-8 p-0">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </Button>
          <Button variant="ghost" size={isMobile ? "sm" : "icon"} asChild className="w-8 h-8 p-0">
            <Link to="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
