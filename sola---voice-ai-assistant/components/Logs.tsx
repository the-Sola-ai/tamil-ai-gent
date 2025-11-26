import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogsProps {
  logs: LogEntry[];
}

export const Logs: React.FC<LogsProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg p-4 overflow-hidden border border-slate-700 shadow-inner">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">
        System Logs & Transcript
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {logs.map((log, index) => (
          <div key={index} className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                log.sender === 'system' 
                  ? 'bg-slate-800 text-slate-400 font-mono text-xs w-full' 
                  : log.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {log.sender !== 'system' && (
                <span className="block text-[10px] opacity-70 font-bold mb-1 uppercase">
                  {log.sender}
                </span>
              )}
              {log.message}
            </div>
            <span className="text-[10px] text-slate-600 mt-1">
              {log.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};