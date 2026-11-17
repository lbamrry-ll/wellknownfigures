import React, { useEffect } from 'react';
import { Download, FileText, X } from 'lucide-react';

interface PdfHandoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfHandoutModal: React.FC<PdfHandoutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfPath = '/assets/aistudio/____50215e53.pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-xs p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl h-[88vh] bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#F3EFE6] border-b border-[#D6CEBE] shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#9A3412]" />
            <h2 id="pdf-modal-title" className="text-lg font-bold text-[#1C1917]">
              原版人物冊講義（全 54 頁 PDF 對照檢視）
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfPath}
              download="DSE中文議論文人物冊.pdf"
              className="px-3 py-1.5 text-xs font-medium bg-[#1C1917] text-white hover:bg-[#292524] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載 PDF 講義</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉講義檢視器"
              className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-[#EBE6DF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#EBE6DF] relative">
          <iframe
            src={pdfPath}
            title="DSE中文議論文人物冊 PDF"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
