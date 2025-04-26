
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-visitvibe-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          We couldn't find the page you were looking for. Perhaps you were looking for a delicious meal instead?
        </p>
        <Link 
          to="/" 
          className="flex items-center justify-center space-x-2 text-visitvibe-primary hover:text-visitvibe-primary/80 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back to map</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
