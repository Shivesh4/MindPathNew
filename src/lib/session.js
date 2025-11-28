// Session management utilities

// Set user session (in a real app, you would use cookies or JWT)
export function setUserSession(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Get user session
export function getUserSession() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Clear user session
export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const user = getUserSession();
  return !!user;
}

// Check if user has a specific role
export function hasRole(role) {
  const user = getUserSession();
  return user && user.role === role;
}

// Check if user is an admin
export function isAdmin() {
  return hasRole('ADMIN');
}

// Check if user is a student
export function isStudent() {
  return hasRole('STUDENT');
}

// Check if user is a tutor
export function isTutor() {
  return hasRole('TUTOR');
}