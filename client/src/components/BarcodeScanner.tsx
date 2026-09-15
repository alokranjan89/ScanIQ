import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (message: string) => void;
}

const SCANNER_ELEMENT_ID = "scaniq-barcode-reader";

function BarcodeScanner({
  onScan,
  onError,
}: BarcodeScannerProps) {
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);

    hasScannedRef.current = false;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 150,
            },
          },
          (decodedText) => {
            if (hasScannedRef.current) {
              return;
            }

            hasScannedRef.current = true;

            onScan(decodedText);
          },
          () => {
            // Normal scan failure while analyzing camera frames.
            // We intentionally ignore these errors.
          },
        );
      } catch {
        onError?.(
          "Unable to access the camera. Please allow camera permission and try again.",
        );
      }
    };

    void startScanner();

    return () => {
      const stopScanner = async () => {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }

          scanner.clear();
        } catch {
          // Scanner may already be stopped or cleared.
        }
      };

      void stopScanner();
    };
  }, [onScan, onError]);

  return (
    <div
      id={SCANNER_ELEMENT_ID}
      className="w-full overflow-hidden rounded-2xl"
    />
  );
}

export default BarcodeScanner;