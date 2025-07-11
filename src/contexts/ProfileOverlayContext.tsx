import React, { createContext, useContext, useState } from "react";

interface ProfileOverlayContextType {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
}

const ProfileOverlayContext = createContext<ProfileOverlayContextType | undefined>(undefined);

export function ProfileOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  return (
    <ProfileOverlayContext.Provider
      value={{
        isProfileOpen,
        openProfile,
        closeProfile,
      }}
    >
      {children}
    </ProfileOverlayContext.Provider>
  );
}

export function useProfileOverlay() {
  const context = useContext(ProfileOverlayContext);
  if (context === undefined) {
    throw new Error("useProfileOverlay must be used within a ProfileOverlayProvider");
  }
  return context;
}
