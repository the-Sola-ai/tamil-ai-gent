import React from 'react';
import { Phone, PhoneIncoming, User } from 'lucide-react';
import { AppState } from '../types';

interface ReceptionistProps {
  appState: AppState;
  salonName: string | null;
}

export const ReceptionistInterface: React.FC<ReceptionistProps> = ({ appState, salonName }) => {
  const isRinging = appState === AppState.CALLING_SALON;
  const isConnected = appState === AppState.IN_CALL_WITH_RECEPTIONIST;

  return (
    <div className="h-full bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-400">
        RECEPTION DESK SIMULATION
      </div>
      
      {/* Phone Screen */}
      <div className={`w-64 bg-black rounded-3xl p-4 border-4 transition-all duration-300 ${isRinging ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' : isConnected ? 'border-green-500' : 'border-slate-600'}`}>
        <div className="h-96 bg-slate-900 rounded-xl flex flex-col items-center justify-between p-6 overflow-hidden relative">
            
            {/* Status Bar */}
            <div className="w-full flex justify-between text-[10px] text-slate-500">
                <span>9:41</span>
                <span>Signal 5G</span>
            </div>

            {/* Caller Info */}
            <div className="flex flex-col items-center mt-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${isRinging ? 'bg-slate-700' : isConnected ? 'bg-green-900' : 'bg-slate-800'}`}>
                    <User size={40} className="text-slate-400" />
                </div>
                <h2 className="text-white text-lg font-semibold">
                    {isRinging || isConnected ? "Incoming Call" : "Idle"}
                </h2>
                <p className="text-slate-400 text-sm">
                    {isRinging || isConnected ? "Sola (Assistant)" : "Waiting for calls..."}
                </p>
                {salonName && (
                  <p className="text-blue-400 text-xs mt-2 bg-blue-900/30 px-2 py-1 rounded">
                    Line: {salonName}
                  </p>
                )}
            </div>

            {/* Actions */}
            <div className="w-full mt-auto">
                {isRinging && (
                    <div className="flex justify-between w-full px-2">
                         <div className="flex flex-col items-center gap-1">
                            <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center animate-bounce delay-75">
                                <Phone size={24} className="text-white rotate-[135deg]" />
                            </button>
                            <span className="text-[10px] text-slate-400">Decline</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                            <button className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                                <PhoneIncoming size={24} className="text-white" />
                            </button>
                            <span className="text-[10px] text-slate-400">Accept</span>
                         </div>
                    </div>
                )}

                {isConnected && (
                     <div className="flex justify-center w-full">
                         <div className="flex flex-col items-center gap-1">
                            <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                                <Phone size={32} className="text-white rotate-[135deg]" />
                            </button>
                            <span className="text-[10px] text-slate-400">End Call</span>
                         </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xs">
        <p className="text-sm text-slate-300 font-medium">
            {isConnected ? "Status: Connected" : isRinging ? "Status: Ringing..." : "Status: Ready"}
        </p>
        <p className="text-xs text-slate-500 mt-2">
            {isConnected 
                ? "Speak into the microphone to roleplay as the Receptionist." 
                : "When Sola calls, this phone will ring."}
        </p>
      </div>
    </div>
  );
};