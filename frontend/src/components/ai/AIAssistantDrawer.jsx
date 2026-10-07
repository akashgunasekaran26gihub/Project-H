import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, Check, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { useHabits } from '../../context/HabitContext';

export const AIAssistantDrawer = ({ isOpen, onClose, onPreFillHabit }) => {
  const { dashboardData } = useHabits();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Habit & Productivity Coach. I have live access to your habit tracker data, completion rates, and active streaks.\n\nI can answer ANY question—from behavioral psychology (Atomic Habits, cues, friction) to routine planning, overcoming procrastination, or troubleshooting your specific habits. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Which habit needs the most attention?',
    'How do I overcome procrastination?',
    'Why am I losing my streak?',
    'Suggest a realistic morning routine',
    'Give me a dopamine reset strategy',
    'How did I perform this month?',
    'Deep work & focus framework',
  ];

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat session refreshed! What habit or productivity challenge would you like to tackle next?`,
      },
    ]);
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        source: res.source,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I could not process your query right now. Your tracking data is safe. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-surface h-full shadow-2xl flex flex-col border-l border-border relative">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-text-primary">
                  AI Habit Assistant
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Live & Data Synchronized" />
              </div>
              <p className="text-[11px] text-text-secondary">
                Answers all habit & productivity questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-200 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-2xs'
                    : 'bg-surface-muted text-text-primary rounded-tl-none border border-border/80 whitespace-pre-line shadow-2xs'
                }`}
              >
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-text-secondary text-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-accent flex items-center justify-center border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-surface-muted p-2.5 rounded-xl border border-border animate-pulse">
                Consulting behavioral models and your habit data...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-surface-muted/40 border-t border-border flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap bg-surface hover:bg-indigo-50 border border-border hover:border-indigo-300 text-text-secondary hover:text-accent px-2.5 py-1 rounded-full font-medium transition-colors flex-shrink-0 shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-border bg-surface flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about habits, psychology, or routines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-surface-muted border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-slate-900 text-white disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AIAssistantDrawer;
