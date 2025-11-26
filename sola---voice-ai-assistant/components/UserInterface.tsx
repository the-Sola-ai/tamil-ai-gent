import React from 'react';
import { Mic, MicOff, Zap, Activity } from 'lucide-react';
import { AppState } from '../types';

interface UserInterfaceProps {
  appState: AppState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const UserInterface: React.FC<UserInterfaceProps> = ({ appState, onConnect, onDisconnect }) => {
  const isConnected = appState !== AppState.IDLE;
  const isConnecting = appState === AppState.CONNECTING;
  
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 p-6">
      
      {/* Avatar / Visualizer */}
      <div className="relative">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 
          ${appState === AppState.CONNECTED ? 'bg-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.4)]' : 
            appState === AppState.CALLING_SALON || appState === AppState.IN_CALL_WITH_RECEPTIONIST ? 'bg-green-600 shadow-[0_0_50px_rgba(34,197,94,0.4)]' :
            'bg-slate-700'}`}>
           <Zap size={64} className={`text-white transition-opacity ${isConnected ? 'opacity-100' : 'opacity-50'}`} fill={isConnected ? "currentColor" : "none"} />
        </div>
        
        {/* Ripple Effect when Active */}
        {appState === AppState.CONNECTED && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 opacity-50 animate-ping" />
            <div className="absolute -inset-4 rounded-full border border-purple-500 opacity-30 animate-pulse" />
          </>
        )}
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Sola</h1>
        <p className="text-slate-400">Your Chennai-based AI Assistant</p>
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-purple-400">
            <Activity size={12} />
            <span>GEMINI 2.5 NATIVE AUDIO</span>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={isConnecting}
        className={`
          group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
          ${isConnecting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : ''}
          ${!isConnected && !isConnecting ? 'bg-white text-slate-900 hover:bg-purple-50 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}
          ${isConnected ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
        `}
      >
        {isConnecting ? (
          <>Connecting...</>
        ) : isConnected ? (
          <>
            <MicOff size={20} />
            End Session
          </>
        ) : (
          <>
            <Mic size={20} className="group-hover:text-purple-600 transition-colors" />
            Talk to Sola
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 max-w-xs text-center">
        {isConnected 
          ? "Microphone is active. Speak naturally." 
          : "Click to start the demo. Ask Sola to find a salon in Adyar."}
      </p>
    </div>
  );
};