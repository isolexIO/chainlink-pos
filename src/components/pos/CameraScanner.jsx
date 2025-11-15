import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VideoOff } from 'lucide-react';

const CameraScanner = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setError('');

    if (!('BarcodeDetector' in window)) {
      setError('Barcode scanning is not supported by this browser. Please try a different browser like Chrome on Android or Safari on iOS 15.4+.');
      return;
    }

    let stream;
    let animationFrameId;
    let isMounted = true;

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } else {
          return;
        }

        const barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
        });

        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState === 4 && isMounted) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                console.log('Camera Scanner: Detected barcode:', barcodes[0].rawValue);
                onScan(barcodes[0].rawValue);
                onClose();
                return; // Stop detection after successful scan
              }
            } catch (e) {
              console.error("Barcode detection failed:", e);
            }
          }
          if (isMounted) {
            animationFrameId = requestAnimationFrame(detect);
          }
        };
        detect();

      } catch (err) {
        console.error('Camera access error:', err);
        if (err.name === 'NotAllowedError') {
          setError('Camera permission was denied. Please allow camera access in your browser settings.');
        } else {
          setError('Could not access the camera. Please ensure it is not being used by another application.');
        }
      }
    };

    startScan();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md dark:bg-gray-800">
        <DialogHeader className="p-4 border-b dark:border-gray-700">
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center text-white p-4">
              <VideoOff className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="font-semibold">Scanner Error</p>
              <p className="text-sm text-gray-300">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-1/3 border-4 border-white/50 rounded-lg shadow-lg"></div>
              </div>
              <div className="absolute top-1/2 left-0 right-0 w-3/4 mx-auto h-0.5 bg-red-500 animate-pulse"></div>
            </>
          )}
        </div>
        <DialogFooter className="p-4 border-t dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraScanner;