import { useState } from 'react';
import { X, Download, Share2, User } from 'lucide-react';

export default function PhotoModal({ photo, onClose }) {
    if (!photo) return null;

    const imageUrl = `/static/uploads/${photo.filepath.split(/[/\\]/).pop()}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="flex-1 bg-surface-950 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
                        <img
                            src={imageUrl}
                            alt={photo.filename}
                            className="max-w-full max-h-[70vh] object-contain"
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="w-full md:w-80 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-surface-800 truncate">{photo.filename}</h3>
                            <p className="text-sm text-surface-400 mt-1">
                                {new Date(photo.upload_timestamp).toLocaleDateString('en-IN', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>

                        {/* Faces */}
                        {photo.faces?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-surface-600 mb-3">Detected Faces</h4>
                                <div className="space-y-2">
                                    {photo.faces.map((face) => (
                                        <div
                                            key={face.id}
                                            className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 border border-surface-100"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-surface-700 truncate">{face.name}</p>
                                                <p className="text-xs text-surface-400">
                                                    {(face.confidence * 100).toFixed(1)}% confidence
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href={imageUrl}
                                download={photo.filename}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-medium text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all">
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
