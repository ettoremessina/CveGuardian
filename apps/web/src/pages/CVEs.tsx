import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const CVEs = () => {
    // Filter State
    const [severity, setSeverity] = useState('');
    const [cveId, setCveId] = useState('');
    const [description, setDescription] = useState('');
    const [publishedAfter, setPublishedAfter] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['cves', severity, cveId, description, publishedAfter, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (severity) params.append('severity', severity);
            if (cveId) params.append('cveId', cveId);
            if (description) params.append('description', description);
            if (publishedAfter) params.append('publishedAfter', publishedAfter);
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`${API_URL}/cves?${params}`);
            return res.json(); // Expected: { data: [], meta: { ... } }
        },
        keepPreviousData: true
    });

    const cves = data?.data || [];
    const meta = data?.meta || {};

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on search
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Vulnerabilities (CVEs)</h2>

                {/* Filter Panel */}
                <div className="flex flex-wrap gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    {/* CVE ID Search */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">CVE ID</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search CVE-2024-..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                                value={cveId}
                                onChange={(e) => { setCveId(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    <div className="flex-[2] min-w-[250px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search vulnerability details..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                                value={description}
                                onChange={(e) => { setDescription(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Published Date Filter */}
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Published After</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <input
                                type="date"
                                lang="en-CA"
                                className="w-full bg-slate-900 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                                value={publishedAfter}
                                onChange={(e) => { setPublishedAfter(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Severity Filter */}
                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                            value={severity}
                            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
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

            {isLoading ? (
                <div className="text-slate-400">Loading CVEs...</div>
            ) : (
                <div className="space-y-4">
                    <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">CVE ID</th>
                                    <th className="px-6 py-4 font-medium">Severity</th>
                                    <th className="px-6 py-4 font-medium">Score</th>
                                    <th className="px-6 py-4 font-medium">Published</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {cves.map((cve: any) => (
                                    <tr key={cve.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            <a
                                                href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 hover:underline"
                                            >
                                                {cve.id}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cve.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                                                cve.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                                    cve.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                {cve.severity || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{cve.cvssScore || '-'}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {cve.publishedAt ? format(new Date(cve.publishedAt), 'yyyy-MM-dd') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 max-w-md truncate" title={cve.description}>
                                            {cve.description}
                                        </td>
                                    </tr>
                                ))}
                                {(!cves || cves.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No CVEs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Page {meta?.page || 1} of {meta?.totalPages || 1} ({meta?.total || 0} results)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(old => Math.max(old - 1, 1))}
                                disabled={page === 1}
                                className="p-2 border border-slate-700 rounded-md bg-slate-900 disabled:opacity-50 hover:bg-slate-800"
                            >
                                <ChevronLeft className="h-4 w-4 text-slate-300" />
                            </button>
                            <button
                                onClick={() => setPage(old => (!meta.totalPages || old >= meta.totalPages ? old : old + 1))}
                                disabled={!meta.totalPages || page >= meta.totalPages}
                                className="p-2 border border-slate-700 rounded-md bg-slate-900 disabled:opacity-50 hover:bg-slate-800"
                            >
                                <ChevronRight className="h-4 w-4 text-slate-300" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVEs;
