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
  ArrowLeft,
  SwitchCamera,
  ShieldCheck,
  Phone,
  User,
  Plus,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

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
  const router = useRouter();
  const { user } = useAuth();
  const { currentLocation, isServiceable } = useLocation();
  const [step, setStep] = useState<'camera' | 'preview' | 'details' | 'success'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
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
  const isClosingRef = useRef(false);
  const historyPushedRef = useRef(false);

  // Stop camera, close scanner, and reliably navigate to home section ('/')
  const handleExitToHome = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    stopCamera();
    onClose();
    router.push('/');
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      try {
        if (typeof window !== 'undefined' && window.history.state?.g1modal === 'slip-scanner') {
          window.history.back();
        }
      } catch {}
    }
    setTimeout(() => {
      isClosingRef.current = false;
    }, 400);
  };

  // Step-aware Back Button in header: details -> preview -> camera -> home
  const handleHeaderBack = () => {
    if (step === 'details') {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('camera');
      startCamera(facingMode);
    } else {
      handleExitToHome();
    }
  };

  // Sync user details if available, with fallback to previously saved customer details
  useEffect(() => {
    if (user?.name) setCustomerName(user.name);
    if (user?.phone) setCustomerPhone(user.phone);

    try {
      if (typeof window !== 'undefined') {
        if (!user?.phone) {
          const savedPhone =
            localStorage.getItem('g1mart_customer_phone') ||
            JSON.parse(localStorage.getItem('g1mart_user_session') || '{}')?.phone ||
            JSON.parse(localStorage.getItem('g1mart_last_used_address') || '{}')?.mobileNumber ||
            JSON.parse(localStorage.getItem('g1mart_recent_order') || '{}')?.address?.mobileNumber ||
            '';
          if (savedPhone) setCustomerPhone(savedPhone);
        }
        if (!user?.name) {
          const savedName =
            localStorage.getItem('g1mart_customer_name') ||
            JSON.parse(localStorage.getItem('g1mart_user_session') || '{}')?.name ||
            JSON.parse(localStorage.getItem('g1mart_last_used_address') || '{}')?.fullName ||
            JSON.parse(localStorage.getItem('g1mart_recent_order') || '{}')?.address?.fullName ||
            '';
          if (savedName) setCustomerName(savedName);
        }
      }
    } catch {}
  }, [user, isOpen]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera with configurable facingMode ('environment' or 'user')
  const startCamera = async (targetFacingMode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (pErr) {
            console.warn('[SlipScanner] Video play warning:', pErr);
          }
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera is not supported on this browser or connection is not HTTPS.');
      }
    } catch (err: any) {
      console.warn('[SlipScanner] Camera access error:', err);
      // Fallback to basic video stream if ideal facing mode failed
      if (targetFacingMode === 'user') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          setCameraActive(true);
          return;
        } catch {}
      }
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or upload a photo from your device.');
      } else {
        setCameraError('Unable to access camera on this device. You can upload a photo from your gallery below.');
      }
      setCameraActive(false);
    }
  };

  // Switch between Rear (environment) and Front (user) camera
  const handleSwitchCamera = () => {
    setIsSwitchingCamera(true);
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode).finally(() => {
      setTimeout(() => setIsSwitchingCamera(false), 400);
    });
  };

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setStep('camera');
      setCapturedPhotos([]);
      setActivePhotoIndex(0);
      setUploadError(null);
      setUploadedSlipId(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Intercept Android hardware & gesture back button so pressing back
  // ALWAYS returns to home section ('/') and NEVER closes or crashes the app!
  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ g1modal: 'slip-scanner' }, '', window.location.href);
      historyPushedRef.current = true;
    } catch {}

    const handlePopState = () => {
      historyPushedRef.current = false;
      stopCamera();
      onClose();
      router.push('/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, router]);

  // Handle ESC key to dismiss modal and go home
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExitToHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

    if (!isServiceable && (currentLocation.distance_km || 0) > 30) {
      setUploadError('Your detected location is beyond our 30 km serviceable radius. Slips can only be accepted in serviceable areas.');
      setStep('details');
      return;
    }

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

      // Copy saved customer location snapshot (Phase 6 Rule 1 & 2)
      formData.append('address', currentLocation.formattedAddress || 'Padarupalli, Nellore');
      if (currentLocation.lat) formData.append('lat', String(currentLocation.lat));
      if (currentLocation.lng) formData.append('lng', String(currentLocation.lng));
      if (currentLocation.pincode) formData.append('pincode', currentLocation.pincode);
      formData.append('distance_km', String(currentLocation.distance_km || 2));
      formData.append('eta_min', String(currentLocation.eta_min || 15));
      if (currentLocation.zone?.id) formData.append('zone_id', currentLocation.zone.id);
      formData.append('zone_min_order', String(currentLocation.min_order || currentLocation.zone?.min_order || 500));
      formData.append('order_type', 'delivery');

      const res = await fetch('/api/slips/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload slip.');
      }

      const activeSlipId = data.orderId || data.slipId || 'slip_received';
      setUploadedSlipId(activeSlipId);

      // Cache slip order so customer sees it in Orders immediately (Phase 6 Rule 2)
      const slipOrderRecord = {
        id: activeSlipId,
        orderNumber: activeSlipId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'SLIP_RECEIVED',
        type: 'slip',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
        subtotal: 0,
        grandTotal: 0,
        total: 0,
        items: [],
        images: capturedPhotos.map((p, idx) => ({
          storagePath: `slips/${cleanPhone}/slip_${idx + 1}.jpg`,
          imageUrl: p.previewUrl,
          image_url: p.previewUrl,
          sort_order: idx,
        })),
        address: {
          fullName: customerName,
          phone: cleanPhone,
          mobileNumber: cleanPhone,
          streetArea: currentLocation.formattedAddress || 'Padarupalli, Nellore',
          city: 'Nellore',
        },
        customerNote: deliveryNote,
      };

      try {
        sessionStorage.setItem('g1mart_latest_order', JSON.stringify(slipOrderRecord));
        const prev = JSON.parse(sessionStorage.getItem('g1mart_orders_list') || '[]');
        sessionStorage.setItem('g1mart_orders_list', JSON.stringify([slipOrderRecord, ...prev]));

        const accPrev = JSON.parse(localStorage.getItem('g1mart_account_orders') || '[]');
        localStorage.setItem('g1mart_account_orders', JSON.stringify([slipOrderRecord, ...accPrev]));
        localStorage.setItem('g1mart_recent_order', JSON.stringify(slipOrderRecord));

        // Save phone and name for seamless future orders
        localStorage.setItem('g1mart_customer_phone', cleanPhone);
        if (customerName.trim()) {
          localStorage.setItem('g1mart_customer_name', customerName.trim());
        }
      } catch {}

      setStep('success');
    } catch (err: any) {
      console.error('[SlipScanner] Upload error:', err);
      let friendlyError = err.message || 'Network error while sending slip. Please try again.';
      if (friendlyError.includes('ENOENT') || friendlyError.includes('mkdir')) {
        friendlyError = 'Server temporarily unable to store file. Please try again.';
      }
      setUploadError(friendlyError);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  if (step === 'details' || step === 'success') {
    return (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) handleExitToHome();
        }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
          {step === 'details' ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-white to-white border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-stone-900 leading-tight">
                      Your Contact Information
                    </h2>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      Store staff will call you once your {capturedPhotos.length} slip {capturedPhotos.length === 1 ? 'page is' : 'pages are'} reviewed
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExitToHome}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form & Content */}
              <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
                {/* Captured Pages Strip */}
                {capturedPhotos.length > 0 && (
                  <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-stone-50 border border-stone-200/70 overflow-x-auto">
                    {capturedPhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative w-14 h-20 rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-xs bg-white shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.previewUrl}
                          alt={`Slip Page ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white font-black text-center py-0.5">
                          Page {idx + 1}
                        </span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddAnother}
                      className="h-20 px-3 rounded-xl border border-dashed border-stone-300 hover:border-emerald-500 text-stone-500 hover:text-emerald-700 flex flex-col items-center justify-center gap-1 text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Page</span>
                    </button>
                  </div>
                )}

                {/* Delivery Address Pill */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-stone-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2E7D32] flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wide block">
                      Delivering to
                    </span>
                    <span className="text-xs text-stone-900 font-bold truncate block">
                      {currentLocation.formattedAddress || 'Padarupalli, Nellore'}
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Full Name <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ramesh / Lakshmi"
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-sm outline-none transition-colors focus:bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Mobile Number <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-stone-600 text-xs font-extrabold pointer-events-none pr-2 border-r border-stone-300">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full h-11 pl-20 pr-3.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-sm font-medium tracking-wide outline-none transition-colors focus:bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Special Notes for Store <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g. Please deliver by 6 PM, include only Tata brand pulses"
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs outline-none transition-colors focus:bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    />
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('preview')}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Back to Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending List...</span>
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
            </>
          ) : (
            /* Success confirmation */
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">
                  We received your list. Our team will call you to confirm
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
                  Our store staff has received your handwritten grocery list. We will prepare your bill and call you on{' '}
                  <span className="text-stone-900 font-bold">+91 {customerPhone}</span> to confirm items and pricing.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-stone-500">
                  <span>Slip Order ID:</span>
                  <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                    {uploadedSlipId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-500">
                  <span>Live Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>SLIP_RECEIVED (In Queue)</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (uploadedSlipId) {
                      router.push(`/orders/${uploadedSlipId}`);
                    }
                  }}
                  className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>Track Live Status in Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleExitToHome}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden touch-none select-none">
      {/* Header Bar: Non-changeable title & subtitle with on-screen Back Arrow and Close button */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950/80 backdrop-blur-md border-b border-white/10 text-white z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-white/10 flex items-center justify-center text-stone-200 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Back"
            title="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Scan Slip or Grocery List</h2>
              <p className="text-[10px] text-emerald-300/80 font-medium">English &amp; Telugu handwriting accepted</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExitToHome}
          className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-white/10 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer active:scale-95"
          aria-label="Close scanner and return home"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-black">
        {/* Hidden File Input for Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* ── STEP 1: CAMERA SCANNER (FULL SCREEN, GREEN FLOATING ANIMATION, NO RECTANGULAR BOX) ── */}
        {step === 'camera' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            {/* Live Fullscreen Video Feed */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Camera Permission Denied or Unavailable State */}
            {cameraError && (
              <div className="z-20 max-w-sm mx-4 p-5 rounded-2xl bg-stone-900/95 border border-stone-700 text-center space-y-3 shadow-2xl">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Camera Access Needed</h3>
                <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload from Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            )}

            {/* ── IMMERSIVE GREENERY FLOATING & ANALYZING SCANNER OVERLAY ── */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {/* 1. Ambient greenery glow across the entire camera view */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/25 via-transparent to-emerald-950/35" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(16,185,129,0.18)]" />

                {/* 2. Floating sweeping emerald laser beam with luminous gradient trail */}
                <div className="absolute inset-x-0 h-36 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-scanner-sweep pointer-events-none">
                  <div className="w-full h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10B981,0_0_32px_#34D399]" />
                </div>

                {/* 3. Floating live AI slip telemetry indicator at top */}
                <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 shadow-lg flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-300 tracking-wider uppercase">
                      AI Slip Scanner Active
                    </span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <span className="w-0.5 h-2 bg-emerald-400 animate-pulse" />
                      <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse delay-75" />
                      <span className="w-0.5 h-2 bg-emerald-400 animate-pulse delay-150" />
                    </div>
                  </div>
                </div>

                {/* 4. Full-screen outer corner brackets (no restrictive box, frames the full sensor) */}
                <div className="absolute inset-5 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-7 h-7 border-t-2 border-l-2 border-emerald-400/70 rounded-tl-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    <div className="w-7 h-7 border-t-2 border-r-2 border-emerald-400/70 rounded-tr-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-7 h-7 border-b-2 border-l-2 border-emerald-400/70 rounded-bl-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    <div className="w-7 h-7 border-b-2 border-r-2 border-emerald-400/70 rounded-br-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                </div>

                {/* 5. Center "Scan your slip" floating badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="animate-scanner-float flex flex-col items-center gap-2">
                    <div className="px-6 py-2.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.45)] flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                      <span className="text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase drop-shadow-sm">
                        Scan your slip
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-100 bg-black/50 px-3.5 py-1 rounded-full backdrop-blur-xs border border-white/10 shadow-sm">
                      Place slip anywhere in camera view
                    </span>
                  </div>
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
      </div>

      {/* Bottom Controls Bar */}
      {step === 'camera' && (
        <div className="px-8 py-5 bg-stone-950/85 backdrop-blur-md border-t border-white/10 flex items-center justify-between z-20">
          {/* Upload (from Gallery / Device) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-stone-300 hover:text-emerald-400 transition-colors cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-stone-900 group-hover:bg-emerald-950/60 border border-stone-700 group-hover:border-emerald-500/50 flex items-center justify-center transition-all shadow-md group-active:scale-95">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tracking-wide">Upload</span>
          </button>

          {/* Shutter Capture Button (Full Camera Capture) */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleCapture}
              disabled={!cameraActive}
              aria-label="Click photo"
              className="relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1.5 cursor-pointer active:scale-90 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:border-emerald-400 disabled:opacity-30 disabled:pointer-events-none"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-emerald-400 active:bg-emerald-500 transition-colors shadow-inner" />
            </button>
          </div>

          {/* Switch Camera Button (Front <-> Rear) */}
          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={!cameraActive}
            className="flex flex-col items-center gap-1.5 text-stone-300 hover:text-emerald-400 transition-colors cursor-pointer group disabled:opacity-40"
          >
            <div className="w-12 h-12 rounded-full bg-stone-900 group-hover:bg-emerald-950/60 border border-stone-700 group-hover:border-emerald-500/50 flex items-center justify-center transition-all shadow-md group-active:scale-95">
              <SwitchCamera className={`w-5 h-5 transition-transform duration-500 ${isSwitchingCamera ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[11px] font-bold tracking-wide">Switch</span>
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="px-6 py-4 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between gap-3 z-10">
          <button
            type="button"
            onClick={handleRetakeAll}
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
