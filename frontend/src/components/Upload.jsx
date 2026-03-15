import { useState, useRef, useCallback } from 'react';
import { uploadPhoto } from '../api/client';
import { CloudUpload, X, CheckCircle2, AlertCircle, FileImage } from 'lucide-react';

export default function Upload({ onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFiles = (incoming) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        const valid = Array.from(incoming).filter((f) => allowed.includes(f.type));
        const items = valid.map((f) => ({
            file: f,
            preview: URL.createObjectURL(f),
            progress: 0,
            status: 'pending', // pending | uploading | done | error
            error: null,
        }));
        setFiles((prev) => [...prev, ...items]);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            processFiles(e.dataTransfer.files);
        }
    }, []);

    const handleSelect = (e) => {
        if (e.target.files?.length) {
            processFiles(e.target.files);
        }
    };

    const removeFile = (index) => {
        setFiles((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleUpload = async () => {
        if (files.length === 0 || uploading) return;
        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            if (files[i].status === 'done') continue;

            setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: 'uploading' } : f));

            try {
                await uploadPhoto(files[i].file, (progress) => {
                    setFiles((prev) => prev.map((f, j) => j === i ? { ...f, progress } : f));
                });
                setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: 'done', progress: 100 } : f));
            } catch (err) {
                setFiles((prev) => prev.map((f, j) => j === i ? {
                    ...f,
                    status: 'error',
                    error: err.response?.data?.detail || 'Upload failed',
                } : f));
            }
        }

        setUploading(false);
        if (onUploadComplete) onUploadComplete();
    };

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-10 text-center
          ${dragActive
                        ? 'drop-zone-active border-primary-400'
                        : 'border-surface-300 hover:border-primary-300 hover:bg-primary-50/30'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSelect}
                    className="hidden"
                    id="file-upload-input"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300
            ${dragActive ? 'bg-primary-100' : 'bg-surface-100'}`}>
                        <CloudUpload className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary-500' : 'text-surface-400'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-surface-700">
                            {dragActive ? 'Drop photos here!' : 'Drag & drop photos here'}
                        </p>
                        <p className="text-sm text-surface-400 mt-1">
                            or click to browse • JPEG, PNG, WebP
                        </p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3 animate-slide-up">
                    {files.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-xl bg-white border border-surface-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Thumbnail */}
                            <img
                                src={item.preview}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-surface-700 truncate">
                                    {item.file.name}
                                </p>
                                <p className="text-xs text-surface-400">
                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                {/* Progress Bar */}
                                {item.status === 'uploading' && (
                                    <div className="mt-2 w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full progress-bar rounded-full transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                                {item.status === 'done' && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                )}
                                {item.status === 'error' && (
                                    <div className="flex items-center gap-1" title={item.error}>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                                {(item.status === 'pending' || item.status === 'uploading') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        className="p-1 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={uploading || files.every((f) => f.status === 'done')}
                        className="w-full py-3 px-6 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all duration-200"
                        id="upload-button"
                    >
                        {uploading ? 'Uploading...' : `Upload ${files.filter((f) => f.status !== 'done').length} Photo(s)`}
                    </button>
                </div>
            )}
        </div>
    );
}
