import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SignatureOverlay from './SignatureOverlay';
import SignerReview from './SignerReview';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'place', or 'review'

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/docs/`);
      setDocuments(response.data);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/v1/docs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDocs(); 
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || "Check server connection"));
    } finally {
      setUploading(false);
    }
  };

  // NEW: Download the actual "Burned-in" PDF from the backend
  const handleDownload = async (doc) => {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${doc.file_path}`,
        method: 'GET',
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed. The file may still be processing.");
    }
  };

  const handleSaveSignature = async (position) => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/docs/sign-position`, {
        document_id: selectedDoc.id,
        x_pos: position.x,
        y_pos: position.y,
        page_number: 1
      });
      
      alert("Signature area placed! You can now view and sign the document.");
      setSelectedDoc(null);
      setViewMode('list');
      fetchDocs();
    } catch (err) {
      alert("Failed to save placement.");
    }
  };

  // --- CONDITIONAL VIEWS ---

  if (viewMode === 'place' && selectedDoc) {
    return (
      <div className="relative animate-in fade-in duration-500">
        <button 
          onClick={() => setViewMode('list')}
          className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-white transition-all border border-slate-200"
        >
          ← Exit Editor
        </button>
        <SignatureOverlay 
          docId={selectedDoc.id}
          pdfUrl={`${API_BASE_URL}${selectedDoc.file_path}`} 
          onSave={handleSaveSignature}
        />
      </div>
    );
  }

  if (viewMode === 'review' && selectedDoc) {
    return (
      <div className="relative animate-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => { setViewMode('list'); fetchDocs(); }}
          className="absolute top-4 left-4 z-50 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition-all"
        >
          ← Back to List
        </button>
        <SignerReview docId={selectedDoc.id} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-500 mt-2">Manage your e-signature workflow.</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={fetchDocs}
                className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                title="Refresh List"
            >
                <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>

            <label className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95">
            {uploading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                </div>
            ) : "+ New Document"}
            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
            </label>
        </div>
      </div>

      {documents.length === 0 && !loading ? (
        <div className="text-center py-32 border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
          <p className="text-slate-500 font-medium text-lg italic">No documents yet. Ready to sign something?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map(doc => (
            <div 
              key={doc.id} 
              className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500"
            >
              <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
                <svg className="w-20 h-20 text-slate-200 group-hover:scale-110 group-hover:text-indigo-100 transition-all duration-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                
                {/* Status Badge Over Image */}
                <div className="absolute top-4 right-4">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border ${
                        doc.status === 'completed' 
                        ? 'bg-emerald-500 text-white border-emerald-400' 
                        : 'bg-white text-slate-600 border-slate-100'
                    }`}>
                        {doc.status}
                    </span>
                </div>

                {/* ACTION OVERLAY */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                   <button 
                    onClick={() => { setSelectedDoc(doc); setViewMode('place'); }}
                    className="w-40 bg-white text-slate-900 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                   >
                     Setup Signature
                   </button>
                   
                   <button 
                    onClick={() => { setSelectedDoc(doc); setViewMode('review'); }}
                    className="w-40 bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                   >
                     Sign Document
                   </button>

                   {doc.status === 'completed' && (
                       <button 
                        onClick={() => handleDownload(doc)}
                        className="text-white/70 hover:text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors mt-2"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Download Final PDF
                       </button>
                   )}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-slate-800 truncate text-lg">{doc.filename}</h3>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-1">
                    UPLOADED {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;