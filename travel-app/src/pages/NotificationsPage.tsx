import { notifications } from '../utils/mockData'
import { 
    CheckCircleIcon, 
    ExclamationCircleIcon, 
    InformationCircleIcon, 
    ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline'

const icons: Record<string, any> = {
    booking: CheckCircleIcon,
    alert: ExclamationCircleIcon,
    info: InformationCircleIcon,
    message: ChatBubbleLeftIcon
}

const styles: Record<string, string> = {
    booking: 'bg-green-100 text-green-600',
    alert: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
    message: 'bg-purple-100 text-purple-600'
}

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Mark all as read
          </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-slate-400">notifications_off</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up!</h3>
            <p className="text-slate-500 text-sm">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = icons[notification.type] || InformationCircleIcon
            const style = styles[notification.type] || styles.info
            
            return (
                <div 
                    key={notification.id} 
                    className={`card-surface p-4 flex gap-4 ${!notification.read ? 'border-l-4 border-l-primary-500' : ''}`}
                >
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${style}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                            {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                    </div>
                    {!notification.read && (
                        <div className="flex-shrink-0 self-center">
                            <span className="w-2.5 h-2.5 bg-primary-500 rounded-full block"></span>
                        </div>
                    )}
                </div>
            )
        }))}
      </div>
    </div>
  )
}
