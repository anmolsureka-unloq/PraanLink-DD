import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-full items-center justify-center bg-background px-5">
      <div className="text-center">
        <h1 className="mb-2 text-display text-foreground">404</h1>
        <p className="mb-4 text-body text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-body font-medium text-primary underline hover:no-underline">
          Return to home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
