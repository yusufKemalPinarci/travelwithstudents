import { useState, useEffect } from 'react';
import { ChevronRightIcon, PencilSquareIcon, StarIcon, BanknotesIcon, ArrowTrendingUpIcon, CalendarDaysIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getWalletStats, type WalletStats } from '../api/stats';
import { useAuth } from '../context/AuthContext';

export default function GuideWallet() {
  const { user } = useAuth();
  const [bankAccount, setBankAccount] = useState<{name: string, iban: string, bank: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.id) {
        setLoading(true);
        const data = await getWalletStats(user.id);
        if (data) {
          setStats(data);
        }
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading wallet info...</div>;
  }

  const transactions = stats ? stats.transactions : [];

  return (
    <div className="font-sans text-slate-900 dark:text-slate-100 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          <span>Dashboard</span>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
          <span className="text-blue-900">Earnings & Payouts</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-blue-900 tracking-tight">Earnings & Payouts</h1>
            <p className="text-slate-500 mt-1">Manage your income, track payouts, and analyze your tour performance.</p>
          </div>
          <div className="relative group">
            <button 
                disabled={!bankAccount || (stats?.totalBalance || 0) <= 0}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-orange-500/20"
                onClick={() => alert('Payout request feature coming soon!')}
            >
                <BanknotesIcon className="w-5 h-5" />
                Request Payout
            </button>
            {!bankAccount && (
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    Please add a bank account first.
                </div>
            )}
          </div>
        </div>
      </header>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-primary-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Balance</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">${stats?.totalBalance.toFixed(2) || '0.00'}</h3>
            <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
              Available to withdraw
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-primary-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Upcoming Payout</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">${stats?.upcomingPayout.toFixed(2) || '0.00'}</h3>
            <div className="flex items-center gap-1 text-slate-400 font-bold text-sm uppercase">
              <CalendarDaysIcon className="w-4 h-4" />
              {stats?.upcomingPayout && stats.upcomingPayout > 0 ? "Processing" : "No active payouts"}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-primary-600/5 rounded-full group-hover:scale-110 transition-transform"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Pending Earnings</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">${stats?.pendingEarnings.toFixed(2) || '0.00'}</h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <ClockIcon className="w-4 h-4" />
              {stats?.pendingToursCount || 0} tours in clearance
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction History Area - Replaces Chart */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-xl text-slate-900 dark:text-white">Transaction History</h3>
                 <button className="text-primary-600 font-bold text-sm hover:underline">Download CSV</button>
              </div>
              <div className="overflow-x-auto flex-1">
                 {transactions.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No transactions yet</div>
                 ) : (
                 <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                     <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-bold uppercase text-xs tracking-wider">
                         <tr>
                             <th className="px-6 py-4">ID</th>
                             <th className="px-6 py-4">Date</th>
                             <th className="px-6 py-4">Tour Name</th>
                             <th className="px-6 py-4">Amount</th>
                             <th className="px-6 py-4">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {transactions.map(trx => (
                             <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="px-6 py-4 font-mono font-medium text-xs">{trx.id}</td>
                                 <td className="px-6 py-4">{trx.date}</td>
                                 <td className="px-6 py-4 truncate max-w-[150px]">{trx.tour}</td>
                                 <td className={`px-6 py-4 font-bold ${trx.amount > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                     {trx.amount > 0 ? '+' : ''}${Math.abs(trx.amount).toFixed(2)}
                                 </td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                         ${trx.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                                           trx.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                                           'bg-slate-100 text-slate-800'}`}>
                                         {trx.status}
                                     </span>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                 )}
              </div>
           </div>
        </div>

        {/* Quick Actions / Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Payout Settings Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payout Settings</h3>
                
                {!bankAccount && !isEditing ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                        <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <BanknotesIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 mb-4">No bank account linked</p>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto hover:bg-slate-800"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Bank Account
                        </button>
                    </div>
                ) : isEditing ? (
                    <form 
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const formData = new FormData(form);
                            setBankAccount({
                                name: formData.get('name') as string,
                                bank: formData.get('bank') as string,
                                iban: formData.get('iban') as string
                            });
                            setIsEditing(false);
                        }}
                    >
                        <input type="text" name="name" placeholder="Account Holder Name" required className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50/50" />
                        <input type="text" name="bank" placeholder="Bank Name" required className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50/50" />
                        <input type="text" name="iban" placeholder="IBAN / Swift Code" required className="w-full text-sm p-3 rounded-lg border border-slate-200 bg-slate-50/50" />
                        <div className="flex gap-2 pt-2">
                             <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                             <button type="submit" className="flex-1 py-2 text-sm font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <BanknotesIcon className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">{bankAccount?.bank}</p>
                            <p className="text-lg font-mono tracking-wider mb-4">**** **** **** {bankAccount?.iban.slice(-4)}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Account Holder</p>
                                    <p className="font-bold text-sm">{bankAccount?.name}</p>
                                </div>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl flex flex-col items-center text-center text-white shadow-lg shadow-indigo-200">
            <StarIcon className="text-yellow-400 w-12 h-12 mb-3 drop-shadow-md" />
            <h4 className="font-bold text-lg text-white mb-1">Top Earners Bonus</h4>
            <p className="text-sm text-indigo-100 mb-6">
                {stats?.bonusProgress ? (
                  stats.bonusProgress.current >= stats.bonusProgress.target 
                   ? "You've unlocked the 5% bonus!" 
                   : `Complete ${stats.bonusProgress.target - stats.bonusProgress.current} more tours this month to unlock a 5% bonus!`
                ) : "Loading bonus status..."}
            </p>
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="bg-yellow-400 h-full shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${stats?.bonusProgress?.percentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
