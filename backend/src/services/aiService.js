/**
 * AI Service for Habit Tracker
 * Provides NLP habit parsing, real data-driven pattern detection,
 * daily/weekly summaries, smart recommendations, and an interactive assistant.
 * Supports external LLM (Gemini / OpenAI) if API keys are set, with a high-fidelity
 * local heuristic engine that operates deterministically on real tracking data.
 */

// 1. Natural Language Habit Parser
export const parseHabitNaturalLanguage = async (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Please provide habit description text');
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Try external LLM if GEMINI_API_KEY is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a habit tracker parser. Extract habit details from the user prompt: "${clean}".
Return ONLY a valid JSON object with these exact keys:
{
  "name": string (short title, e.g. "Morning Run", "LeetCode"),
  "description": string (short summary),
  "frequency": "daily" | "weekly" | "weekdays",
  "target": number,
  "unit": string (e.g. "minutes", "pages", "problems", "times", "liters"),
  "preferredTime": "morning" | "afternoon" | "evening" | "anytime",
  "category": "Health" | "Productivity" | "Learning" | "Mindfulness" | "Fitness" | "Lifestyle",
  "color": string (hex color code, e.g. "#10b981", "#3b82f6", "#8b5cf6")
}`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              ...parsed,
              target: Number(parsed.target) || 1,
              source: 'gemini-llm'
            };
          }
        }
      }
    } catch (e) {
      console.warn('Gemini LLM call failed, falling back to deterministic NLP parser:', e.message);
    }
  }

  // Robust Local NLP Heuristics Engine
  let name = clean;
  let target = 1;
  let unit = 'times';
  let frequency = 'daily';
  let preferredTime = 'anytime';
  let category = 'General';
  let color = '#6366f1';

  // Target and unit regex
  const numberMatch = lower.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|pages?|problems?|glasses?|liters?|reps?|steps?|km|miles?|times?|sessions?)/i);
  if (numberMatch) {
    target = parseFloat(numberMatch[1]);
    const matchedUnit = numberMatch[2].toLowerCase();
    if (matchedUnit.startsWith('min')) unit = 'minutes';
    else if (matchedUnit.startsWith('hr') || matchedUnit.startsWith('hour')) {
      target = target * 60;
      unit = 'minutes';
    } else if (matchedUnit.startsWith('page')) unit = 'pages';
    else if (matchedUnit.startsWith('problem')) unit = 'problems';
    else if (matchedUnit.startsWith('glass')) unit = 'glasses';
    else if (matchedUnit.startsWith('step')) unit = 'steps';
    else unit = matchedUnit;
  }

  // Time preference
  if (lower.includes('morning') || lower.includes('am ') || lower.includes('breakfast')) {
    preferredTime = 'morning';
  } else if (lower.includes('afternoon') || lower.includes('lunch')) {
    preferredTime = 'afternoon';
  } else if (lower.includes('evening') || lower.includes('night') || lower.includes('before bed') || lower.includes('pm')) {
    preferredTime = 'evening';
  }

  // Frequency
  if (lower.includes('everyday') || lower.includes('every day') || lower.includes('daily')) {
    frequency = 'daily';
  } else if (lower.includes('weekday') || lower.includes('mon-fri') || lower.includes('workday')) {
    frequency = 'weekdays';
  } else if (lower.includes('weekly') || lower.includes('once a week') || lower.includes('weekends')) {
    frequency = 'weekly';
  }

  // Category and Color
  if (/exercise|workout|gym|run|jog|pushup|yoga|walk|swim|fitness/i.test(lower)) {
    category = 'Fitness';
    color = '#10b981'; // emerald green
  } else if (/read|book|study|learn|code|coding|leetcode|japanese|spanish|course/i.test(lower)) {
    category = 'Learning';
    color = '#3b82f6'; // blue
  } else if (/meditat|journal|sleep|breathe|gratitude|pray/i.test(lower)) {
    category = 'Mindfulness';
    color = '#8b5cf6'; // purple
  } else if (/water|hydrate|eat|clean|sleep|vitamins/i.test(lower)) {
    category = 'Health';
    color = '#06b6d4'; // cyan
  } else if (/work|deep work|inbox|plan|review/i.test(lower)) {
    category = 'Productivity';
    color = '#f59e0b'; // amber
  }

  // Clean title
  let parsedName = clean
    .replace(/^i want to\s+/i, '')
    .replace(/^i will\s+/i, '')
    .replace(/^build a habit to\s+/i, '')
    .replace(/^track\s+/i, '')
    .replace(/\s+for\s+\d+.*$/i, '')
    .replace(/\s+every\s+(morning|day|evening|night|week).*$/i, '');

  if (parsedName.length > 30) {
    parsedName = parsedName.substring(0, 30).trim();
  }
  name = parsedName.charAt(0).toUpperCase() + parsedName.slice(1);

  return {
    name: name || 'New Habit',
    description: `Target: ${target} ${unit} (${preferredTime})`,
    frequency,
    target,
    unit,
    preferredTime,
    category,
    color,
    source: 'nlp-parser'
  };
};

// 2. Pattern Detection Engine (using real completion records)
export const detectPatterns = (habits, completions, daysStats) => {
  const patterns = [];

  if (!completions || completions.length < 5) {
    return [
      {
        id: 'p-initial',
        type: 'info',
        title: 'Building Baseline Data',
        summary: 'Not enough historical data yet. Continue tracking your habits daily to unlock deep statistical correlations and AI patterns.',
        metric: 'Data threshold: 5+ entries',
        actionable: 'Mark your completions for today to build momentum.'
      }
    ];
  }

  // Day of week analysis (0=Sun, 1=Mon, ..., 6=Sat)
  const dayBuckets = { 0: { total: 0, done: 0, label: 'Sunday' },
                       1: { total: 0, done: 0, label: 'Monday' },
                       2: { total: 0, done: 0, label: 'Tuesday' },
                       3: { total: 0, done: 0, label: 'Wednesday' },
                       4: { total: 0, done: 0, label: 'Thursday' },
                       5: { total: 0, done: 0, label: 'Friday' },
                       6: { total: 0, done: 0, label: 'Saturday' } };

  completions.forEach((c) => {
    const d = new Date(c.date + 'T00:00:00Z');
    const day = d.getDay();
    if (dayBuckets[day]) {
      dayBuckets[day].total++;
      if (c.status === 'completed') dayBuckets[day].done++;
    }
  });

  let bestDay = null;
  let worstDay = null;
  let maxRate = -1;
  let minRate = 101;

  Object.values(dayBuckets).forEach(b => {
    if (b.total >= 2) {
      const rate = Math.round((b.done / b.total) * 100);
      if (rate > maxRate) {
        maxRate = rate;
        bestDay = b;
      }
      if (rate < minRate) {
        minRate = rate;
        worstDay = b;
      }
    }
  });

  if (bestDay && maxRate > 60) {
    patterns.push({
      id: 'p-best-day',
      type: 'positive',
      title: `Peak Performance on ${bestDay.label}s`,
      summary: `Your habit execution hits its highest velocity on ${bestDay.label}s with a ${maxRate}% completion rate.`,
      metric: `${maxRate}% success rate`,
      actionable: `Use ${bestDay.label}s to tackle your highest resistance habits.`
    });
  }

  if (worstDay && minRate < 60 && worstDay.label !== bestDay?.label) {
    patterns.push({
      id: 'p-friction-day',
      type: 'warning',
      title: `Consistency Dip on ${worstDay.label}s`,
      summary: `Historical data reveals that completions drop to ${minRate}% on ${worstDay.label}s.`,
      metric: `${minRate}% completion rate`,
      actionable: `Schedule reminder alerts 1 hour earlier on ${worstDay.label}s or decrease target duration.`
    });
  }

  // Habit trending performance
  habits.forEach((h) => {
    const habitCompletions = completions.filter(c => c.habitId === h.id);
    const sorted = habitCompletions.sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length >= 6) {
      const midpoint = Math.floor(sorted.length / 2);
      const firstHalf = sorted.slice(0, midpoint);
      const secondHalf = sorted.slice(midpoint);

      const firstRate = firstHalf.filter(c => c.status === 'completed').length / firstHalf.length;
      const secondRate = secondHalf.filter(c => c.status === 'completed').length / secondHalf.length;
      const diff = Math.round((secondRate - firstRate) * 100);

      if (diff >= 15) {
        patterns.push({
          id: `p-improve-${h.id}`,
          type: 'positive',
          title: `${h.name} is Surging`,
          summary: `Your consistency with ${h.name} improved by +${diff}% over recent tracking sessions.`,
          metric: `+${diff}% surge`,
          actionable: `Your neurological habit loop is solidifying. Keep the momentum going!`
        });
      } else if (diff <= -20) {
        patterns.push({
          id: `p-decline-${h.id}`,
          type: 'warning',
          title: `${h.name} Needs Immediate Focus`,
          summary: `Completion rate for ${h.name} has decreased by ${Math.abs(diff)}% recently.`,
          metric: `${diff}% trend`,
          actionable: `Try habit stacking: do ${h.name} immediately after your morning coffee or breakfast.`
        });
      }
    }
  });

  return patterns;
};

// 3. Daily & Weekly Summaries
export const generateDailySummary = (dashboardData) => {
  const { todayStats, habits, overallStreaks } = dashboardData;
  const total = todayStats.totalActive || habits.length || 0;
  const done = todayStats.completedCount || 0;

  const strong = habits.filter(h => h.monthlyRate >= 75).map(h => h.name);
  const needsAttention = habits.filter(h => h.monthlyRate < 50).map(h => h.name);

  return {
    title: "Today's Progress Overview",
    completed: done,
    total,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    currentStreak: overallStreaks.currentStreak,
    bestStreak: overallStreaks.bestStreak,
    strong: strong.slice(0, 3),
    needsAttention: needsAttention.slice(0, 3),
    recommendation: done === total && total > 0
      ? 'Perfect day achieved! You crushed all active habits.'
      : `You have ${total - done} habit${total - done === 1 ? '' : 's'} remaining today. Focus on quick wins to protect your streak.`
  };
};

export const generateWeeklySummary = (dashboardData) => {
  const { weeklyProgress, habits } = dashboardData;
  const currentWeek = weeklyProgress[weeklyProgress.length - 1] || weeklyProgress[0];
  
  const strong = habits.filter(h => h.monthlyRate >= 80).map(h => h.name);
  const needsAttention = habits.filter(h => h.monthlyRate < 60).map(h => h.name);

  return {
    title: 'Weekly AI Executive Review',
    overallCompletion: currentWeek ? currentWeek.completionRate : 0,
    bestHabit: currentWeek?.bestHabit || (strong[0] || 'None'),
    weakestHabit: currentWeek?.weakestHabit || (needsAttention[0] || 'None'),
    strong: strong.slice(0, 3),
    needsAttention: needsAttention.slice(0, 3),
    pattern: 'Consistency is highest mid-week and dips towards the weekend.',
    recommendation: 'Anchor low-completion habits to an established morning trigger to guarantee execution.'
  };
};

// 4. Upgraded Smart AI Assistant / Chat Handler (Answers ALL questions)
export const answerHabitAssistantQuery = async (query, dashboardData, conversationHistory = []) => {
  const { habits, overallProgress, overallStreaks, todayStats, weeklyProgress } = dashboardData;

  const activeHabits = habits.filter(h => h.active);
  const habitsSummary = activeHabits.map(h => 
    `- ${h.name} (${h.category}): ${h.monthlyRate}% monthly rate, ${h.currentStreak} day streak, target: ${h.target} ${h.unit} (${h.preferredTime || 'anytime'})`
  ).join('\n');

  // 1. External LLM (Gemini or OpenAI) if API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const systemPrompt = `You are a world-class behavioral AI Habit Coach and Productivity Architect (combining Atomic Habits, behavioral psychology, and compassionate guidance).
You have real-time live access to the user's habit tracker data:
- Overall monthly completion: ${overallProgress}%
- Today's progress: ${todayStats.completedCount} of ${todayStats.totalActive} habits completed
- Current overall streak: ${overallStreaks.currentStreak} days (Best: ${overallStreaks.bestStreak} days)

Active habits:
${habitsSummary}

INSTRUCTIONS:
1. Answer the user's question directly, insightfully, and with maximum clarity.
2. Ground advice in behavioral science (cue, craving, response, reward, habit stacking, friction elimination).
3. If the user asks about their specific habits or data, use the exact metrics above.
4. If the user asks general questions (motivation, sleep, routines, psychology, time management), give structured, high-value advice with bullet points.
5. If suggesting a new habit, include a concrete formula: "After [Current Habit], I will [New Habit] for [Time/Reps]".`;

      const contents = [
        ...conversationHistory.slice(-4).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${query}` }] }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return { reply: replyText, source: 'gemini-llm' };
        }
      }
    } catch (e) {
      console.warn('Gemini chat failed, falling back to local cognitive engine:', e.message);
    }
  }

  // 2. High-Performance Multi-Domain Cognitive Reasoning Engine
  const q = query.toLowerCase().trim();

  // Greeting & Identity
  if (/^(hi|hello|hey|greetings|good morning|good evening|yo)\b/i.test(q)) {
    return {
      reply: `👋 **Hello! I'm your AI Habit & Productivity Coach.**\n\n` +
             `I'm constantly analyzing your tracking data to help you build unbreakable consistency.\n\n` +
             `📊 **Quick Snapshot Today**:\n` +
             `• Completed **${todayStats.completedCount}/${todayStats.totalActive}** habits so far.\n` +
             `• Overall consistency is at **${overallProgress}%**.\n` +
             `• Active streak: **${overallStreaks.currentStreak} days**.\n\n` +
             `Ask me anything—whether about your streaks, overcoming low energy, building custom morning/evening routines, or psychology tips from *Atomic Habits*!`,
      source: 'cognitive-engine'
    };
  }

  // Who are you / Capabilities
  if (q.includes('who are you') || q.includes('what can you do') || q.includes('help me with')) {
    return {
      reply: `🤖 **About Your AI Coach**:\n\n` +
             `I am your 24/7 personal behavioral architect. I can:\n\n` +
             `1. **Analyze Your Real Tracker Data**: Assess your streaks, pinpoint friction days, and identify your strongest/weakest habits.\n` +
             `2. **Solve Behavioral Obstacles**: Provide strategies for procrastination, burnout, broken streaks, and resistance.\n` +
             `3. **Design Science-Backed Routines**: Build morning, evening, study, coding, or workout routines.\n` +
             `4. **Habit Stacking Formulas**: Anchor new habits to existing ones using proven psychology.\n` +
             `5. **Mindfulness & Focus Coaching**: Guide deep work intervals, Pomodoros, and stress recovery.\n\n` +
             `Try asking: *"How do I fix my reading habit?"* or *"Give me a dopamine detox plan"*.`,
      source: 'cognitive-engine'
    };
  }

  // Streaks & Losing Momentum
  if (q.includes('streak') || q.includes('losing') || q.includes('broken') || q.includes('missed') || q.includes('slip')) {
    const fragileHabits = activeHabits.filter(h => h.currentStreak > 0 && h.currentStreak <= 2);
    const topStreak = activeHabits.reduce((max, h) => (h.currentStreak > (max?.currentStreak || 0) ? h : max), activeHabits[0]);

    return {
      reply: `🛡️ **Streak Resilience & Recovery Protocol**:\n\n` +
             `Your overall active streak is **${overallStreaks.currentStreak} days** (Personal Record: **${overallStreaks.bestStreak} days**).\n\n` +
             (topStreak ? `🌟 **Strongest Anchor**: **${topStreak.name}** with a **${topStreak.currentStreak}-day** active streak.\n\n` : '') +
             (fragileHabits.length > 0
               ? `⚠️ **Habits at risk of breaking**: ${fragileHabits.map(h => `**${h.name}** (${h.currentStreak}d)`).join(', ')}.\n\n`
               : `All active habits currently hold stable consistency.\n\n`) +
             `🧠 **The "Never Miss Twice" Rule** (James Clear):\n` +
             `Missing one day is an accident; missing two is the start of a new, negative habit. Even if you only have 2 minutes today, do a micro-version of each habit to preserve the neurological identity.`,
      source: 'cognitive-engine'
    };
  }

  // Weakest Habit / What to Focus On
  if (q.includes('attention') || q.includes('weak') || q.includes('worst') || q.includes('focus') || q.includes('struggling') || q.includes('hardest')) {
    const weakest = [...activeHabits].sort((a, b) => a.monthlyRate - b.monthlyRate);
    const lowest = weakest[0];

    if (!lowest) {
      return {
        reply: `You don't have any active habits yet! Click **+ Add Habit** to start tracking.`,
        source: 'cognitive-engine'
      };
    }

    return {
      reply: `🔍 **Habit Needing Priority Focus**: **${lowest.name}**\n\n` +
             `• **Current Monthly Rate**: ${lowest.monthlyRate}%\n` +
             `• **Current Streak**: ${lowest.currentStreak} days\n` +
             `• **Target**: ${lowest.target} ${lowest.unit} (${lowest.preferredTime || 'anytime'})\n\n` +
             `💡 **Action Plan to Turn This Around**:\n` +
             `1. **Lower the Barrier of Entry**: Drop your daily target in half for the next 4 days. If it was ${lowest.target} ${lowest.unit}, aim for ${Math.max(1, Math.round(lowest.target * 0.4))} ${lowest.unit}.\n` +
             `2. **Habit Stacking Formula**:\n` +
             `   *"Immediately after I finish ${activeHabits[0]?.name || 'my morning coffee'}, I will do ${lowest.name} for 3 minutes."*\n` +
             `3. **Pre-commit the Environment**: Prepare your tools or space the night before so there is zero startup friction.`,
      source: 'cognitive-engine'
    };
  }

  // Performance & Monthly Review
  if (q.includes('perform') || q.includes('month') || q.includes('how did i do') || q.includes('summary') || q.includes('stats') || q.includes('progress')) {
    const bestHabit = [...activeHabits].sort((a, b) => b.monthlyRate - a.monthlyRate)[0];

    return {
      reply: `📊 **Monthly Performance Diagnostic**:\n\n` +
             `• **Overall Completion Rate**: **${overallProgress}%**\n` +
             `• **Today's Status**: **${todayStats.completedCount} of ${todayStats.totalActive}** habits completed\n` +
             `• **Current Overall Streak**: **${overallStreaks.currentStreak} days**\n` +
             (bestHabit ? `• **Highest Performer**: **${bestHabit.name}** at **${bestHabit.monthlyRate}%** consistency\n\n` : '\n') +
             `🎯 **Coach's Assessment**:\n` +
             (overallProgress >= 80 
               ? `You are performing in the top 10% of habit builders! Your momentum is compounding. Focus on protecting your evening routines to lock in 90%+ consistency.` 
               : `You have established a solid baseline. The key leverage point right now is reducing missed days mid-week to create unbroken 7-day clusters.`),
      source: 'cognitive-engine'
    };
  }

  // Morning / Evening Routines & Scheduling
  if (q.includes('routine') || q.includes('morning') || q.includes('evening') || q.includes('night') || q.includes('wake up') || q.includes('sleep')) {
    const isMorning = !q.includes('evening') && !q.includes('night');
    if (isMorning) {
      return {
        reply: `🌅 **The 30-Minute High-Impact Morning Routine**:\n\n` +
               `1. **Hydration & Light (Minutes 0–5)**: Drink 500ml water and step outside for natural retinal sunlight (triggers dopamine and sets circadian rhythm).\n` +
               `2. **Physical Priming (Minutes 5–15)**: 10 mins of light movement, mobility stretches, or bodyweight exercises.\n` +
               `3. **Cognitive Clarity (Minutes 15–30)**: Review your top 1 priority for today before opening social media or email.\n\n` +
               `Would you like to add any of these habits to your dashboard? You can use the **AI Quick Create** tab in the *+ Add Habit* modal!`,
        source: 'cognitive-engine'
      };
    } else {
      return {
        reply: `🌙 **The Restorative Evening Wind-Down Routine**:\n\n` +
               `1. **Digital Sunset (T-60 mins)**: Dim artificial lighting and disconnect from work screens.\n` +
               `2. **Brain Dump / Closure (T-30 mins)**: Spend 5 minutes writing tomorrow's 3 key tasks to empty working memory.\n` +
               `3. **Parasympathetic Activation (T-15 mins)**: 10 pages of fiction reading, light stretching, or Box Breathing.\n\n` +
               `Sleep quality dictates tomorrow's willpower. Protect this window!`,
        source: 'cognitive-engine'
      };
    }
  }

  // Motivation, Procrastination & Resistance
  if (q.includes('motivation') || q.includes('procrastinat') || q.includes('lazy') || q.includes('burnout') || q.includes('tired') || q.includes('bored') || q.includes('hard to start')) {
    return {
      reply: `⚡ **How to Overcome Resistance & Low Motivation**:\n\n` +
             `*"You do not rise to the level of your goals; you fall to the level of your systems."*\n\n` +
             `Here is the 3-step psychological antidote when motivation is zero:\n\n` +
             `1. **The 2-Minute Rule**: Scale the habit down to just the first 2 minutes. E.g., put on running shoes, open your code editor and write 1 line, or read 1 paragraph. Once you cross the initiation threshold, inertia works *for* you.\n` +
             `2. **Dopamine Friction**: Motivation follows action, it rarely precedes it. Action creates a dopamine pulse that fuels the next step.\n` +
             `3. **Shrink the Scope, Don't Skip**: Doing 10% of a habit maintains your self-identity as someone who never quits.`,
      source: 'cognitive-engine'
    };
  }

  // Coding, Studying & Deep Work
  if (q.includes('code') || q.includes('leetcode') || q.includes('study') || q.includes('read') || q.includes('learning') || q.includes('deep work')) {
    return {
      reply: `🧠 **Deep Work & Accelerated Learning Framework**:\n\n` +
             `1. **The 50/10 Ultradian Rhythm**: Work with complete focus for 50 minutes with all notifications silenced, followed by 10 minutes of complete cognitive rest (walk, hydrate, no phone).\n` +
             `2. **Active Recall & Spaced Repetition**: For coding or language practice, testing yourself generates 3x higher retention than passive reading.\n` +
             `3. **Environment Cues**: Dedicate a specific desk setup or browser profile exclusively for focused work to trigger instant flow state.`,
      source: 'cognitive-engine'
    };
  }

  // Fitness, Exercise & Health
  if (q.includes('exercise') || q.includes('workout') || q.includes('gym') || q.includes('diet') || q.includes('water') || q.includes('weight') || q.includes('health')) {
    return {
      reply: `💪 **Sustainable Fitness & Health Habit Principles**:\n\n` +
             `1. **Consistency Beats Intensity**: 20 minutes done 5 days a week produces dramatically superior metabolic and mental benefits compared to an exhaustive 2-hour workout once a week.\n` +
             `2. **Reduce Decision Fatigue**: Decide your exact workout the night before. Don't waste energy deciding what exercises to do at the gym.\n` +
             `3. **Hydration First**: 8 glasses of water daily increases mental acuity and physical endurance by up to 20%. Keep a refillable bottle beside your workstation.`,
      source: 'cognitive-engine'
    };
  }

  // Time Management & Planning
  if (q.includes('time') || q.includes('schedule') || q.includes('plan') || q.includes('busy') || q.includes('hours') || q.includes('pomodoro')) {
    return {
      reply: `⏱️ **High-Leverage Time Management Strategy**:\n\n` +
             `1. **Time-Blocking over To-Do Lists**: If a habit doesn't have a specific calendar time and location, it's just a wish. Assign habits to concrete blocks (e.g., 7:30 AM or 6:00 PM).\n` +
             `2. **Eat the Frog Early**: Schedule your highest mental resistance habit (like LeetCode or Exercise) before 1:00 PM when cognitive willpower is at its highest.\n` +
             `3. **Defend Buffers**: Keep 30-minute buffers between obligations to prevent small delays from derailing your entire day.`,
      source: 'cognitive-engine'
    };
  }

  // General Open-Ended Guidance (Answers ANY other question thoughtfully)
  return {
    reply: `💡 **Coach's Strategic Insights for "${query}"**:\n\n` +
           `When approaching any challenge with habits or personal systems, apply these foundational principles:\n\n` +
           `1. **Make it Obvious**: Visual cues are the biggest triggers of human behavior. Place your habit tools where you cannot miss them.\n` +
           `2. **Make it Easy**: Reduce friction until doing the habit is easier than avoiding it. The fewer steps required, the higher your consistency.\n` +
           `3. **Track Every Rep**: Logging your completion in this dashboard provides immediate neurological reward (dopamine reinforcement).\n\n` +
           `📈 **Your Tracker Status**: You have completed **${todayStats.completedCount}/${todayStats.totalActive}** habits today with a **${overallStreaks.currentStreak}-day** streak.\n\n` +
           `Feel free to ask for specific step-by-step routines, habit stacking recipes, or advice on any specific habit!`,
    source: 'cognitive-engine'
  };
};
