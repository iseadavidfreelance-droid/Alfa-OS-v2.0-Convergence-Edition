
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, ShieldAlert, GitBranch, LayoutGrid, Share2, Target, Type } from 'lucide-react';

const engineeringLinks = [
  { to: "/monitor", icon: Activity, label: "System Monitor" },
  { to: "/quarantine", icon: ShieldAlert, label: "Quarantine" },
  { to: "/forensics", icon: GitBranch, label: "Forensics" },
];

const commandLinks = [
  { to: "/arena", icon: LayoutGrid, label: "Asset Arena" },
  { to: "/swarm", icon: Share2, label: "Pin Swarm" },
  { to: "/missions", icon: Target, label: "Missions" },
];

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ease-in-out font-mono rounded-sm ${
          isActive
            ? 'bg-matrix/10 text-matrix shadow-[0_0_10px_rgba(0,255,65,0.5)]'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  </li>
);

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-void font-mono text-gray-300">
      <aside className="w-64 flex-shrink-0 bg-void border-r border-matrix/10 flex flex-col p-4">
        <div className="flex items-center gap-2 pb-4 border-b border-matrix/10">
           <Type className="w-8 h-8 text-matrix" />
           <h1 className="text-xl font-bold tracking-widest text-matrix">ALFA-OS</h1>
        </div>
        
        <nav className="flex-grow mt-6 space-y-8">
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
              SECTOR 01: ENGINEERING
            </h2>
            <ul className="space-y-1">
              {engineeringLinks.map(link => <NavItem key={link.to} {...link} />)}
            </ul>
          </div>
          <div>
            <h2 className="px-4 mb-2 text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
              SECTOR 02: COMMAND
            </h2>
            <ul className="space-y-1">
              {commandLinks.map(link => <NavItem key={link.to} {...link} />)}
            </ul>
          </div>
        </nav>
        <div className="text-center text-xs text-gray-600 border-t border-matrix/10 pt-4">
            <p>CONVERGENCE v2.0</p>
            <p>&copy; {new Date().getFullYear()} CORE DYNAMICS</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8 bg-black/20">
        <Outlet />
      </main>
    </div>
  );
};
