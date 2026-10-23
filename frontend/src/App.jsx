import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import { useApp } from './context/AppContext';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Found from './pages/Found';
import Lost from './pages/Lost';
import Verify from './pages/Verify';
import Reveal from './pages/Reveal';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function RequireAuth() {
  const { user, onboarded } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to={onboarded ? '/signin' : '/welcome'} replace state={{ from: location }} />;
  return <AppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/signin" element={<SignIn />} />
      <Route element={<RequireAuth />}>
        <Route index element={<Home />} />
        <Route path="found" element={<Found />} />
        <Route path="lost" element={<Lost />} />
        <Route path="verify/:id" element={<Verify />} />
        <Route path="reveal/:id" element={<Reveal />} />
        <Route path="activity" element={<Activity />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
