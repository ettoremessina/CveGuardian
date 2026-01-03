// React not needed for JSX
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CVEs from './pages/CVEs';
import Projects from './pages/Projects';
import ImpactedProjects from './pages/ImpactedProjects';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cves" element={<CVEs />} />
            <Route path="projects" element={<Projects />} />
            <Route path="impacted" element={<ImpactedProjects />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
