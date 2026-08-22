import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, Wallet } from 'lucide-react';
import api from '../services/api';

const TOKEN_KEY = 'catalog_jwt';
const USER_KEY = 'control_cuentas_user';

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    return user?.id ? user : null;
  } catch {
    return null;
  }
};

export function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === 'register';
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (isRegister && form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        ...(isRegister ? { name: form.name } : {}),
        email: form.email,
        password: form.password,
      });
      saveSession(data);
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo completar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md bg-[#FFFDF9] border border-[#EFE8DC] rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#5B8266] text-white flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-[#2D2A26]">Control de Cuentas</h1>
            <p className="text-xs text-[#7A746B]">Tus cuentas, en un solo lugar</p>
          </div>
        </div>

        <div className="flex border-b border-[#EAE3D5] mb-6">
          <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`flex-1 pb-3 text-sm font-bold ${!isRegister ? 'text-[#3B6645] border-b-2 border-[#5B8266]' : 'text-[#8C8479]'}`}>Iniciar sesión</button>
          <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`flex-1 pb-3 text-sm font-bold ${isRegister ? 'text-[#3B6645] border-b-2 border-[#5B8266]' : 'text-[#8C8479]'}`}>Crear cuenta</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && <label className="block"><span className="text-xs font-bold text-[#6E6A63]">Nombre</span><div className="relative mt-1"><UserRound className="absolute left-3 top-3.5 w-4 h-4 text-[#A39E93]" /><input required name="name" value={form.name} onChange={updateField} autoComplete="name" className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#E2DAD0] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8266]" /></div></label>}
          <label className="block"><span className="text-xs font-bold text-[#6E6A63]">Correo electrónico</span><div className="relative mt-1"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#A39E93]" /><input required type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#E2DAD0] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8266]" /></div></label>
          <label className="block"><span className="text-xs font-bold text-[#6E6A63]">Contraseña</span><div className="relative mt-1"><LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-[#A39E93]" /><input required minLength={8} type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={updateField} autoComplete={isRegister ? 'new-password' : 'current-password'} className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E2DAD0] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8266]" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-3 text-[#8C8479]" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></label>
          {isRegister && <label className="block"><span className="text-xs font-bold text-[#6E6A63]">Confirmar contraseña</span><input required minLength={8} type="password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" className="w-full mt-1 px-4 py-3 rounded-xl border border-[#E2DAD0] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8266]" /></label>}
          {error && <p role="alert" className="rounded-xl bg-[#FDF0EC] border border-[#F5C2B4] px-4 py-2 text-xs font-semibold text-[#A63F29]">{error}</p>}
          <button disabled={isSubmitting} className="w-full py-3 rounded-xl bg-[#5B8266] hover:bg-[#476C53] disabled:opacity-60 text-white text-sm font-bold transition">{isSubmitting ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>
      </section>
    </main>
  );
}