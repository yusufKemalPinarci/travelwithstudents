type MessageBubbleProps = {
  text: string
  isSensder: boolean
  timestamp: string
}

export default function MessageBubble({ text, isSensder, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isSensder ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isSensder
            ? 'bg-primary-600 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-800 rounded-bl-none'
        }`}
      >
        {text}
      </div>
      <span className="mt-1 text-xs text-slate-400">{timestamp}</span>
    </div>
  )
}
