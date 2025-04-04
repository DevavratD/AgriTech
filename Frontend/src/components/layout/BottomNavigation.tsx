
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart2, Brain, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    path: "/",
    icon: Home,
    label: "Home",
    exact: true,
  },
  {
    path: "/sensors",
    icon: BarChart2,
    label: "Sensors",
    exact: false,
  },
  {
    path: "/ai-tools",
    icon: Brain,
    label: "AI Tools",
    exact: false,
  },
  {
    path: "/forum",
    icon: MessageSquare,
    label: "Forum",
    exact: false,
  },
];

const BottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
      <nav className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full px-1",
              isActive(item.path, item.exact)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default BottomNavigation;
