import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log('🧹 Removing all demo data from database...');

  // 1. Find the demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@habittracker.app' },
  });

  if (demoUser) {
    console.log(`Found demo user: ${demoUser.email} (${demoUser.id}). Deleting user and all cascades...`);
    // Delete habits, completions, expenses, conversations, insights for demo user
    await prisma.habitCompletion.deleteMany({
      where: { habit: { userId: demoUser.id } },
    });
    await prisma.habit.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.expense.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.aIInsight.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.aIConversation.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.userPreference.deleteMany({
      where: { userId: demoUser.id },
    });
    await prisma.user.delete({
      where: { id: demoUser.id },
    });
    console.log('✅ Demo user and all associated demo data removed.');
  } else {
    console.log('No demo user found.');
  }

  // 2. Also remove any test expenses across the entire database
  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`✅ Removed ${deletedExpenses.count} demo/test expenses.`);

  // 3. Remove any remaining starter/demo habits so all users start clean
  const deletedCompletions = await prisma.habitCompletion.deleteMany({});
  console.log(`✅ Removed ${deletedCompletions.count} completions.`);

  const deletedHabits = await prisma.habit.deleteMany({});
  console.log(`✅ Removed ${deletedHabits.count} habits.`);

  console.log('🎉 Database is now completely free of all demo data and clean!');
}

cleanDemoData()
  .catch((e) => {
    console.error('Error cleaning demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
