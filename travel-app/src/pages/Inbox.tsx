import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUserConversations, getMessages, sendMessage as sendMessageApi, markMessagesAsRead, sendBookingProposal } from '../api/messages'
import type { Conversation, Message as ApiMessage } from '../api/messages'
import { getMyBookings } from '../api/bookings'
import type { Booking } from '../api/bookings'
import { useAuth } from '../context/AuthContext.tsx'
import { getImageUrl, getDefaultAvatar } from '../utils/image'
import { 
  PaperClipIcon, 
  MapPinIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  FlagIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/solid'
import Button from '../components/Button.tsx'
import BookingProposalCard from '../components/BookingProposalCard.tsx'
import BookingProposalModal from '../components/BookingProposalModal.tsx'

export default function InboxPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Responsive check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const fetchConversations = async () => {
      if (!user) return
      const convs = await getUserConversations(user.id)
      setConversations(convs)
  }

  // API'den konuşmaları çek
  useEffect(() => {
    let mounted = true;
    const fetchData = async (isPoll = false) => {
      if (!user) return
      if (!isPoll && conversations.length === 0) setLoading(true)
      
      try {
        const [convs, books] = await Promise.all([
          getUserConversations(user.id),
          getMyBookings(user.id, user.role === 'Student Guide' ? 'STUDENT_GUIDE' : 'TRAVELER')
        ])
        if (mounted) {
            setConversations(convs)
            setBookings(books)
            setLoading(false)
        }
      } catch (error) {
          console.error('Failed to fetch inbox data', error)
          if (mounted) setLoading(false)
      }
    }
    fetchData()

    const interval = setInterval(() => fetchData(true), 10000)
    return () => {
        mounted = false;
        clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleChatClick = (id: string) => {
      // Determine base path based on role or current location
      const basePath = user?.role === 'Student Guide' ? '/guide/messages' : '/messages';
      navigate(`${basePath}/${id}`, { preventScrollReset: true });
  }

  // If on mobile and chatId is set, we hide the sidebar (show only chat)
  // If on mobile and no chatId, we show the sidebar (show only list)
  const showSidebar = !isMobile || !chatId
  const showChat = !isMobile || !!chatId

  const filteredConversations = conversations.filter(c => {
    // 1. Search Filter
    if (searchQuery) {
        const name = c.participant?.name.toLowerCase() || ''
        if (!name.includes(searchQuery.toLowerCase())) return false
    }
    // 2. Status Filter
    if (filter === 'unread') return c.unread
    return true
  })

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border-t border-slate-200">
      {/* Sidebar: Message List */}
      {showSidebar && (
        <aside className={`${isMobile ? 'w-full' : 'w-[30%] border-r border-slate-200'} flex flex-col h-full`}>
           <div className="p-4 border-b border-slate-100 min-h-[73px] flex items-center justify-between gap-2">
              {isSearchOpen ? (
                  <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                      <div className="relative flex-1">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Check user or message..." 
                            className="w-full bg-slate-50 border-none rounded-full py-2 pl-9 pr-4 text-sm text-slate-800 focus:ring-2 focus:ring-blue-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <button 
                        onClick={() => {
                            setIsSearchOpen(false)
                            setSearchQuery('')
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                      >
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>
              ) : (
                  <>
                    <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                            title="Search messages"
                        >
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </>
              )}
           </div>
           
           <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    {filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}
                  </div>
              ) : (
                  filteredConversations.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50 
                        ${chat.id === chatId ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}
                      `}
                    >
                        <div className="relative shrink-0">
                             <img 
                                src={chat.participant?.profileImage ? getImageUrl(chat.participant.profileImage) : getDefaultAvatar(chat.participant?.name)} 
                                alt={chat.participant?.name} 
                                className="w-12 h-12 rounded-full object-cover" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = getDefaultAvatar(chat.participant?.name)
                                }}
                             />
                             {chat.unread && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full"></span>
                             )}
                        </div>
                        <div className="min-w-0 flex-1">
                             <div className="flex justify-between items-baseline mb-1">
                                 <h3 className={`text-sm truncate pr-2 ${chat.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                     {chat.participant?.name}
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
                <ActiveChatWindow 
                  chatId={chatId} 
                  initialConversation={conversations.find(c => c.id === chatId)}
                  onBack={() => navigate(user?.role === 'Student Guide' ? '/guide/messages' : '/messages')}
                  onMessageSent={fetchConversations}
                /> 
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

function ActiveChatWindow({ chatId, initialConversation, onBack, onMessageSent }: { chatId: string; initialConversation?: Conversation; onBack: () => void; onMessageSent?: () => void }) {
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(initialConversation || null)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Update conversation if prop changes (e.g. direct nav or load completion)
  useEffect(() => {
    if (initialConversation) {
      setConversation(initialConversation)
    }
  }, [initialConversation])

  const lastMessageIdRef = useRef<string | null>(null)

  // API'den mesajları çek
  useEffect(() => {
    let mounted = true;
    const fetchMessages = async (isPoll = false) => {
      if (!isPoll) setLoading(true)
      try {
        const msgs = await getMessages(chatId)
        if (mounted) {
            setMessages(msgs)
            
            // Only scroll if last message ID changed
            const lastMsg = msgs[msgs.length - 1]
            if (lastMsg && lastMsg.id !== lastMessageIdRef.current) {
                lastMessageIdRef.current = lastMsg.id
                // Use setTimeout to ensure DOM is updated
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
            } else if (!isPoll && msgs.length > 0) {
                 // Initial load scroll
                 lastMessageIdRef.current = lastMsg?.id || null
                 setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50)
            }

            if (!isPoll) setLoading(false)
        }
        
        // Mesajları okundu olarak işaretle
        if (user && mounted) {
            await markMessagesAsRead(chatId, user.id)
        }
      } catch (error) {
          console.error(error)
          if (mounted && !isPoll) setLoading(false)
      }
    }
    fetchMessages()

    const interval = setInterval(() => fetchMessages(true), 3000)
    return () => {
        mounted = false
        clearInterval(interval)
    }
  }, [chatId, user])
  
  // Removed existing useEffect([messages]) that caused aggressive scrolling
  
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim() || !user) return

    // API'ye mesaj gönder
    const newMsg = await sendMessageApi(chatId, user.id, inputText)
    if (newMsg) {
      setMessages(prev => [...prev, newMsg])
      lastMessageIdRef.current = newMsg.id // Update re ref immediately
      
      // Use block: 'nearest' to prevent whole page scrolling
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
      
      if (onMessageSent) onMessageSent()
    }
    setInputText('')
  }

  const handleSendBookingProposal = async (bookingData: any) => {
    if (!user) return

    const msg = await sendBookingProposal(chatId, user.id, bookingData)
    if (msg) {
      setMessages(prev => [...prev, msg])
      lastMessageIdRef.current = msg.id
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
      if (onMessageSent) onMessageSent()
    }
  }
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!conversation && messages.length === 0) return <div className="p-8">Conversation not found</div>

  return (
    <>
      {/* 2. Active Chat Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
              {/* Back Button (Mobile Only normally, but handled by parent layout logic, visual here optional) */}
              <button 
                onClick={onBack}
                className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                  <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <img 
                src={(conversation?.participant?.profileImage ? getImageUrl(conversation.participant.profileImage) : null) || (messages[0]?.sender?.profileImage ? getImageUrl(messages[0].sender.profileImage) : null) || getDefaultAvatar(conversation?.participant?.name || messages[0]?.sender?.name)} 
                alt={conversation?.participant?.name || 'User'} 
                className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-200"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = getDefaultAvatar(conversation?.participant?.name || messages[0]?.sender?.name)
                }}
              />
              <div>
                  <h2 className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                      {conversation?.participant?.name || messages[0]?.sender?.name || 'User'}
                  </h2>
                  <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-xs text-slate-500 font-medium">Online</span>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowBookingModal(true)}
                className="hidden sm:flex"
            >
                {user?.role === 'STUDENT_GUIDE' ? 'Send Proposal' : 'Send Request'}
            </Button>

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
        </div>
      </header>

      {/* Context Sticky Banner - Kaldırıldı, booking context API'den gelecek */}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => {
             const isMe = msg.senderId === user?.id
             const hasBookingData = msg.bookingData && typeof msg.bookingData === 'object'
             
             return (
                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     {!isMe && msg.sender && !hasBookingData && (
                        <img 
                            src={msg.sender.profileImage ? getImageUrl(msg.sender.profileImage) : getDefaultAvatar(msg.sender.name)} 
                            className="w-8 h-8 rounded-full mr-2 self-end mb-1" 
                            alt="" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = getDefaultAvatar(msg.sender?.name)
                            }}
                        />
                     )}
                     
                     {hasBookingData ? (
                        <BookingProposalCard
                          bookingData={msg.bookingData}
                          messageId={msg.id}
                          senderId={msg.senderId}
                          isMyMessage={isMe}
                          onAccept={() => {
                            // Refresh messages to show updated status
                            setTimeout(() => {
                              setMessages(prev => prev.map(m => 
                                m.id === msg.id 
                                  ? { ...m, bookingData: { ...m.bookingData, status: 'ACCEPTED' } }
                                  : m
                              ))
                            }, 500)
                          }}
                        />
                     ) : (
                       <div className={`
                          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                          ${isMe 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }
                       `}>
                          {msg.content}
                          <div className={`text-[10px] mt-1 font-medium ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                             {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                     )}
                 </div>
             )
          })}
          <div ref={bottomRef} />
      </div>

      {/* 3. Input Area Footer */}
      <footer className="bg-white px-4 py-4 border-t border-slate-100 shrink-0">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
              <button 
                type="button"
                onClick={() => setShowBookingModal(true)}
                className="p-3 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                title="Send booking proposal"
              >
                  <CalendarIcon className="w-6 h-6" />
              </button>
              
              <button 
                type="button" 
                className="p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
                title="Add attachment"
              >
                  <PaperClipIcon className="w-6 h-6" />
              </button>
              
              <div className="flex-1 relative">
                  <input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-slate-100 border-none rounded-full py-3.5 pl-6 pr-12 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-sm"
                      placeholder="Type a message..."
                  />
                  
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:shadow-none"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                      </svg>
                  </button>
              </div>
          </form>
      </footer>

      {showBookingModal && (
        <BookingProposalModal
          onClose={() => setShowBookingModal(false)}
          onSend={handleSendBookingProposal}
          isGuide={user?.role === 'STUDENT_GUIDE'}
        />
      )}
    </>
  )
}
