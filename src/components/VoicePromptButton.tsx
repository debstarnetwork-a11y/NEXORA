import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoicePromptButtonProps {
  onTranscript: (spokenText: string, mode: 'append' | 'replace') => void;
  disabled?: boolean;
  onNotice?: (message: string) => void;
  variant?: 'compact' | 'expanded';
  placeholder?: string;
}

export function VoicePromptButton({
  onTranscript,
  disabled = false,
  onNotice,
  variant = 'compact',
  placeholder = 'Speak your prompt...'
}: VoicePromptButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [insertMode, setInsertMode] = useState<'append' | 'replace'>('append');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check Web Speech API availability
  const hasWebSpeech = typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const startAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('Audio meter initialization skipped:', e);
    }
  };

  // Start dictation via Web Speech API with fallback to MediaRecorder
  const startListening = async () => {
    if (disabled || isListening || isTranscribing) return;
    setInterimText('');

    if (hasWebSpeech) {
      try {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let accumulatedFinal = '';

        recognition.onstart = () => {
          setIsListening(true);
          onNotice?.('Listening... Speak your prompt clearly into your microphone.');
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += (accumulatedFinal ? ' ' : '') + transcriptChunk.trim();
            } else {
              currentInterim += transcriptChunk;
            }
          }
          const liveDisplay = accumulatedFinal + (currentInterim ? ` ${currentInterim}` : '');
          setInterimText(liveDisplay.trim());
        };

        recognition.onerror = async (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          if (event.error === 'not-allowed') {
            cleanupAudio();
            onNotice?.('Microphone access was denied. Please allow microphone permissions in your browser.');
          } else if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'no-speech') {
            // Try high-fidelity MediaRecorder fallback
            console.log('Switching to MediaRecorder + Gemini fallback speech transcription...');
            cleanupAudio();
            await startMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          // If we still have speech recognition active, it may have stopped automatically due to silence
          if (isListening && !accumulatedFinal && !interimText) {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;

        // Try getting user media for the live audio wave animation
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          startAudioMeter(stream);
        } catch {
          // Non-blocking if audio meter can't get stream
        }

        recognition.start();
        return;
      } catch (speechErr) {
        console.warn('Web Speech API failed, falling back to MediaRecorder:', speechErr);
      }
    }

    // Fallback: Audio recording + Gemini transcription
    await startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioMeter(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
          await transcribeWithGemini(audioBlob, mimeType);
        } else {
          setIsTranscribing(false);
          setIsListening(false);
          onNotice?.('No audio captured. Please try speaking again.');
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsListening(true);
      onNotice?.('Listening via high-fidelity microphone... Click Stop when finished.');
    } catch (micErr: any) {
      console.error('Microphone access failed:', micErr);
      cleanupAudio();
      onNotice?.('Microphone access unavailable. Please grant microphone permissions in your browser.');
    }
  };

  const transcribeWithGemini = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const res = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.text && data.text.trim()) {
        const text = data.text.trim();
        setInterimText(text);
        onTranscript(text, insertMode);
        onNotice?.(`Voice prompt transcribed: "${text.slice(0, 45)}..."`);
      } else {
        onNotice?.('No clear speech recognized in audio. Please speak clearly.');
      }
    } catch (err: any) {
      console.warn('Gemini audio transcription error:', err);
      onNotice?.('Could not transcribe audio. Please verify your connection.');
    } finally {
      setIsTranscribing(false);
      setIsListening(false);
    }
  };

  // User manually commits or stops
  const handleStopAndCommit = () => {
    const textToCommit = interimText.trim();
    if (textToCommit) {
      onTranscript(textToCommit, insertMode);
      onNotice?.(`Voice prompt applied (${insertMode === 'append' ? 'appended' : 'replaced'})!`);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupAudio();
    }
  };

  const handleCancel = () => {
    cleanupAudio();
    setInterimText('');
    onNotice?.('Voice input cancelled.');
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Primary Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (isListening || isTranscribing) {
            handleStopAndCommit();
          } else {
            startListening();
          }
        }}
        disabled={disabled || isTranscribing}
        title={
          isTranscribing
            ? 'Transcribing audio with Gemini...'
            : isListening
            ? 'Listening... Click to stop and apply prompt'
            : 'Voice Prompt: Speak your prompt into microphone'
        }
        className={`relative transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none ${
          variant === 'expanded'
            ? 'px-3 py-1.5 rounded-xl text-xs font-semibold gap-1.5'
            : 'p-2 rounded-xl'
        } ${
          isListening
            ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-4 ring-red-400/40 animate-pulse'
            : isTranscribing
            ? 'bg-purple-100 text-purple-900 border border-purple-300'
            : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80 shadow-2xs hover:shadow-xs'
        }`}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="w-4 h-4 text-purple-700 animate-spin" />
            {variant === 'expanded' && <span>Transcribing...</span>}
          </>
        ) : isListening ? (
          <>
            <MicOff className="w-4 h-4 text-white" />
            {variant === 'expanded' && <span>Stop & Apply</span>}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-purple-700" />
            {variant === 'expanded' && <span>Voice Prompt</span>}
          </>
        )}
      </button>

      {/* Floating Active Voice Dictation Banner */}
      <AnimatePresence>
        {(isListening || isTranscribing) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 w-80 sm:w-96 bg-white/98 backdrop-blur-md rounded-2xl border border-purple-200/90 shadow-xl p-3.5 space-y-3"
          >
            {/* Header with soundwave equalizer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {isTranscribing ? 'Processing Audio...' : 'Voice Dictation Active'}
                </span>
              </div>

              {/* Audio Equalizer Bars */}
              <div className="flex items-end gap-0.5 h-4 px-2 py-0.5 bg-purple-50 rounded-md">
                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((factor, idx) => {
                  const barHeight = Math.max(3, Math.min(14, Math.round((audioLevel / 100) * 14 * factor + 3)));
                  return (
                    <span
                      key={idx}
                      className="w-1 bg-purple-600 rounded-full transition-all duration-75"
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>

              {/* Mode Toggle: Append vs Replace */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setInsertMode('append')}
                  className={`px-1.5 py-0.5 rounded ${
                    insertMode === 'append' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                  }`}
                  title="Append spoken words to existing prompt"
                >
                  Append
                </button>
                <button
                  type="button"
                  onClick={() => setInsertMode('replace')}
                  className={`px-1.5 py-0.5 rounded ${
                    insertMode === 'replace' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                  }`}
                  title="Replace prompt with spoken words"
                >
                  Replace
                </button>
              </div>
            </div>

            {/* Live Words Card */}
            <div className="min-h-14 max-h-28 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
              {interimText ? (
                <span>{interimText}</span>
              ) : isTranscribing ? (
                <div className="flex items-center gap-2 text-purple-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing with Gemini Flash AI...</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">
                  {placeholder} (Speak naturally into your mic)
                </span>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStopAndCommit}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Done & Apply</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
