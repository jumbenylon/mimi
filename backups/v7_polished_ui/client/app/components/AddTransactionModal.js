"use client";
import { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Transport');
  const [loanType, setLoanType] = useState('LOLC'); // Default if Loan is selected
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    
    // If it's a loan repayment, tag it specifically so the backend knows
    let finalCategory = category;
    if (category === 'Repayment') {
        finalCategory = `Repayment: ${loanType}`;
    }

    const payload = {
      description: desc || (category === 'Repayment' ? `Manual ${loanType} Payment` : 'Cash Expense'),
      amount: parseFloat(amount),
      category: finalCategory,
      date: new Date().toISOString().split('T')[0]
    };

    await fetch('http://localhost:8000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    setAmount('');
    setDesc('');
    setCategory('Transport');
    onSuccess();
    onClose();
  };

  const categories = ['Food', 'Transport', 'Lifestyle', 'Utilities', 'Business', 'Repayment'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-all animate-in slide-in-from-bottom-10">
        
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-gray-900">Add Transaction</h3>
           <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
        </div>

        <div className="space-y-4">
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Amount (TZS)</label>
              <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full text-4xl font-black text-gray-900 border-b-2 border-gray-100 focus:border-red-500 outline-none py-2 placeholder:text-gray-200"
                autoFocus
              />
           </div>

           {/* IF LOAN REPAYMENT, SHOW LOAN SELECTOR */}
           {category === 'Repayment' ? (
             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <label className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 mb-2">
                    <Zap size={12} /> Select Loan
                </label>
                <div className="flex gap-2">
                    {['LOLC', 'Contract'].map(l => (
                        <button
                            key={l}
                            onClick={() => setLoanType(l)}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loanType === l ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
             </div>
           ) : (
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
                <input 
                    type="text" 
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="e.g. Lunch"
                    className="w-full bg-gray-50 rounded-xl p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-red-100"
                />
             </div>
           )}

           <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setCategory(cat)}
                     className={`py-2 text-xs font-bold rounded-lg transition-all ${category === cat ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <button 
             onClick={handleSubmit}
             disabled={!amount || loading}
             className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-200"
           >
             {loading ? 'Saving...' : <><Check size={20} /> Save Transaction</>}
           </button>
        </div>
      </div>
    </div>
  );
}
