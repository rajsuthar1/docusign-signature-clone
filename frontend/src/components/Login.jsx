import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Testing with the Signup endpoint first to verify connection
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/signup', {
        email: email,
        full_name: "Test User",
        password: password
      });
      setMessage("Success! User created.");
      console.log(response.data);
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.detail || "Connection failed"));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Login to DocuSign Clone</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input 
            type="email" 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Sign In
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm font-medium text-blue-600">{message}</p>}
    </div>
  );
};

export default Login;