import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signUp } from '@/lib/auth-client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const signInSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleSignIn = async (data: SignInData) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        setError(result.error.message || 'Sign in failed');
      } else {
        navigate('/');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        setError(result.error.message || 'Sign up failed');
      } else {
        navigate('/');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    await signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <div className="min-h-screen bg-[#131313]">
      <Navbar />

      <main className="pt-20 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-headline text-4xl md:text-5xl text-white tracking-tighter">
              {mode === 'signin' ? 'Welcome Back' : 'Join DRIP'}
            </h1>
            <p className="text-neutral-500 text-sm tracking-widest uppercase">
              {mode === 'signin'
                ? 'Sign in to your atelier account'
                : 'Create your atelier account'}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 px-4 py-3 text-center">
              <p className="text-red-400 text-xs uppercase tracking-wider">{error}</p>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-4 border border-neutral-700 text-white hover:border-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-xs uppercase tracking-widest font-bold">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-neutral-800" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
              or
            </span>
            <div className="flex-1 h-[1px] bg-neutral-800" />
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form
              onSubmit={signInForm.handleSubmit(handleSignIn)}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Email Address
                  </label>
                  <input
                    {...signInForm.register('email')}
                    type="email"
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="you@example.com"
                  />
                  {signInForm.formState.errors.email && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signInForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Password
                  </label>
                  <input
                    {...signInForm.register('password')}
                    type="password"
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="••••••••"
                  />
                  {signInForm.formState.errors.password && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signInForm.formState.errors.password.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-white py-5 text-black font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="relative z-10">
                  {loading ? 'Signing in...' : 'Sign In'}
                </span>
                <div className="absolute inset-0 bg-neutral-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form
              onSubmit={signUpForm.handleSubmit(handleSignUp)}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Full Name
                  </label>
                  <input
                    {...signUpForm.register('name')}
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="Alexander McQueen"
                  />
                  {signUpForm.formState.errors.name && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signUpForm.formState.errors.name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Email Address
                  </label>
                  <input
                    {...signUpForm.register('email')}
                    type="email"
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="you@example.com"
                  />
                  {signUpForm.formState.errors.email && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signUpForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Password
                  </label>
                  <input
                    {...signUpForm.register('password')}
                    type="password"
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="••••••••"
                  />
                  {signUpForm.formState.errors.password && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signUpForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
                    Confirm Password
                  </label>
                  <input
                    {...signUpForm.register('confirmPassword')}
                    type="password"
                    className="bg-transparent border-t-0 border-x-0 border-b border-neutral-700 px-0 py-3 text-white focus:ring-0 focus:border-white transition-colors placeholder:text-neutral-700"
                    placeholder="••••••••"
                  />
                  {signUpForm.formState.errors.confirmPassword && (
                    <span className="text-red-400 text-[10px] uppercase tracking-wider">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-white py-5 text-black font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span className="relative z-10">
                  {loading ? 'Creating account...' : 'Create Account'}
                </span>
                <div className="absolute inset-0 bg-neutral-200 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="text-center pt-4">
            <p className="text-neutral-500 text-xs tracking-wider">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-white underline underline-offset-4 hover:opacity-70 transition-opacity uppercase tracking-widest"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="text-white underline underline-offset-4 hover:opacity-70 transition-opacity uppercase tracking-widest"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
