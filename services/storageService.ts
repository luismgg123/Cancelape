import { Loan, LoanStatus, User, LoanSummary, StoredUser } from '../types';

const USERS_KEY = 'prestamist_users_v2'; // Updated key version
const LOANS_KEY = 'prestamist_loans_v2'; // Updated key version
const CURRENT_USER_KEY = 'prestamist_current_user';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

export const hasRegisteredUser = (): boolean => {
  // Check if there are any users in the local DB
  return !!localStorage.getItem(USERS_KEY);
};

export const loginUser = async (email: string, pin: string, rememberMe: boolean): Promise<User> => {
  await delay(600);
  
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: Record<string, StoredUser> = usersStr ? JSON.parse(usersStr) : {};
  const normalizedEmail = email.toLowerCase().trim();
  const foundUser = users[normalizedEmail];

  if (!foundUser) {
    throw new Error('No existe una cuenta con este correo.');
  }

  if (foundUser.pin !== pin) {
    throw new Error('Clave incorrecta.');
  }

  const sessionUser: User = { email: foundUser.email, name: foundUser.name };
  
  if (rememberMe) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  } else {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  }
  
  return sessionUser;
};

export const registerUser = async (data: { email: string, name: string, pin: string }): Promise<User> => {
  await delay(800);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: Record<string, StoredUser> = usersStr ? JSON.parse(usersStr) : {};
  const normalizedEmail = data.email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    throw new Error('Este correo ya está registrado.');
  }
  
  const newUser: StoredUser = {
    email: normalizedEmail,
    name: data.name,
    pin: data.pin
  };

  users[normalizedEmail] = newUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Default to session storage for safety unless specified, but for reg we usually login immediately.
  // Let's assume session storage for immediate login after register.
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
};

export const resetUserPin = async (email: string, newPin: string): Promise<void> => {
  await delay(1000);
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: Record<string, StoredUser> = usersStr ? JSON.parse(usersStr) : {};
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!users[normalizedEmail]) {
    throw new Error('Correo no encontrado.');
  }

  users[normalizedEmail].pin = newPin;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  // Check session first, then local (for "Remember Me")
  const sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
  if (sessionUser) return JSON.parse(sessionUser);

  const localUser = localStorage.getItem(CURRENT_USER_KEY);
  return localUser ? JSON.parse(localUser) : null;
};

// --- Loan Services ---

const getLoansFromStorage = (): Loan[] => {
  const l = localStorage.getItem(LOANS_KEY);
  return l ? JSON.parse(l) : [];
};

const saveLoansToStorage = (loans: Loan[]) => {
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
};

export const createLoan = async (loanData: Omit<Loan, 'id' | 'createdAt' | 'status' | 'lastActionByEmail'>): Promise<Loan> => {
  await delay(300);
  const loans = getLoansFromStorage();
  
  const newLoan: Loan = {
    ...loanData,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    createdAt: Date.now(),
    status: LoanStatus.PENDING,
    lastActionByEmail: loanData.createdByEmail
  };

  loans.push(newLoan);
  saveLoansToStorage(loans);
  return newLoan;
};

export const updateLoanStatus = async (loanId: string, newStatus: LoanStatus, actionByEmail: string): Promise<Loan> => {
  await delay(200);
  const loans = getLoansFromStorage();
  const index = loans.findIndex(l => l.id === loanId);
  
  if (index === -1) throw new Error('Loan not found');

  const updatedLoan = { 
    ...loans[index], 
    status: newStatus, 
    lastActionByEmail: actionByEmail,
    closedAt: (newStatus === LoanStatus.PAID || newStatus === LoanStatus.REJECTED) ? Date.now() : undefined
  };

  loans[index] = updatedLoan;
  saveLoansToStorage(loans);
  return updatedLoan;
};

export const getMyLoans = async (email: string): Promise<Loan[]> => {
  await delay(200);
  const loans = getLoansFromStorage();
  const normalizedEmail = email.toLowerCase().trim();
  // Return loans where I am involved
  return loans.filter(l => l.borrowerEmail === normalizedEmail || l.lenderEmail === normalizedEmail).sort((a, b) => b.createdAt - a.createdAt);
};

export const getSummary = (loans: Loan[], myEmail: string): LoanSummary => {
  let totalLent = 0;
  let totalBorrowed = 0;
  let activeCount = 0;
  let pendingCount = 0;
  const normalizedMe = myEmail.toLowerCase().trim();

  loans.forEach(loan => {
    // Only count active loans for money totals
    if (loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.PAID_PENDING_CONFIRMATION) {
      if (loan.lenderEmail === normalizedMe) {
        totalLent += loan.amount;
      } else if (loan.borrowerEmail === normalizedMe) {
        totalBorrowed += loan.amount;
      }
      activeCount++;
    }

    if (loan.status === LoanStatus.PENDING || loan.status === LoanStatus.PAID_PENDING_CONFIRMATION) {
      pendingCount++;
    }
  });

  return { totalLent, totalBorrowed, activeCount, pendingCount };
};

export const getPendingActionsCount = (loans: Loan[], myEmail: string): number => {
  const normalizedMe = myEmail.toLowerCase().trim();
  return loans.filter(l => {
    const isOffline = !!l.isOffline;
    if (isOffline) {
       if (l.status === LoanStatus.PENDING) return true; 
       if (l.status === LoanStatus.PAID_PENDING_CONFIRMATION) return true;
       return false;
    }
    const isMyTurn = l.lastActionByEmail !== normalizedMe;
    if (l.status === LoanStatus.PENDING && isMyTurn) return true;
    if (l.status === LoanStatus.PAID_PENDING_CONFIRMATION && isMyTurn) return true;

    return false;
  }).length;
};