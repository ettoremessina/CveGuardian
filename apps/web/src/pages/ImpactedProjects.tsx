
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const ImpactedProjects = () => {
    const { data: matches, isLoading } = useQuery({
        queryKey: ['impacted'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/impacted-projects`);
            return res.json();
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Impacts</h2>

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
                                    <td className="px-6 py-4 text-blue-400 font-mono">{match.cveId}</td>
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
