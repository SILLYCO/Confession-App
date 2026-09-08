import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '../../lib/i18n';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  Check, 
  X, 
  Crop,
  Move
} from 'lucide-react';

interface PhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  outputSize?: number;
}

const VIEWPORT_SIZE = 280; // interactive preview area in CSS pixels

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  title,
  outputSize = 512,
}) => {
  const { t, language } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewShape, setPreviewShape] = useState<'circle' | 'rounded'>('circle');

  // Load image when imageSrc changes or modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Compute base scale and max pan limits based on image dimensions & rotation
  const getScaleAndLimits = useCallback((img: HTMLImageElement, currentZoom: number, currentRotation: number) => {
    const isRotated90or270 = currentRotation % 180 !== 0;
    const rotatedW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
    const rotatedH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

    const baseScale = Math.max(VIEWPORT_SIZE / rotatedW, VIEWPORT_SIZE / rotatedH);
    const scale = baseScale * currentZoom;

    const effW = rotatedW * scale;
    const effH = rotatedH * scale;

    const maxPanX = Math.max(0, (effW - VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (effH - VIEWPORT_SIZE) / 2);

    return { scale, maxPanX, maxPanY };
  }, []);

  // Clamp offset to ensure image always fills crop area
  const clampOffset = useCallback((x: number, y: number, maxPanX: number, maxPanY: number) => {
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    };
  }, []);

  // Render to canvas
  useEffect(() => {
    if (!canvasRef.current || !imageObj) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina support: scale up canvas internal buffer
    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIEWPORT_SIZE * dpr;
    canvas.height = VIEWPORT_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const { scale, maxPanX, maxPanY } = getScaleAndLimits(imageObj, zoom, rotation);
    const clamped = clampOffset(offset.x, offset.y, maxPanX, maxPanY);

    // Clear background
    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    // Draw transformed image
    ctx.save();
    ctx.translate(VIEWPORT_SIZE / 2 + clamped.x, VIEWPORT_SIZE / 2 + clamped.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(imageObj, -imageObj.naturalWidth / 2, -imageObj.naturalHeight / 2);
    ctx.restore();

    // Draw crop guide overlay (darkened surround)
    ctx.save();
    ctx.fillStyle = 'rgba(7, 22, 38, 0.45)';
    ctx.beginPath();
    ctx.rect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    if (previewShape === 'circle') {
      ctx.arc(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2 - 4, 0, Math.PI * 2, true);
    } else {
      // Rounded rectangle cutout
      const r = 24;
      const w = VIEWPORT_SIZE - 8;
      const h = VIEWPORT_SIZE - 8;
      const x = 4;
      const y = 4;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    ctx.fill('evenodd');

    // Draw gold guide border ring
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (previewShape === 'circle') {
      ctx.arc(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2 - 4, 0, Math.PI * 2);
    } else {
      const r = 24;
      const w = VIEWPORT_SIZE - 8;
      const h = VIEWPORT_SIZE - 8;
      const x = 4;
      const y = 4;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    }
    ctx.stroke();

    // Fine center crosshair guide (subtle)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(VIEWPORT_SIZE / 2 - 10, VIEWPORT_SIZE / 2);
    ctx.lineTo(VIEWPORT_SIZE / 2 + 10, VIEWPORT_SIZE / 2);
    ctx.moveTo(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2 - 10);
    ctx.lineTo(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2 + 10);
    ctx.stroke();

    ctx.restore();
  }, [imageObj, zoom, rotation, offset, previewShape, getScaleAndLimits, clampOffset]);

  // Mouse / Touch handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset({ ...offset });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageObj) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const { maxPanX, maxPanY } = getScaleAndLimits(imageObj, zoom, rotation);
    const newOffset = clampOffset(initialOffset.x + dx, initialOffset.y + dy, maxPanX, maxPanY);
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialOffset({ ...offset });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageObj || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    const { maxPanX, maxPanY } = getScaleAndLimits(imageObj, zoom, rotation);
    const newOffset = clampOffset(initialOffset.x + dx, initialOffset.y + dy, maxPanX, maxPanY);
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3, Math.max(1, +(prev + delta).toFixed(2))));
  };

  const handleRotate = (direction: 'cw' | 'ccw') => {
    setRotation((prev) => {
      const next = direction === 'cw' ? (prev + 90) % 360 : (prev - 90 + 360) % 360;
      return next;
    });
    setOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Export cropped avatar
  const handleApply = () => {
    if (!imageObj) return;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outputSize;
    outCanvas.height = outputSize;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    const ratio = outputSize / VIEWPORT_SIZE;
    const { scale, maxPanX, maxPanY } = getScaleAndLimits(imageObj, zoom, rotation);
    const clamped = clampOffset(offset.x, offset.y, maxPanX, maxPanY);

    // High quality smoothing
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';

    outCtx.translate(outputSize / 2 + clamped.x * ratio, outputSize / 2 + clamped.y * ratio);
    outCtx.rotate((rotation * Math.PI) / 180);
    outCtx.scale(scale * ratio, scale * ratio);
    outCtx.drawImage(imageObj, -imageObj.naturalWidth / 2, -imageObj.naturalHeight / 2);

    const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white p-5 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-400/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif leading-tight">
                {title || t.adminFlow.cropModalTitle}
              </h3>
              <p className="text-xs text-stone-300">
                {t.adminFlow.cropModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Interactive Viewport Canvas */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-[280px] h-[280px] rounded-3xl bg-stone-900 overflow-hidden shadow-inner cursor-grab active:cursor-grabbing select-none border-2 border-stone-300"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              <canvas
                ref={canvasRef}
                style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
                className="w-full h-full block"
              />

              {/* Drag Hint Badge */}
              <div className="absolute top-2.5 left-2.5 pointer-events-none bg-navy-950/75 backdrop-blur text-gold-400 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border border-gold-400/30">
                <Move className="w-3 h-3" />
                <span>{language === 'ar' ? 'اسحب لتوسيط الوجه' : 'Drag to reposition'}</span>
              </div>
            </div>

            {/* Shape Guide Toggle */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-stone-500 font-medium">
                {language === 'ar' ? 'معاينة الإطار:' : 'Preview Frame:'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewShape('circle')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                  previewShape === 'circle'
                    ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-sm'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {language === 'ar' ? 'دائري' : 'Circular'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewShape('rounded')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition ${
                  previewShape === 'rounded'
                    ? 'bg-navy-950 text-gold-400 border-navy-950 shadow-sm'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {language === 'ar' ? 'مربع منحني' : 'Rounded'}
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-gold-600" />
                  <span>{t.adminFlow.zoomLabel}</span>
                </span>
                <span className="font-mono text-stone-600 text-[11px]">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-navy-950 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />

                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-navy-950 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions (Rotate, Reset) */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRotate('cw')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold transition shadow-sm"
                  title="Rotate 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5 text-gold-600" />
                  <span>{t.adminFlow.rotateLabel}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-navy-950 hover:bg-stone-200 font-medium transition"
                title="Reset crop"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.adminFlow.resetLabel}</span>
              </button>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-gold-400 font-bold text-xs shadow-lg transition"
            >
              <Check className="w-4 h-4" />
              <span>{t.adminFlow.applyCropBtn}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
