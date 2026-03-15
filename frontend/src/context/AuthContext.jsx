import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('drishyamitra_token'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            // Decode username from JWT payload
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.sub });
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const loginUser = (accessToken) => {
        localStorage.setItem('drishyamitra_token', accessToken);
        setToken(accessToken);
    };

    const logoutUser = () => {
        localStorage.removeItem('drishyamitra_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
