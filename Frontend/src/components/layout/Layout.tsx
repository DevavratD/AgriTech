
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import { Chatbot } from "../chatbot";


const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-24 pt-16 container mx-auto px-3 sm:px-4">
        <Outlet />
      </main>
      <BottomNavigation />
      <Chatbot />
    </div>
  );
};
export default Layout;

