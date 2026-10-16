import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Tag,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  FileSpreadsheet,
  X,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';

const CATEGORIES = [
  'All',
  'General',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Investment'
];

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Utilities': '#06b6d4',
  'Health': '#10b981',
  'Entertainment': '#8b5cf6',
  'Education': '#6366f1',
  'Investment': '#14b8a6',
  'General': '#64748b'
};

export const ExpenseHistoryPage = ({ onBackToDashboard }) => {
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'last30', 'year'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

  // Modal states for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete confirmation
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Fetch initial expenses and summary
  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const [listData, summaryData] = await Promise.all([
        api.getExpenses(),
        api.getExpenseSummary()
      ]);
      setExpenses(listData || []);
      setSummary(summaryData || null);
    } catch (err) {
      toast.error('Failed to load expense history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpensesData();
  }, []);

  // Filter & Sort Logic
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.description && e.description.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          e.amount.toString().includes(q)
      );
    }

    // 2. Category
    if (selectedCategory !== 'All') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // 3. Time Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      result = result.filter((e) => {
        const itemDate = new Date(e.date);
        if (timeFilter === 'today') {
          return itemDate.toDateString() === now.toDateString();
        }
        if (timeFilter === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= oneWeekAgo;
        }
        if (timeFilter === 'month') {
          return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          );
        }
        if (timeFilter === 'last30') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= thirtyDaysAgo;
        }
        if (timeFilter === 'year') {
          return itemDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, search, selectedCategory, timeFilter, sortBy]);

  // Aggregate Metrics based on filtered items
  const stats = useMemo(() => {
    const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = filteredExpenses.length;
    const avgExpense = count > 0 ? totalSpent / count : 0;

    // Category breakdown
    const categoryTotals = {};
    filteredExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([cat, total]) => ({
        category: cat,
        total,
        percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
        color: CATEGORY_COLORS[cat] || '#64748b'
      }))
      .sort((a, b) => b.total - a.total);

    const topCategory = categoryBreakdown[0] || null;

    return {
      totalSpent,
      count,
      avgExpense,
      categoryBreakdown,
      topCategory
    };
  }, [filteredExpenses]);

  // Handle Form Open (New or Edit)
  const openAddModal = () => {
    setEditingExpense(null);
    setFormAmount('');
    setFormCategory('General');
    setFormDescription('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormAmount(expense.amount.toString());
    setFormCategory(expense.category || 'General');
    setFormDescription(expense.description || '');
    setFormDate(new Date(expense.date).toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  // Submit Expense Form
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    const val = parseFloat(formAmount);
    if (isNaN(val) || val <= 0) {
      toast.warning('Please enter a valid expense amount.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense.id, {
          amount: val,
          category: formCategory,
          description: formDescription,
          date: formDate
        });
        toast.success(`Updated expense: ₹${val.toFixed(2)} (${formCategory})`);
      } else {
        await api.addExpense({
          amount: val,
          category: formCategory,
          description: formDescription,
          date: formDate
        });
        toast.success(`Recorded expense: ₹${val.toFixed(2)} (${formCategory})`);
      }
      setIsModalOpen(false);
      await loadExpensesData();
    } catch (err) {
      toast.error('Failed to save expense. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Expense Confirmation
  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await api.deleteExpense(expenseToDelete.id);
      toast.info('Expense entry removed from history.');
      setExpenseToDelete(null);
      await loadExpensesData();
    } catch (err) {
      toast.error('Failed to delete expense.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.warning('No expenses to export.');
      return;
    }

    let csv = 'Date,Category,Description,Amount (INR)\n';
    filteredExpenses.forEach((e) => {
      const d = new Date(e.date).toISOString().slice(0, 10);
      const desc = (e.description || '').replace(/"/g, '""');
      csv += `"${d}","${e.category}","${desc}",${e.amount.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Expense history exported to CSV.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans pb-16">
      {/* Top Banner Navigation Bar */}
      <div className="bg-surface border-b border-border sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl border border-border bg-surface-muted hover:bg-surface text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Return to Habit Tracker Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Tracker</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-text-primary tracking-tight">
                  Expense Tracker History
                </h1>
                <p className="text-[10px] sm:text-xs text-text-secondary hidden xs:block">
                  Complete financial logs & spending distribution in ₹
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text-secondary hover:text-text-primary text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export filtered records to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={loadExpensesData}
              className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openAddModal}
              className="py-2 px-3 sm:px-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 1. Executive Analytics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Spending */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Total Expenses
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-text-primary tracking-tight">
                ₹{stats.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                Across {stats.count} recorded transaction{stats.count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Card 2: This Month's Spending */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                This Month
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-text-primary tracking-tight">
                ₹{(summary?.monthlyTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                Last month: ₹{(summary?.lastMonthTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Card 3: Average Transaction */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Average Expense
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-text-primary tracking-tight">
                ₹{stats.avgExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                Per logged transaction
              </div>
            </div>
          </div>

          {/* Card 4: Top Category */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-text-secondary mb-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Top Category
              </span>
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Tag className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-text-primary tracking-tight truncate">
                {stats.topCategory ? stats.topCategory.category : 'None'}
              </div>
              <div className="text-[11px] text-text-secondary mt-1">
                {stats.topCategory
                  ? `₹${stats.topCategory.total.toFixed(2)} (${stats.topCategory.percentage}%)`
                  : 'No categories logged yet'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visual Charts Row (Trend & Category Share) */}
        {summary?.monthlyComparison?.length > 0 && stats.totalSpent > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Trend Chart (2 cols) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-border shadow-soft">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Monthly Spending Trend</span>
              </h3>
              <div className="h-48 sm:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthlyComparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Total']}
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Progress Bars (1 col) */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-soft flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" />
                  <span>Category Breakdown</span>
                </h3>
                <div className="space-y-3 mt-4 max-h-48 overflow-y-auto pr-1">
                  {stats.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-text-primary flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{cat.category}</span>
                        </span>
                        <span className="text-text-secondary font-medium">
                          ₹{cat.total.toFixed(2)} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-text-secondary mt-4 border-t border-border pt-2 text-center">
                Visualizing distribution of active filtered expenses
              </p>
            </div>
          </div>
        )}

        {/* 3. Toolbar: Search, Filters & Sorting Controls */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by note, category or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-surface-muted border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-text-secondary/60"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="py-2 px-3 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Time Filter Dropdown */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              aria-label="Filter by time"
              className="py-2 px-3 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month</option>
              <option value="last30">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>

            {/* Sort By Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort expenses"
              className="py-2 px-3 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* 4. Complete Expense History Table & List */}
        <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-text-primary">
                {expenses.length === 0 ? 'No expenses recorded yet' : 'No matching expenses found'}
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
                {expenses.length === 0
                  ? 'Start by logging your daily expenses to see a complete ledger and financial insights in ₹.'
                  : 'Try clearing your search query or adjusting your category/time filters.'}
              </p>
              <div className="mt-5">
                {expenses.length === 0 ? (
                  <button
                    onClick={openAddModal}
                    className="py-2 px-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log First Expense</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCategory('All');
                      setTimeFilter('all');
                    }}
                    className="py-2 px-3 rounded-xl border border-border text-xs font-bold text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 text-text-secondary font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredExpenses.map((expense) => {
                    const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const color = CATEGORY_COLORS[expense.category] || '#64748b';

                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-surface-muted/40 transition-colors group"
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-text-secondary/70" />
                            <span>{formattedDate}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                            style={{
                              backgroundColor: `${color}15`,
                              borderColor: `${color}35`,
                              color: color
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span>{expense.category}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-text-primary font-medium max-w-xs truncate">
                          {expense.description ? (
                            <span>{expense.description}</span>
                          ) : (
                            <span className="text-text-secondary/50 italic">No description</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-black text-sm text-text-primary">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(expense)}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-indigo-600 hover:bg-surface-muted transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpenseToDelete(expense)}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Expense Modal Dialog */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-text-primary">
                  {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
                </h3>
                <p className="text-xs text-text-secondary">
                  Track transaction details, category, and date in ₹
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              {/* Amount */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-text-primary mb-1">
                  Description / Notes <span className="text-text-secondary font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Groceries, Metro Pass, Cloud Server"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-text-secondary/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-primary font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm cursor-pointer"
                >
                  {formSubmitting
                    ? 'Saving...'
                    : editingExpense
                    ? 'Update Expense'
                    : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense Entry?"
        message={`Are you sure you want to remove the expense of ₹${expenseToDelete?.amount.toFixed(2)} (${expenseToDelete?.category})? This will update your total analytics.`}
        confirmText="Delete Entry"
        variant="danger"
      />
    </div>
  );
};

export default ExpenseHistoryPage;
