import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Building2, UserCircle, Lock, Mail, Phone, MapPin, Upload, Briefcase, ArrowRight, Loader2, FileText, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const isConfigured = url && 
                      key && 
                      url !== 'YOUR_SUPABASE_URL' && 
                      url !== 'mock.supabase.co' && 
                      url.startsWith('http') &&
                      !url.includes('undefined');
  return { url, key, isConfigured };
};

const { url: supabaseUrl, key: supabaseKey, isConfigured } = getSupabaseConfig();
const supabase = createClient(isConfigured ? supabaseUrl : 'https://mock.supabase.co', isConfigured ? supabaseKey : 'mock-key');

export default function Auth({ onLogin }: { onLogin: (session: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { lang, setLang, t } = useLanguage();

  // Login state
  const [businessCode, setBusinessCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [ownerName, setOwnerName] = useState('');
  const [role, setRole] = useState('Buyer');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!isConfigured) {
      // Demo Mode Login
      setTimeout(() => {
        if (businessCode === 'DEMO' && loginPassword === 'demo') {
          onLogin({
            user: { id: 'demo-user', email: 'demo@example.com' },
            access_token: 'demo-token'
          });
        } else {
          setError("Demo Mode: Use code 'DEMO' and password 'demo'");
        }
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // Step 1: Query profiles for email via RPC
      const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_business_code', {
        b_code: businessCode
      });

      if (rpcError) throw rpcError;
      if (!emailData) {
        throw new Error(t.businessCodeNotFound);
      }

      // Step 2: Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailData,
        password: loginPassword,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error(t.invalidCredentials);
        }
        throw signInError;
      }
      
      if (data.session) {
        onLogin(data.session);
      }
    } catch (err: any) {
      setError(err.message || t.loginError);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isConfigured) {
      setError("Registration is disabled in Demo Mode.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    if (!rcFile) {
      setError(t.uploadRCError);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload RC PDF
      const fileExt = rcFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `rc_documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business_documents')
        .upload(filePath, rcFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('business_documents')
        .getPublicUrl(filePath);

      const rc_file_url = publicUrlData.publicUrl;

      // Step 2 & 3: Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: registerPassword,
        options: {
          data: {
            owner_name: ownerName,
            role,
            business_name: businessName,
            phone_number: phone,
            address,
            rc_file_url,
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(t.accountCreated);
      setIsLogin(true);
      
      // Reset form
      setOwnerName('');
      setRole('Buyer');
      setBusinessName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setRcFile(null);
      setRegisterPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      setError(err.message || t.registerError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
        <Globe className="w-4 h-4 text-slate-500" />
        <button 
          onClick={() => setLang('en')}
          className={`text-sm font-medium transition-colors ${lang === 'en' ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          EN
        </button>
        <span className="text-slate-300">|</span>
        <button 
          onClick={() => setLang('fr')}
          className={`text-sm font-medium transition-colors ${lang === 'fr' ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          FR
        </button>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {isLogin ? t.loginTitle : t.registerTitle}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isLogin ? t.loginSubtitle : t.registerSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-white/60">
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {isLogin ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="businessCode" className="block text-sm font-medium text-slate-700">
                  {t.businessCode}
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="businessCode"
                    name="businessCode"
                    type="text"
                    required
                    value={businessCode}
                    onChange={(e) => setBusinessCode(e.target.value)}
                    className="focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 bg-slate-50 border text-slate-900"
                    placeholder={t.businessCodePlaceholder}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-slate-700">
                  {t.password}
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="loginPassword"
                    name="loginPassword"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 bg-slate-50 border text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t.loginBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 gap-y-5 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="businessName" className="block text-sm font-medium text-slate-700">
                    {t.businessName}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="businessName"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="Acme Auto Parts"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700">
                    {t.ownerName}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="ownerName"
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                    {t.role}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="role"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                    >
                      <option value="Buyer">{t.buyer}</option>
                      <option value="Seller">{t.seller}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    {t.email}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                    {t.phone}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="+212 600 000 000"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                    {t.address}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="123 Business Blvd, City"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t.uploadRC}
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label
                          htmlFor="rc-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1"
                        >
                          <span>Upload a file</span>
                          <input
                            id="rc-upload"
                            name="rc-upload"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            required
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setRcFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PDF up to 10MB</p>
                      {rcFile && (
                        <p className="text-sm font-medium text-indigo-600 mt-2 truncate max-w-xs mx-auto">
                          {rcFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="registerPassword" className="block text-sm font-medium text-slate-700">
                    {t.password}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="registerPassword"
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                    {t.confirmPassword}
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2.5 bg-slate-50 border text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t.createAccountBtn
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {isLogin ? t.newHere : t.alreadyRegistered}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
