
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const ImpactedProjects = () => {
    const [selectedProject, setSelectedProject] = useState<string>('all');

    // Fetch Projects for Filter
    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects`);
            return res.json();
        }
    });

    const { data: matches, isLoading } = useQuery({
        queryKey: ['impacted', selectedProject],
        queryFn: async () => {
            const url = selectedProject && selectedProject !== 'all'
                ? `${API_URL}/impacted-projects?projectId=${selectedProject}`
                : `${API_URL}/impacted-projects`;
            const res = await fetch(url);
            return res.json();
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Impacts</h2>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Filter by Project:</span>
                    <select
                        className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
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

            {isLoading ? (
                <div className="text-slate-400">Loading Analysis...</div>
            ) : (
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Project</th>
                                <th className="px-6 py-4 font-medium">CVE</th>
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
