import React from 'react';
import { Play, Tag } from 'lucide-react';
import { LibraryVideo } from '../../types.ts';
import {
    SynapseNetworkIcon,
    ResonatorIcon,
    VoidEclipseIcon,
    CelestialRoseIcon,
    WorldEngineIcon,
} from '../visualizations/SacredGeometryIcons';

interface VideoLibraryItemProps {
    video: LibraryVideo;
}

const domainColors: Record<string, string> = {
    Mind: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    Body: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Shadow: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    Spirit: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Theory: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
};

// Map domains to modality icons
const getDomainIcon = (domain: string): React.ComponentType<{ size?: number; className?: string }> => {
    switch (domain) {
        case 'Mind':
            return SynapseNetworkIcon;
        case 'Body':
            return ResonatorIcon;
        case 'Shadow':
            return VoidEclipseIcon;
        case 'Spirit':
            return CelestialRoseIcon;
        case 'Theory':
            return WorldEngineIcon;
        default:
            return WorldEngineIcon;
    }
};

export default function VideoLibraryItem({ video }: VideoLibraryItemProps) {
    const DomainIcon = getDomainIcon(video.domain);
    const domainColor = domainColors[video.domain] || domainColors.Theory;

    return (
        <div className="group relative flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            {/* Video Preview / Thumbnail Area */}
            <div className="relative aspect-video bg-black overflow-hidden">
                <video
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                    src={video.url}
                    preload="metadata"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600/40 transition-all duration-300">
                        <Play size={20} className="text-purple-100 fill-purple-100 ml-1" />
                    </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-mono text-slate-300 border border-slate-700">
                        {video.duration}
                    </div>
                )}

                {/* Domain Icon Overlay */}
                <div className={`absolute top-2 left-2 transition-opacity duration-300 opacity-30 group-hover:opacity-50 ${domainColor.split(' ')[0]}`}>
                    <DomainIcon size={20} />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${domainColor}`}>
                        <DomainIcon size={12} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${domainColor}`}>
                        {video.domain}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
                        <Tag size={10} /> {video.category}
                    </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2 leading-tight group-hover:text-purple-200 transition-colors">
                    {video.title}
                </h3>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                    {video.description}
                </p>

                <div className="mt-auto">
                    <video
                        className="hidden" // Just to have it available for modal if we add one, but for now we rely on controls or a simple play pattern
                        src={video.url}
                        controls
                    />
                    {/* Action button */}
                    <button
                        className="w-full py-2 bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-500/50 rounded-lg text-xs font-bold text-slate-200 hover:text-purple-100 transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={() => {
                            // Open in a new tab or trigger a modal (modal is better but for now let's just make it look good)
                            window.open(video.url, '_blank');
                        }}
                    >
                        <Play size={14} /> Watch Now
                    </button>
                </div>
            </div>
        </div>
    );
}
