
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-3 sm:border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-sm sm:text-base text-muted-foreground">Loading AgriTech...</p>
      </div>
    </div>
  );
};

export default Index;
