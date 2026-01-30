import { createBrowserRouter } from 'react-router-dom'
import AppShell from './App.tsx'
import AuthLayout from './layouts/AuthLayout.tsx'
import DashboardLayout from './layouts/DashboardLayout.tsx'
import CheckoutLayout from './layouts/CheckoutLayout.tsx'
import GuideLayout from './layouts/GuideLayout.tsx'
import AdminLayout from './layouts/AdminLayout.tsx'
import RequireAuth from './components/RequireAuth.tsx'

import AuthPage from './pages/Auth.tsx'
import DashboardPage from './pages/Dashboard.tsx'
import AdvancedSearchPage from './pages/AdvancedSearch.tsx'
import MapSearchPage from './pages/MapSearch.tsx'
import GuideProfilePage from './pages/GuideProfile.tsx'
import CategoriesPage from './pages/Categories.tsx'
import NotFoundPage from './pages/NotFound.tsx'
import BookPage from './pages/Book.tsx'
import BookingSummaryPage from './pages/BookingSummary.tsx'
import CheckoutPage from './pages/CheckoutPage.tsx'
import BookingSuccessPage from './pages/BookingSuccessPage.tsx'
import InboxPage from './pages/Inbox.tsx'
// import ChatPage from './pages/Chat.tsx'
import TripsPage from './pages/Trips.tsx'
import WishlistPage from './pages/WishlistPage.tsx'
import NotificationsPage from './pages/NotificationsPage.tsx'
import GuideDashboardPage from './pages/GuideDashboard.tsx'
import GuideCalendarPage from './pages/GuideCalendarPage.tsx'
import EarningsPage from './pages/Earnings.tsx'
import CreateTourPage from './pages/CreateTourPage.tsx'
import MyToursPage from './pages/MyTours.tsx'
import ToursPage from './pages/ToursPage.tsx'
import TourDetailPage from './pages/TourDetailPage.tsx'
import BookTourPage from './pages/BookTour.tsx'
import MyRequestsPage from './pages/MyRequests.tsx'

import GuideReviews from './pages/GuideReviews.tsx'
import GuideWallet from './pages/GuideWallet.tsx'
import Settings from './pages/Settings.tsx'
import GuideProfileEditor from './pages/GuideProfileEditor.tsx'
import StudentGuideProfile from './pages/StudentGuideProfile.tsx'
import VerificationPage from './pages/VerificationPage.tsx'
import TravelerProfilePage from './pages/TravelerProfile.tsx'
import GuideBookingsPage from './pages/GuideBookings.tsx'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import UserManagement from './pages/admin/UserManagement.tsx'
import BookingManagement from './pages/admin/BookingManagement.tsx'
import ReviewManagement from './pages/admin/ReviewManagement.tsx'
import TransactionManagement from './pages/admin/TransactionManagement.tsx'
import PlatformSettings from './pages/admin/PlatformSettings.tsx'

// Corporate & Legal
import AboutUs from './pages/AboutUs.tsx'
import Contact from './pages/Contact.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import TermsOfService from './pages/TermsOfService.tsx'
import CookiePolicy from './pages/CookiePolicy.tsx'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [{ index: true, element: <AuthPage /> }],
      },
      {
        path: '/checkout',
        element: <CheckoutLayout />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
      {
        path: '/booking-success/:bookingId',
        element: <RequireAuth><BookingSuccessPage /></RequireAuth>,
      },
      


      // Guide Portal
      {
        path: '/guide',
        element: (
          <RequireAuth>
            <GuideLayout />
          </RequireAuth>
        ),
        children: [
            { index: true, element: <GuideDashboardPage /> },
            { path: 'dashboard', element: <GuideDashboardPage /> },
            { path: 'bookings', element: <GuideBookingsPage /> },
            { path: 'my-tours', element: <MyToursPage /> },
            { path: 'earnings', element: <EarningsPage /> },
            { path: 'calendar', element: <GuideCalendarPage /> },
            { path: 'wallet', element: <GuideWallet /> },
            { path: 'reviews', element: <GuideReviews /> },
            { path: 'edit-profile', element: <GuideProfileEditor /> },
            { path: 'verification', element: <VerificationPage /> }, // Added verification to Guide Portal
            { path: 'settings', element: <Settings /> }, // Added settings to Guide Portal
            { path: 'help', element: <Contact /> }, // Added help/contact to Guide Portal
            { path: 'list-experience', element: <CreateTourPage /> },
            { path: 'notifications', element: <NotificationsPage /> },
            { path: 'messages', element: <InboxPage /> },
            { path: 'messages/:chatId', element: <InboxPage /> }
        ]
      },

      // Admin Portal
      {
        path: '/admin/login',
        element: <AdminLogin />
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <UserManagement /> },
          { path: 'bookings', element: <BookingManagement /> },
          { path: 'reviews', element: <ReviewManagement /> },
          { path: 'transactions', element: <TransactionManagement /> },
          { path: 'settings', element: <PlatformSettings /> },
        ]
      },
      // Traveler Portal
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'discover', element: <DashboardPage /> },
          { path: 'tours', element: <ToursPage /> },
          { path: 'tours/:id', element: <TourDetailPage /> },
          { path: 'book-tour/:id', element: <RequireAuth><BookTourPage /></RequireAuth> },
          { path: 'search', element: <AdvancedSearchPage /> },
          { path: 'map', element: <MapSearchPage /> },
          // Public Traveler Profile
          { path: 'traveler/:id', element: <TravelerProfilePage /> },
          { path: 'profile/:id', element: <GuideProfilePage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'book/:id', element: <RequireAuth><BookPage /></RequireAuth> },
          { path: 'book/summary', element: <RequireAuth><BookingSummaryPage /></RequireAuth> },
          { path: 'messages', element: <RequireAuth><InboxPage /></RequireAuth> },
          { path: 'messages/:chatId', element: <RequireAuth><InboxPage /></RequireAuth> },
          { path: 'trips', element: <RequireAuth><TripsPage /></RequireAuth> },
          { path: 'my-requests', element: <RequireAuth><MyRequestsPage /></RequireAuth> },
          { path: 'wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
          { path: 'notifications', element: <RequireAuth><NotificationsPage /></RequireAuth> },
          // Shared Pages (Verification & Settings)
          { path: 'settings', element: <RequireAuth><Settings /></RequireAuth> },
          { path: 'verification', element: <RequireAuth><VerificationPage /></RequireAuth> },
          { path: 'verify/:type', element: <RequireAuth><VerificationPage /></RequireAuth> },

          // Footer / Static Pages
          { path: 'about', element: <AboutUs /> },
          { path: 'contact', element: <Contact /> },
          { path: 'privacy', element: <PrivacyPolicy /> },
          { path: 'terms', element: <TermsOfService /> },
          { path: 'cookies', element: <CookiePolicy /> },
          { path: 'help', element: <Contact /> }, // Map help to contact for now
          
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
