import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onResultRef.current) {
          onResultRef.current(transcript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognitionRef.current) return;
    onResultRef.current = onResult;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening, isSupported };
}
