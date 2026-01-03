
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

// Import Engineering modules
import MonitorPage from './modules/Monitor';
import QuarantinePage from './modules/Quarantine';
import ForensicsPage from './modules/Forensics';

// Import Command modules
import ArenaPage from './modules/Arena';
import SwarmPage from './modules/Swarm';
import MissionsPage from './modules/Missions';

const App: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/monitor" replace />} />
                    <Route path="monitor" element={<MonitorPage />} />
                    <Route path="quarantine" element={<QuarantinePage />} />
                    <Route path="forensics" element={<ForensicsPage />} />
                    <Route path="arena" element={<ArenaPage />} />
                    <Route path="swarm" element={<SwarmPage />} />
                    <Route path="missions" element={<MissionsPage />} />
                    <Route path="*" element={<Navigate to="/monitor" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
