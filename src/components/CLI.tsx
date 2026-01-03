
import React from 'react';

const cliLines = [
  "ALFA-OS v2.0 [Convergence Edition]",
  "© CORE DYNAMICS. All rights reserved.",
  "Booting kernel...",
  "Initializing Supabase connection... OK",
  "Mounting data streams... OK",
  "ENGINEERING DECK... ONLINE",
  "COMMAND DECK... ONLINE",
  "Awaiting user input.",
];

const CLI: React.FC = () => {
  return (
    <div className="bg-black/50 p-2 font-mono text-xs text-matrix h-full overflow-hidden">
      {cliLines.map((line, index) => (
        <p key={index} className="whitespace-nowrap">
          <span className="text-gray-500 mr-2">&gt;</span>{line}
        </p>
      ))}
      <p className="cli-cursor whitespace-nowrap">
        <span className="text-gray-500 mr-2">&gt;</span>
      </p>
    </div>
  );
};

export default CLI;
