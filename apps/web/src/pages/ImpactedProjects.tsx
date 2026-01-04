
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle, Search, Folder } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const ImpactedProjects = () => {
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [cveFilter, setCveFilter] = useState<string>('');
    const [severity, setSeverity] = useState<string>('');

    // Fetch Projects for Filter
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects`);
            return res.json();
        }
    });

    const { data: matches, isLoading } = useQuery({
        queryKey: ['impacted', selectedProject, cveFilter, severity],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (selectedProject && selectedProject !== 'all') params.append('projectId', selectedProject);
            if (cveFilter) params.append('cveId', cveFilter);
            if (severity) params.append('severity', severity);

            const res = await fetch(`${API_URL}/impacted-projects?${params.toString()}`);
            return res.json();
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Impacts</h2>

                {/* Filter Panel */}
                <div className="flex flex-wrap gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Project</label>
                        <div className="relative">
                            <Folder className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="all">All Projects</option>
                                {projects?.slice().sort((a: any, b: any) => a.name.localeCompare(b.name)).map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">CVE ID</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search CVE-202X-..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                value={cveFilter}
                                onChange={(e) => setCveFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
                        <div className="relative">
                            <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value)}
                            >
                                <option value="">All Severities</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-slate-400">Loading Analysis...</div>
            ) : (
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Project</th>
                                <th className="px-6 py-4 font-medium">CVE ID</th>
                                <th className="px-6 py-4 font-medium">Severity</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Detected At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {matches?.map((match: any) => (
                                <tr key={match.matchId} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-200">{match.projectName}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <a
                                            href={`https://nvd.nist.gov/vuln/detail/${match.cveId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            {match.cveId}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${match.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                                            match.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                                match.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {match.severity || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={14} className="text-red-400" />
                                            <span className="text-slate-300">{match.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {format(new Date(match.detectedAt), 'yyyy-MM-dd HH:mm')}
                                    </td>
                                </tr>
                            ))}
                            {(!matches || matches.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No impacted projects found (Good news!).
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ImpactedProjects;
