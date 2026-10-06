'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ScanBarcode, Camera, Search, Check, Sparkles } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeScannerModal({ isOpen, onClose }: BarcodeScannerModalProps) {
  const router = useRouter();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when closing
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCameraError(null);
      setBarcodeInput('');
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera not supported on this browser.');
      }
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. You can enter or select a barcode below.');
      setCameraActive(false);
    }
  };

  const handleSearchBarcode = (code: string) => {
    if (!code.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(code.trim())}`);
  };

  // Popular FMCG Barcodes for quick testing
  const sampleBarcodes = [
    { name: 'Aashirvaad Atta', code: 'Aashirvaad Atta' },
    { name: 'Tata Salt', code: 'Tata Salt' },
    { name: 'Surf Excel', code: 'Surf Excel' },
    { name: 'Mysore Sandal Soap', code: 'Mysore Sandal' },
    { name: 'Vim Bar', code: 'Vim Bar' },
    { name: 'Dettol Soap', code: 'Dettol Soap' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 leading-tight">Barcode Scanner</h3>
              <p className="text-[11px] text-stone-500 font-medium">Scan FMCG barcode or pantry item</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport / Scanning Area */}
        <div className="p-5 space-y-4">
          <div className="relative aspect-video rounded-2xl bg-stone-900 overflow-hidden flex flex-col items-center justify-center text-white p-4">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
            ) : null}

            {/* Target Reticle Overlay */}
            <div className="relative z-10 w-48 h-28 border-2 border-dashed border-emerald-400/80 rounded-xl flex items-center justify-center pointer-events-none">
              <div className="w-full h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              <div className="absolute top-1 left-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 bg-black/60 px-1 py-0.5 rounded">
                G1 Scanner
              </div>
            </div>

            {!cameraActive && (
              <div className="mt-3 text-center space-y-2 z-10">
                <p className="text-xs text-stone-300 font-medium max-w-xs">
                  {cameraError || 'Point camera at product barcode or tap to activate live camera'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Input or Code Entry */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchBarcode(barcodeInput);
            }}
            className="space-y-2"
          >
            <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
              Or Type / Paste Barcode Number
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 8901030383792 or product name"
                className="w-full h-11 pl-3.5 pr-20 rounded-xl bg-stone-100 border border-stone-200 text-xs font-medium focus:bg-white focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]/20 outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Demo Barcodes */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Quick Test Items
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleBarcodes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSearchBarcode(item.code)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-[#2E7D32] border border-stone-200/60 text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
