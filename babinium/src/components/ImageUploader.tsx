import React, { useState, useCallback, DragEvent, ClipboardEvent, ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
        alert('Por favor, selecciona un archivo de imagen válido (PNG, JPG, etc.).');
    }
  }, [onImageSelect]);
  
  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        e.preventDefault();
        handleFile(e.clipboardData.files[0]);
      }
  }, [handleFile]);

  return (
    <div 
        className="w-full max-w-lg"
        onPaste={handlePaste}
        tabIndex={0} 
    >
      <label
        htmlFor="image-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-800'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`} />
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Haz clic para subir</span>, arrastra y suelta, o pega una imagen
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF, WEBP</p>
        </div>
        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={isProcessing} />
      </label>
    </div>
  );
};

export default ImageUploader;