"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Star, Trash2, CheckCircle2, Loader2, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { compressImageToWebP, CompressionResult } from "@/lib/imageCompressor";
import { uploadImageFile } from "@/lib/db";
import { ProductImage } from "@/lib/types";

export type GalleryPhoto = ProductImage;

interface MultiImageUploadProps {
  label?: string;
  sublabel?: string;
  images: ProductImage[];
  primaryUrl?: string;
  onChange: (images: ProductImage[]) => void;
  onSetPrimary?: (url: string) => void;
  folder?: string;
  className?: string;
}

export default function MultiImageUpload({
  label = "Product Images (Multi-upload with WebP Auto-Compression & Primary Cover Selector)",
  sublabel = "Automatic high-efficiency client-side WebP compression (sub-100KB per photo) stored directly on cloud storage.",
  images = [],
  primaryUrl = "",
  onChange,
  onSetPrimary,
  folder = "products",
  className = "",
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setErrorMsg("Please select valid image files (JPG, PNG, WebP, BMP, JFIF)");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentProgress({ current: 0, total: files.length });

    const newUploadedPhotos: GalleryPhoto[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentProgress({ current: i + 1, total: files.length });

        // 1. Client-side canvas compression to WebP (max 1200px, sub-100KB target)
        const compressed: CompressionResult = await compressImageToWebP(file, {
          maxDimension: 1200,
          targetMaxSizeBytes: 100 * 1024,
        });

        // 2. Direct upload to cloud storage
        const uploadedUrl = await uploadImageFile(compressed.file, folder);

        newUploadedPhotos.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          public_url: uploadedUrl,
          sort_order: images.length + newUploadedPhotos.length + 1,
          is_primary: images.length === 0 && newUploadedPhotos.length === 0, // First photo is default primary if none exist
          size_kb: compressed.compressedSizeFormatted,
        });
      }

      const merged = [...images, ...newUploadedPhotos];
      onChange(merged);

      // If no primary was set yet and we uploaded items, make the first one primary
      if (!primaryUrl && merged.length > 0 && onSetPrimary) {
        onSetPrimary(merged[0].public_url);
      }
    } catch (err) {
      console.error("Batch image upload error:", err);
      setErrorMsg("Some images could not be uploaded. Please try again.");
    } finally {
      setIsProcessing(false);
      setCurrentProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (photoUrl: string) => {
    // Notify parent to set main cover
    if (onSetPrimary) {
      onSetPrimary(photoUrl);
    }
    // Update internal is_primary flag for gallery items
    const updated = images.map((img) => ({
      ...img,
      is_primary: img.public_url === photoUrl,
    }));
    onChange(updated);
  };

  const handleRemove = (photoId: string, photoUrl: string) => {
    const updated = images.filter((img) => img.id !== photoId && img.public_url !== photoUrl);
    onChange(updated);

    // If removed photo was the primary, designate the first remaining one as primary
    if (photoUrl === primaryUrl && updated.length > 0 && onSetPrimary) {
      onSetPrimary(updated[0].public_url);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Header Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="block text-xs font-bold text-gray-800 tracking-tight">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-gray-500">
          {images.length} {images.length === 1 ? "photo" : "photos"} in gallery
        </span>
      </div>

      {/* Main Drag & Drop Zone - Matches Reference Image media_1790743550097.png */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 border-2 border-dashed ${
          isDragging
            ? "border-amber-500 bg-slate-900/90 ring-4 ring-amber-500/20"
            : "border-slate-600/70 bg-[#162032] hover:border-amber-500/80 hover:bg-[#1a263c]"
        } shadow-md`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Processing State */}
        {isProcessing && currentProgress && (
          <div className="absolute inset-0 z-20 bg-[#0d1527]/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2.5 p-4 text-center">
            <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
            <span className="text-white font-bold text-xs sm:text-sm">
              Optimizing {currentProgress.current} of {currentProgress.total} photos to WebP...
            </span>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
              />
            </div>
            <span className="text-slate-400 text-[10px]">
              Sub-100KB compression in progress
            </span>
          </div>
        )}

        {/* Upload Icon in Circle (Exact styling as reference) */}
        <div className="w-12 h-12 rounded-full bg-amber-100/90 text-amber-600 mx-auto mb-3 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-amber-200 transition-all">
          <UploadCloud className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h4 className="text-white font-bold text-xs sm:text-sm tracking-wide group-hover:text-amber-300 transition-colors">
          Click to upload multiple images or drag &amp; drop here
        </h4>

        {/* Subtitle */}
        <p className="text-slate-300 text-[11px] mt-1.5 max-w-lg mx-auto leading-relaxed">
          {sublabel}
        </p>
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-500 font-semibold">{errorMsg}</p>
      )}

      {/* Gallery Photos Grid with Primary Cover Selector */}
      {images.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-semibold text-gray-700">Gallery Preview &amp; Cover Assignment:</span>
            <span>Click ⭐ to set as Primary Cover Photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((photo, idx) => {
              const isCover = photo.is_primary || (primaryUrl && photo.public_url === primaryUrl);

              return (
                <div
                  key={photo.id || idx}
                  className={`group relative rounded-xl overflow-hidden aspect-square transition-all duration-200 bg-gray-100 ${
                    isCover
                      ? "ring-3 ring-amber-500 border-2 border-amber-400 shadow-md"
                      : "border border-gray-300 hover:border-gray-400 hover:shadow-xs"
                  }`}
                >
                  <Image
                    src={photo.public_url}
                    alt={`Product photo ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  {/* Primary Badge */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md tracking-tight">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        PRIMARY COVER
                      </span>
                    </div>
                  )}

                  {/* Size tag */}
                  {photo.size_kb && (
                    <div className="absolute bottom-1.5 left-1.5 z-10 pointer-events-none">
                      <span className="bg-slate-950/80 backdrop-blur-xs text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {photo.size_kb}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 z-20 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(photo.public_url)}
                        className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm transition-transform active:scale-95"
                      >
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Set Cover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(photo.id, photo.public_url)}
                      className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-transform active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
