'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ZoomIn, ZoomOut, Move, Check, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    imageUrl?: string;
    onUpload: (url: string, publicId: string) => void;
    onRemove?: () => void;
    folder?: string;
    label?: string;
    className?: string;
    aspectRatio?: '4/5' | '1/1' | '3/4';
}

interface CropState {
    scale: number;
    x: number;
    y: number;
}

// Cloudinary configuration from environment
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'hairengineer_unsigned';

export default function ImageUpload({
    imageUrl,
    onUpload,
    onRemove,
    folder = 'general',
    label = 'Upload Image',
    className = '',
    aspectRatio = '4/5',
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropState, setCropState] = useState<CropState>({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Handle zoom
    const handleZoom = (direction: 'in' | 'out') => {
        setCropState(prev => ({
            ...prev,
            scale: Math.max(0.5, Math.min(3, prev.scale + (direction === 'in' ? 0.1 : -0.1)))
        }));
    };

    // Handle pan start
    const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - cropState.x, y: clientY - cropState.y });
    };

    // Handle pan move
    const handlePanMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setCropState(prev => ({
            ...prev,
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        }));
    }, [isDragging, dragStart]);

    // Handle pan end
    const handlePanEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add event listeners for pan
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handlePanMove);
            window.addEventListener('mouseup', handlePanEnd);
            window.addEventListener('touchmove', handlePanMove);
            window.addEventListener('touchend', handlePanEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handlePanMove);
            window.removeEventListener('mouseup', handlePanEnd);
            window.removeEventListener('touchmove', handlePanMove);
            window.removeEventListener('touchend', handlePanEnd);
        };
    }, [isDragging, handlePanMove, handlePanEnd]);

    // Reset crop state
    const resetCrop = () => {
        setCropState({ scale: 1, x: 0, y: 0 });
    };

    // Handle file selection
    const handleFileSelect = (file: File) => {
        setError(null);

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedFile(reader.result as string);
            setShowCropper(true);
            resetCrop();
        };
        reader.readAsDataURL(file);
    };

    /**
     * INDUSTRY STANDARD: Direct client-side upload to Cloudinary
     * This bypasses the server completely, avoiding Vercel timeout limits
     */
    const uploadToCloudinary = async (blob: Blob): Promise<{ url: string; publicId: string }> => {
        if (!CLOUD_NAME) {
            throw new Error('Cloudinary cloud name not configured');
        }

        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', `hairengineer/${folder}`);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

            // Track upload progress
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(progress);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            url: response.secure_url,
                            publicId: response.public_id
                        });
                    } catch {
                        reject(new Error('Failed to parse response'));
                    }
                } else {
                    try {
                        const error = JSON.parse(xhr.responseText);
                        reject(new Error(error.error?.message || 'Upload failed'));
                    } catch {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.ontimeout = () => reject(new Error('Upload timed out'));

            // 5 minute timeout for very slow connections
            xhr.timeout = 300000;

            xhr.send(formData);
        });
    };

    // Confirm and upload the cropped image
    const handleConfirmCrop = async () => {
        if (!selectedFile || !cropperRef.current) return;

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Create a canvas to capture the cropped area
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            // Get the cropper dimensions
            const cropperRect = cropperRef.current.getBoundingClientRect();
            const outputSize = 800;
            canvas.width = outputSize;
            canvas.height = aspectRatio === '1/1' ? outputSize :
                aspectRatio === '4/5' ? outputSize * 1.25 :
                    outputSize * 1.33;

            // Create image element
            const img = document.createElement('img');
            img.crossOrigin = 'anonymous';

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
                img.src = selectedFile;
            });

            // Calculate the visible area
            const scaleRatio = img.naturalWidth / (cropperRect.width * cropState.scale);
            const srcX = (-cropState.x * scaleRatio) + (img.naturalWidth / 2 - (cropperRect.width / 2 * scaleRatio));
            const srcY = (-cropState.y * scaleRatio) + (img.naturalHeight / 2 - (cropperRect.height / 2 * scaleRatio));
            const srcWidth = cropperRect.width * scaleRatio;
            const srcHeight = cropperRect.height * scaleRatio;

            // Draw the cropped image
            ctx.drawImage(
                img,
                Math.max(0, srcX),
                Math.max(0, srcY),
                srcWidth,
                srcHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // Convert canvas to blob for upload
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
                    'image/jpeg',
                    0.9
                );
            });

            // Upload directly to Cloudinary (bypasses server - no timeout issues!)
            const result = await uploadToCloudinary(blob);

            onUpload(result.url, result.publicId);
            toast.success('Image uploaded successfully');
            setShowCropper(false);
            setSelectedFile(null);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err?.message || 'Failed to upload image');
            toast.error(err?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
        e.target.value = '';
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleRemove = () => {
        if (onRemove) onRemove();
    };

    const cancelCrop = () => {
        setShowCropper(false);
        setSelectedFile(null);
        setError(null);
        resetCrop();
    };

    return (
        <div className={className}>
            <label className="block text-xs text-gray-400 mb-2">{label}</label>

            {/* Cropper Modal */}
            {showCropper && selectedFile && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-lg">
                        {/* Instructions */}
                        <div className="text-center mb-4">
                            <h3 className="text-white text-lg font-semibold mb-1">Adjust Your Image</h3>
                            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                                <Move size={16} /> Drag to position • Pinch or use buttons to zoom
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* Cropper Area */}
                        <div
                            ref={cropperRef}
                            className="relative mx-auto overflow-hidden rounded-xl border-2 border-white/30 bg-gray-900 cursor-move"
                            style={{
                                width: '100%',
                                maxWidth: '350px',
                                aspectRatio: aspectRatio.replace('/', ' / ')
                            }}
                            onMouseDown={handlePanStart}
                            onTouchStart={handlePanStart}
                        >
                            {/* Image */}
                            <img
                                ref={imageRef}
                                src={selectedFile}
                                alt="Crop preview"
                                className="absolute w-full h-full object-cover pointer-events-none select-none"
                                style={{
                                    transform: `translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale})`,
                                    transformOrigin: 'center center',
                                }}
                                draggable={false}
                            />

                            {/* Grid overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="border border-white/20" />
                                    ))}
                                </div>
                            </div>

                            {/* Upload Progress Overlay */}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
                                    <div className="w-3/4 bg-gray-700 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-white h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-white text-sm">{uploadProgress}% uploaded</span>
                                </div>
                            )}
                        </div>

                        {/* Preview Card */}
                        <div className="mt-4 flex justify-center">
                            <div className="text-center">
                                <p className="text-gray-500 text-xs mb-2">Card Preview</p>
                                <div
                                    className="relative overflow-hidden rounded-lg border border-white/20 bg-gray-900"
                                    style={{
                                        width: '80px',
                                        aspectRatio: aspectRatio.replace('/', ' / ')
                                    }}
                                >
                                    <img
                                        src={selectedFile}
                                        alt="Card preview"
                                        className="absolute w-full h-full object-cover"
                                        style={{
                                            transform: `translate(${cropState.x * 0.23}px, ${cropState.y * 0.23}px) scale(${cropState.scale})`,
                                            transformOrigin: 'center center',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => handleZoom('out')}
                                disabled={uploading}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-50"
                                title="Zoom out"
                            >
                                <ZoomOut size={20} />
                            </button>
                            <button
                                onClick={resetCrop}
                                disabled={uploading}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-50"
                                title="Reset"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                onClick={() => handleZoom('in')}
                                disabled={uploading}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition disabled:opacity-50"
                                title="Zoom in"
                            >
                                <ZoomIn size={20} />
                            </button>
                        </div>

                        {/* Zoom indicator */}
                        <div className="text-center mt-2">
                            <span className="text-gray-500 text-xs">{Math.round(cropState.scale * 100)}%</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={cancelCrop}
                                disabled={uploading}
                                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmCrop}
                                disabled={uploading}
                                className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Confirm
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Upload Area */}
            {imageUrl ? (
                <div className="relative group">
                    <div
                        className="relative w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-700"
                        style={{ aspectRatio: aspectRatio.replace('/', ' / ') }}
                    >
                        <Image
                            src={imageUrl}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        {onRemove && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-full transition"
                                title="Remove image"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-2 left-2 right-2 bg-black/70 hover:bg-black/90 text-white py-2 px-3 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"
                    >
                        <Upload size={14} />
                        Replace Image
                    </button>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative w-full rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${dragActive
                            ? 'border-white bg-white/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
                        }`}
                    style={{ aspectRatio: aspectRatio.replace('/', ' / '), minHeight: '200px' }}
                >
                    <div className="p-4 rounded-full bg-gray-800">
                        <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <span className="text-sm text-gray-300 font-medium block">
                            Drag & drop or tap to upload
                        </span>
                        <span className="text-xs text-gray-500 mt-1 block">
                            JPG, PNG up to 10MB
                        </span>
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
