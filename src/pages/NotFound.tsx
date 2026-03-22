import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto border border-primary/30">
          <Gamepad2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-6xl font-display font-bold text-gradient">404</h1>
        <p className="text-xl text-muted-foreground">This page doesn't exist in the arena</p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
