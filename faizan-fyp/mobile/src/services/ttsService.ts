import * as Speech from 'expo-speech';
import { Language } from '@/types';

const langCode: Record<Language, string> = {
  en: 'en-US',
  ur: 'ur-PK',
};

export function speak(text: string, language: Language = 'en'): void {
  Speech.stop();
  Speech.speak(text, {
    language: langCode[language],
    rate: 0.85,
    pitch: 1.05,
  });
}

export function stop(): void {
  Speech.stop();
}
