
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, FolderGit2, AlertTriangle } from 'lucide-react';

const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        CveGuardian
                    </h1>
                </div>
                <nav className="space-y-1 px-3">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                            }`
                        }
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/cves"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                            }`
                        }
                    >
                        <ShieldAlert size={20} />
                        CVEs
                    </NavLink>
                    <NavLink
                        to="/projects"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                            }`
                        }
                    >
                        <FolderGit2 size={20} />
                        Projects
                    </NavLink>
                    <NavLink
                        to="/impacted"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                            }`
                        }
                    >
                        <AlertTriangle size={20} />
                        Impacts
                    </NavLink>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
