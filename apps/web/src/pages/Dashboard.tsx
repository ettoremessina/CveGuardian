import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

const Dashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/stats`);
            return res.json();
        }
    });

    if (isLoading) {
        return <div className="text-slate-400">Loading stats...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">Total CVEs</h3>
                    <p className="mt-2 text-3xl font-bold">{stats?.totalCves?.toLocaleString() || 0}</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">Active Projects</h3>
                    <p className="mt-2 text-3xl font-bold">{stats?.activeProjects || 0}</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">Compromised Projects</h3>
                    <p className="mt-2 text-3xl font-bold text-orange-400">{stats?.compromisedProjects || 0}</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">Critical Alerts</h3>
                    <p className="mt-2 text-3xl font-bold text-red-500">{stats?.criticalAlerts || 0}</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">High Alerts</h3>
                    <p className="mt-2 text-3xl font-bold text-orange-500">{stats?.highAlerts || 0}</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                    <h3 className="text-sm font-medium text-slate-400">Medium Alerts</h3>
                    <p className="mt-2 text-3xl font-bold text-yellow-500">{stats?.mediumAlerts || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
