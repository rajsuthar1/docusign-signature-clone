import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle State
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Switch endpoint based on mode
    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';
    
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Store token and go to Dashboard
          localStorage.setItem('token', data.access_token);
          navigate('/dashboard');
        } else {
          // If signup successful, flip to login mode
          setIsLogin(true);
          alert("Account created! Please log in.");
        }
      } else {
        setError(data.detail || "Authentication failed");
      }
    } catch (err) {
      setError("Backend server is not responding.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        {isLogin ? 'Welcome Back' : 'Join DocuSign Clone'}
      </h2>
      <p className="text-gray-500 text-center mb-8 text-sm">
        {isLogin ? 'Enter your credentials to access your docs' : 'Start managing your digital signatures today'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Raj Suthar"
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="aman@labmentix.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="••••••••"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transform transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center border-t pt-6">
        <p className="text-gray-600 text-sm">
          {isLogin ? "New to our platform?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-blue-600 font-bold hover:underline"
          >
            {isLogin ? "Sign Up Now" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;