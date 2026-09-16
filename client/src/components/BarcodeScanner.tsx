import { useEffect, useRef } from "react";
import {
  BrowserMultiFormatReader,
} from "@zxing/browser";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (message: string) => void;
}

function BarcodeScanner({
  onScan,
  onError,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    hasScannedRef.current = false;

    const reader = new BrowserMultiFormatReader();

    let controls:
      | {
          stop: () => void;
        }
      | undefined;

    const startScanner = async () => {
      try {
        controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
            audio: false,
          },
          videoElement,
          (result) => {
            if (!result || hasScannedRef.current) {
              return;
            }

            const decodedValue = result
              .getText()
              .trim();

            if (!decodedValue) {
              return;
            }

            hasScannedRef.current = true;

            onScan(decodedValue);
          },
        );
      } catch (error) {
        console.error(
          "Barcode scanner error:",
          error,
        );

        onError?.(
          "Unable to access the camera. Please allow camera permission and try again.",
        );
      }
    };

    void startScanner();

    return () => {
      controls?.stop();

      const stream = videoElement.srcObject;

      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      videoElement.srcObject = null;
    };
  }, [onScan, onError]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        className="block aspect-video w-full object-cover"
        autoPlay
        muted
        playsInline
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-40 w-72 max-w-[80%] rounded-2xl border-2 border-white/80">
          <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-white" />

          <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-white" />

          <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-white" />

          <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-white" />

          <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/70" />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
        <span className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">
          Align the QR code or barcode inside the frame
        </span>
      </div>
    </div>
  );
}

export default BarcodeScanner;