import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
