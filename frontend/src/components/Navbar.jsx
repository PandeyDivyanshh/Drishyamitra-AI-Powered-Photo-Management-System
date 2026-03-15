import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LogOut, Search } from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 glass-light shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text tracking-tight">
                            Drishyamitra
                        </span>
                    </Link>

                    {/* Right side */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-surface-600">
                                Hi, <span className="text-primary-600 font-semibold">{user?.username}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-500 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2 text-sm font-medium text-surface-600 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] transition-all duration-200"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
