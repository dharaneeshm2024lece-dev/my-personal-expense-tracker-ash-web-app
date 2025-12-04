import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  PieChart,
  DollarSign,
  Calendar,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  User,
  LogOut,
  Mail,
  Lock,
  ChevronDown,
  Shield
} from 'lucide-react';

/**
 * DEVOPS TRAINING NOTE:
 * ---------------------
 * Currently, this app uses 'localStorage' to simulate a database so you can 
 * see it working immediately in this preview.
 * * * TO CONNECT TO YOUR AWS BACKEND:
 * 1. Set 'USE_MOCK_API' to false below.
 * 2. Set 'API_BASE_URL' to your EC2 public IP or Load Balancer URL.
 * e.g., const API_BASE_URL = "http://54.123.45.67:5000/api";
 */

const USE_MOCK_API = false;
const API_BASE_URL = "http://localhost:5000/api"; // Change this for production

// --- MOCK API SERVICE ---
const mockApi = {
  fetchExpenses: async () => {
    return JSON.parse(localStorage.getItem('expenses') || '[]');
  },
  addExpense: async (expense) => {
    const current = JSON.parse(localStorage.getItem('expenses') || '[]');
    const newExpense = { ...expense, _id: Date.now().toString(), date: new Date().toISOString() };
    const updated = [newExpense, ...current];
    localStorage.setItem('expenses', JSON.stringify(updated));
    return newExpense;
  },
  deleteExpense: async (id) => {
    const current = JSON.parse(localStorage.getItem('expenses') || '[]');
    const updated = current.filter(e => e._id !== id);
    localStorage.setItem('expenses', JSON.stringify(updated));
    return id;
  },
  // Mock Auth Methods
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Accept any login for demo
    return {
      id: "user_123",
      name: "DevOps Engineer",
      email: credentials.email,
      role: "Admin",
      joined: new Date().toISOString()
    };
  }
};

// --- REAL API SERVICE ---
const realApi = {
  // Helper to get headers with token
  getHeaders: () => {
    const user = JSON.parse(localStorage.getItem('tracker_user'));
    return {
      'Content-Type': 'application/json',
      'Authorization': user ? user.token : ''
    };
  },

  fetchExpenses: async () => {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      headers: realApi.getHeaders()
    });
    return await res.json();
  },
  addExpense: async (expense) => {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: realApi.getHeaders(),
      body: JSON.stringify(expense)
    });
    return await res.json();
  },
  deleteExpense: async (id) => {
    await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: realApi.getHeaders()
    });
    return id;
  },
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return await res.json();
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }
    return await res.json();
  }
};
const api = USE_MOCK_API ? mockApi : realApi;

// --- SHARED COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
      ? 'bg-indigo-600 text-white shadow-md'
      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
  >
    {children}
  </button>
);

// --- AUTH COMPONENT ---

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // LOGIN FLOW
        const data = await api.login({ email: formData.email, password: formData.password });
        // The backend now returns { token, user: {...} }
        // We combine them to store in local storage
        onLogin({ ...data.user, token: data.token });
      } else {
        // REGISTER FLOW
        await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        alert("Account created! Please sign in.");
        setIsLogin(true); // Switch to login mode
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Personal Expenses Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          MERN Stack Training Environment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  {isLogin ? 'New to the platform?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                {isLogin ? 'Create an account' : 'Sign in existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PROFILE MODAL ---
const ProfileModal = ({ user, onClose, onLogout }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto text-indigo-600 text-2xl font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="mt-4 text-xl font-bold text-white">{user.name}</h3>
          <p className="text-indigo-200 text-sm">{user.email}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Role</span>
            <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs">{user.role || 'User'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-sm">User ID</span>
            <span className="font-mono text-xs text-slate-400">{user.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Joined</span>
            <span className="font-medium text-slate-800 text-sm">{new Date(user.joined || Date.now()).toLocaleDateString()}</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-3 rounded-lg transition-colors font-medium border border-red-100"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [timeRange, setTimeRange] = useState("monthly");

  // Check for persisted user
  useEffect(() => {
    const savedUser = localStorage.getItem('tracker_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch Data when user is logged in
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.fetchExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('tracker_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tracker_user');
    setShowProfile(false);
  };

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense"
  });

  const categories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Healthcare", "Salary", "Stocks", "Crypto", "Savings"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    try {
      const newExp = await api.addExpense({ ...formData, amount: Number(formData.amount) });
      setExpenses(prev => [newExp, ...prev]);
      setFormData({ title: "", amount: "", category: "Food", type: "expense" });
      setIsFormOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) { console.error(err); }
  };

  // Calculations
  const timeFilteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(item => {
      const itemDate = new Date(item.date);
      if (timeRange === 'daily') return itemDate.toDateString() === now.toDateString();
      if (timeRange === 'monthly') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      if (timeRange === 'yearly') return itemDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [expenses, timeRange]);

  const stats = useMemo(() => {
    return timeFilteredExpenses.reduce((acc, curr) => {
      const amt = Number(curr.amount);
      switch (curr.type) {
        case 'income': acc.totalIncome += amt; acc.totalBalance += amt; break;
        case 'expense': acc.totalExpense += amt; acc.totalBalance -= amt; break;
        case 'investment': acc.totalInvested += amt; acc.totalBalance -= amt; break;
        case 'withdrawal': acc.totalWithdrawn += amt; acc.totalBalance += amt; break;
        default: break;
      }
      return acc;
    }, { totalBalance: 0, totalIncome: 0, totalExpense: 0, totalInvested: 0, totalWithdrawn: 0 });
  }, [timeFilteredExpenses]);

  const filteredList = filterCategory === "All"
    ? timeFilteredExpenses
    : timeFilteredExpenses.filter(e => e.category === filterCategory);

  const getIcon = (type) => {
    switch (type) {
      case 'income': return <ArrowUpCircle size={20} />;
      case 'expense': return <Tag size={20} />;
      case 'investment': return <TrendingUp size={20} />;
      case 'withdrawal': return <TrendingDown size={20} />;
      default: return <Tag size={20} />;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-600';
      case 'expense': return 'bg-red-100 text-red-600';
      case 'investment': return 'bg-purple-100 text-purple-600';
      case 'withdrawal': return 'bg-orange-100 text-orange-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // If not logged in, show Auth Screen
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* Header */}
      <div className="bg-indigo-600 text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
              Personal Expenses Tracker
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1">Developed by Thanvir Assif</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-2 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add</span>
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 pl-2 pr-3 py-1.5 rounded-full transition-colors border border-indigo-500"
            >
              <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-white">{user.name}</p>
                <p className="text-[10px] text-indigo-200">{user.role || 'User'}</p>
              </div>
              <ChevronDown size={14} className="text-indigo-200" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="max-w-5xl mx-auto mt-6 flex justify-center md:justify-start gap-2 overflow-x-auto">
          <TabButton active={timeRange === 'daily'} onClick={() => setTimeRange('daily')}>Daily</TabButton>
          <TabButton active={timeRange === 'monthly'} onClick={() => setTimeRange('monthly')}>Monthly</TabButton>
          <TabButton active={timeRange === 'yearly'} onClick={() => setTimeRange('yearly')}>Yearly</TabButton>
          <TabButton active={timeRange === 'all'} onClick={() => setTimeRange('all')}>All Time</TabButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 space-y-6">

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex flex-col justify-between border-l-4 border-l-indigo-500">
            <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Wallet size={16} /> Net Balance
            </span>
            <span className={`text-3xl font-bold mt-2 ${stats.totalBalance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
              ${stats.totalBalance.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 mt-2">Cash on hand</span>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <ArrowUpCircle size={20} />
              </div>
              <span className="text-slate-500 text-sm font-medium">Total Income</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">${stats.totalIncome.toFixed(2)}</span>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <ArrowDownCircle size={20} />
              </div>
              <span className="text-slate-500 text-sm font-medium">Total Expenses</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">${stats.totalExpense.toFixed(2)}</span>
          </Card>
        </div>

        {/* Investment Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-purple-50/50 border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-purple-600 text-sm font-bold flex items-center gap-2 mb-1">
                  <TrendingUp size={16} /> Total Invested
                </span>
                <span className="text-2xl font-bold text-slate-800">${stats.totalInvested.toFixed(2)}</span>
              </div>
              <div className="text-purple-300">
                <PieChart size={40} />
              </div>
            </div>
          </Card>

          <Card className="bg-orange-50/50 border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-orange-600 text-sm font-bold flex items-center gap-2 mb-1">
                  <TrendingDown size={16} /> Withdrawn (Gains)
                </span>
                <span className="text-2xl font-bold text-slate-800">${stats.totalWithdrawn.toFixed(2)}</span>
              </div>
              <div className="text-orange-300">
                <DollarSign size={40} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Transactions ({timeRange})
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-md py-1 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading transactions...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500">No transactions found for this period.</p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="text-indigo-600 font-medium text-sm mt-2 hover:underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              filteredList.map((expense) => (
                <div key={expense._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColorClass(expense.type)}`}>
                      {getIcon(expense.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{expense.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{new Date(expense.date || Date.now()).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{expense.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${(expense.type === 'income' || expense.type === 'withdrawal') ? 'text-green-600' : 'text-slate-900'
                      }`}>
                      {(expense.type === 'income' || expense.type === 'withdrawal') ? '+' : '-'}${Number(expense.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Add Transaction Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Add Transaction</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. AWS Invoice"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="investment">Investment (Out)</option>
                    <option value="withdrawal">Withdrawal (In)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`text-xs py-2 px-1 rounded-md border transition-all ${formData.category === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 transition-colors shadow-lg shadow-indigo-200"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}