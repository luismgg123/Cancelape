import React, { useState, useEffect } from 'react';
import { User, Loan, LoanStatus, Currency, LoanRole } from './types';
import * as api from './services/storageService';
import { Icons } from './constants';
import LoanCard from './components/LoanCard';

// --- Mock Ad Component ---

const MockInterstitialAd = ({ adUnitId, onClose }: { adUnitId: string, onClose: () => void }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 right-4 z-10">
             {countdown === 0 ? (
               <button onClick={onClose} className="bg-black/10 hover:bg-black/20 text-black rounded-full p-1 transition">
                 <Icons.X size={20} />
               </button>
             ) : (
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"></div>
             )}
        </div>
        
        <div className="pt-12 pb-8 px-6 flex flex-col items-center text-center">
            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                ANUNCIO
            </div>
            
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-blue-200 shadow-xl">
              G
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Google AdMob</h2>
            <p className="text-sm text-gray-500 mb-6">Test Interstitial Ad</p>
            
            <div className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 mb-6">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Ad Unit ID</p>
                <p className="text-[10px] text-gray-600 font-mono break-all">{adUnitId}</p>
            </div>
            
            <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl w-full hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Más información
            </button>
        </div>
      </div>
      <div className="mt-6 text-white/40 text-xs text-center">
          {countdown > 0 ? `El botón de cierre aparecerá en ${countdown}s` : 'Ya puedes cerrar el anuncio'}
      </div>
    </div>
  );
};

// --- Auth Component ---

const AuthScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: User) => void }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');

  // Recover State
  const [recEmail, setRecEmail] = useState('');
  const [recStep, setRecStep] = useState<'EMAIL' | 'VERIFY_AND_RESET'>('EMAIL');
  const [recPin, setRecPin] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || loginPin.length !== 6) {
        setError('Ingresa tu correo y clave de 6 dígitos.');
        return;
    }
    
    setLoading(true);
    try {
        const user = await api.loginUser(loginEmail, loginPin, rememberMe);
        onLoginSuccess(user);
    } catch (err: any) {
        setError(err.message || 'Error al iniciar sesión');
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (regPin.length !== 6) return setError('La clave debe tener 6 dígitos');
    if (!regName || !regEmail) return setError('Completa todos los campos');

    setLoading(true);
    try {
        const user = await api.registerUser({
            name: regName,
            email: regEmail,
            pin: regPin
        });
        onLoginSuccess(user);
    } catch (err: any) {
        setError(err.message || 'Error en registro');
    } finally {
        setLoading(false);
    }
  };

  const handleRecoverEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simulate verification
      setTimeout(() => {
          setLoading(false);
          setRecStep('VERIFY_AND_RESET');
      }, 1000);
  };

  const handleRecoverReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (recPin.length !== 6) return setError('La nueva clave debe tener 6 dígitos');
      
      setLoading(true);
      try {
          await api.resetUserPin(recEmail, recPin);
          alert('Clave actualizada. Por favor inicia sesión.');
          setMode('LOGIN');
          setRecStep('EMAIL');
          setRecEmail('');
          setRecPin('');
          setLoginPin('');
      } catch (err: any) {
          setError(err.message || 'Error al restablecer clave');
      } finally {
          setLoading(false);
      }
  };

  const handlePinChange = (val: string, setter: (v: string) => void) => {
      if (/^\d*$/.test(val) && val.length <= 6) {
          setter(val);
      }
  };

  if (mode === 'LOGIN') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-white overflow-y-auto no-scrollbar">
            {/* Logo Area - Simulating the provided image with Icons */}
            <div className="mb-6 flex flex-col items-center">
                <div className="w-28 h-28 rounded-full overflow-hidden border-[6px] border-green-700 shadow-2xl mb-3 bg-white flex items-center justify-center relative">
                     <div className="absolute inset-0 bg-green-50 opacity-50"></div>
                     <div className="relative z-10 flex flex-col items-center translate-y-2">
                        <div className="flex items-center">
                             <Icons.Rabbit size={56} className="text-green-700" strokeWidth={2} />
                             <Icons.Banknote size={24} className="text-green-600 -ml-2 -mt-4 transform rotate-12" />
                        </div>
                     </div>
                </div>
                <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Cancela Pe</h1>
                <p className="text-gray-500 text-sm">Gestiona tus préstamos personales</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
                {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>}
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Google</label>
                    <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        placeholder="tu@gmail.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Clave de 6 dígitos</label>
                    <input
                        type="password"
                        inputMode="numeric"
                        value={loginPin}
                        onChange={e => handlePinChange(e.target.value, setLoginPin)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 tracking-widest text-lg"
                        placeholder="••••••"
                    />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center text-sm text-gray-600 cursor-pointer select-none">
                        <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="mr-2 rounded text-green-600 focus:ring-green-500"
                        />
                        Mantener sesión abierta
                    </label>
                    <button type="button" onClick={() => {setError(''); setMode('RECOVER');}} className="text-sm text-green-600 font-bold hover:underline">
                        ¿Olvidé mi clave?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-green-200 shadow-lg mt-4"
                >
                    {loading ? 'Entrando...' : 'Ingresar'}
                </button>
            </form>

            <p className="mt-8 text-sm text-gray-500">
                ¿No tienes cuenta? <button onClick={() => { setError(''); setMode('REGISTER'); }} className="text-green-600 font-bold hover:underline">Regístrate</button>
            </p>
        </div>
      );
  }

  if (mode === 'REGISTER') {
      return (
        <div className="flex flex-col h-full p-6 bg-white overflow-y-auto no-scrollbar">
            <button onClick={() => setMode('LOGIN')} className="self-start text-gray-400 mb-4 hover:text-green-600">
                 ← Volver
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear cuenta</h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
                {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">{error}</div>}
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                    <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        placeholder="Tu nombre"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Google</label>
                    <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        placeholder="tu@gmail.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Crea una Clave (6 dígitos)</label>
                    <input
                        type="password"
                        inputMode="numeric"
                        required
                        value={regPin}
                        onChange={e => handlePinChange(e.target.value, setRegPin)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 tracking-widest text-lg"
                        placeholder="••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-green-200 shadow-lg mt-4"
                >
                    {loading ? 'Registrarme' : 'Crear Cuenta'}
                </button>
            </form>
        </div>
      );
  }

  // Recover Mode
  return (
    <div className="flex flex-col h-full p-6 bg-white overflow-y-auto no-scrollbar">
        <button onClick={() => setMode('LOGIN')} className="self-start text-gray-400 mb-4 hover:text-green-600">
             ← Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Clave</h2>
        <p className="text-sm text-gray-500 mb-6">Restablece tu acceso de forma segura.</p>
        
        {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center mb-4">{error}</div>}

        {recStep === 'EMAIL' ? (
            <form onSubmit={handleRecoverEmailSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Correo registrado</label>
                    <input
                        type="email"
                        required
                        value={recEmail}
                        onChange={e => setRecEmail(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        placeholder="tu@gmail.com"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-green-200 shadow-lg"
                >
                    {loading ? 'Verificando...' : 'Verificar correo'}
                </button>
            </form>
        ) : (
            <form onSubmit={handleRecoverReset} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800 mb-4">
                    ✓ Correo verificado: <b>{recEmail}</b>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Clave (6 dígitos)</label>
                    <input
                        type="password"
                        inputMode="numeric"
                        required
                        value={recPin}
                        onChange={e => handlePinChange(e.target.value, setRecPin)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 tracking-widest text-lg"
                        placeholder="••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-green-200 shadow-lg"
                >
                    {loading ? 'Actualizando...' : 'Restablecer Clave'}
                </button>
            </form>
        )}
    </div>
  );
};

// --- Create Loan Screen ---

const CreateLoanScreen = ({ currentUser, onSuccess, onCancel }: { currentUser: User, onSuccess: () => void, onCancel: () => void }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [role, setRole] = useState<LoanRole>(LoanRole.LENDER);
  
  // New Form Fields
  const [personName, setPersonName] = useState(''); // Name/Alias
  const [hasApp, setHasApp] = useState(true); // Checkbox
  const [otherEmail, setOtherEmail] = useState(''); // Replaces Phone
  
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.includes('-')) return;
      if (parseFloat(val) < 0) return;
      setAmount(val);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === '-' || e.key === 'e') {
          e.preventDefault();
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !personName) return;
    if (hasApp && !otherEmail) return;

    setLoading(true);
    try {
        const finalOtherEmail = hasApp ? otherEmail : `offline-${Date.now()}`;
        
        const payload = {
            amount: parseFloat(amount),
            currency,
            description,
            createdByEmail: currentUser.email,
            lenderEmail: role === LoanRole.LENDER ? currentUser.email : finalOtherEmail,
            borrowerEmail: role === LoanRole.LENDER ? finalOtherEmail : currentUser.email,
            paymentDate: date ? new Date(date).getTime() : undefined,
            otherName: personName,
            isOffline: !hasApp
        };
        await api.createLoan(payload);
        onSuccess();
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Nuevo Registro</h2>
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Icons.X size={20} className="text-gray-600"/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
        
        {/* Role Toggle */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
            <button
                type="button"
                onClick={() => setRole(LoanRole.LENDER)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === LoanRole.LENDER ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
                Presté dinero
            </button>
            <button
                type="button"
                onClick={() => setRole(LoanRole.BORROWER)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${role === LoanRole.BORROWER ? 'bg-white shadow-sm text-red-500' : 'text-gray-500'}`}
            >
                Me prestaron
            </button>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Monto</label>
            <div className="relative">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={handleAmountChange}
                    onKeyDown={handleAmountKeyDown}
                    className="w-full p-4 text-3xl font-bold border-b-2 border-gray-200 outline-none focus:border-green-500 bg-transparent placeholder-gray-300"
                    placeholder="0.00"
                    autoFocus
                />
                <select 
                    value={currency}
                    onChange={e => setCurrency(e.target.value as Currency)}
                    className="absolute right-0 top-4 text-lg font-medium bg-transparent outline-none text-gray-500"
                >
                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    Persona (Contacto) <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={personName}
                    onChange={e => setPersonName(e.target.value)}
                    placeholder="Nombre o Alias"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                />
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="hasApp" 
                    checked={hasApp} 
                    onChange={e => setHasApp(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="hasApp" className="text-sm text-gray-600 select-none cursor-pointer">
                    La otra persona tiene la aplicación
                </label>
            </div>

            <div className={`transition-opacity duration-200 ${!hasApp ? 'opacity-50' : 'opacity-100'}`}>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo de Google</label>
                <input
                    type="email"
                    value={otherEmail}
                    onChange={e => setOtherEmail(e.target.value)}
                    disabled={!hasApp}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {!hasApp && (
                    <p className="text-[10px] text-gray-500 mt-1">
                        * Modo offline: Solo tú gestionarás este préstamo.
                    </p>
                )}
                {hasApp && (
                    <p className="text-[10px] text-gray-400 mt-1">
                        Se enviará una notificación a este usuario.
                    </p>
                )}
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción (Opcional)</label>
            <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Cena, Taxi, Emergencia..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha límite (Opcional)</label>
            <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
        </div>
      </form>

      <div className="mt-auto pt-4">
        <button
            onClick={handleSubmit}
            disabled={loading || !amount || !personName || (hasApp && !otherEmail)}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-green-200 shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
        >
            {loading ? 'Registrando...' : 'Registrar Préstamo'}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY' | 'NOTIFICATIONS'>('HOME');
  const [isCreating, setIsCreating] = useState(false);
  const [showAd, setShowAd] = useState(false);
  
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Initialize
  useEffect(() => {
    const existingUser = api.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      fetchLoans(existingUser.email);
    }
  }, []);

  const fetchLoans = async (email: string) => {
    setLoadingLoans(true);
    try {
        const data = await api.getMyLoans(email);
        setLoans(data);
    } catch (error) {
        console.error("Failed to load loans", error);
    } finally {
        setLoadingLoans(false);
    }
  };

  const handleLoginSuccess = async (u: User) => {
    setUser(u);
    fetchLoans(u.email);
  };

  const handleLogout = () => {
    api.logoutUser();
    setUser(null);
    setLoans([]);
  };

  const handleStatusUpdate = async (loanId: string, status: LoanStatus) => {
    if (!user) return;
    await api.updateLoanStatus(loanId, status, user.email);
    fetchLoans(user.email);
  };

  const refresh = () => {
    if (user) fetchLoans(user.email);
  };

  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Intercept the creation flow with Ad
  if (showAd) {
      return (
        <MockInterstitialAd 
            adUnitId="ca-app-pub-3940256099942544/1033173712"
            onClose={() => {
                setShowAd(false);
                setIsCreating(true);
            }} 
        />
      );
  }

  if (isCreating) {
    return (
        <CreateLoanScreen 
            currentUser={user} 
            onSuccess={() => { setIsCreating(false); refresh(); }} 
            onCancel={() => setIsCreating(false)} 
        />
    );
  }

  const summary = api.getSummary(loans, user.email);
  const pendingActions = api.getPendingActionsCount(loans, user.email);

  const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.PAID_PENDING_CONFIRMATION);
  const historyLoans = loans.filter(l => l.status === LoanStatus.PAID || l.status === LoanStatus.REJECTED || l.status === LoanStatus.CANCELLED);
  const pendingLoans = loans.filter(l => l.status === LoanStatus.PENDING);

  const notificationLoans = loans.filter(l => {
     const isOffline = !!l.isOffline;
     if (isOffline) {
        return l.status === LoanStatus.PENDING || l.status === LoanStatus.PAID_PENDING_CONFIRMATION;
     }
     const isMyAction = l.lastActionByEmail !== user.email;
     const isPending = l.status === LoanStatus.PENDING;
     const isConfirming = l.status === LoanStatus.PAID_PENDING_CONFIRMATION;
     return (isPending || isConfirming) && isMyAction; 
  });

  const renderContent = () => {
    if (activeTab === 'HOME') {
        return (
            <div className="space-y-4 pb-20 p-4">
                {/* Header / Summary */}
                <div className="bg-green-600 text-white p-5 rounded-3xl shadow-green-200 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold border-2 border-green-400">
                                {user.name.slice(0, 2).toUpperCase()}
                             </div>
                             <div>
                                <span className="block text-xs text-green-200 uppercase tracking-wider font-bold">Bienvenido</span>
                                <span className="font-bold text-lg">{user.name}</span>
                             </div>
                        </div>
                        <button onClick={handleLogout} className="bg-green-700 p-2 rounded-xl text-green-100 hover:text-white hover:bg-green-800 transition">
                            <Icons.LogOut size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-700/40 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-green-100 text-xs mb-1 font-medium uppercase tracking-wide">Te deben</p>
                            <p className="text-2xl font-bold">{summary.totalLent.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-700/40 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-green-100 text-xs mb-1 font-medium uppercase tracking-wide">Debes</p>
                            <p className="text-2xl font-bold">{summary.totalBorrowed.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 px-1">
                    <h3 className="font-bold text-gray-800 text-lg">Préstamos Activos</h3>
                    <span className="text-xs bg-green-100 px-2.5 py-1 rounded-full text-green-700 font-bold">{activeLoans.length}</span>
                </div>

                {loadingLoans ? (
                    <div className="text-center py-10 text-gray-400">Cargando...</div>
                ) : activeLoans.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.Check className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Todo al día. No tienes préstamos activos.</p>
                    </div>
                ) : (
                    activeLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan} currentUser={user} onUpdateStatus={handleStatusUpdate} />
                    ))
                )}
            </div>
        );
    }

    if (activeTab === 'HISTORY') {
        return (
            <div className="space-y-4 pb-20 p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-4 px-1">Historial Completo</h3>
                {historyLoans.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 bg-white rounded-3xl border border-gray-100 mx-4">
                        <Icons.History className="mx-auto mb-2 opacity-50" size={32}/>
                        <p>Historial vacío</p>
                    </div>
                ) : (
                    historyLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan} currentUser={user} onUpdateStatus={handleStatusUpdate} />
                    ))
                )}
            </div>
        );
    }

    if (activeTab === 'NOTIFICATIONS') {
        return (
            <div className="space-y-4 pb-20 p-4">
                 <h3 className="font-bold text-gray-800 text-lg mb-4 px-1">Solicitudes Pendientes</h3>
                 
                 {/* Also show Pending outgoing requests to inform user (Only Online ones) */}
                 {pendingLoans.filter(l => l.lastActionByEmail === user.email && !l.isOffline).length > 0 && (
                     <div className="mb-6">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Enviadas (Esperando respuesta)</h4>
                         {pendingLoans.filter(l => l.lastActionByEmail === user.email && !l.isOffline).map(loan => (
                            <LoanCard key={loan.id} loan={loan} currentUser={user} onUpdateStatus={handleStatusUpdate} />
                         ))}
                     </div>
                 )}

                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Requieren tu acción</h4>
                 {notificationLoans.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                        <p className="text-gray-400">No tienes solicitudes pendientes.</p>
                    </div>
                 ) : (
                    notificationLoans.map(loan => (
                        <LoanCard key={loan.id} loan={loan} currentUser={user} onUpdateStatus={handleStatusUpdate} />
                    ))
                 )}
            </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)] relative z-10">
        <button 
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'HOME' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Icons.Home size={26} strokeWidth={activeTab === 'HOME' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Inicio</span>
        </button>

        <button 
            onClick={() => setShowAd(true)} // Trigger Ad before creation
            className="bg-green-600 text-white p-4 rounded-full -mt-10 shadow-green-300 shadow-lg active:scale-95 transition-transform border-[6px] border-gray-50 hover:bg-green-500"
        >
            <Icons.Plus size={28} strokeWidth={3} />
        </button>

        <button 
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`flex flex-col items-center gap-1.5 relative transition-colors ${activeTab === 'NOTIFICATIONS' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <div className="relative">
                <Icons.Bell size={26} strokeWidth={activeTab === 'NOTIFICATIONS' ? 2.5 : 2} />
                {pendingActions > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {pendingActions}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-bold">Alertas</span>
        </button>

        <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'HISTORY' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Icons.History size={26} strokeWidth={activeTab === 'HISTORY' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Historial</span>
        </button>
      </div>
    </div>
  );
};

export default App;