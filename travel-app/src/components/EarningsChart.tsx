interface EarningsChartProps {
  data?: Array<{ month: string; amount: number }>;
}

export default function EarningsChart({ data }: EarningsChartProps) {
  // If no data, show empty state instead of mock
  if (!data || data.length === 0) {
    return (
      <div className="card-surface p-5 h-full flex flex-col items-center justify-center text-center">
        <h3 className="font-bold text-slate-900 mb-2">Earnings History</h3>
        <p className="text-slate-500 text-sm">No earnings data available yet.</p>
      </div>
    )
  }

  const chartData = data;
  
  const values = chartData.map(d => d.amount);
  const max = Math.max(...values, 10); // Minimum scale

  return (
    <div className="card-surface p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900">Earnings History</h3>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-2">
        {chartData.map((item, i) => {
           let height = "4px";
           if (max > 0) {
             const pct = (item.amount / max) * 100;
             height = `${pct === 0 ? 1 : pct}%`;
           }
           return (
             <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer relative">
               <div className="w-full flex items-end justify-center h-48 bg-slate-50 rounded-t-lg">
                 <div 
                   className="w-full mx-1 bg-primary-100 group-hover:bg-primary-200 transition-all rounded-t-md relative flex items-end" 
                   style={{ height }}
                 >
                    <div className="w-full bg-primary-500 rounded-t-md opacity-80 h-full"></div>
                 </div>
               </div>
                {/* Tooltip */}
                <div className="absolute -top-6 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
                ${item.amount}
                </div>
               <span className="text-xs text-slate-500 font-medium">
                 {item.month}
               </span>
             </div>
           )
        })}
      </div>
    </div>
  )
}
