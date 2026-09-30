"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, CheckCircle2, Loader2, RefreshCw, Trash2, Sparkles, Image as ImageIcon } from "lucide-react";
import { compressImageToWebP, CompressionResult } from "@/lib/imageCompressor";
import { uploadImageFile } from "@/lib/db";

interface SingleImageUploadProps {
  label?: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "banner" | "portrait" | "auto";
  maxDimension?: number;
}

export default function SingleImageUpload({
  label,
  sublabel = "PNG, JPG, BMP auto-compressed into lightweight WebP in KB size",
  value = "",
  onChange,
  folder = "products",
  className = "",
  aspectRatio = "auto",
  maxDimension = 1200,
}: SingleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressStats, setCompressStats] = useState<{
    originalSize: string;
    compressedSize: string;
    savings: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (JPG, PNG, WebP, BMP, JFIF)");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // 1. Client-side Canvas Auto-Resize & WebP Compression
      const result: CompressionResult = await compressImageToWebP(file, {
        maxDimension,
        targetMaxSizeBytes: 100 * 1024, // sub-100KB target
      });

      setCompressStats({
        originalSize: result.originalSizeFormatted,
        compressedSize: result.compressedSizeFormatted,
        savings: result.savingsPercent,
      });

      // 2. Direct upload of compressed WebP blob to Cloud Storage
      const uploadedUrl = await uploadImageFile(result.file, folder);

      // 3. Update parent state with CDN URL
      onChange(uploadedUrl);
    } catch (err) {
      console.error("Image upload/compression error:", err);
      setErrorMsg("Failed to compress and upload image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setCompressStats(null);
    setErrorMsg(null);
  };

  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "banner":
        return "aspect-[21/9]";
      case "portrait":
        return "aspect-[3/4]";
      default:
        return "min-h-[140px]";
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800 tracking-tight">
            {label}
          </label>
          {compressStats && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-fade-in">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {compressStats.compressedSize} WebP ({compressStats.savings}% saved)
            </span>
          )}
        </div>
      )}

      {/* Main Upload / Preview Area */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group cursor-pointer rounded-2xl transition-all duration-200 overflow-hidden ${
          value
            ? "border border-gray-200 bg-gray-50 shadow-xs"
            : "border-2 border-dashed bg-[#0d1527] border-slate-700/80 hover:border-amber-500/80 shadow-md"
        } ${isDragging ? "!border-amber-500 !bg-slate-900/90 ring-4 ring-amber-500/20" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* LOADING OVERLAY */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-[#0d1527]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <div className="text-white font-bold text-xs tracking-wide">
              Compressing &amp; Converting to WebP...
            </div>
            <div className="text-slate-400 text-[10px]">
              Optimizing dimensions &amp; generating ultra-light CDN asset
            </div>
          </div>
        )}

        {/* IF VALUE EXISTS: LIVE PREVIEW MODE */}
        {value ? (
          <div className={`relative w-full ${getAspectClass()} max-h-56 flex items-center justify-center bg-gray-900/5`}>
            <div className="relative w-full h-full min-h-[140px]">
              <Image
                src={value}
                alt="Upload preview"
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Bottom Status Ribbon */}
            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-amber-400 border border-slate-700 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>WebP Ready</span>
              </span>
            </div>
          </div>
        ) : (
          /* EMPTY STATE: Matches user reference mockup */
          <div className="py-7 px-4 flex flex-col items-center justify-center text-center">
            {/* Cloud Icon */}
            <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center mb-2.5 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-amber-500" />
            </div>

            {/* Title */}
            <span className="text-white font-bold text-xs sm:text-sm tracking-wide group-hover:text-amber-400 transition-colors">
              Click to upload image
            </span>

            {/* Subtitle */}
            <span className="text-slate-400 text-[11px] mt-1 max-w-sm leading-relaxed">
              {sublabel}
            </span>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[11px] text-red-500 font-semibold mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
