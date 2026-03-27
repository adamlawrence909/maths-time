/// <reference types="vite/client" />

// Web Speech API — not fully typed in all TS DOM lib versions
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart:  ((this: SpeechRecognition, ev: Event) => void) | null;
  onend:    ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:  ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: { new(): SpeechRecognition };

interface Window {
  SpeechRecognition:        typeof SpeechRecognition;
  webkitSpeechRecognition:  typeof SpeechRecognition;
}
