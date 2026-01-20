export default function EarningsChart() {
  const data = [40, 65, 45, 90, 75, 55, 80];
  const max = Math.max(...data);

  return (
    <div className="card-surface p-5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900">Weekly Earnings</h3>
        <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer">
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-2">
        {data.map((value, i) => {
           const height = `${(value / max) * 100}%`;
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
                ${value * 2.5}
                </div>
               <span className="text-xs text-slate-500 font-medium">
                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
               </span>
             </div>
           )
        })}
      </div>
    </div>
  )
}
