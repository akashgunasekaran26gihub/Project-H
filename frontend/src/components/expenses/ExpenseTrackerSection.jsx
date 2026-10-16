import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

const defaultSummary = {
  dailyTotal: 0,
  weeklyTotal: 0,
  monthlyTotal: 0,
  monthlyAverage: 0,
  monthlyComparison: [
    { month: 'M1', total: 0 },
    { month: 'M2', total: 0 },
    { month: 'M3', total: 0 },
    { month: 'M4', total: 0 },
    { month: 'M5', total: 0 },
    { month: 'M6', total: 0 }
  ]
};

const ExpenseTrackerSection = ({ onViewExpenseHistory }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState(defaultSummary);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const summaryData = await api.getExpenseSummary();
      if (summaryData) {
        setSummary(summaryData);
      }
      const listData = await api.getExpenses();
      if (listData) {
        setExpenses(listData);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount) return;
    const expenseVal = parseFloat(amount);
    if (isNaN(expenseVal) || expenseVal <= 0) {
      toast.warning('Please enter a valid expense amount.');
      return;
    }
    setLoading(true);
    try {
      await api.addExpense({ amount, category, description });
      toast.success(`Expense of ₹${expenseVal.toFixed(2)} recorded for ${category}.`);
      setAmount('');
      setDescription('');
      await fetchData();
    } catch (err) {
      toast.error('Failed to add expense.');
      console.error('Failed to add expense', err);
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.deleteExpense(id);
      toast.info('Expense entry removed.');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete expense.');
      console.error('Failed to delete expense', err);
    }
  };

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-3 rounded-xl shadow-lg">
          <p className="text-text-secondary text-xs mb-1 font-medium">{label}</p>
          <p className="text-emerald-600 font-bold text-lg">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft mb-6 sm:mb-8 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
              EXPENSE TRACKER
            </h2>
            <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
              Track and analyze your spending in ₹
            </p>
          </div>
        </div>

        {onViewExpenseHistory && (
          <button
            onClick={onViewExpenseHistory}
            className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text-primary text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-emerald-500/50"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Full History & Breakdown →</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 bg-background custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Left Side: Add Expense & History */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            
            {/* Add Expense Form */}
            <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
              <h3 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-emerald-500"/> Add Expense
              </h3>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-background border border-border rounded-md pl-6 pr-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase tracking-wider">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    <option value="General">General</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary mb-1 uppercase tracking-wider">Description <span className="font-normal opacity-70">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    placeholder="What was this for?"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 mt-1 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Plus className="w-3.5 h-3.5" />} 
                  {loading ? 'Processing...' : 'Record'}
                </button>
              </form>
            </div>

            {/* History */}
            <div className="bg-surface p-4 rounded-xl border border-border shadow-xs flex-1 flex flex-col min-h-[220px]">
              <h3 className="text-xs font-bold text-text-primary mb-3">Recent Expenses</h3>
              <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                {expenses.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
                    <Wallet className="w-8 h-8 text-text-secondary mb-3" />
                    <p className="text-text-secondary text-xs">No expenses recorded yet.</p>
                  </div>
                ) : (
                  expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border hover:border-emerald-500/40 transition-all group">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 font-bold text-xs">
                          ₹
                        </div>
                        <div>
                          <p className="font-bold text-text-primary text-[13px]">{expense.category}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5 truncate max-w-[120px] sm:max-w-[150px]">
                            {new Date(expense.date).toLocaleDateString()} {expense.description && `• ${expense.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary text-xs">
                          ₹{expense.amount.toFixed(2)}
                        </span>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Expense"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Side: Analysis & Charts */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-surface rounded-lg p-3 sm:p-4 border border-border shadow-xs flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:scale-110 transition-transform">
                  <Calendar className="w-16 h-16" />
                </div>
                <p className="text-[10px] text-text-secondary font-bold mb-0.5 uppercase tracking-wider">Daily Total</p>
                <p className="text-lg sm:text-xl font-black text-text-primary">₹{summary.dailyTotal.toFixed(2)}</p>
              </div>
              <div className="bg-surface rounded-lg p-3 sm:p-4 border border-border shadow-xs flex flex-col justify-center">
                <p className="text-[10px] text-text-secondary font-bold mb-0.5 uppercase tracking-wider">Weekly Total</p>
                <p className="text-lg sm:text-xl font-black text-text-primary">₹{summary.weeklyTotal.toFixed(2)}</p>
              </div>
              <div className="bg-surface rounded-lg p-3 sm:p-4 border border-border shadow-xs flex flex-col justify-center">
                <p className="text-[10px] text-text-secondary font-bold mb-0.5 uppercase tracking-wider">Monthly Total</p>
                <p className="text-lg sm:text-xl font-black text-text-primary">₹{summary.monthlyTotal.toFixed(2)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-3 sm:p-4 border border-emerald-500/20 shadow-xs flex flex-col justify-center relative overflow-hidden">
                <p className="text-[10px] text-emerald-700 font-bold mb-0.5 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3"/> Monthly Avg
                </p>
                <p className="text-lg sm:text-xl font-black text-emerald-600">₹{summary.monthlyAverage.toFixed(2)}</p>
              </div>
            </div>

            {/* Professional Recharts Graph */}
            <div className="bg-surface rounded-lg p-4 border border-border shadow-xs flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-text-primary">6-Month Spending Trend</h3>
                <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 uppercase tracking-wide">
                  INR (₹)
                </span>
              </div>
              
              <div className="flex-1 w-full relative">
                {summary.monthlyComparison.every(m => m.total === 0) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 rounded-lg border border-dashed border-border z-10 backdrop-blur-[1px]">
                    <TrendingUp className="w-8 h-8 text-text-secondary mb-2 opacity-50" />
                    <p className="text-sm text-text-secondary font-medium">Add expenses to see your spending trend</p>
                  </div>
                ) : null}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                      tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-muted)', opacity: 0.4 }} />
                    <Bar 
                      dataKey="total" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={60}
                      animationDuration={1500}
                    >
                      {summary.monthlyComparison.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === summary.monthlyComparison.length - 1 ? '#10b981' : '#34d399'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpenseTrackerSection;
