import React, { useRef, useState } from 'react';
import { 
  Upload, 
  X, 
  Sparkles, 
  Maximize2, 
  Check, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { ImageEditMode } from '../types';

interface ImageEditControlsProps {
  referenceImage: string | null;
  onReferenceImageChange: (image: string | null) => void;
  editMode: ImageEditMode;
  onEditModeChange: (mode: ImageEditMode) => void;
  faceLock: boolean;
  onFaceLockChange: (locked: boolean) => void;
  lockComplexion: boolean;
  onLockComplexionChange: (locked: boolean) => void;
  lockAttire: boolean;
  onLockAttireChange: (locked: boolean) => void;
  lockHairstyle?: boolean;
  onLockHairstyleChange?: (locked: boolean) => void;
  onPromptSelect?: (promptText: string) => void;
  onTriggerUpscale?: (factor: 2 | 4, mode: 'balanced' | 'face_revamp' | 'ultra_sharp') => void;
  isUpscaling?: boolean;
  onNotice?: (message: string) => void;
}

export function ImageEditControls({
  referenceImage,
  onReferenceImageChange,
  editMode,
  onEditModeChange,
  faceLock,
  onFaceLockChange,
  lockComplexion,
  onLockComplexionChange,
  lockAttire,
  onLockAttireChange,
  lockHairstyle = true,
  onLockHairstyleChange,
  onPromptSelect,
  onTriggerUpscale,
  isUpscaling = false,
  onNotice,
}: ImageEditControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onNotice?.('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      onNotice?.('Image size is too large. Please select an image under 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onReferenceImageChange(result);
        onNotice?.('Reference photo loaded.');
      }
    };
    reader.onerror = () => {
      onNotice?.('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const EDIT_AREAS: { id: ImageEditMode; label: string; examples: string[] }[] = [
    { 
      id: 'background_change', 
      label: 'Background',
      examples: [
        'Place standing naturally on beach sand with the sea in the background',
        'Inside a modern office with city skyline through large windows',
        'In a professional photography studio against a clean grey backdrop'
      ]
    },
    { 
      id: 'scene_change', 
      label: 'Scene',
      examples: [
        'Walking outdoors in a vibrant park with soft warm daylight',
        'Seated comfortably at a modern coffee shop terrace table',
        'Attending an evening celebration with soft ambient lighting'
      ]
    },
    { 
      id: 'posture_change', 
      label: 'Pose',
      examples: [
        'Standing full-body facing forward with a confident natural posture',
        'Walking naturally forward with hands relaxed at the sides',
        'Seated comfortably looking toward the camera'
      ]
    },
    { 
      id: 'custom_edit', 
      label: 'Clothing',
      examples: [
        'Change outfit to a tailored dark navy suit with clean dress shoes',
        'Change outfit to a casual white linen shirt and dark trousers'
      ]
    },
    { 
      id: 'face_revamp', 
      label: 'Other',
      examples: [
        'Sharpen focal details, clean lighting, and enhance portrait clarity',
        'Add soft cinematic golden hour lighting across the scene'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Reference Image Section */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Reference Image
        </label>

        {!referenceImage ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-purple-600 bg-purple-50'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50 hover:bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <div className="w-10 h-10 mx-auto rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Upload photo to edit
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag and drop or click to upload (PNG, JPG, WebP)
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative shrink-0">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  Reference photo loaded
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2.5 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onReferenceImageChange(null);
                      onNotice?.('Reference image removed.');
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Optional Quick Upscale */}
              {onTriggerUpscale && (
                <div className="hidden sm:flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={isUpscaling}
                    onClick={() => onTriggerUpscale(2, 'balanced')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium transition-all disabled:opacity-50"
                    title="Upscale image 2X resolution"
                  >
                    {isUpscaling ? 'Upscaling...' : 'Upscale 2X'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Preservation Options */}
      {referenceImage && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Preserve
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={faceLock}
                onChange={(e) => onFaceLockChange(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-slate-700">Person (Face & Identity)</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={lockComplexion}
                onChange={(e) => onLockComplexionChange(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-slate-700">Skin tone</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={lockHairstyle}
                onChange={(e) => onLockHairstyleChange?.(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-slate-700">Hairstyle</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={lockAttire}
                onChange={(e) => onLockAttireChange(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span className="text-xs font-medium text-slate-700">Clothing</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. Edit Area Selection */}
      {referenceImage && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Edit area
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EDIT_AREAS.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => onEditModeChange(area.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  editMode === area.id
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>

          {/* Optional clean example suggestions */}
          {onPromptSelect && (
            <div className="mt-2 flex flex-wrap gap-1">
              {EDIT_AREAS.find((a) => a.id === editMode)?.examples.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPromptSelect(example)}
                  className="text-[11px] text-slate-600 hover:text-purple-900 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-2 py-0.5 rounded-md text-left transition-colors truncate max-w-full"
                  title={example}
                >
                  💡 {example}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
