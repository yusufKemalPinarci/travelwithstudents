import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { conversations, bookings } from '../utils/mockData.ts'
import type { Message } from '../types.ts'
import { 
  PaperClipIcon, 
  MapPinIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  FlagIcon
} from '@heroicons/react/24/solid'
import Button from '../components/Button.tsx'

export default function InboxPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  
  // Responsive check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // If on mobile and chatId is set, we hide the sidebar (show only chat)
  // If on mobile and no chatId, we show the sidebar (show only list)
  const showSidebar = !isMobile || !chatId
  const showChat = !isMobile || !!chatId

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border-t border-slate-200">
      {/* Sidebar: Message List */}
      {showSidebar && (
        <aside className={`${isMobile ? 'w-full' : 'w-[30%] border-r border-slate-200'} flex flex-col h-full`}>
           <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900">Messages</h1>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                  <FunnelIcon className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No messages yet.</div>
              ) : (
                  conversations.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => navigate(`/guide/inbox/${chat.id}`)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50 
                        ${chat.id === chatId ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                      `}
                    >
                        <div className="relative shrink-0">
                             <img src={chat.guide.image} alt={chat.guide.name} className="w-12 h-12 rounded-full object-cover" />
                             {chat.unread && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full"></span>
                             )}
                        </div>
                        <div className="min-w-0 flex-1">
                             <div className="flex justify-between items-baseline mb-1">
                                 <h3 className={`text-sm truncate pr-2 ${chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                     {chat.guide.name}
                                 </h3>
                                 <span className={`text-xs whitespace-nowrap ${chat.unread ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                     {chat.timestamp}
                                 </span>
                             </div>
                             <p className={`text-xs truncate ${chat.unread ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                                 {chat.lastMessage}
                             </p>
                        </div>
                    </div>
                  ))
              )}
           </div>
        </aside>
      )}

      {/* Main Chat Window */}
      {showChat ? (
        <main className={`${isMobile ? 'w-full' : 'w-[70%]'} flex flex-col h-full bg-slate-50 relative`}>
            {chatId ? (
                <ActiveChatWindow chatId={chatId} onBack={() => navigate('/guide/inbox')} /> 
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Select a conversation to start chatting</p>
                </div>
            )}
        </main>
      ) : null}
    </div>
  )
}

function ActiveChatWindow({ chatId, onBack }: { chatId: string; onBack: () => void }) {
  // Find conversation
  const conversation = conversations.find(c => c.id === chatId)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [actionsOpen, setActionsOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Mock Active Booking Request Context
  const activeRequest = bookings.find(b => b.guideId === conversation?.guideId && b.status === "upcoming")
  
  useEffect(() => {
    if (conversation) {
        setMessages(conversation.messages)
    }
  }, [conversation])
  
  useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim()) return

    const newMsg: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        text: inputText,
        timestamp: 'Just now'
    }
    setMessages(prev => [...prev, newMsg])
    setInputText('')
  }
  
  if (!conversation) return <div className="p-8">Conversation not found</div>

  return (
    <>
      {/* 2. Active Chat Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
              {/* Back Button (Mobile Only normally, but handled by parent layout logic, visual here optional) */}
              <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
              </button>

              <img src={conversation.guide.image} alt={conversation.guide.name} className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-200" />
              <div>
                  <h2 className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                      {conversation.guide.name}
                  </h2>
                  <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-slate-500 font-medium">Online</span>
                  </div>
              </div>
          </div>
          
          {/* Task 3: Quick Actions Dropdown */}
          <div className="relative">
              <button 
                onClick={() => setActionsOpen(!actionsOpen)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                  <EllipsisVerticalIcon className="w-6 h-6" />
              </button>
              
              {actionsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1">
                            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-500" /> Accept Request
                            </button>
                            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                                <NoSymbolIcon className="w-5 h-5 text-slate-400" /> Decline Request
                            </button>
                            <div className="my-1 border-t border-slate-100"></div>
                            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                                <FlagIcon className="w-5 h-5" /> Report User
                            </button>
                        </div>
                    </div>
                  </>
              )}
          </div>
      </header>

      {/* Context Sticky Banner */}
      {activeRequest && (
          <div className="sticky top-0 z-10 bg-blue-50/95 backdrop-blur-sm border-b border-blue-100 px-4 py-3 flex items-center justify-between shadow-sm">
             <div>
                 <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-0.5">Booking Request</p>
                 <p className="text-sm text-blue-800 font-medium flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" /> Food Tour in Istanbul • Oct 15
                 </p>
             </div>
             <Button size="sm" variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">View details</Button>
          </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
          {messages.map((msg) => {
             const isMe = msg.senderId === 'me'
             return (
                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     {!isMe && (
                        <img src={conversation.guide.image} className="w-8 h-8 rounded-full mr-2 self-end mb-1" alt="" />
                     )}
                     <div className={`
                        max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }
                     `}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 font-medium ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                           {msg.timestamp}
                        </div>
                     </div>
                 </div>
             )
          })}
          <div ref={bottomRef} />
      </div>

      {/* 3. Input Area Footer */}
      <footer className="bg-white px-4 py-3 border-t border-slate-200 shrink-0">
          <form 
            onSubmit={handleSend}
            className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all"
          >
              <button type="button" className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                  <PaperClipIcon className="w-5 h-5" />
              </button>
              
              <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 resize-none py-2 max-h-32 text-sm"
                  placeholder="Type a message..."
                  rows={1}
              />
              
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
              </button>
          </form>
      </footer>
    </>
  )
}
