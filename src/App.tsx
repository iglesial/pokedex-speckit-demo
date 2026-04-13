import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { DetailPage } from './pages/DetailPage/DetailPage';
import { PreviewPage } from './pages/PreviewPage/PreviewPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pokemon/:id" element={<DetailPage />} />
      {import.meta.env.DEV && <Route path="/preview" element={<PreviewPage />} />}
    </Routes>
  );
}
