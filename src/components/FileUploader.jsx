import { useRef, useState } from 'react';

export default function FileUploader({ onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = (file) => {
    if (file && file.name.endsWith('.xlsx')) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      alert('Please upload a valid .xlsx file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        dragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-gray-500">
        <svg
          className="mx-auto h-10 w-10 mb-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {fileName ? (
          <p className="text-sm font-medium text-gray-700">{fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium">
              Drop your .xlsx file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports Arabic store order exports
            </p>
          </>
        )}
      </div>
    </div>
  );
}
