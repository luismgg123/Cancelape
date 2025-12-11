import React from 'react';
import { Loan, LoanStatus, User } from '../types';
import { Icons } from '../constants';

interface LoanCardProps {
  loan: Loan;
  currentUser: User;
  onUpdateStatus: (loanId: string, status: LoanStatus) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, currentUser, onUpdateStatus }) => {
  const isLender = loan.lenderEmail === currentUser.email;
  // In offline mode, the current user can act on behalf of the "other" person
  const isMyActionNeeded = loan.isOffline || loan.lastActionByEmail !== currentUser.email;
  
  const otherPartyEmail = isLender ? loan.borrowerEmail : loan.lenderEmail;
  const displayName = loan.otherName || otherPartyEmail;

  // Format date
  const dateStr = new Date(loan.createdAt).toLocaleDateString();
  const paymentDateStr = loan.paymentDate ? new Date(loan.paymentDate).toLocaleDateString() : 'Sin fecha';
  
  const closedDateStr = loan.closedAt ? new Date(loan.closedAt).toLocaleDateString() : null;

  // Status Styling
  let statusBadge = null;
  let actionButtons = null;

  switch (loan.status) {
    case LoanStatus.PENDING:
      statusBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
          Pendiente
        </span>
      );
      if (isMyActionNeeded) {
        actionButtons = (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onUpdateStatus(loan.id, LoanStatus.ACTIVE)}
              className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium active:scale-95 transition-transform shadow-sm"
            >
              {loan.isOffline ? 'Autoconfirmar' : 'Aceptar'}
            </button>
            <button
              onClick={() => onUpdateStatus(loan.id, LoanStatus.REJECTED)}
              className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 rounded-lg font-medium active:scale-95 transition-transform"
            >
              Rechazar
            </button>
          </div>
        );
      } else {
        actionButtons = <p className="text-xs text-gray-400 mt-2 italic">Esperando respuesta de {displayName}...</p>;
      }
      break;

    case LoanStatus.ACTIVE:
      statusBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Activo
        </span>
      );
      actionButtons = (
        <button
          onClick={() => onUpdateStatus(loan.id, LoanStatus.PAID_PENDING_CONFIRMATION)}
          className="mt-3 w-full border border-green-500 text-green-600 text-sm py-2 rounded-lg font-medium active:scale-95 transition-transform hover:bg-green-50"
        >
          Marcar como Pagado
        </button>
      );
      break;

    case LoanStatus.PAID_PENDING_CONFIRMATION:
      statusBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-800">
          Confirmación Pendiente
        </span>
      );
      if (isMyActionNeeded) {
        actionButtons = (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onUpdateStatus(loan.id, LoanStatus.PAID)}
              className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg font-medium active:scale-95 transition-transform shadow-sm"
            >
              Confirmar Pago
            </button>
            <button
              onClick={() => onUpdateStatus(loan.id, LoanStatus.ACTIVE)}
              className="flex-1 bg-red-50 text-red-600 text-sm py-2 rounded-lg font-medium active:scale-95 transition-transform"
            >
              No recibí pago
            </button>
          </div>
        );
      } else {
        actionButtons = <p className="text-xs text-gray-400 mt-2 italic">Esperando confirmación de {displayName}...</p>;
      }
      break;

    case LoanStatus.PAID:
      statusBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-800 text-white">
          Pagado
        </span>
      );
      break;

    case LoanStatus.REJECTED:
      statusBadge = (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          Rechazado
        </span>
      );
      break;
      
    case LoanStatus.CANCELLED:
        statusBadge = (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            Cancelado
          </span>
        );
        break;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 relative overflow-hidden">
      {/* Offline Indicator strip */}
      {loan.isOffline && (
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
             <div className="bg-gray-200 text-gray-500 text-[9px] font-bold text-center transform rotate-45 translate-x-[12px] translate-y-[6px] w-[60px]">OFFLINE</div>
          </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
           {isLender ? (
             <div className="bg-green-100 p-2 rounded-full text-green-600">
               <Icons.ArrowUpRight size={20} />
             </div>
           ) : (
             <div className="bg-red-100 p-2 rounded-full text-red-600">
               <Icons.ArrowDownLeft size={20} />
             </div>
           )}
           <div>
             <p className="font-semibold text-gray-800 leading-tight">
               {isLender ? 'Te debe' : 'Debes a'}: <span className="text-green-700">{displayName}</span>
             </p>
             <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
           </div>
        </div>
        <div className="text-right mr-2">
          <p className={`font-bold text-lg ${isLender ? 'text-green-600' : 'text-red-500'}`}>
            {loan.amount.toLocaleString()} {loan.currency}
          </p>
          {statusBadge}
        </div>
      </div>
      
      {loan.description && (
        <p className="text-sm text-gray-600 mb-2 italic bg-gray-50 p-2 rounded-lg">"{loan.description}"</p>
      )}

      <div className="flex flex-col gap-1 text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">
        <div className="flex justify-between">
           <span>Vence: {paymentDateStr}</span>
           <span>ID: {loan.id.slice(0, 6)}</span>
        </div>
        {/* Closed Date for History */}
        {(loan.status === LoanStatus.PAID || loan.status === LoanStatus.REJECTED) && closedDateStr && (
           <div className="flex justify-between text-green-700 font-medium">
             <span>Completado el: {closedDateStr}</span>
           </div>
        )}
      </div>

      {actionButtons}
    </div>
  );
};

export default LoanCard;