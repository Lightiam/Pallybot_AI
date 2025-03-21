import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/Dashboard';
import InterviewSetup from './components/InterviewSetup';
import InterviewSession from './components/InterviewSession';
import MockInterviewAvatar from './components/MockInterviewAvatar';
import InterviewCopilot from './components/InterviewCopilot';
import InterviewCopilotNew from './components/InterviewCopilotNew';
import Community from './components/Community';
import UserProfile from './components/UserProfile';
import Pricing from './components/Pricing';
import ProtectedRoute from './components/auth/ProtectedRoute';
import VideoConference from './components/VideoConference';
import TrainingRouter from './components/training/TrainingRouter';
import CurriculumRouter from './components/curriculum/CurriculumRouter';
import AIRouter from './components/ai/AIRouter';
import AdminRouter from './components/admin/AdminRouter';
import MessagesList from './components/MessagesList';
import DirectMessage from './components/DirectMessage';
import CalendarPage from './components/calendar/CalendarPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/*"
              element={
                <ProtectedRoute>
                  <TrainingRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/curriculum/*"
              element={
                <ProtectedRoute>
                  <CurriculumRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai/*"
              element={
                <ProtectedRoute>
                  <AIRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/session"
              element={
                <ProtectedRoute>
                  <InterviewSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/copilot"
              element={
                <ProtectedRoute>
                  <InterviewCopilotNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/copilot/legacy"
              element={
                <ProtectedRoute>
                  <InterviewCopilot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <MockInterviewAvatar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <ProtectedRoute>
                  <DirectMessage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-call/:sessionId"
              element={
                <ProtectedRoute>
                  <VideoConference />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminRouter />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App