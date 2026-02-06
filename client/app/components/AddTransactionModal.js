"use client";
import { useState } from 'react';
import { X, Check, DollarSign, TrendingUp, Hash } from 'lucide-react';

export default function AddTransactionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [type, setType] = useState('Expense'); 
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Groceries');
  
  // Investment Specific
  const [assetName, setAssetName] = useState('CRDB'); 
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);

  // Auto-calculate total for investment
  const totalInvest = type === 'Investment' ? (qty * price) : amount;

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      description: desc || (type === 'Investment' ? `Buy ${assetName}` : 'Expense'),
      amount: parseFloat(totalInvest),
      category: type === 'Income' ? 'Income' : type === 'Repayment' ? 'Debt Repayment' : type === 'Investment' ? 'Investment' : category,
      date: new Date().toISOString().split('T')[0],
      asset_name: type === 'Investment' ? assetName : null,
      quantity: type === 'Investment' ? parseFloat(qty) : 0,
      buy_price: type === 'Investment' ? parseFloat(price) : 0
    };

    await fetch('http://localhost:8000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    window.location.reload(); 
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">New Transaction</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
        </div>

        {/* Type Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          {['Expense', 'Income', 'Repayment', 'Investment'].map((t) => (
            <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition ${type === t ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
              {t === 'Investment' ? 'Invest' : t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          
          {/* INVESTMENT FORM */}
          {type === 'Investment' ? (
            <>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Select Asset</label>
                <select value={assetName} onChange={e => setAssetName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 mt-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black">
                  <optgroup label="Banks & Finance">
                    <option value="CRDB">CRDB Bank</option>
                    <option value="NMB">NMB Bank</option>
                    <option value="DCB">DCB Commercial Bank</option>
                    <option value="MBP">Maendeleo Bank</option>
                    <option value="MCB">Mwalimu Commercial Bank</option>
                    <option value="MKCB">Mkombozi Commercial Bank</option>
                    <option value="TICL">Tanzania Insurance (TICL)</option>
                  </optgroup>
                  <optgroup label="Industrial & Allied">
                    <option value="TCCL">Simba Cement (TCCL)</option>
                    <option value="TPCC">Twiga Cement (TPCC)</option>
                    <option value="TOL">TOL Gases</option>
                    <option value="TBL">Tanzania Breweries (TBL)</option>
                    <option value="TCC">Tanzania Cigarette (TCC)</option>
                    <option value="SWIS">Swissport Tanzania</option>
                    <option value="NICO">NICO (Investment)</option>
                    <option value="VODA">Vodacom Tanzania</option>
                    <option value="PAL">Precision Air</option>
                    <option value="SWALA">Swala Oil & Gas</option>
                  </optgroup>
                  <optgroup label="Cross Listed">
                    <option value="EABL">East African Breweries</option>
                    <option value="JHL">Jubilee Holdings</option>
                    <option value="KA">Kenya Airways</option>
                    <option value="KCB">KCB Group</option>
                    <option value="NMG">Nation Media Group</option>
                    <option value="USL">Uchumi Supermarkets</option>
                  </optgroup>
                  <optgroup label="UTT AMIS Funds">
                    <option value="Umoja Unit Trust">Umoja Fund</option>
                    <option value="Wekeza Maisha">Wekeza Maisha</option>
                    <option value="Watoto Fund">Watoto Fund</option>
                    <option value="Jikimu Fund">Jikimu Fund</option>
                    <option value="Liquid Fund">Liquid Fund</option>
                    <option value="Bond Fund">Bond Fund</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Quantity</label>
                    <div className="relative mt-1">
                       <Hash className="absolute left-4 top-3.5 text-gray-400" size={16} />
                       <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Price / Share</label>
                    <div className="relative mt-1">
                       <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={16} />
                       <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" />
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                 <span className="text-xs font-bold text-gray-500 uppercase">Total Cost</span>
                 <span className="text-xl font-black text-gray-900">{(qty * price).toLocaleString()}</span>
              </div>
            </>
          ) : (
            /* STANDARD FORM */
            <>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Amount</label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 font-bold text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" placeholder="0" autoFocus />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 mt-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black" placeholder="Fuel, Salary, Loan..." />
              </div>
              {type === 'Expense' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 mt-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black">
                    <option>Transport & Fuel</option>
                    <option>Food & Groceries</option>
                    <option>Utilities</option>
                    <option>Entertainment</option>
                    <option>Fitness & Health</option>
                    <option>Family Support</option>
                    <option>Other</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full mt-8 bg-black text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50">
          {loading ? 'Processing...' : <><Check size={18} /> Confirm Transaction</>}
        </button>

      </div>
    </div>
  );
}
