import { useState } from 'react'
import type { FormEvent } from 'react'

type ChatInputBarProps = {
  onSend: (text: string) => void
}

export default function ChatInputBar({ onSend }: ChatInputBarProps) {
  const [text, setText] = useState('')
  const [sendingLoc, setSendingLoc] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  const handleLocationShare = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    setSendingLoc(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            onSend(mapUrl);
            setSendingLoc(false);
        },
        (error) => {
            console.error("Error getting location", error);
            alert("Unable to retrieve your location");
            setSendingLoc(false);
        }
    );
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button 
            type="button" 
            onClick={handleLocationShare}
            disabled={sendingLoc}
            className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${sendingLoc ? 'text-primary-500 animate-pulse' : 'text-slate-400 hover:text-primary-600'}`}
            title="Share Location"
        >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
        </button>
        <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
             {/* Attachment Icon Placeholder */}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 6.182l-9.771 9.771" />
            </svg>
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700 disabled:bg-slate-300 transition-colors"
        >
             {/* Send Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
        </button>
      </form>
    </div>
  )
}
