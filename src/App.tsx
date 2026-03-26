import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-bg text-[var(--text)] selection:bg-[var(--text)] selection:text-[var(--bg)]">
          <Routes>
            <Route path="/" element={<Layout />} />
            <Route path="/settings" element={<Layout view="settings" />} />
            <Route path="/guide" element={<Layout view="guide" />} />
            <Route path="/domain/:domain" element={<Layout />} />
            <Route path="/concept/:id" element={<Layout />} />
            <Route path="/bookmarks" element={<Layout />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
