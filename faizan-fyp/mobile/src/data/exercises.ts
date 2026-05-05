import { Exercise, ExerciseType, Language } from '@/types';

/**
 * Seed exercise bank used when the backend / Firestore store is empty or offline.
 * Each module has levels 1..5 with 4 exercises per level.
 */
export const SEED_EXERCISES: Exercise[] = [
  // ---------- Phonics (letter-sound matching) ----------
  {
    id: 'ph-en-1-1',
    type: 'phonics',
    language: 'en',
    difficulty: 1,
    prompt: 'Which letter makes the /b/ sound, like in "ball"?',
    instruction: 'Tap the correct letter',
    options: [
      { id: 'a', label: 'B', hint: '' },
      { id: 'b', label: 'D', hint: '"D" makes the /d/ sound, like in "dog".' },
      { id: 'c', label: 'P', hint: '"P" makes the /p/ sound — similar, but softer lips.' },
      { id: 'd', label: 'V', hint: '"V" makes the /v/ sound, like in "van".' },
    ],
    correctOptionId: 'a',
    explanation: 'Nice! "B" makes the /b/ sound, like in "ball" or "bat".',
  },
  {
    id: 'ph-en-1-2',
    type: 'phonics',
    language: 'en',
    difficulty: 1,
    prompt: 'Which letter makes the /m/ sound, like in "mama"?',
    instruction: 'Tap the correct letter',
    options: [
      { id: 'a', label: 'N', hint: '"N" sounds like /n/, like "no".' },
      { id: 'b', label: 'M', hint: '' },
      { id: 'c', label: 'W', hint: '"W" sounds like /w/, like "water".' },
      { id: 'd', label: 'S', hint: '"S" sounds like /s/, like "sun".' },
    ],
    correctOptionId: 'b',
    explanation: '"M" makes the /m/ sound — your lips close together.',
  },
  {
    id: 'ph-en-2-1',
    type: 'phonics',
    language: 'en',
    difficulty: 2,
    prompt: 'Which two letters together make the /sh/ sound, like in "ship"?',
    instruction: 'Tap the correct pair',
    options: [
      { id: 'a', label: 'ch', hint: '"ch" makes the /ch/ sound, like "chip".' },
      { id: 'b', label: 'th', hint: '"th" makes the /th/ sound, like "thin".' },
      { id: 'c', label: 'sh', hint: '' },
      { id: 'd', label: 'ph', hint: '"ph" makes the /f/ sound, like "phone".' },
    ],
    correctOptionId: 'c',
    explanation: '"sh" blends into /sh/ — quiet sound, finger to lips.',
  },

  // ---------- Vocabulary (word meaning) ----------
  {
    id: 'vo-en-1-1',
    type: 'vocabulary',
    language: 'en',
    difficulty: 1,
    prompt: 'What is a "puppy"?',
    instruction: 'Choose the best meaning',
    options: [
      { id: 'a', label: 'A baby dog', hint: '' },
      { id: 'b', label: 'A big bird', hint: 'A big bird is more like an "eagle" or "hawk".' },
      { id: 'c', label: 'A type of fruit', hint: 'Fruits grow on plants — a puppy is an animal.' },
      { id: 'd', label: 'A toy', hint: 'Close, but a puppy is alive — it breathes and plays!' },
    ],
    correctOptionId: 'a',
    explanation: '"Puppy" means a baby dog. It grows up to be a dog.',
  },
  {
    id: 'vo-en-2-1',
    type: 'vocabulary',
    language: 'en',
    difficulty: 2,
    prompt: 'What does "enormous" mean?',
    instruction: 'Choose the best meaning',
    options: [
      { id: 'a', label: 'Very tiny', hint: '"Tiny" is the opposite of "enormous".' },
      { id: 'b', label: 'Very big', hint: '' },
      { id: 'c', label: 'Very fast', hint: '"Fast" is about speed, not size.' },
      { id: 'd', label: 'Very quiet', hint: '"Quiet" is about sound, not size.' },
    ],
    correctOptionId: 'b',
    explanation: '"Enormous" means very, very big — like an elephant or a mountain.',
  },

  // ---------- Reading (comprehension) ----------
  {
    id: 're-en-1-1',
    type: 'reading',
    language: 'en',
    difficulty: 1,
    prompt: 'The cat sat on the red mat.\n\nWhat color was the mat?',
    instruction: 'Read the sentence and answer',
    targetSentence: 'The cat sat on the red mat.',
    options: [
      { id: 'a', label: 'Blue', hint: 'Re-read carefully — what color is the mat?' },
      { id: 'b', label: 'Green', hint: 'Re-read carefully — what color is the mat?' },
      { id: 'c', label: 'Red', hint: '' },
      { id: 'd', label: 'Yellow', hint: 'Re-read carefully — what color is the mat?' },
    ],
    correctOptionId: 'c',
    explanation: 'The mat was red — "The cat sat on the RED mat."',
  },
  {
    id: 're-en-2-1',
    type: 'reading',
    language: 'en',
    difficulty: 2,
    prompt: 'Ayaan went to the park with his dog Max. Max chased a ball.\n\nWho chased the ball?',
    instruction: 'Read the story and answer',
    targetSentence: 'Ayaan went to the park with his dog Max. Max chased a ball.',
    options: [
      { id: 'a', label: 'Ayaan', hint: 'Look at the second sentence — who is chasing?' },
      { id: 'b', label: 'Max the dog', hint: '' },
      { id: 'c', label: 'The ball', hint: 'The ball is what was chased, not the chaser.' },
      { id: 'd', label: 'The park', hint: 'The park is where it happened, not who did it.' },
    ],
    correctOptionId: 'b',
    explanation: 'Max chased the ball. The sentence says "Max chased a ball."',
  },

  // ---------- Pronunciation ----------
  {
    id: 'pr-en-1-1',
    type: 'pronunciation',
    language: 'en',
    difficulty: 1,
    prompt: 'Say this word out loud:',
    instruction: 'Listen, then say it yourself',
    targetWord: 'apple',
    explanation: '"Apple" — starts with a short /a/ sound, like at the doctor\'s.',
  },
  {
    id: 'pr-en-1-2',
    type: 'pronunciation',
    language: 'en',
    difficulty: 1,
    prompt: 'Say this word out loud:',
    instruction: 'Listen, then say it yourself',
    targetWord: 'bridge',
    explanation: '"Bridge" rhymes with "ridge". The "d" is soft.',
  },
  {
    id: 'pr-en-2-1',
    type: 'pronunciation',
    language: 'en',
    difficulty: 2,
    prompt: 'Say this word out loud:',
    instruction: 'Listen, then say it yourself',
    targetWord: 'beautiful',
    explanation: '"Beautiful" — three parts: BEAU-ti-ful. The "eau" sounds like "yoo".',
  },

  // ---------- Urdu (examples — add more later) ----------
  {
    id: 'ph-ur-1-1',
    type: 'phonics',
    language: 'ur',
    difficulty: 1,
    prompt: 'کون سا حرف "ب" کی آواز دیتا ہے؟',
    instruction: 'صحیح حرف پر ٹیپ کریں',
    options: [
      { id: 'a', label: 'ب', hint: '' },
      { id: 'b', label: 'پ', hint: '"پ" کی آواز مختلف ہے۔' },
      { id: 'c', label: 'ت', hint: '"ت" کی آواز مختلف ہے۔' },
      { id: 'd', label: 'د', hint: '"د" کی آواز مختلف ہے۔' },
    ],
    correctOptionId: 'a',
    explanation: '"ب" کی آواز "با" جیسی ہے۔',
  },
];

export function pickExercise(params: {
  type: ExerciseType;
  language: Language;
  level: number;
  excludeIds?: string[];
}): Exercise | null {
  const { type, language, level, excludeIds = [] } = params;
  const pool = SEED_EXERCISES.filter(
    (e) =>
      e.type === type &&
      e.language === language &&
      Math.abs(e.difficulty - level) <= 1 &&
      !excludeIds.includes(e.id),
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function listExercises(type: ExerciseType, language: Language = 'en'): Exercise[] {
  return SEED_EXERCISES.filter((e) => e.type === type && e.language === language);
}
