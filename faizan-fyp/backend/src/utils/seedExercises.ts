/**
 * Seeds the MongoDB database with:
 *   - ~25 exercises across all 4 modules (EN + UR)
 *   - 3 parent users + 5 child profiles linked to them
 *   - 8 learning sessions with realistic attempts (so analytics show numbers)
 *
 * Run with: npm run db:seed   (from backend/)
 *   or:     npx tsx src/utils/seedExercises.ts
 */
import mongoose from 'mongoose';
import { connectMongo } from '@/config/db';
import { ExerciseModel } from '@/models/Exercise';
import { UserModel } from '@/models/User';
import { StudentModel } from '@/models/Student';
import { LearningSessionModel } from '@/models/LearningSession';

// ---------- Exercises ----------
const EXERCISES = [
  // Phonics EN
  {
    type: 'phonics', language: 'en', difficulty: 1,
    prompt: 'Which letter makes the /b/ sound, like in "ball"?',
    instruction: 'Tap the correct letter',
    options: [
      { id: 'a', label: 'B' },
      { id: 'b', label: 'D', hint: '"D" makes the /d/ sound, like in "dog".' },
      { id: 'c', label: 'P', hint: '"P" makes the /p/ sound — similar, but softer lips.' },
      { id: 'd', label: 'V', hint: '"V" makes the /v/ sound, like in "van".' },
    ],
    correctOptionId: 'a',
    explanation: '"B" makes the /b/ sound, like in "ball" or "bat".',
  },
  {
    type: 'phonics', language: 'en', difficulty: 1,
    prompt: 'Which letter makes the /m/ sound, like in "mama"?',
    instruction: 'Tap the correct letter',
    options: [
      { id: 'a', label: 'N', hint: '"N" sounds like /n/, like "no".' },
      { id: 'b', label: 'M' },
      { id: 'c', label: 'W', hint: '"W" sounds like /w/, like "water".' },
      { id: 'd', label: 'S', hint: '"S" sounds like /s/, like "sun".' },
    ],
    correctOptionId: 'b',
    explanation: '"M" — your lips press together.',
  },
  {
    type: 'phonics', language: 'en', difficulty: 2,
    prompt: 'Which two letters together make the /sh/ sound?',
    options: [
      { id: 'a', label: 'ch', hint: '"ch" makes /ch/ like "chip".' },
      { id: 'b', label: 'th', hint: '"th" makes /th/ like "thin".' },
      { id: 'c', label: 'sh' },
      { id: 'd', label: 'ph', hint: '"ph" makes /f/ like "phone".' },
    ],
    correctOptionId: 'c',
    explanation: '"sh" blends into /sh/ — quiet sound.',
  },
  {
    type: 'phonics', language: 'en', difficulty: 2,
    prompt: 'Which blend starts the word "stop"?',
    options: [
      { id: 'a', label: 'st' },
      { id: 'b', label: 'sp', hint: '"sp" starts words like "spin".' },
      { id: 'c', label: 'sk', hint: '"sk" starts "skip".' },
      { id: 'd', label: 'sl', hint: '"sl" starts "slip".' },
    ],
    correctOptionId: 'a',
    explanation: '"Stop" starts with the /st/ blend.',
  },
  {
    type: 'phonics', language: 'en', difficulty: 3,
    prompt: 'Which word has a long "a" sound?',
    options: [
      { id: 'a', label: 'cat', hint: 'Cat has a short "a".' },
      { id: 'b', label: 'cake' },
      { id: 'c', label: 'bag', hint: 'Bag has a short "a".' },
      { id: 'd', label: 'map', hint: 'Map has a short "a".' },
    ],
    correctOptionId: 'b',
    explanation: 'The "e" at the end of "cake" makes the "a" long.',
  },

  // Vocabulary EN
  {
    type: 'vocabulary', language: 'en', difficulty: 1,
    prompt: 'What is a "puppy"?',
    instruction: 'Choose the best meaning',
    options: [
      { id: 'a', label: 'A baby dog' },
      { id: 'b', label: 'A big bird', hint: 'A big bird is more like an "eagle".' },
      { id: 'c', label: 'A type of fruit', hint: 'A puppy is an animal, not a plant.' },
      { id: 'd', label: 'A toy', hint: 'Close — but a puppy is alive.' },
    ],
    correctOptionId: 'a',
    explanation: '"Puppy" means a baby dog.',
  },
  {
    type: 'vocabulary', language: 'en', difficulty: 1,
    prompt: 'What does "tiny" mean?',
    options: [
      { id: 'a', label: 'Very big', hint: '"Tiny" is the opposite — very small.' },
      { id: 'b', label: 'Very small' },
      { id: 'c', label: 'Very loud', hint: '"Loud" is about sound.' },
      { id: 'd', label: 'Very fast', hint: '"Fast" is about speed.' },
    ],
    correctOptionId: 'b',
    explanation: '"Tiny" means very small, like an ant.',
  },
  {
    type: 'vocabulary', language: 'en', difficulty: 2,
    prompt: 'What does "enormous" mean?',
    options: [
      { id: 'a', label: 'Very tiny', hint: '"Tiny" is the opposite.' },
      { id: 'b', label: 'Very big' },
      { id: 'c', label: 'Very fast', hint: '"Fast" is about speed, not size.' },
      { id: 'd', label: 'Very quiet', hint: '"Quiet" is about sound.' },
    ],
    correctOptionId: 'b',
    explanation: '"Enormous" means very, very big — like a mountain.',
  },
  {
    type: 'vocabulary', language: 'en', difficulty: 2,
    prompt: 'Which word means "happy"?',
    options: [
      { id: 'a', label: 'Sad', hint: '"Sad" is the opposite of happy.' },
      { id: 'b', label: 'Joyful' },
      { id: 'c', label: 'Angry', hint: '"Angry" means mad.' },
      { id: 'd', label: 'Tired', hint: '"Tired" means sleepy.' },
    ],
    correctOptionId: 'b',
    explanation: '"Joyful" is another word for happy.',
  },
  {
    type: 'vocabulary', language: 'en', difficulty: 3,
    prompt: 'What does "generous" mean?',
    options: [
      { id: 'a', label: 'Selfish', hint: '"Selfish" is the opposite.' },
      { id: 'b', label: 'Willing to share' },
      { id: 'c', label: 'Quiet', hint: '"Quiet" is about sound.' },
      { id: 'd', label: 'Tall', hint: 'Not related to size.' },
    ],
    correctOptionId: 'b',
    explanation: 'A generous person likes to share.',
  },

  // Reading EN
  {
    type: 'reading', language: 'en', difficulty: 1,
    prompt: 'The cat sat on the red mat.\n\nWhat color was the mat?',
    instruction: 'Read and answer',
    targetSentence: 'The cat sat on the red mat.',
    options: [
      { id: 'a', label: 'Blue' },
      { id: 'b', label: 'Green' },
      { id: 'c', label: 'Red' },
      { id: 'd', label: 'Yellow' },
    ],
    correctOptionId: 'c',
    explanation: 'The mat was red.',
  },
  {
    type: 'reading', language: 'en', difficulty: 1,
    prompt: 'Sara has two apples. She gives one to her brother.\n\nHow many apples does Sara have now?',
    targetSentence: 'Sara has two apples. She gives one to her brother.',
    options: [
      { id: 'a', label: 'Zero' },
      { id: 'b', label: 'One' },
      { id: 'c', label: 'Two', hint: 'She gave one away — so not two anymore.' },
      { id: 'd', label: 'Three' },
    ],
    correctOptionId: 'b',
    explanation: '2 − 1 = 1 apple left.',
  },
  {
    type: 'reading', language: 'en', difficulty: 2,
    prompt: 'Ayaan went to the park with his dog Max. Max chased a ball.\n\nWho chased the ball?',
    targetSentence: 'Ayaan went to the park with his dog Max. Max chased a ball.',
    options: [
      { id: 'a', label: 'Ayaan', hint: 'Look at the second sentence.' },
      { id: 'b', label: 'Max the dog' },
      { id: 'c', label: 'The ball', hint: 'The ball was chased, not the chaser.' },
      { id: 'd', label: 'The park', hint: 'The park is the place.' },
    ],
    correctOptionId: 'b',
    explanation: 'Max the dog chased the ball.',
  },
  {
    type: 'reading', language: 'en', difficulty: 2,
    prompt: 'It was raining. Amna took her umbrella and walked to school.\n\nWhy did Amna take an umbrella?',
    targetSentence: 'It was raining. Amna took her umbrella and walked to school.',
    options: [
      { id: 'a', label: 'Because it was raining' },
      { id: 'b', label: 'Because it was sunny', hint: 'It was raining, not sunny.' },
      { id: 'c', label: 'Because she was cold', hint: 'Umbrellas are for rain.' },
      { id: 'd', label: 'Because it was a gift', hint: 'That is not in the story.' },
    ],
    correctOptionId: 'a',
    explanation: 'She took it because it was raining.',
  },
  {
    type: 'reading', language: 'en', difficulty: 3,
    prompt: 'Ali loved drawing. Every evening after dinner he would take out his crayons and fill a page with bright colors.\n\nWhen did Ali draw?',
    targetSentence: 'Every evening after dinner he would take out his crayons.',
    options: [
      { id: 'a', label: 'In the morning', hint: 'The story says "evening".' },
      { id: 'b', label: 'After dinner, every evening' },
      { id: 'c', label: 'At school', hint: 'The story is about home.' },
      { id: 'd', label: 'On Saturdays only', hint: 'It says "every evening".' },
    ],
    correctOptionId: 'b',
    explanation: 'Every evening after dinner.',
  },

  // Pronunciation EN
  {
    type: 'pronunciation', language: 'en', difficulty: 1,
    prompt: 'Say this word out loud:',
    instruction: 'Listen, then say it yourself',
    targetWord: 'apple',
    explanation: '"Apple" — starts with a short /a/ sound.',
  },
  {
    type: 'pronunciation', language: 'en', difficulty: 1,
    prompt: 'Say this word out loud:',
    targetWord: 'bridge',
    explanation: '"Bridge" rhymes with "ridge".',
  },
  {
    type: 'pronunciation', language: 'en', difficulty: 2,
    prompt: 'Say this word out loud:',
    targetWord: 'butterfly',
    explanation: 'Three parts: but-ter-fly.',
  },
  {
    type: 'pronunciation', language: 'en', difficulty: 2,
    prompt: 'Say this word out loud:',
    targetWord: 'elephant',
    explanation: 'Three parts: el-e-phant.',
  },
  {
    type: 'pronunciation', language: 'en', difficulty: 3,
    prompt: 'Say this word out loud:',
    targetWord: 'beautiful',
    explanation: '"Beau-ti-ful" — the "eau" sounds like "yoo".',
  },

  // Urdu
  {
    type: 'phonics', language: 'ur', difficulty: 1,
    prompt: 'کون سا حرف "ب" کی آواز دیتا ہے؟',
    instruction: 'صحیح حرف پر ٹیپ کریں',
    options: [
      { id: 'a', label: 'ب' },
      { id: 'b', label: 'پ', hint: '"پ" کی آواز مختلف ہے۔' },
      { id: 'c', label: 'ت', hint: '"ت" کی آواز مختلف ہے۔' },
      { id: 'd', label: 'د', hint: '"د" کی آواز مختلف ہے۔' },
    ],
    correctOptionId: 'a',
    explanation: '"ب" کی آواز "با" جیسی ہے۔',
  },
  {
    type: 'vocabulary', language: 'ur', difficulty: 1,
    prompt: '"کتاب" کا کیا مطلب ہے؟',
    options: [
      { id: 'a', label: 'پڑھنے والی چیز' },
      { id: 'b', label: 'کھانے والی چیز' },
      { id: 'c', label: 'پینے والی چیز' },
      { id: 'd', label: 'کھیلنے والی چیز' },
    ],
    correctOptionId: 'a',
    explanation: 'کتاب پڑھنے کے لیے ہوتی ہے۔',
  },
  {
    type: 'reading', language: 'ur', difficulty: 1,
    prompt: 'علی نے ایک سیب کھایا۔\n\nعلی نے کیا کھایا؟',
    targetSentence: 'علی نے ایک سیب کھایا۔',
    options: [
      { id: 'a', label: 'سیب' },
      { id: 'b', label: 'کیلا' },
      { id: 'c', label: 'روٹی' },
      { id: 'd', label: 'چاول' },
    ],
    correctOptionId: 'a',
    explanation: 'علی نے سیب کھایا۔',
  },
  {
    type: 'pronunciation', language: 'ur', difficulty: 1,
    prompt: 'یہ لفظ بلند آواز سے کہیں:',
    targetWord: 'سکول',
    explanation: '"سکول" — جہاں بچے پڑھتے ہیں۔',
  },
];

// ---------- Users (parents) — fake Firebase UIDs so you can view them in admin ----------
const PARENTS = [
  { firebaseUid: 'seed-uid-parent-001', email: 'aisha.khan@example.com', name: 'Aisha Khan' },
  { firebaseUid: 'seed-uid-parent-002', email: 'hassan.ali@example.com', name: 'Hassan Ali' },
  { firebaseUid: 'seed-uid-parent-003', email: 'fatima.sheikh@example.com', name: 'Fatima Sheikh' },
];

// ---------- Children ----------
function makeChildren() {
  return [
    { parentFirebaseUid: PARENTS[0].firebaseUid, name: 'Ayaan', age: 7, grade: 'Class 2', avatarIndex: 0, currentLevel: 2 },
    { parentFirebaseUid: PARENTS[0].firebaseUid, name: 'Zara', age: 9, grade: 'Class 4', avatarIndex: 3, currentLevel: 3 },
    { parentFirebaseUid: PARENTS[1].firebaseUid, name: 'Hamza', age: 8, grade: 'Class 3', avatarIndex: 2, currentLevel: 2 },
    { parentFirebaseUid: PARENTS[2].firebaseUid, name: 'Maryam', age: 6, grade: 'Class 1', avatarIndex: 5, currentLevel: 1 },
    { parentFirebaseUid: PARENTS[2].firebaseUid, name: 'Bilal', age: 11, grade: 'Class 6', avatarIndex: 4, currentLevel: 4 },
  ];
}

function makeSessionsFor(studentId: mongoose.Types.ObjectId, dayOffsets: number[]) {
  return dayOffsets.map((daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const attemptsCount = 4 + Math.floor(Math.random() * 4);
    const attempts = Array.from({ length: attemptsCount }, (_, i) => ({
      exerciseId: `seed-ex-${i}`,
      correct: Math.random() < 0.75,
      selectedOptionId: ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)],
      timeSpentMs: 4000 + Math.floor(Math.random() * 8000),
      timestamp: new Date(d.getTime() + i * 60_000),
    }));
    const correct = attempts.filter((a) => a.correct).length;
    return {
      studentId,
      date,
      startedAt: d,
      endedAt: new Date(d.getTime() + attempts.length * 60_000),
      totalTimeMs: attempts.reduce((s, a) => s + a.timeSpentMs, 0),
      exercisesCompleted: attempts.length,
      correctCount: correct,
      score: Math.round((correct / attempts.length) * 100),
      attempts,
    };
  });
}

async function main() {
  await connectMongo();

  console.log('Clearing old seed data…');
  await Promise.all([
    ExerciseModel.deleteMany({}),
    UserModel.deleteMany({ firebaseUid: { $regex: /^seed-uid-/ } }),
    StudentModel.deleteMany({ parentFirebaseUid: { $regex: /^seed-uid-/ } }),
  ]);
  // Kill sessions that belonged to seed students (we'll re-insert)
  const oldStudentIds = await StudentModel.find().distinct('_id');
  await LearningSessionModel.deleteMany({ studentId: { $in: oldStudentIds } });

  console.log(`Inserting ${EXERCISES.length} exercises…`);
  await ExerciseModel.insertMany(EXERCISES);

  console.log(`Inserting ${PARENTS.length} parent users…`);
  const parentDocs = await UserModel.insertMany(
    PARENTS.map((p) => ({ ...p, role: 'parent' })),
  );

  console.log(`Inserting children…`);
  const childDocs = await StudentModel.insertMany(makeChildren());

  console.log('Inserting sample learning sessions…');
  const allSessions = childDocs.flatMap((c, idx) =>
    // Varied history per child so analytics look real
    makeSessionsFor(c._id as mongoose.Types.ObjectId, [0, 1, 2, 4, 7].slice(0, 2 + (idx % 4))),
  );
  await LearningSessionModel.insertMany(allSessions);

  console.log('\n✅ Seed complete');
  console.log(`   exercises: ${EXERCISES.length}`);
  console.log(`   parents:   ${parentDocs.length}`);
  console.log(`   children:  ${childDocs.length}`);
  console.log(`   sessions:  ${allSessions.length}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
