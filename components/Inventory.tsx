
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { InventoryItem } from '../types';
import { Plus, Search, AlertTriangle, Edit2, Trash2, Filter, Save, X } from 'lucide-react';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const data = await StorageService.getInventory();
    setItems(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    await StorageService.saveInventoryItem(editingItem);
    await loadInventory();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Delete this medicine from inventory?')) {
      await StorageService.deleteInventoryItem(id);
      loadInventory();
    }
  };

  const openAddModal = () => {
    setEditingItem({ name: '', potency: '30', type: 'Dilution', quantity: 1, minLevel: 5 });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const lowStockCount = items.filter(i => i.quantity <= i.minLevel).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pharmacy Inventory</h2>
          <p className="text-slate-500 text-sm">Manage stock, potencies, and shortages</p>
        </div>
        <div className="flex gap-4">
           {lowStockCount > 0 && (
             <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold animate-pulse">
               <AlertTriangle size={18} /> {lowStockCount} Items Low Stock
             </div>
           )}
           <button 
             onClick={openAddModal}
             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
           >
             <Plus size={20} /> Add Medicine
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search medicine name..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
             />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg outline-none text-sm bg-slate-50"
            >
              <option value="All">All Types</option>
              <option value="Dilution">Dilution</option>
              <option value="Mother Tincture">Mother Tincture</option>
              <option value="Bio-Chemic">Bio-Chemic</option>
              <option value="Ointment">Ointment</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
               <tr>
                 <th className="p-4">Medicine Name</th>
                 <th className="p-4">Potency</th>
                 <th className="p-4">Type</th>
                 <th className="p-4 text-center">Quantity (Bottles)</th>
                 <th className="p-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {loading ? (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading inventory...</td></tr>
               ) : filteredItems.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">No medicines found.</td></tr>
               ) : (
                 filteredItems.map(item => (
                   <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="p-4 font-medium text-slate-800">{item.name}</td>
                     <td className="p-4 text-slate-600">{item.potency}</td>
                     <td className="p-4">
                       <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">{item.type}</span>
                     </td>
                     <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.quantity <= item.minLevel ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                          {item.quantity}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{editingItem.id ? 'Edit Medicine' : 'Add Medicine'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                <input required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g. Arnica Mont" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Potency</label>
                    <input list="potencies" value={editingItem.potency} onChange={e => setEditingItem({...editingItem, potency: e.target.value})} className="w-full p-2 border rounded" />
                    <datalist id="potencies">
                      <option value="Q (Mother Tincture)" />
                      <option value="6C" />
                      <option value="30C" />
                      <option value="200C" />
                      <option value="1M" />
                      <option value="10M" />
                    </datalist>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value as any})} className="w-full p-2 border rounded">
                       <option value="Dilution">Dilution</option>
                       <option value="Mother Tincture">Mother Tincture</option>
                       <option value="Bio-Chemic">Bio-Chemic</option>
                       <option value="Ointment">Ointment</option>
                       <option value="Other">Other</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Quantity</label>
                    <input type="number" required value={editingItem.quantity} onChange={e => setEditingItem({...editingItem, quantity: Number(e.target.value)})} className="w-full p-2 border rounded" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Level</label>
                    <input type="number" required value={editingItem.minLevel} onChange={e => setEditingItem({...editingItem, minLevel: Number(e.target.value)})} className="w-full p-2 border rounded" />
                 </div>
              </div>
              
              <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 mt-4 flex items-center justify-center gap-2">
                <Save size={18} /> Save Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
