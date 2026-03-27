import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import SignerReview from './components/SignerReview';

const Navbar = () => (
  <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 font-sans">
    <Link to="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-black">DS</span>
      </div>
      DocuSign <span className="text-indigo-600">Clone</span>
    </Link>
    <div className="flex gap-6 items-center">
      <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
      <Link to="/login" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
        Get Started
      </Link>
    </div>
  </nav>
);

const SignPageWrapper = () => {
  const { docId } = useParams();
  return <SignerReview docId={docId} />;
};

const Home = () => (
  <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 inline-block border border-indigo-100">
        Final Year Project • SPPU 2026
      </span>
      <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
        The simplest way to <br />
        <span className="text-indigo-600 italic">Sign Documents</span>
      </h1>
      <p className="text-slate-500 text-xl max-w-xl mx-auto leading-relaxed mb-10 font-medium">
        Secure, full-stack e-signature solution built with FastAPI & React. 
        Precise coordinate mapping with digital ink.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/login" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
          Get Started Free
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans antialiased">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<div className="min-h-[80vh] flex items-center justify-center py-12"><AuthForm /></div>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sign/:docId" element={<SignPageWrapper />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;