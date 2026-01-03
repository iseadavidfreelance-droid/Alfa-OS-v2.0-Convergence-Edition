
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Mainframe from './components/Mainframe';

// Import Engineering modules
import BlackBox from './modules/BlackBox'; // Unified engineering module
import ForensicsPage from './modules/Forensics';

// Import Command modules
import MatrixDeck from './modules/MatrixDeck';
import SwarmPage from './modules/Swarm';
import MissionsPage from './modules/Missions';
import BioLab from './modules/BioLab';

const App: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Mainframe />}>
                    <Route index element={<Navigate to="/blackbox" replace />} />
                    <Route path="blackbox" element={<BlackBox />} />
                    <Route path="forensics" element={<ForensicsPage />} />
                    <Route path="arena" element={<MatrixDeck />} />
                    <Route path="biolab/:assetId" element={<BioLab />} />
                    <Route path="swarm" element={<SwarmPage />} />
                    <Route path="missions" element={<MissionsPage />} />
                    <Route path="*" element={<Navigate to="/blackbox" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
