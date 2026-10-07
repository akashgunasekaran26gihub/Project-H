import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create or update Demo User
  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@habittracker.app' },
    update: {},
    create: {
      name: 'Alex Mercer',
      email: 'demo@habittracker.app',
      passwordHash,
      timezone: 'UTC',
      preferences: {
        create: {
          theme: 'light',
          compactGrid: false,
          soundEffects: true,
        }
      }
    },
  });

  console.log(`👤 Demo User: ${user.email} (id: ${user.id})`);

  // Clean old habits for a fresh, clean seed
  await prisma.habitCompletion.deleteMany({
    where: { habit: { userId: user.id } }
  });
  await prisma.habit.deleteMany({
    where: { userId: user.id }
  });

  // 2. Create core habits matching prompt specification
  const seedHabits = [
    {
      name: 'Exercise',
      description: 'Morning workout, cardio, or strength training',
      frequency: 'daily',
      target: 30,
      unit: 'mins',
      preferredTime: 'morning',
      color: '#10b981', // emerald green
      icon: 'dumbbell',
      category: 'Fitness',
      order: 0,
      completionPattern: [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0] // ~87%
    },
    {
      name: 'Coding',
      description: 'Algorithm practice or building projects',
      frequency: 'daily',
      target: 1,
      unit: 'problem',
      preferredTime: 'afternoon',
      color: '#3b82f6', // blue
      icon: 'code',
      category: 'Productivity',
      order: 1,
      completionPattern: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1] // ~84%
    },
    {
      name: 'Reading',
      description: 'Non-fiction books and technical papers',
      frequency: 'daily',
      target: 15,
      unit: 'pages',
      preferredTime: 'evening',
      color: '#8b5cf6', // purple
      icon: 'book',
      category: 'Learning',
      order: 2,
      completionPattern: [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1] // ~76%
    },
    {
      name: 'Japanese',
      description: 'Anki flashcards, kanji review, and listening',
      frequency: 'daily',
      target: 20,
      unit: 'mins',
      preferredTime: 'evening',
      color: '#ec4899', // pink
      icon: 'globe',
      category: 'Learning',
      order: 3,
      completionPattern: [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // ~81%
    },
    {
      name: 'Meditation',
      description: 'Mindful breathing and stillness',
      frequency: 'daily',
      target: 10,
      unit: 'mins',
      preferredTime: 'morning',
      color: '#06b6d4', // cyan
      icon: 'smile',
      category: 'Mindfulness',
      order: 4,
      completionPattern: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1] // ~85%
    },
    {
      name: 'Hydration',
      description: 'Drink optimal fluids throughout the day',
      frequency: 'daily',
      target: 8,
      unit: 'glasses',
      preferredTime: 'anytime',
      color: '#0ea5e9', // sky blue
      icon: 'droplets',
      category: 'Health',
      order: 5,
      completionPattern: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // 100%
    }
  ];

  const year = 2026;
  const month = 10; // October
  const monthStr = '10';

  for (const item of seedHabits) {
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: item.name,
        description: item.description,
        frequency: item.frequency,
        target: item.target,
        unit: item.unit,
        preferredTime: item.preferredTime,
        color: item.color,
        icon: item.icon,
        category: item.category,
        order: item.order,
      }
    });

    console.log(`Created habit: ${habit.name}`);

    // Create completions for October 2026
    const completionsData = [];
    for (let day = 1; day <= 31; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${year}-${monthStr}-${dayStr}`;
      const isCompleted = item.completionPattern[day - 1] === 1;

      if (isCompleted) {
        completionsData.push({
          habitId: habit.id,
          date: dateISO,
          status: 'completed',
          value: item.target,
          note: day === 15 ? 'Felt energized today!' : null
        });
      } else if (day % 7 === 3) {
        // Sample partial completion
        completionsData.push({
          habitId: habit.id,
          date: dateISO,
          status: 'partial',
          value: item.target * 0.5,
          note: 'Short session'
        });
      }
    }

    // Also seed September 2026 for lifetime and trend statistics
    for (let day = 1; day <= 30; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${year}-09-${dayStr}`;
      if ((day + item.order) % 3 !== 0) {
        completionsData.push({
          habitId: habit.id,
          date: dateISO,
          status: 'completed',
          value: item.target,
          note: null
        });
      }
    }

    await prisma.habitCompletion.createMany({
      data: completionsData
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
