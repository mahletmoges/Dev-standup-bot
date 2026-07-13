import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateWorkspace from './pages/CreateWorkspace';
import JoinWorkspace from './pages/JoinWorkspace';
import Dashboard from './pages/Dashboard';
import StandupForm from './pages/StandupForm';
import DigestPage from './pages/DigestPage';
import History from './pages/History';

function WorkspaceRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user && !user.workspaceId) {
    return <Navigate to="/workspace/new" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route
          path="/"
          element={
            <WorkspaceRedirect>
              <Dashboard />
            </WorkspaceRedirect>
          }
        />
        <Route path="/workspace/new" element={<CreateWorkspace />} />
        <Route path="/workspace/join" element={<JoinWorkspace />} />
        <Route
          path="/standup"
          element={
            <WorkspaceRedirect>
              <StandupForm />
            </WorkspaceRedirect>
          }
        />
        <Route
          path="/digests"
          element={
            <WorkspaceRedirect>
              <DigestPage />
            </WorkspaceRedirect>
          }
        />
        <Route
          path="/history"
          element={
            <WorkspaceRedirect>
              <History />
            </WorkspaceRedirect>
          }
        />
      </Route>
    </Routes>
  );
}
