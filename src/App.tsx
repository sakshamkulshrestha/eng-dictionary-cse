import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import SmoothScroll from './components/SmoothScroll';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SmoothScroll>
          <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 ease-in-out selection:bg-[var(--neo-green)] selection:text-[var(--pop-black)]">
            <Routes>
              <Route path="/" element={<Layout />} />
              <Route path="/settings" element={<Layout view="settings" />} />
              <Route path="/guide" element={<Layout view="guide" />} />
              <Route path="/domain/:domain" element={<Layout />} />
              <Route path="/concept/:id" element={<Layout />} />
              <Route path="/bookmarks" element={<Layout view="bookmarks" />} />
            </Routes>
          </div>
        </SmoothScroll>
      </Router>
    </ErrorBoundary>
  );
}
