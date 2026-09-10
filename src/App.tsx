/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/shared/NotificationDrawer';
import { InvoiceModal } from './components/shared/InvoiceModal';
import { ResortAIWidget } from './components/shared/ResortAIWidget';

// Guest Components
import { HeroSection } from './components/guest/HeroSection';
import { RoomsSection } from './components/guest/RoomsSection';
import { DiningSection } from './components/guest/DiningSection';
import { ActivitiesSection } from './components/guest/ActivitiesSection';
import { MyStaySection } from './components/guest/MyStaySection';
import { ReviewsSection } from './components/guest/ReviewsSection';
import { FeedbackSection } from './components/guest/FeedbackSection';
import { ContactSection } from './components/guest/ContactSection';

// Dashboards
import { OwnerDashboard } from './components/dashboards/OwnerDashboard';
import { ManagerDashboard } from './components/dashboards/ManagerDashboard';
import { ReceptionDashboard } from './components/dashboards/ReceptionDashboard';
import { WaiterDashboard } from './components/dashboards/WaiterDashboard';
import { KitchenDashboard } from './components/dashboards/KitchenDashboard';
import { HousekeepingDashboard } from './components/dashboards/HousekeepingDashboard';
import { MaintenanceDashboard } from './components/dashboards/MaintenanceDashboard';
import { KitchenWaiterDashboard } from './components/dashboards/KitchenWaiterDashboard';

// Auth Components
import { HotelLoginPortal } from './components/auth/HotelLoginPortal';
import { FirstLoginModal } from './components/auth/FirstLoginModal';
import { UnauthorizedBarrier } from './components/auth/UnauthorizedBarrier';

const HotelAppContent: React.FC = () => {
  const { activeRole, guestTab, setGuestTab, isRoleAuthorized, authUser } = useHotel();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<{
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  } | undefined>(undefined);

  const handleHeroAvailabilityCheck = (data: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomType: string;
  }) => {
    setSearchCriteria(data);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#33332D] font-sans flex flex-col selection:bg-[#E5E1D5] selection:text-[#5C5E4E]">
      {/* Top Navbar */}
      <Navbar onOpenNotifications={() => setNotificationDrawerOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeRole === 'guest' && (
          <>
            {guestTab === 'home' && (
              <>
                <HeroSection onCheckAvailability={handleHeroAvailabilityCheck} />
                <RoomsSection searchFilter={searchCriteria} />
                <DiningSection />
                <ActivitiesSection />
                <ReviewsSection />
                <ContactSection />
              </>
            )}

            {guestTab === 'rooms' && (
              <>
                <RoomsSection searchFilter={searchCriteria} />
                <ContactSection />
              </>
            )}

            {guestTab === 'dining' && (
              <>
                <DiningSection />
                <ContactSection />
              </>
            )}

            {guestTab === 'activities' && (
              <>
                <ActivitiesSection />
                <ContactSection />
              </>
            )}

            {guestTab === 'map' && (
              <>
                <ActivitiesSection />
                <ContactSection />
              </>
            )}

            {guestTab === 'mystay' && (
              <>
                <MyStaySection />
                <ContactSection />
              </>
            )}

            {guestTab === 'reviews' && (
              <>
                <ReviewsSection />
                <ContactSection />
              </>
            )}

            {guestTab === 'feedback' && (
              <>
                <FeedbackSection />
                <ContactSection />
              </>
            )}
          </>
        )}

        {/* Authentication Gateway */}
        {activeRole === 'login' && <HotelLoginPortal />}

        {/* Operational Staff & Executive Dashboards (Guarded by RBAC) */}
        {activeRole !== 'guest' && activeRole !== 'login' && (
          !isRoleAuthorized(activeRole) ? (
            <UnauthorizedBarrier attemptedRole={activeRole} />
          ) : (
            <>
              {activeRole === 'owner' && <OwnerDashboard />}
              {activeRole === 'manager' && <ManagerDashboard />}
              {activeRole === 'reception' && <ReceptionDashboard />}
              {activeRole === 'waiter' && <WaiterDashboard />}
              {activeRole === 'kitchen' && <KitchenDashboard />}
              {activeRole === 'housekeeping' && <HousekeepingDashboard />}
              {activeRole === 'maintenance' && <MaintenanceDashboard />}
              {activeRole === 'kitchen-waiter' && <KitchenWaiterDashboard />}
            </>
          )
        )}
      </main>

      {/* Overlays & Drawers */}
      <FirstLoginModal />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />

      <InvoiceModal />

      <ResortAIWidget />
    </div>
  );
};

export default function App() {
  return (
    <HotelProvider>
      <HotelAppContent />
    </HotelProvider>
  );
}
