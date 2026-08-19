import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import GuidePage from './pages/GuidePage.jsx';

export default function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/guide/:sessionId" element={<GuidePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
