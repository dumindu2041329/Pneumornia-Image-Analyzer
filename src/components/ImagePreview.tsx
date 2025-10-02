import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';

interface ImagePreviewProps {
  file: File | null;
  imageUrl?: string;
}

export function ImagePreview({ file, imageUrl }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setZoom(1);
    } else if (imageUrl) {
      setPreview(imageUrl);
      setZoom(1);
    } else {
      setPreview(null);
      setZoom(1);
    }
  }, [file, imageUrl]);

  if (!preview) {
    return null;
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-semibold">X-Ray Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-gray-700 rounded transition"
              disabled={zoom <= 0.5}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-white hover:bg-gray-700 rounded transition text-sm"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-gray-700 rounded transition"
              disabled={zoom >= 3}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 text-white hover:bg-gray-700 rounded transition"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-4 flex items-center justify-center overflow-auto max-h-[500px]">
          <img
            src={preview}
            alt="Chest X-Ray"
            className="transition-transform duration-200 select-none"
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition text-white"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
              disabled={zoom <= 0.5}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition text-sm"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
              disabled={zoom >= 3}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <img
            src={preview}
            alt="Chest X-Ray Fullscreen"
            className="max-w-full max-h-full transition-transform duration-200 select-none"
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
