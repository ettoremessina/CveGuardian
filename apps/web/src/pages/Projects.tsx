import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Play, Trash2, GitBranch, Folder, Pencil } from 'lucide-react';

const API_URL = 'http://localhost:3000';

const Projects = () => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingDependenciesId, setViewingDependenciesId] = useState<number | null>(null);
    const [viewingLogId, setViewingLogId] = useState<number | null>(null);


    const [projectForm, setProjectForm] = useState({ name: '', repoUrl: '', branch: 'main' });

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects`);
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await fetch(`${API_URL}/projects/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            resetForm();
        }
    });

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setProjectForm({ name: '', repoUrl: '', branch: 'main' });
    };

    const handleEdit = (project: any) => {
        setProjectForm({
            name: project.name,
            repoUrl: project.repoUrl,
            branch: project.branch
        });
        setEditingId(project.id);
        setIsCreating(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateMutation.mutate(projectForm);
        } else {
            createMutation.mutate(projectForm);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <button
                    onClick={() => { resetForm(); setIsCreating(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                    <Plus size={16} />
                    Add Project
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-medium text-slate-200 mb-4">
                        {editingId ? 'Edit Project' : 'Add New Project'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={projectForm.name}
                                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                                    placeholder="My App"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Git URL</label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={projectForm.repoUrl}
                                    onChange={e => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                                    placeholder="https://github.com/user/repo.git"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Branch</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={projectForm.branch}
                                    onChange={e => setProjectForm({ ...projectForm, branch: e.target.value })}
                                    placeholder="main"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-slate-400 hover:text-slate-200 text-sm font-medium px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                            >
                                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="text-slate-400">Loading Projects...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects?.map((project: any) => (
                        <ProjectCard
                            key={project.id}
                            isCreating={false}
                            project={project}
                            onEdit={handleEdit}
                            onViewResults={setViewingDependenciesId}
                            onShowLog={setViewingLogId}
                        />
                    ))}

                    {(!projects || projects.length === 0) && !isCreating && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                            No projects added yet.
                        </div>
                    )}
                </div>
            )}

            {/* Log Modal */}
            {viewingLogId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 rounded-t-lg">
                            <h3 className="text-xl font-bold">Last Scan Log</h3>
                            <button onClick={() => setViewingLogId(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap rounded-b-lg">
                            {projects?.find((p: any) => p.id === viewingLogId)?.lastScanLog || 'No log available.'}
                        </div>
                    </div>
                </div>
            )}

            {/* Scan Results Modal */}
            {viewingDependenciesId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 rounded-t-lg">
                            <h3 className="text-xl font-bold">Vulnerabilities Found in Dependencies</h3>
                            <button onClick={() => setViewingDependenciesId(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <DependenciesList projectId={viewingDependenciesId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProjectCard = ({ project, onEdit, onViewResults, onShowLog }: any) => {
    const queryClient = useQueryClient();

    const scanMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`${API_URL}/projects/${id}/scan`, { method: 'POST' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            alert('Scan completed');
        },
        onError: (err) => {
            alert('Scan failed: ' + err);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
    });

    return (
        <div className="group relative rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700 transition-all">
            {/* ... top part ... */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {/* ... icon ... */}
                    <div className="bg-blue-600/10 p-2 rounded-lg text-blue-500 relative">
                        <Folder size={20} />
                        {project.vulnerabilityCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg border border-slate-900">
                                {project.vulnerabilityCount}
                            </span>
                        )}
                    </div>
                    {/* ... name ... */}
                    <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <GitBranch size={12} />
                            <span>{project.branch}</span>
                        </div>
                    </div>
                </div>
                {/* ... edit/delete buttons ... */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(project)}
                        className="p-1 text-slate-600 hover:text-blue-400 transition-colors"
                        title="Edit Project"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => { if (confirm('Delete project?')) deleteMutation.mutate(project.id) }}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>


            <div className="mt-6 flex items-end justify-between">
                <div className="text-sm text-slate-500">
                    <p>Last scan:</p>
                    <p className="font-medium text-slate-400">
                        {project.lastScanAt ? format(new Date(project.lastScanAt), 'yyyy-MM-dd HH:mm') : 'Never'}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => onShowLog(project.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 mr-2"
                        title="View Log"
                    >
                        Log
                    </button>
                    <button
                        onClick={() => onViewResults(project.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
                    >
                        Results
                    </button>
                    <button
                        onClick={() => scanMutation.mutate(project.id)}
                        disabled={scanMutation.isPending}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-slate-700"
                    >
                        <Play size={14} />
                        {scanMutation.isPending ? 'Scanning...' : 'Scan Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DependenciesList = ({ projectId }: { projectId: number }) => {
    const { data: deps, isLoading } = useQuery({
        queryKey: ['dependencies', projectId],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/projects/${projectId}/dependencies`);
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        }
    });

    if (isLoading) return <div className="text-center text-slate-400 py-8">Loading dependencies...</div>;
    if (!deps || deps.length === 0) return <div className="text-center text-slate-500 py-8">No dependencies found in last scan.</div>;

    return (
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/50 text-slate-400 sticky top-0">
                <tr>
                    <th className="px-4 py-2">Package</th>
                    <th className="px-4 py-2">Version</th>
                    <th className="px-4 py-2">Ecosystem</th>
                    <th className="px-4 py-2">Type</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {deps.map((dep: any) => (
                    <tr key={dep.id} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2 font-medium text-slate-200">{dep.packageName}</td>
                        <td className="px-4 py-2 font-mono text-slate-400">{dep.version}</td>
                        <td className="px-4 py-2 text-slate-400">{dep.ecosystem}</td>
                        <td className="px-4 py-2">
                            {dep.isDev ? <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Dev</span> : <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">Prod</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Projects;
