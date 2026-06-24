"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useProgressPhotos } from "@/features/progress/hooks";
import type { ProgressPhotoPoint } from "@/features/progress/types";
import { Button } from "@/components/ui/button";

export default function ProgressPhotosPage() {
  const { data: photos, isLoading, isError } = useProgressPhotos();

  // State for comparison
  const [beforePhoto, setBeforePhoto] = useState<ProgressPhotoPoint | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<ProgressPhotoPoint | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Auto-initialize comparison if we have photos
  useEffect(() => {
    if (photos && photos.length >= 2 && !beforePhoto && !afterPhoto) {
      // Sort chronologically (oldest first) to find oldest and newest
      const sorted = [...photos].sort((a, b) => a.date.localeCompare(b.date));
      setBeforePhoto(sorted[0]);
      setAfterPhoto(sorted[sorted.length - 1]);
    } else if (photos && photos.length === 1 && !beforePhoto) {
      setBeforePhoto(photos[0]);
    }
  }, [photos, beforePhoto, afterPhoto]);

  // Handle slider movement (mouse / touch)
  const handleMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  // Format date helper
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString(undefined, options);
  };

  // Calculate weight difference if both weights exist
  const getWeightDiffText = () => {
    if (beforePhoto && afterPhoto && typeof beforePhoto.weight_kg === "number" && typeof afterPhoto.weight_kg === "number") {
      const diff = afterPhoto.weight_kg - beforePhoto.weight_kg;
      if (diff === 0) return "No weight change";
      const sign = diff > 0 ? "+" : "";
      return `${sign}${diff.toFixed(1)} kg`;
    }
    return null;
  };

  // Calculate days elapsed between before & after photos
  const getDaysElapsed = () => {
    if (beforePhoto && afterPhoto) {
      const dateA = new Date(beforePhoto.date);
      const dateB = new Date(afterPhoto.date);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        const diffTime = Math.abs(dateB.getTime() - dateA.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Same day";
        return `${diffDays} days apart`;
      }
    }
    return null;
  };

  const weightDiff = getWeightDiffText();
  const daysElapsed = getDaysElapsed();

  return (
    <AppShell title="Transformation Photos" eyebrow="Visual progress timeline">
      {/* Top action bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] px-4 py-3">
        <Link href="/progress" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Analytics
        </Link>
        <Link href="/progress/body-measurement" className="rounded-xl bg-lime-300 px-4 py-2 text-xs font-black text-slate-900 transition hover:bg-lime-400">
          Upload New Photo
        </Link>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="size-8 animate-spin rounded-full border-2 border-lime-350 border-t-transparent shadow-[0_0_12px_rgba(163,230,53,0.15)]" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Loading progress photos...</span>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm font-bold text-red-300">Could not load progress photos. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (!photos || photos.length === 0) && (
        <div className="rounded-[1.35rem] border border-lime-200/10 bg-[#101b15] p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-300 mb-4">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <h3 className="text-base font-black text-white">No progress photos found</h3>
          <p className="mt-2 text-xs font-bold text-slate-500 max-w-sm mx-auto">
            Progress photos are automatically saved when you log a body measurement with a photo attached.
          </p>
          <Link href="/progress/body-measurement" className="mt-5 inline-flex rounded-xl bg-lime-300 px-5 py-3 text-xs font-black text-slate-900 transition hover:bg-lime-400">
            Log Body Measurement with Photo
          </Link>
        </div>
      )}

      {!isLoading && !isError && photos && photos.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Comparison Slider / Panel */}
          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-lime-200/10 bg-[#0b1710] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black">Compare Transformation</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    {daysElapsed ? `${daysElapsed}` : "Select two photos to compare"}
                  </p>
                </div>
                {(beforePhoto || afterPhoto) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setBeforePhoto(null);
                      setAfterPhoto(null);
                    }}
                    className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-white transition"
                  >
                    Clear selection
                  </Button>
                )}
              </div>

              {/* Slider area */}
              {beforePhoto && afterPhoto ? (
                <div 
                  ref={sliderContainerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  onMouseDown={() => setIsResizing(true)}
                  onTouchStart={() => setIsResizing(true)}
                  className="relative h-[360px] w-full select-none overflow-hidden rounded-2xl border border-lime-300/15 bg-slate-950 cursor-ew-resize"
                >
                  {/* Before Image (underneath) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={beforePhoto.image_url}
                    alt="Before progress"
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable="false"
                  />
                  <div className="absolute left-3 top-3 z-10 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs border border-white/5">
                    Before: {formatDateString(beforePhoto.date)}
                    {beforePhoto.weight_kg ? ` • ${beforePhoto.weight_kg} kg` : ""}
                  </div>

                  {/* After Image (clipped on top) */}
                  <div 
                    className="absolute inset-0 h-full w-full overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={afterPhoto.image_url}
                      alt="After progress"
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable="false"
                    />
                    <div className="absolute right-3 top-3 z-10 rounded-lg bg-lime-400/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                      After: {formatDateString(afterPhoto.date)}
                      {afterPhoto.weight_kg ? ` • ${afterPhoto.weight_kg} kg` : ""}
                    </div>
                  </div>

                  {/* Slider Control Line */}
                  <div 
                    className="absolute bottom-0 top-0 w-1 bg-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.5)] z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-lime-300 text-slate-950 shadow-[0_0_15px_rgba(163,230,53,0.6)] border-2 border-[#050b08]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0-4.5 4.5M21 7.5H7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : beforePhoto ? (
                <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-lime-300/15 bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={beforePhoto.image_url}
                    alt="Selected progress"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                    Selected: {formatDateString(beforePhoto.date)}
                    {beforePhoto.weight_kg ? ` • ${beforePhoto.weight_kg} kg` : ""}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 text-center backdrop-blur-xs">
                    <p className="text-xs font-bold text-lime-200/90 max-w-xs leading-relaxed">
                      Select a second photo from the grid to enable the interactive Before & After transformation slider!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#07120c] p-6 text-center">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-600 mb-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0-4.5 4.5M21 7.5H7.5" />
                  </svg>
                  <p className="text-xs font-bold text-slate-400 max-w-xs">
                    Select photos from your grid below to set them as the Before and After states.
                  </p>
                </div>
              )}

              {/* Stats Change Summary */}
              {beforePhoto && afterPhoto && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                  <article className="rounded-xl border border-white/5 bg-[#101b15] p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Weight Difference</p>
                    <p className={`mt-1 text-lg font-black ${weightDiff?.startsWith("-") ? "text-lime-300" : "text-white"}`}>
                      {weightDiff ?? "--"}
                    </p>
                  </article>
                  <article className="rounded-xl border border-white/5 bg-[#101b15] p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Time Elapsed</p>
                    <p className="mt-1 text-lg font-black text-lime-200">
                      {daysElapsed ?? "--"}
                    </p>
                  </article>
                </div>
              )}
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-black px-1">Photo History ({photos.length})</h2>
            <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {photos.map((photo, index) => {
                const isBefore = beforePhoto?.date === photo.date && beforePhoto?.image_url === photo.image_url;
                const isAfter = afterPhoto?.date === photo.date && afterPhoto?.image_url === photo.image_url;

                return (
                  <div
                    key={`${photo.date}-${index}`}
                    className={`group relative overflow-hidden rounded-2xl border bg-slate-950 transition-all duration-300 ${
                      isBefore
                        ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20"
                        : isAfter
                        ? "border-lime-300 shadow-[0_0_15px_rgba(190,242,100,0.15)] ring-2 ring-lime-300/20"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image_url}
                        alt={`Progress photo logged on ${photo.date}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Active Status Badges */}
                      <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
                        {isBefore && (
                          <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
                            Before
                          </span>
                        )}
                        {isAfter && (
                          <span className="rounded-md bg-lime-300 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                            After
                          </span>
                        )}
                      </div>

                      {/* Info overlay (shows on hover / always mobile) */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-6 text-white">
                        <p className="text-[10px] font-bold text-slate-300">{formatDateString(photo.date)}</p>
                        <p className="mt-0.5 text-xs font-black text-white">
                          {photo.weight_kg ? `${photo.weight_kg} kg` : "--"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Select Actions */}
                    <div className="flex border-t border-white/5 bg-[#0b1710] p-1.5 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (isBefore) setBeforePhoto(null);
                          else {
                            setBeforePhoto(photo);
                            if (isAfter) setAfterPhoto(null);
                          }
                        }}
                        className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                          isBefore
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        {isBefore ? "Selected" : "Set Before"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isAfter) setAfterPhoto(null);
                          else {
                            setAfterPhoto(photo);
                            if (isBefore) setBeforePhoto(null);
                          }
                        }}
                        className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                          isAfter
                            ? "bg-lime-300 text-slate-950"
                            : "bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        {isAfter ? "Selected" : "Set After"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
