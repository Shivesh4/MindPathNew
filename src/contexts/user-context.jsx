'use client';

import * as React from 'react';

const UserContext = React.createContext(undefined);

export function UserProvider({ children, user }) {
  const [currentUser, setCurrentUser] = React.useState(user);

  const value = {
    user: currentUser,
    setUser: setCurrentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}