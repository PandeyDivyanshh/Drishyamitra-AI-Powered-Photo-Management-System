import { useState, useCallback } from 'react';
import Upload from '../components/Upload';
import Gallery from '../components/Gallery';
import ChatSidebar from '../components/ChatSidebar';
import { Plus, X } from 'lucide-react';

export default function Home() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [chatPhotos, setChatPhotos] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

    const handleUploadComplete = useCallback(() => {
        setRefreshKey((k) => k + 1);
        setChatPhotos([]);
    }, []);

    const handleSearchResults = useCallback((photos) => {
        setChatPhotos(photos);
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-surface-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-surface-800">
                            Your <span className="gradient-text">Gallery</span>
                        </h1>
                        <p className="text-surface-400 mt-1">
                            AI-powered photo management with face recognition
                        </p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${showUpload
                                ? 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02]'
                            }`}
                        id="toggle-upload"
                    >
                        {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {showUpload ? 'Close' : 'Upload Photos'}
                    </button>
                </div>

                {/* Upload Section */}
                {showUpload && (
                    <div className="mb-10 animate-slide-up">
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <Upload onUploadComplete={handleUploadComplete} />
                        </div>
                    </div>
                )}

                {/* Chat result banner */}
                {chatPhotos.length > 0 && (
                    <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-primary-50 border border-primary-100 animate-fade-in">
                        <p className="text-sm font-medium text-primary-700">
                            ✨ Showing {chatPhotos.length} result{chatPhotos.length !== 1 ? 's' : ''} from AI search
                        </p>
                        <button
                            onClick={() => setChatPhotos([])}
                            className="text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors"
                        >
                            Clear results
                        </button>
                    </div>
                )}

                {/* Gallery */}
                <Gallery refreshTrigger={refreshKey} chatPhotos={chatPhotos} />
            </div>

            {/* Chat Sidebar */}
            <ChatSidebar onSearchResults={handleSearchResults} />
        </div>
    );
}
