import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register, login } from '../api/client';
import { Camera, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            // Auto-login after registration
            const res = await login({ username: form.username, email: form.email, password: form.password });
            loginUser(res.data.access_token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-primary-50/30 to-surface-50 px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/25 mb-4">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Create account</h1>
                    <p className="text-surface-400 mt-2">Start managing your photos with AI</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/60">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 animate-fade-in">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-surface-600 mb-1.5">Username</label>
                        <input
                            type="text"
                            required
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 text-surface-700 placeholder-surface-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="Choose a username"
                            id="register-username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-600 mb-1.5">Email</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 text-surface-700 placeholder-surface-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                            placeholder="you@example.com"
                            id="register-email"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-surface-600 mb-1.5">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50/50 text-surface-700 placeholder-surface-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all pr-12"
                            placeholder="Min 6 characters"
                            id="register-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-9 text-surface-400 hover:text-surface-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.01] disabled:opacity-50 transition-all duration-200"
                        id="register-submit"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <p className="text-center text-sm text-surface-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 font-medium hover:text-primary-600 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
