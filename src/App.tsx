import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { DetailPage } from './pages/DetailPage/DetailPage';

// Dev-only /preview route. Lazy-loaded so the component gallery never ships
// in the production bundle — code-split into its own chunk and only fetched
// when the route is visited in dev.
const PreviewPage = lazy(() =>
  import('./pages/PreviewPage/PreviewPage').then((m) => ({ default: m.PreviewPage })),
);

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pokemon/:id" element={<DetailPage />} />
      {import.meta.env.DEV && (
        <Route
          path="/preview"
          element={
            <Suspense fallback={<div style={{ padding: 32 }}>Loading preview…</div>}>
              <PreviewPage />
            </Suspense>
          }
        />
      )}
    </Routes>
  );
}
