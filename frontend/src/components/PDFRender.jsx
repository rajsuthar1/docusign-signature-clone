import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFRender = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);

  return (
    <div className="flex flex-col items-center bg-gray-500 p-8 min-h-screen">
      <div className="bg-white shadow-2xl p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          error={<p className="text-red-500">Failed to load PDF.</p>}
        >
          <Page pageNumber={1} width={600} />
        </Document>
      </div>
      <p className="text-white mt-4">Page 1 of {numPages}</p>
    </div>
  );
};

export default PDFRender;