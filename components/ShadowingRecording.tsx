import React, { useState, useRef, useEffect } from 'react';
import { Material } from '../types';
import { Button } from './Button';
import { Mic, Square, Play, RefreshCw, Award, Loader2, StopCircle } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface ShadowingRecordingProps {
  material: Material;
  onComplete: () => void;
}

export const ShadowingRecording: React.FC<ShadowingRecordingProps> = ({ material, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferCache = useRef<AudioBuffer | null>(null);
  const activeSourceNode = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    // Clean up when material changes
    audioBufferCache.current = null;
    if (activeSourceNode.current) {
        activeSourceNode.current.stop();
        activeSourceNode.current = null;
    }
    setIsPlayingAudio(false);
  }, [material.id]);

  // Recording Logic
  const startRecording = async () => {
    try {
      if (activeSourceNode.current) {
        activeSourceNode.current.stop();
        setIsPlayingAudio(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access needed for shadowing.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const playOriginal = async () => {
     if (isPlayingAudio) {
         activeSourceNode.current?.stop();
         setIsPlayingAudio(false);
         return;
     }

     if (!audioContextRef.current) return;
     
     if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
     }

     let buffer = audioBufferCache.current;

     if (!buffer) {
         setIsLoadingAudio(true);
         const snippet = material.content.substring(0, 200);
         const base64Audio = await generateSpeech(snippet);
         
         if (!base64Audio) {
             setIsLoadingAudio(false);
             return; // Handle error silently or with toast
         }

         try {
             // Manual PCM decoding for Gemini TTS (24kHz, 1 channel, no header)
             const bytes = decodeBase64(base64Audio);
             const dataInt16 = new Int16Array(bytes.buffer);
             const numChannels = 1;
             const sampleRate = 24000;
             const frameCount = dataInt16.length / numChannels;
             
             buffer = audioContextRef.current.createBuffer(numChannels, frameCount, sampleRate);
             
             for (let channel = 0; channel < numChannels; channel++) {
                const channelData = buffer.getChannelData(channel);
                for (let i = 0; i < frameCount; i++) {
                   channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
                }
             }

             audioBufferCache.current = buffer;
         } catch (e) {
             console.error("Audio decode error", e);
             setIsLoadingAudio(false);
             return;
         }
         setIsLoadingAudio(false);
     }

     const source = audioContextRef.current.createBufferSource();
     source.buffer = buffer;
     source.connect(audioContextRef.current.destination);
     source.onended = () => setIsPlayingAudio(false);
     
     activeSourceNode.current = source;
     source.start();
     setIsPlayingAudio(true);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 space-y-10 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Shadowing & Record</h2>
        <p className="text-gray-400">Mimic the speaker's tone and speed.</p>
      </div>

      <div className="w-full bg-tiktok-dark border border-gray-800 rounded-2xl p-6 relative">
        <p className="text-xl leading-relaxed text-gray-300 text-center font-medium">
          {material.content.substring(0, 200)}...
        </p>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tiktok-cyan text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          Authentic Audio Snippet
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full">
        <button 
          onClick={playOriginal}
          disabled={isLoadingAudio}
          className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-white transition-colors gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform ${isPlayingAudio ? 'animate-pulse' : ''}`}>
             {isLoadingAudio ? (
                <Loader2 className="w-6 h-6 animate-spin text-tiktok-pink" />
             ) : isPlayingAudio ? (
                <StopCircle className="fill-current w-6 h-6 text-tiktok-pink" />
             ) : (
                <Play className="fill-current w-5 h-5" />
             )}
          </div>
          <span className="font-bold">
            {isLoadingAudio ? 'Loading Audio...' : isPlayingAudio ? 'Stop Audio' : 'Play Authentic'}
          </span>
        </button>

        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-colors gap-3 ${
            isRecording 
            ? 'bg-tiktok-pink/20 border-tiktok-pink animate-pulse' 
            : 'bg-gray-900 border-gray-700 hover:border-tiktok-pink'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isRecording ? 'bg-tiktok-pink' : 'bg-gray-700'}`}>
            {isRecording ? <Square className="fill-current w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </div>
          <span className="font-bold">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </button>
      </div>

      {audioUrl && (
        <div className="w-full bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center animate-fade-in">
          <p className="text-sm text-gray-400 mb-2">Your Recording</p>
          <audio src={audioUrl} controls className="w-full mb-4" />
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setAudioUrl(null)} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
            <Button onClick={onComplete}>
              Finish Session <Award className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};