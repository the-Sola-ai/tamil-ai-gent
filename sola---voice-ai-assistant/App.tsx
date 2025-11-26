import React from 'react';
import { UserInterface } from './components/UserInterface';
import { ReceptionistInterface } from './components/ReceptionistInterface';
import { Logs } from './components/Logs';
import { useLiveGemini } from './hooks/useLiveGemini';

const App = () => {
  const { connect, disconnect, appState, logs, activeSalon } = useLiveGemini();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[90vh]">
        
        {/* Left Column: User Interface (Sola) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
          <UserInterface 
            appState={appState} 
            onConnect={connect} 
            onDisconnect={disconnect} 
          />
        </div>

        {/* Center/Right: Receptionist View & Logs */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
          
          {/* Receptionist View (Top Half) */}
          <div className="flex-1 min-h-[400px]">
            <ReceptionistInterface 
              appState={appState} 
              salonName={activeSalon}
            />
          </div>

          {/* Logs View (Bottom Half) */}
          <div className="h-48 lg:h-64">
             <Logs logs={logs} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;