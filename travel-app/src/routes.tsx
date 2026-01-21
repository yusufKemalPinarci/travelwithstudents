import { createBrowserRouter } from 'react-router-dom'
import AppShell from './App.tsx'
import AuthLayout from './layouts/AuthLayout.tsx'
import DashboardLayout from './layouts/DashboardLayout.tsx'
import CheckoutLayout from './layouts/CheckoutLayout.tsx'
import GuideLayout from './layouts/GuideLayout.tsx'
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
import CheckoutPage from './pages/Checkout.tsx'
import InboxPage from './pages/Inbox.tsx'
// import ChatPage from './pages/Chat.tsx'
import TripsPage from './pages/Trips.tsx'
import WishlistPage from './pages/WishlistPage.tsx'
import NotificationsPage from './pages/NotificationsPage.tsx'
import GuideDashboardPage from './pages/GuideDashboard.tsx'
import GuideCalendarPage from './pages/GuideCalendarPage.tsx'
import EarningsPage from './pages/Earnings.tsx'
import CreateTourPage from './pages/CreateTourPage.tsx'

import GuideReviews from './pages/GuideReviews.tsx'
import GuideWallet from './pages/GuideWallet.tsx'
import Settings from './pages/Settings.tsx'
import GuideProfileEditor from './pages/GuideProfileEditor.tsx'
import VerificationPage from './pages/VerificationPage.tsx'
import TravelerProfilePage from './pages/TravelerProfile.tsx'

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
            { path: 'earnings', element: <EarningsPage /> },
            { path: 'calendar', element: <GuideCalendarPage /> },
            { path: 'wallet', element: <GuideWallet /> },
            { path: 'reviews', element: <GuideReviews /> },
            { path: 'edit-profile', element: <GuideProfileEditor /> },
            { path: 'list-experience', element: <CreateTourPage /> },
            { path: 'notifications', element: <NotificationsPage /> },
            { path: 'inbox', element: <InboxPage /> },
            { path: 'inbox/:chatId', element: <InboxPage /> }
        ]
      },
      // Traveler Portal
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'discover', element: <DashboardPage /> },
          { path: 'search', element: <AdvancedSearchPage /> },
          { path: 'map', element: <MapSearchPage /> },
          // Public Traveler Profile
          { path: 'traveler/:id', element: <TravelerProfilePage /> },
          { path: 'profile/:id', element: <GuideProfilePage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'book/:id', element: <RequireAuth><BookPage /></RequireAuth> },
          { path: 'book/summary', element: <RequireAuth><BookingSummaryPage /></RequireAuth> },
          { path: 'inbox', element: <RequireAuth><InboxPage /></RequireAuth> },
          { path: 'inbox/:chatId', element: <RequireAuth><InboxPage /></RequireAuth> },
          { path: 'trips', element: <RequireAuth><TripsPage /></RequireAuth> },
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
