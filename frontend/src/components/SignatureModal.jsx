import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas'; // Install: npm install react-signature-canvas

const SignatureModal = ({ isOpen, onClose, onSave }) => {
  const sigPad = useRef(null);

  if (!isOpen) return null;

  const clear = () => sigPad.current.clear();
  
  const save = () => {
    if (sigPad.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    // Get the image as a base64 string
    const dataURL = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Draw Your Signature</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden">
            <SignatureCanvas 
              ref={sigPad}
              penColor='black'
              canvasProps={{
                width: 400, 
                height: 200, 
                className: 'sigCanvas cursor-crosshair'
              }}
            />
          </div>
          <p className="text-center text-xs text-gray-400 mt-2 italic">Use your mouse or finger to sign above</p>
        </div>

        <div className="p-6 flex gap-3 justify-end bg-white">
          <button 
            onClick={clear}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear Pad
          </button>
          <button 
            onClick={save}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            Adopt & Sign
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;