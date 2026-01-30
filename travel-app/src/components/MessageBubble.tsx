type MessageBubbleProps = {
  text: string
  isSensder: boolean
  timestamp: string
}

export default function MessageBubble({ text, isSensder, timestamp }: MessageBubbleProps) {
  const isLocation = text.includes('google.com/maps');

  return (
    <div className={`flex flex-col mb-3 ${isSensder ? 'items-end' : 'items-start'}`}>
        <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isSensder
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md'
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-600'
            }`}
        >
            {isLocation ? (
                <a 
                    href={text} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center gap-2 font-medium hover:underline ${isSensder ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    View Location on Map
                </a>
            ) : (
                <p className="whitespace-pre-wrap break-words leading-relaxed">{text}</p>
            )}
        </div>
        <span className={`mt-1.5 text-xs font-medium ${isSensder ? 'text-slate-400' : 'text-slate-500'}`}>{timestamp}</span>
    </div>
  )
}
