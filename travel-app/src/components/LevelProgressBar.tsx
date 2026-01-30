type LevelProgressBarProps = {
  level: number;
  currentExp: number;
  maxExp: number;
  title?: string;
};

export default function LevelProgressBar({ level, currentExp, maxExp, title = 'Rising Star' }: LevelProgressBarProps) {
  const percentage = Math.min((currentExp / maxExp) * 100, 100);

  return (
    <div className="card-surface p-5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-700 font-black text-xs px-2 py-0.5 rounded uppercase tracking-wider">
            Level {level}
          </span>
          <span className="text-sm font-bold text-slate-900">{title}</span>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {currentExp} / {maxExp} XP
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-xs text-slate-500 mt-2">
        Earn <strong>{maxExp - currentExp} XP</strong> more to reach Level {level + 1} and unlock lower platform fees!
      </p>
    </div>
  )
}
