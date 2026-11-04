import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BackgroundProvider } from './context/BackgroundContext';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { HabitProvider } from './context/HabitContext';
import { NoteProvider } from './context/NoteContext';
import { PlannerProvider } from './context/PlannerContext';
import { TimerProvider } from './context/TimerContext';
import { NotificationProvider } from './context/NotificationContext';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

import { Overview } from './pages/Overview';
import { Tasks } from './pages/Tasks';
import { Planner } from './pages/Planner';
import { Habits } from './pages/Habits';
import { Focus } from './pages/Focus';
import { Notes } from './pages/Notes';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BackgroundProvider>
        <AuthProvider>
        <TaskProvider>
          <HabitProvider>
            <NoteProvider>
              <PlannerProvider>
                <TimerProvider>
                  <NotificationProvider>
                    <BrowserRouter>
                      <Routes>
                        {/* Public Authentication Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Protected Dashboard & App Routes */}
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <MainLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Overview />} />
                          <Route path="tasks" element={<Tasks />} />
                          <Route path="planner" element={<Planner />} />
                          <Route path="habits" element={<Habits />} />
                          <Route path="focus" element={<Focus />} />
                          <Route path="notes" element={<Notes />} />
                          <Route path="insights" element={<Insights />} />
                          <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Catch-all Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </BrowserRouter>
                  </NotificationProvider>
                </TimerProvider>
              </PlannerProvider>
            </NoteProvider>
          </HabitProvider>
        </TaskProvider>
      </AuthProvider>
    </BackgroundProvider>
  </ThemeProvider>
  );
};

export default App;
