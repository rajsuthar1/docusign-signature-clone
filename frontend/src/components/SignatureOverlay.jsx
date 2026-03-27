import React, { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';

// LOCAL WORKER FIX: Replaces the unpkg.com URL to bypass CORS blocks
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const SignatureOverlay = ({ pdfUrl, onSave, docId }) => {
  const [numPages, setNumPages] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const containerRef = useRef(null);

  const API_BASE = 'http://127.0.0.1:8000';

  // --- URL FIXER ---
  // Ensures exact http://127.0.0.1:8000/uploads/... format to avoid 404s
  const getCleanUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${path}`;
  };

  const cleanPdfUrl = getCleanUrl(pdfUrl);

  const [percentPos, setPercentPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log("PDF Signature Overlay - Final Formatted URL:", cleanPdfUrl);
    
    // Guard against non-string objects often returned during API failures
    if (pdfUrl && typeof pdfUrl === 'object' && !(pdfUrl instanceof Blob)) {
        setLoadError({ message: "Invalid PDF data received from server." });
    } else {
        setLoadError(null);
    }
    setIsLoaded(false);
  }, [cleanPdfUrl, pdfUrl]);

  const calculatePercentages = useCallback((x, y) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xP = (x / rect.width) * 100;
    const yP = (y / rect.height) * 100;
    setPercentPos({ x: xP, y: yP });
  }, []);

  useEffect(() => {
    if (isLoaded) calculatePercentages(20, 20);
  }, [isLoaded, calculatePercentages]);

  const handleStop = (e, data) => {
    calculatePercentages(data.x, data.y);
  };

  if (!cleanPdfUrl) {
    return (
      <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl m-10 bg-white font-sans">
        <div className="text-center animate-pulse">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting Document Source...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700 font-sans">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">POSITION SIGNATURE</h2>
        <p className="text-slate-500 mt-2 font-medium">Drag the box to the desired signature location.</p>
      </div>

      <div className="mb-6 flex gap-3">
         <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
            <span className="text-slate-400 mr-2 uppercase">X:</span> {percentPos.x.toFixed(2)}%
         </div>
         <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl text-[11px] font-bold shadow-sm flex items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></div>
            <span className="text-slate-400 mr-2 uppercase">Y:</span> {percentPos.y.toFixed(2)}%
         </div>
      </div>

      <div 
        className="relative shadow-2xl border-[16px] border-white bg-white rounded-3xl overflow-hidden" 
        ref={containerRef}
        style={{ width: '600px', minHeight: '600px' }}
      >
        {loadError ? (
          <div className="flex flex-col items-center justify-center py-48 px-12 text-center bg-red-50/30">
            <span className="text-slate-900 font-bold text-lg">Unable to display PDF</span>
            <p className="text-slate-500 text-sm mt-1">{loadError.message}</p>
          </div>
        ) : (
          /* RENDER GUARD: Ensures Document only attempts to load valid string URLs */
          cleanPdfUrl && typeof cleanPdfUrl === 'string' && (
            <Document 
              file={cleanPdfUrl} 
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setIsLoaded(true);
              }}
              onLoadError={(err) => setLoadError(err)}
              loading={
                <div className="flex flex-col items-center justify-center py-52">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                  <p className="mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading PDF...</p>
                </div>
              }
            >
              <Page 
                pageNumber={1} 
                width={600} 
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
              />
            </Document>
          )
        )}

        {isLoaded && !loadError && (
          <div className="absolute inset-0 pointer-events-none">
            <Draggable 
              bounds="parent" 
              onStop={handleStop}
              defaultPosition={{ x: 20, y: 20 }}
            >
              <div className="pointer-events-auto absolute w-48 h-24 bg-indigo-600/10 border-2 border-dashed border-indigo-600 cursor-move flex flex-col items-center justify-center rounded-xl backdrop-blur-[3px] shadow-xl group">
                <div className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-2 uppercase shadow-lg group-hover:scale-110 transition-transform">
                    Sign Here
                </div>
              </div>
            </Draggable>
          </div>
        )}
      </div>

      <div className="mt-12">
        <button 
          onClick={() => onSave(percentPos)}
          disabled={!isLoaded || loadError}
          className={`px-20 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${
            isLoaded && !loadError
            ? "bg-slate-900 text-white hover:bg-indigo-600 hover:-translate-y-1" 
            : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          Confirm Placement
        </button>
      </div>
    </div>
  );
};

export default SignatureOverlay;