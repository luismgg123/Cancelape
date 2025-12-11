export enum LoanStatus {
  PENDING = 'PENDING',               // Created, waiting for other party to accept
  ACTIVE = 'ACTIVE',                 // Accepted, money exchanged (conceptually)
  REJECTED = 'REJECTED',             // Other party denied the request
  PAID_PENDING_CONFIRMATION = 'PAID_PENDING_CONFIRMATION', // One party marked as paid
  PAID = 'PAID',                     // Both parties confirmed payment
  CANCELLED = 'CANCELLED'            // Creator cancelled before acceptance
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  PEN = 'PEN',
  MXN = 'MXN',
  COP = 'COP'
}

export enum LoanRole {
  LENDER = 'LENDER',   // "I lent money"
  BORROWER = 'BORROWER' // "I borrowed money"
}

export interface User {
  email: string; // Changed from phone to email
  name: string;
}

// Internal type for storage including credentials
export interface StoredUser extends User {
  pin: string;
}

export interface Loan {
  id: string;
  amount: number;
  currency: Currency;
  description: string;
  
  // Who created the record
  createdByEmail: string;
  
  // Participants
  lenderEmail: string;
  borrowerEmail: string;
  
  // Display name manually entered
  otherName?: string; 
  isOffline?: boolean; 
  
  // Dates
  createdAt: number;
  paymentDate?: number;
  closedAt?: number;
  
  status: LoanStatus;
  
  // Tracking who initiated the last status change
  lastActionByEmail: string;
}

export interface LoanSummary {
  totalLent: number;
  totalBorrowed: number;
  activeCount: number;
  pendingCount: number;
}