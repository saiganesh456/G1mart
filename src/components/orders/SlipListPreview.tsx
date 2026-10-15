'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Image as ImageIcon, Eye, X } from 'lucide-react';

interface SlipImageItem {
  id?: string;
  storage_path?: string;
  image_url: string;
  sort_order?: number;
}

interface Props {
  images: SlipImageItem[];
}

export default function SlipListPreview({ images }: Props) {
  const [activeModalUrl, setActiveModalUrl] = useState<string | null>(null);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  if (!images || images.length === 0) return null;

  const isPdf = (url: string, path?: string) => {
    const target = (url || path || '').toLowerCase();
    return target.includes('.pdf') || target.startsWith('data:application/pdf');
  };

  const getResolvedSrc = (img: SlipImageItem, idx: number) => {
    // If direct image_url failed and we have storage_path, route through our resolver endpoint
    if (failedIndices[idx] && img.storage_path) {
      return `/api/slips/image?path=${encodeURIComponent(img.storage_path)}`;
    }
    return img.image_url;
  };

  return (
    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#15803D]" />
          <span>
            Your Uploaded Grocery List ({images.length} {images.length === 1 ? 'Photo' : 'Photos'})
          </span>
        </span>
        <span className="text-[10px] text-stone-500 font-medium">Tap to view</span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {images.map((img, idx) => {
          const pdf = isPdf(img.image_url, img.storage_path);
          const currentSrc = getResolvedSrc(img, idx);
          const hasPermanentlyFailed = failedIndices[idx] && !img.storage_path;

          if (pdf) {
            return (
              <a
                key={idx}
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-rose-200 hover:bg-rose-50/50 transition-colors shadow-2xs shrink-0 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex flex-col items-center justify-center font-black text-[9px] leading-none shrink-0">
                  <FileText className="w-4 h-4 mb-0.5" />
                  PDF
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-800 group-hover:text-rose-700 transition-colors">
                    List Document {idx + 1}
                  </p>
                  <p className="text-[10px] text-stone-500 flex items-center gap-0.5">
                    <span>View PDF</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </p>
                </div>
              </a>
            );
          }

          if (hasPermanentlyFailed) {
            return (
              <a
                key={idx}
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors shrink-0 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-stone-800">List Page {idx + 1}</p>
                  <p className="text-[10px] text-[#15803D] font-medium flex items-center gap-0.5">
                    <span>Open slip</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </p>
                </div>
              </a>
            );
          }

          return (
            <div
              key={idx}
              className="relative shrink-0 group cursor-pointer"
              onClick={() => setActiveModalUrl(currentSrc)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentSrc}
                alt={`Uploaded grocery list page ${idx + 1}`}
                className="w-14 h-14 object-cover rounded-xl border border-stone-200/90 shadow-2xs group-hover:opacity-90 group-hover:scale-102 transition-all bg-stone-100"
                onError={() => {
                  setFailedIndices((prev) => ({ ...prev, [idx]: true }));
                }}
              />
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                <Eye className="w-4 h-4 drop-shadow-md" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Full View */}
      {activeModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setActiveModalUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-stone-200 bg-stone-50">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#15803D]" />
                Uploaded Grocery List Photo
              </span>
              <button
                type="button"
                onClick={() => setActiveModalUrl(null)}
                className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-stone-900 flex items-center justify-center max-h-[75vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalUrl}
                alt="Uploaded grocery list enlarged preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-2.5 text-center bg-stone-50 border-t border-stone-200 flex items-center justify-center gap-3">
              <a
                href={activeModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
              >
                <span>Open in full tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
