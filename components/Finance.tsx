
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Expense, Visit } from '../types';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Finance: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Clinic Maintenance',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [expData, visitData] = await Promise.all([
      StorageService.getExpenses(),
      StorageService.getVisits()
    ]);
    setExpenses(expData);
    setVisits(visitData);
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    await StorageService.addExpense({
      title: newExpense.title,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      notes: newExpense.notes
    });

    await loadData();
    setShowAddModal(false);
    setNewExpense({
      title: '',
      amount: '',
      category: 'Clinic Maintenance',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense record?')) {
      await StorageService.deleteExpense(id);
      loadData();
    }
  };

  // Calculations
  const totalIncome = visits.reduce((sum, v) => sum + (v.fees || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // Chart Data Preparation (Last 7 days simplified)
  const chartData = [
    { name: 'Income', amount: totalIncome, fill: '#10b981' },
    { name: 'Expense', amount: totalExpenses, fill: '#ef4444' },
  ];

  if (loading) return <div className="p-8">Loading Finance Data...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Finance & Billing</h2>
          <p className="text-slate-500 text-sm">Track clinic earnings and expenses</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> Log Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-green-600 font-medium text-sm">Total Income</p>
            <h3 className="text-3xl font-bold text-green-800 mt-1">₹{totalIncome.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-red-600 font-medium text-sm">Total Expenses</p>
            <h3 className="text-3xl font-bold text-red-800 mt-1">₹{totalExpenses.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-blue-600 font-medium text-sm">Net Profit</p>
            <h3 className="text-3xl font-bold text-blue-800 mt-1">₹{netProfit.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Expenses</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                 <tr>
                   <th className="p-4">Date</th>
                   <th className="p-4">Title</th>
                   <th className="p-4">Category</th>
                   <th className="p-4 text-right">Amount</th>
                   <th className="p-4 w-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {expenses.length === 0 ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-400">No expenses logged yet.</td></tr>
                 ) : (
                   expenses.map(exp => (
                     <tr key={exp.id} className="hover:bg-slate-50">
                       <td className="p-4 text-sm text-slate-600">{exp.date}</td>
                       <td className="p-4 font-medium text-slate-800">{exp.title}</td>
                       <td className="p-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{exp.category}</span></td>
                       <td className="p-4 text-right font-bold text-red-600">-₹{exp.amount}</td>
                       <td className="p-4">
                         <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
           <h3 className="font-bold text-slate-800 mb-6">Financial Overview</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={50} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 text-center text-sm text-slate-500">
             Income vs Expenses All Time
           </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Log New Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expense Title</label>
                <input required value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Electricity Bill" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input type="number" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                   <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full p-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full p-2 border rounded">
                  <option>Clinic Maintenance</option>
                  <option>Medicine Stock</option>
                  <option>Salary/Wages</option>
                  <option>Rent/Utilities</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                 <textarea value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} className="w-full p-2 border rounded" rows={2} />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 mt-2">
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
