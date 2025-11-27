import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = () => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [finalTranscript, setFinalTranscript] = useState('');

    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    // VAD Threshold: Time in ms to wait after speech stops before committing
    const SILENCE_THRESHOLD = 1500;

    const processResult = useCallback((event) => {
        let interimTranscript = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (final) {
            setFinalTranscript(prev => prev + ' ' + final);
            setText(''); // Clear interim
        } else if (interimTranscript) {
            setText(interimTranscript);

            // Reset silence timer on any speech input
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                // If silence threshold reached, treat interim as final (if needed) or just wait for engine
                // In this implementation, we rely on the engine's 'final' flag mostly, 
                // but this timer can force a "commit" if the engine hangs.
                // For now, we use it to detect "end of turn".
                if (interimTranscript) {
                    // Optional: Force stop/start to commit if engine is slow
                    // recognitionRef.current.stop(); 
                }
            }, SILENCE_THRESHOLD);
        }
    }, []);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = processResult;

        recognition.onend = () => {
            // Auto-restart if we are supposed to be listening
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    // ignore if already started
                }
            } else {
                setIsListening(false);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognition.stop();
        };
    }, [isListening, processResult]);

    const startListening = (lang = 'en-US') => {
        if (recognitionRef.current) {
            // Stop current instance if running to change lang
            recognitionRef.current.stop();

            setTimeout(() => {
                recognitionRef.current.lang = lang;
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                    setText('');
                    setFinalTranscript('');
                } catch (e) {
                    console.error("Start error", e);
                }
            }, 100);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    return {
        text, // Interim text
        finalTranscript, // Committed text
        setFinalTranscript, // Allow parent to clear it
        isListening,
        startListening,
        stopListening
    };
};

export default useSpeechRecognition;
