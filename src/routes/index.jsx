import { Routes, Route } from "react-router-dom";

import Dashboard from "../components/Dashboard";
import MainLayout from "../layouts/MainLayout/index.jsx";

import VictimDetection from "../components/VictimDetection";
import FloodPrediction from "../components/FloodPrediction";
import ShelterFinder from "../components/ShelterFinder";
import EmergencyChatbot from "../components/EmergencyChatbot";
import Alerts from "../components/Alerts/index.jsx";
import SOS from "../components/SOS/index.jsx";
import DroneSurveillance from "../components/DroneSurveillance";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

// NEW
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Reset Password */}
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* ================= PROTECTED ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/victim-detection"
        element={
          <ProtectedRoute>
            <MainLayout>
              <VictimDetection />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/drone-surveillance"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DroneSurveillance />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/flood-prediction"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FloodPrediction />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shelter-finder"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ShelterFinder />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency-chatbot"
        element={
          <ProtectedRoute>
            <MainLayout>
              <EmergencyChatbot />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Alerts />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sos"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SOS />
            </MainLayout>
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default AppRoutes;