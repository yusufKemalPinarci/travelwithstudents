import { useState } from 'react'
import { 
    Cog6ToothIcon,
    BellIcon,
    CreditCardIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function PlatformSettings() {
    const [settings, setSettings] = useState({
        siteName: 'Travel with Student',
        siteEmail: 'support@travelwithstudent.com',
        commissionRate: 15,
        minBookingAmount: 20,
        maxBookingAmount: 1000,
        cancellationHours: 24,
        autoApproveGuides: false,
        autoApproveReviews: false,
        emailNotifications: true,
        smsNotifications: false,
        maintenanceMode: false,
    })

    const handleSave = () => {
        console.log('Saving settings:', settings)
        alert('Settings saved successfully!')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
                <p className="text-slate-500 mt-1">Configure platform-wide settings and preferences</p>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <Cog6ToothIcon className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Site Name
                        </label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Support Email
                        </label>
                        <input
                            type="email"
                            value={settings.siteEmail}
                            onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="maintenance"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="maintenance" className="text-sm font-medium text-slate-700">
                            Enable Maintenance Mode
                        </label>
                    </div>
                </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-900">Payment Settings</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Platform Commission Rate (%)
                        </label>
                        <input
                            type="number"
                            value={settings.commissionRate}
                            onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Percentage of each booking taken as platform fee</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Minimum Booking Amount ($)
                            </label>
                            <input
                                type="number"
                                value={settings.minBookingAmount}
                                onChange={(e) => setSettings({ ...settings, minBookingAmount: parseInt(e.target.value) })}
                                min="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Maximum Booking Amount ($)
                            </label>
                            <input
                                type="number"
                                value={settings.maxBookingAmount}
                                onChange={(e) => setSettings({ ...settings, maxBookingAmount: parseInt(e.target.value) })}
                                min="0"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <GlobeAltIcon className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-900">Booking Policies</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Free Cancellation Window (hours)
                        </label>
                        <input
                            type="number"
                            value={settings.cancellationHours}
                            onChange={(e) => setSettings({ ...settings, cancellationHours: parseInt(e.target.value) })}
                            min="0"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Hours before booking start when free cancellation is allowed</p>
                    </div>
                </div>
            </div>

            {/* Moderation Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-900">Moderation</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="autoApproveGuides"
                            checked={settings.autoApproveGuides}
                            onChange={(e) => setSettings({ ...settings, autoApproveGuides: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="autoApproveGuides" className="text-sm font-medium text-slate-700">
                            Auto-approve student guide registrations
                        </label>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="autoApproveReviews"
                            checked={settings.autoApproveReviews}
                            onChange={(e) => setSettings({ ...settings, autoApproveReviews: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="autoApproveReviews" className="text-sm font-medium text-slate-700">
                            Auto-approve reviews without moderation
                        </label>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <BellIcon className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-slate-700">
                            Enable email notifications
                        </label>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="checkbox"
                            id="smsNotifications"
                            checked={settings.smsNotifications}
                            onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="smsNotifications" className="text-sm font-medium text-slate-700">
                            Enable SMS notifications
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Save Settings
                </button>
            </div>
        </div>
    )
}
