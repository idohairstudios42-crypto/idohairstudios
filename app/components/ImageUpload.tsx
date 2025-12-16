'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    imageUrl?: string;
    onUpload: (url: string, publicId: string) => void;
    onRemove?: () => void;
    folder?: string;
    label?: string;
    className?: string;
}

export default function ImageUpload({
    imageUrl,
    onUpload,
    onRemove,
    folder = 'general',
    label = 'Upload Image',
    className = '',
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result as string;

                    const response = await fetch('/api/cloudinary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64, folder }),
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const data = await response.json();
                    onUpload(data.url, data.publicId);
                    toast.success('Image uploaded successfully');
                } catch {
                    toast.error('Failed to upload image');
                } finally {
                    setUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            toast.error('Failed to process image');
            setUploading(false);
        }
    }, [folder, onUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
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
        if (file) {
            handleUpload(file);
        }
    };

    const handleRemove = async () => {
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div className={className}>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>

            {imageUrl ? (
                <div className="relative group">
                    <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
                        <Image
                            src={imageUrl}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {onRemove && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative h-32 w-full rounded-lg border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${dragActive
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-gray-700 hover:border-gray-600 bg-black/40'
                        }`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                            <span className="text-xs text-gray-400">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-500" />
                            <span className="text-xs text-gray-400">
                                Drag & drop or click to upload
                            </span>
                            <span className="text-xs text-gray-600">Max 5MB</span>
                        </>
                    )}
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
