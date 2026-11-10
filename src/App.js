import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import Assessment from './pages/student/Assessment';
import Chat from './pages/student/Chat';
import Resources from './pages/student/Resources';
import BreathingGame from './pages/student/Games/BreathingGame';
import MemoryGame from './pages/student/Games/MemoryGame';
import BubbleGame from './pages/student/Games/BubbleGame';
import Community from './pages/student/Community';
import Counselor from './pages/student/Counselor';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CounselorLogin from './pages/counselor/CounselorLogin';
import MoodTracker from './pages/student/MoodTracker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                        element={<Login />}              />
        <Route path="/student/dashboard"       element={<StudentDashboard />}   />
        <Route path="/student/assessment"      element={<Assessment />}         />
        <Route path="/student/chat"            element={<Chat />}               />
        <Route path="/student/resources"       element={<Resources />}          />
        <Route path="/student/games/breathing" element={<BreathingGame />}      />
        <Route path="/student/games/memory"    element={<MemoryGame />}         />
        <Route path="/student/games/bubble"    element={<BubbleGame />}         />
        <Route path="/student/community"       element={<Community />}          />
        <Route path="/student/counselor"       element={<Counselor />}          />
        <Route path="/counselor/dashboard"     element={<CounselorDashboard />} />
        <Route path="/admin/dashboard"         element={<AdminDashboard />}     />
        <Route path="/counselor/login" element={<CounselorLogin />} />
        <Route path="/student/mood" element={<MoodTracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;