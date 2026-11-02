export const INITIAL_SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "target" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'times',
    "preferredTime" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT NOT NULL DEFAULT 'activity',
    "category" TEXT NOT NULL DEFAULT 'General',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "HabitCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "value" REAL NOT NULL DEFAULT 1.0,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "AIInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "habitId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'insight',
    "metric" TEXT,
    "actionable" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIInsight_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "AIConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Habit Coach',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "AIMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "structuredData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "compactGrid" BOOLEAN NOT NULL DEFAULT false,
    "soundEffects" BOOLEAN NOT NULL DEFAULT true,
    "dailyReminderTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE INDEX IF NOT EXISTS "Habit_userId_idx" ON "Habit"("userId");`,
  `CREATE INDEX IF NOT EXISTS "HabitCompletion_habitId_idx" ON "HabitCompletion"("habitId");`,
  `CREATE INDEX IF NOT EXISTS "HabitCompletion_date_idx" ON "HabitCompletion"("date");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "HabitCompletion_habitId_date_key" ON "HabitCompletion"("habitId", "date");`,
  `CREATE INDEX IF NOT EXISTS "AIInsight_userId_idx" ON "AIInsight"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AIConversation_userId_idx" ON "AIConversation"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "UserPreference_userId_key" ON "UserPreference"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Expense_date_idx" ON "Expense"("date");`
];
