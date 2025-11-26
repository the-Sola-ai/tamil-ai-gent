import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AppState, LogEntry, SearchPlacesArgs, CallSalonArgs } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio-utils';
import { tools, MOCK_SALONS } from '../services/tools';

const SYSTEM_INSTRUCTION = `
You are Sola, a smart and friendly personal assistant from Chennai.
Language Style:
- Speak in "Tanglish" (Tamil-English mix) but keep it understandable for a general audience.
- Use words like "Vanakkam", "Seri", "Machan" (friend), "Aiyyo", "Super".
- Be casual, energetic, and helpful with the User.
- Be polite and formal when speaking to the Receptionist.

Workflow:
1. Start by chatting with the User. Ask what they need.
2. If they want a salon, ask for the location.
3. Use the 'search_places' tool to find salons.
4. Present options to the User.
5. If the User picks one, say you will call them.
6. Use the 'call_salon' tool to initiate the call.
7. IMPORTANT: Once 'call_salon' is successfully called, assume the next voice you hear is the RECEPTIONIST. Switch your tone to be formal and professional. Ask to book a haircut for your friend.
`;

export const useLiveGemini = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeSalon, setActiveSalon] = useState<string | null>(null);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Stream tracking
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback tracking
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Connection
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const addLog = (sender: 'user' | 'sola' | 'system', message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), sender, message }]);
  };

  const handleToolCall = async (functionCalls: any[]) => {
    const responses = [];
    
    for (const call of functionCalls) {
      addLog('system', `Executing tool: ${call.name}`);
      let result: any = {};

      if (call.name === 'search_places') {
        const args = call.args as SearchPlacesArgs;
        const found = MOCK_SALONS.filter(s => 
          s.location.toLowerCase().includes(args.location.toLowerCase())
        );
        result = { salons: found.length > 0 ? found : 'No salons found in that area.' };
        addLog('system', `Found ${found.length} salons in ${args.location}`);
      } 
      else if (call.name === 'call_salon') {
        const args = call.args as CallSalonArgs;
        setActiveSalon(args.salonName);
        setAppState(AppState.CALLING_SALON);
        // Simulate ringing delay then connected
        setTimeout(() => {
            setAppState(AppState.IN_CALL_WITH_RECEPTIONIST);
            addLog('system', 'Call connected to Receptionist');
        }, 3000);
        result = { status: 'calling', message: `Dialing ${args.salonName}...` };
      }

      responses.push({
        id: call.id,
        name: call.name,
        response: { result }
      });
    }

    const session = await sessionPromiseRef.current;
    if (session) {
      session.sendToolResponse({ functionResponses: responses });
    }
  };

  const connect = useCallback(async () => {
    if (appState === AppState.CONNECTING || appState === AppState.CONNECTED) return;
    
    // Check API Key
    if (!process.env.API_KEY) {
        alert("API Key not found in environment variables.");
        return;
    }

    try {
      setAppState(AppState.CONNECTING);
      addLog('system', 'Initializing audio and connecting to Gemini...');

      // Initialize Audio Contexts
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Initialize Gemini Client
      // IMPORTANT: Create a new instance every time to avoid stale state if key changes (per instructions)
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Connect to Live API
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Female-sounding voice often implies 'Kore' or 'Puck' loosely
          }
        },
        callbacks: {
            onopen: async () => {
                addLog('system', 'Connected to Gemini Live.');
                setAppState(AppState.CONNECTED);
                
                // Start Microphone Streaming
                try {
                    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const ctx = inputAudioContextRef.current!;
                    sourceRef.current = ctx.createMediaStreamSource(mediaStreamRef.current);
                    
                    // Use ScriptProcessor for raw PCM access (bufferSize, inputChannels, outputChannels)
                    processorRef.current = ctx.createScriptProcessor(4096, 1, 1);
                    
                    processorRef.current.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        
                        // Send to Gemini
                        sessionPromiseRef.current?.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    sourceRef.current.connect(processorRef.current);
                    processorRef.current.connect(ctx.destination); // Required for script processor to run
                } catch (err) {
                    console.error("Mic Error:", err);
                    addLog('system', 'Error accessing microphone.');
                    disconnect();
                }
            },
            onmessage: async (message: LiveServerMessage) => {
                // 1. Handle Audio
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    const ctx = outputAudioContextRef.current;
                    try {
                        const audioBuffer = await decodeAudioData(
                            base64ToUint8Array(base64Audio),
                            ctx,
                            24000,
                            1
                        );
                        
                        // Schedule playback
                        const now = ctx.currentTime;
                        // Ensure we schedule at least slightly in the future if we fell behind
                        // or at the end of the previous chunk
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
                        
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(ctx.destination);
                        source.start(nextStartTimeRef.current);
                        
                        scheduledSourcesRef.current.add(source);
                        source.onended = () => scheduledSourcesRef.current.delete(source);
                        
                        nextStartTimeRef.current += audioBuffer.duration;
                    } catch (e) {
                        console.error("Audio Decode Error", e);
                    }
                }

                // 2. Handle Tool Calls
                if (message.toolCall) {
                    await handleToolCall(message.toolCall.functionCalls);
                }

                // 3. Handle Interruptions
                if (message.serverContent?.interrupted) {
                    addLog('system', 'Sola was interrupted.');
                    // Stop current playback
                    scheduledSourcesRef.current.forEach(source => source.stop());
                    scheduledSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            onclose: () => {
                addLog('system', 'Connection closed.');
                setAppState(AppState.IDLE);
            },
            onerror: (err) => {
                console.error("Gemini Error:", err);
                addLog('system', 'Connection error occurred.');
                setAppState(AppState.IDLE);
            }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Connection failed:", error);
      setAppState(AppState.IDLE);
      addLog('system', 'Failed to connect.');
    }
  }, [appState]);

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
        // Unfortunately standard API doesn't expose clean close on promise directly easily in all SDK versions,
        // but typically we let it close via logic or GC. 
        // We'll rely on stopping audio to effectively kill the interaction for the user.
    }
    
    // Stop Mic
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    
    // Stop Audio Processing
    if (processorRef.current && sourceRef.current) {
        sourceRef.current.disconnect();
        processorRef.current.disconnect();
    }

    // Stop Playback
    if (outputAudioContextRef.current) {
        scheduledSourcesRef.current.forEach(s => s.stop());
        scheduledSourcesRef.current.clear();
        outputAudioContextRef.current.close(); // Clean up context
        outputAudioContextRef.current = null;
    }
    
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }

    setAppState(AppState.IDLE);
    setLogs(prev => [...prev, { timestamp: new Date(), sender: 'system', message: 'Disconnected' }]);
  }, []);

  return {
    connect,
    disconnect,
    appState,
    logs,
    activeSalon
  };
};