import { useState, useEffect, useMemo } from 'react';
import { searchPhotos } from '../api/client';
import PhotoModal from './PhotoModal';
import { FolderOpen, Users, Image, RefreshCw } from 'lucide-react';

export default function Gallery({ refreshTrigger, chatPhotos }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [activeFolder, setActiveFolder] = useState('All');

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const res = await searchPhotos({});
            setPhotos(res.data);
        } catch {
            // silently fail — user might not be logged in yet
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPhotos();
    }, [refreshTrigger]);

    // If chat returned specific photos, show those
    const displayPhotos = chatPhotos?.length > 0 ? chatPhotos : photos;

    // Build smart folders from detected face names
    const smartFolders = useMemo(() => {
        const folderMap = { All: [] };
        displayPhotos.forEach((photo) => {
            folderMap.All.push(photo);
            photo.faces?.forEach((face) => {
                if (!folderMap[face.name]) folderMap[face.name] = [];
                folderMap[face.name].push(photo);
            });
        });
        return folderMap;
    }, [displayPhotos]);

    const folderNames = Object.keys(smartFolders);
    const filteredPhotos = smartFolders[activeFolder] || [];

    return (
        <div className="flex gap-6">
            {/* Smart Folders Sidebar */}
            {folderNames.length > 1 && (
                <div className="w-56 flex-shrink-0 space-y-1 hidden md:block">
                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-3">
                        Smart Folders
                    </h3>
                    {folderNames.map((name) => (
                        <button
                            key={name}
                            onClick={() => setActiveFolder(name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${activeFolder === name
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                                }`}
                        >
                            {name === 'All' ? (
                                <Image className="w-4 h-4" />
                            ) : name === 'Unknown' ? (
                                <Users className="w-4 h-4" />
                            ) : (
                                <FolderOpen className="w-4 h-4" />
                            )}
                            <span className="truncate">{name}</span>
                            <span className="ml-auto text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
                                {smartFolders[name].length}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Photo Grid */}
            <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-800">
                            {activeFolder === 'All' ? 'All Photos' : activeFolder}
                        </h2>
                        <p className="text-sm text-surface-400 mt-1">
                            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
                            {chatPhotos?.length > 0 && ' • AI search results'}
                        </p>
                    </div>
                    <button
                        onClick={fetchPhotos}
                        className="p-2.5 rounded-xl border border-surface-200 text-surface-400 hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50/50 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Grid */}
                {loading && filteredPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm">Loading photos...</p>
                    </div>
                ) : filteredPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                        <Image className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-lg font-medium text-surface-500">No photos yet</p>
                        <p className="text-sm mt-1">Upload some photos to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredPhotos.map((photo, index) => {
                            const imageUrl = `/static/uploads/${photo.filepath.split(/[/\\]/).pop()}`;
                            return (
                                <div
                                    key={photo.id}
                                    onClick={() => setSelectedPhoto(photo)}
                                    className="photo-card group cursor-pointer rounded-2xl overflow-hidden bg-white border border-surface-100 shadow-sm animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="aspect-square overflow-hidden bg-surface-100">
                                        <img
                                            src={imageUrl}
                                            alt={photo.filename}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-surface-600 truncate">
                                            {photo.filename}
                                        </p>
                                        {photo.faces?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {photo.faces.slice(0, 3).map((face) => (
                                                    <span
                                                        key={face.id}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-600"
                                                    >
                                                        {face.name}
                                                    </span>
                                                ))}
                                                {photo.faces.length > 3 && (
                                                    <span className="text-[10px] text-surface-400 px-1">
                                                        +{photo.faces.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
        </div>
    );
}
