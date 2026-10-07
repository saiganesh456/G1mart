'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Phone,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface CapturedPhoto {
  id: string;
  blob: Blob;
  previewUrl: string;
}

export default function SlipScannerModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<'camera' | 'preview' | 'details' | 'success'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedSlipId, setUploadedSlipId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync user details if available
  useEffect(() => {
    if (user?.name) setCustomerName(user.name);
    if (user?.phone) setCustomerPhone(user.phone);
  }, [user]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start rear camera
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera is not supported on this browser or connection is not HTTPS.');
      }
    } catch (err: any) {
      console.warn('[SlipScanner] Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or choose a photo from your gallery.');
      } else {
        setCameraError('Unable to access camera on this device. You can choose a photo from your gallery below.');
      }
      setCameraActive(false);
    }
  };

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setStep('camera');
      setCapturedBlob(null);
      setPreviewUrl(null);
      setUploadError(null);
      setUploadedSlipId(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Client-side image compression: max 1600px on long side, max ~1.5MB JPEG
  const compressImage = async (imageSource: HTMLImageElement | HTMLVideoElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        let width = 'videoWidth' in imageSource ? imageSource.videoWidth : imageSource.naturalWidth;
        let height = 'videoHeight' in imageSource ? imageSource.videoHeight : imageSource.naturalHeight;

        if (!width || !height) {
          width = 1200;
          height = 1600;
        }

        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(imageSource, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas compression failed'));
            }
          },
          'image/jpeg',
          0.82
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  // Capture frame from live video
  const handleCapture = async () => {
    if (!videoRef.current) return;
    try {
      const blob = await compressImage(videoRef.current);
      const url = URL.createObjectURL(blob);
      const newPhoto: CapturedPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        blob,
        previewUrl: url,
      };
      setCapturedPhotos((prev) => [...prev, newPhoto]);
      setActivePhotoIndex(capturedPhotos.length);
      stopCamera();
      setStep('preview');
    } catch (err) {
      console.error('[SlipScanner] Capture error:', err);
      setUploadError('Failed to capture frame. Please try again.');
    }
  };

  // File picker handler (gallery fallback)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const added: CapturedPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) continue;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const blob = await compressImage(img);
        const url = URL.createObjectURL(blob);
        added.push({
          id: `photo_${Date.now()}_${i}`,
          blob,
          previewUrl: url,
        });
      }

      if (added.length > 0) {
        setCapturedPhotos((prev) => [...prev, ...added]);
        setActivePhotoIndex(capturedPhotos.length);
        stopCamera();
        setStep('preview');
      } else {
        setUploadError('Please select valid image files (JPG, PNG, or WebP).');
      }
    } catch (err) {
      console.error('[SlipScanner] File processing error:', err);
      setUploadError('Failed to process selected images.');
    }
  };

  // Add another photo
  const handleAddAnother = () => {
    setUploadError(null);
    setStep('camera');
    startCamera();
  };

  // Remove photo from captured set
  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length === 0) {
        setStep('camera');
        startCamera();
      } else if (activePhotoIndex >= updated.length) {
        setActivePhotoIndex(updated.length - 1);
      }
      return updated;
    });
  };

  // Retake all photos
  const handleRetakeAll = () => {
    setCapturedPhotos([]);
    setActivePhotoIndex(0);
    setUploadError(null);
    setStep('camera');
    startCamera();
  };

  // Submit slip photos to server
  const handleUpload = async () => {
    if (capturedPhotos.length === 0) return;

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setUploadError('Please provide a valid 10-digit mobile number.');
      setStep('details');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      capturedPhotos.forEach((photo, idx) => {
        formData.append('files', photo.blob, `slip_${idx + 1}.jpg`);
      });
      // Fallback single file field for backward compatibility
      if (capturedPhotos[0]) {
        formData.append('file', capturedPhotos[0].blob, 'slip.jpg');
      }
      formData.append('name', customerName.trim() || 'Valued Customer');
      formData.append('phone', cleanPhone);
      formData.append('note', deliveryNote.trim());

      const res = await fetch('/api/slips/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload slip.');
      }

      setUploadedSlipId(data.slipId || 'slip_received');
      setStep('success');
    } catch (err: any) {
      console.error('[SlipScanner] Upload error:', err);
      setUploadError(err.message || 'Network error while sending slip. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden touch-none select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-900/80 border-b border-stone-800 text-white z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#4CAF50]" />
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Scan Slip or Grocery List</h2>
            <p className="text-[10px] text-stone-400">English &amp; Telugu handwriting accepted</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* ── STEP 1: CAMERA SCANNER ── */}
        {step === 'camera' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Camera Permission Denied or Unavailable State */}
            {cameraError && (
              <div className="z-10 max-w-sm mx-4 p-5 rounded-2xl bg-stone-900/90 border border-stone-700 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Camera Access Needed</h3>
                <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Choose from Gallery</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            )}

            {/* Document Framing Guide (Camera Active) */}
            {cameraActive && (
              <div className="relative z-10 w-[82vw] max-w-sm aspect-[3/4] rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none flex flex-col justify-between p-4">
                {/* Corner guide brackets */}
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-4 border-l-4 border-[#4CAF50] rounded-tl-md" />
                  <div className="w-5 h-5 border-t-4 border-r-4 border-[#4CAF50] rounded-tr-md" />
                </div>
                <div className="text-center bg-black/60 backdrop-blur-xs py-1.5 px-3 rounded-full self-center">
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Align your handwritten slip inside frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-4 border-l-4 border-[#4CAF50] rounded-bl-md" />
                  <div className="w-5 h-5 border-b-4 border-r-4 border-[#4CAF50] rounded-br-md" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: PREVIEW CAPTURED PHOTOS (MULTI-PHOTO) ── */}
        {step === 'preview' && capturedPhotos.length > 0 && (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-3 select-none">
            {/* Active Photo Full Display */}
            <div className="flex-1 w-full flex items-center justify-center p-2 relative min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedPhotos[activePhotoIndex]?.previewUrl}
                alt={`Slip Page ${activePhotoIndex + 1}`}
                className="max-w-full max-h-[62vh] object-contain rounded-2xl shadow-2xl border border-stone-800"
              />

              {/* Delete Current Page Button */}
              <button
                type="button"
                onClick={() => handleRemovePhoto(activePhotoIndex)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-rose-900 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Remove this page"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip with Add Another Page Option */}
            <div className="w-full max-w-sm py-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
              {capturedPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-[#4CAF50] scale-105 shadow-md'
                      : 'border-stone-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white font-black text-center">
                    p.{idx + 1}
                  </span>
                </button>
              ))}

              {/* Add More Photos Button */}
              {capturedPhotos.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddAnother}
                  className="w-12 h-16 rounded-lg border-2 border-dashed border-stone-600 hover:border-emerald-400 bg-stone-900 flex flex-col items-center justify-center text-stone-400 hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                  title="Capture next page of slip"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Add</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: CUSTOMER PHONE/NAME DETAILS ── */}
        {step === 'details' && (
          <div className="w-full max-w-sm px-4 py-6 bg-stone-900 rounded-3xl border border-stone-800 mx-4 space-y-4">
            <div className="text-center">
              <h3 className="text-base font-extrabold text-white">Your Contact Information</h3>
              <p className="text-xs text-stone-400 mt-1">
                Store staff will contact you via Phone/WhatsApp once your {capturedPhotos.length} slip {capturedPhotos.length === 1 ? 'page is' : 'pages are'} reviewed.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-400 block mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-800 border border-stone-700 text-white text-sm outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-400 block mb-1">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-stone-800 border border-stone-700 text-white text-sm outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-400 block mb-1">
                  Special Notes for Store (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Please deliver by 6 PM, include only Tata brand pulses"
                  className="w-full p-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white text-xs outline-none focus:border-[#4CAF50]"
                />
              </div>

              {uploadError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/60">
                  {uploadError}
                </p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back to Preview
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Send</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
        {step === 'success' && (
          <div className="w-full max-w-sm px-6 py-8 bg-stone-900 rounded-3xl border border-stone-800 mx-4 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#4CAF50] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">Your slip was sent to the store.</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Our supermarket staff has received your handwritten grocery list. We will check stock availability and call or message you on{' '}
                <span className="text-white font-bold">{customerPhone}</span> to confirm your items.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80 text-left text-xs space-y-1">
              <div className="flex justify-between text-stone-400">
                <span>Slip Reference:</span>
                <span className="font-mono text-white font-bold">{uploadedSlipId}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Received by G1 Mart</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      {step === 'camera' && (
        <div className="px-6 py-4 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between z-10">
          {/* Gallery Fallback Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Gallery</span>
          </button>

          {/* Shutter Capture Button */}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!cameraActive}
            aria-label="Capture photo"
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 cursor-pointer active:scale-90 transition-transform disabled:opacity-30 disabled:pointer-events-none"
          >
            <div className="w-full h-full rounded-full bg-white hover:bg-emerald-400 transition-colors" />
          </button>

          {/* Camera Flip / Restart Button */}
          <button
            type="button"
            onClick={startCamera}
            className="flex flex-col items-center gap-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Restart</span>
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="px-6 py-4 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between gap-3 z-10">
          <button
            type="button"
            onClick={handleRetake}
            className="flex-1 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake</span>
          </button>

          <button
            type="button"
            onClick={() => setStep('details')}
            className="flex-1 py-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Use Photo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
