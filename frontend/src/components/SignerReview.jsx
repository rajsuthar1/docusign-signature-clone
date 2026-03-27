import React, { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const SignerReview = ({ docId }) => {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingId, setSigningId] = useState(null);
  const sigPad = useRef({});
  const API_BASE = 'http://127.0.0.1:8000';

  const loadData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/docs/${docId}`);
      setDocData(res.data);
    } catch (err) {
      console.error("Error loading document", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (docId) loadData(); }, [docId]);

  const saveSignature = async (sigId) => {
    if (sigPad.current.isEmpty()) return alert("Please sign first.");
    const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    try {
      await axios.patch(`${API_BASE}/api/v1/docs/signatures/${sigId}/finalize`, { image: dataUrl });
      setSigningId(null);
      loadData(); // Refresh to show burned-in signature
    } catch (err) { alert("Finalization failed."); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return (
    <div className="flex flex-col items-center p-8 bg-gray-900 min-h-screen">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-white">Document Review</h1>
      </div>

      <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white" style={{ width: '600px' }}>
        {/* Loading Guard: Only render Document if file_path exists */}
        {docData?.file_path ? (
          <Document 
            file={`${API_BASE}${docData.file_path}`}
            onLoadError={(err) => console.error("PDF Load Error:", err)}
          >
            <Page pageNumber={1} width={600} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        ) : (
          <div className="h-[600px] flex items-center justify-center bg-slate-100 text-slate-400">
            Document URL not found. Check backend uploads folder.
          </div>
        )}

        {/* Overlays */}
        {docData?.signatures?.map((sig) => (
          <div 
            key={sig.id} 
            onClick={() => sig.status === 'pending' && setSigningId(sig.id)}
            style={{ position: 'absolute', left: `${sig.x_pos}%`, top: `${sig.y_pos}%`, width: '160px', transform: 'translate(-50%, -50%)', zIndex: 10 }}
          >
            {sig.status === 'signed' ? (
              <img src={`${API_BASE}${sig.signature_image_path}`} className="w-full mix-blend-multiply" alt="Signed" />
            ) : (
              <div className="border-2 border-dashed border-indigo-500 bg-indigo-50/90 p-3 text-[10px] text-indigo-700 font-bold text-center rounded cursor-pointer">
                CLICK TO SIGN
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Signature Modal Logic (Same as before) */}
      {signingId && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
             <SignatureCanvas ref={sigPad} penColor='black' canvasProps={{width: 400, height: 200, className: 'sigCanvas'}} />
             <div className="flex gap-2 mt-4">
                <button onClick={() => setSigningId(null)} className="flex-1 py-2 border rounded-xl">Cancel</button>
                <button onClick={() => saveSignature(signingId)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl">Save</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignerReview;