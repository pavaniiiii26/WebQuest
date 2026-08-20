import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import DetailPage from './pages/DetailPage.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/destination/:name" element={<DetailPage />} />
      </Routes>
    </Router>
  );
}
