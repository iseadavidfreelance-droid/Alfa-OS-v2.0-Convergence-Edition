
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box, GitBranch, LayoutGrid, Share2, Target, Type } from 'lucide-react';
import Telemetry from './Telemetry';
import CLI from './CLI';

const engineeringLinks = [
  { to: "/blackbox", icon: Box, label: "BlackBox" },
  { to: "/forensics", icon: GitBranch, label: "Forensics" },
];

const commandLinks = [
  { to: "/arena", icon: LayoutGrid, label: "Arena" },
  { to: "/swarm", icon: Share2, label: "Swarm" },
  { to: "/missions", icon: Target, label: "Missions" },
];

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center p-2 text-sm transition-colors duration-200 ease-in-out font-mono border-t-2 ${
          isActive
            ? 'bg-matrix/10 text-matrix border-matrix'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-transparent hover:border-gray-600'
        }`
      }
    >
      <Icon className="h-5 w-5 mb-1" />
      <span>{label.toUpperCase()}</span>
    </NavLink>
);

const Mainframe: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-void font-mono text-gray-300 border-4 border-gray-800/50">
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b-2 border-gray-800/50 bg-gray-900/50">
        <div className="flex items-center gap-2">
           <Type className="w-8 h-8 text-matrix animate-pulse" />
           <h1 className="text-xl font-bold tracking-widest text-matrix">ALFA-OS</h1>
        </div>
        <Telemetry />
      </header>
      
      <div className="flex flex-1 min-h-0">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
        {/* Right Sidebar Nav */}
        <nav className="w-24 bg-gray-900/30 border-l-2 border-gray-800/50 flex flex-col justify-center">
            <div className="px-2 py-2 text-center text-xs font-semibold tracking-[0.2em] text-gray-500">ENG</div>
            {engineeringLinks.map(link => <NavItem key={link.to} {...link} />)}
            <div className="border-t border-matrix/20 my-2 mx-4"></div>
            <div className="px-2 py-2 text-center text-xs font-semibold tracking-[0.2em] text-gray-500">CMD</div>
            {commandLinks.map(link => <NavItem key={link.to} {...link} />)}
        </nav>
      </div>

      {/* Footer */}
      <footer className="h-24 border-t-2 border-gray-800/50">
        <CLI />
      </footer>
    </div>
  );
};

export default Mainframe;
