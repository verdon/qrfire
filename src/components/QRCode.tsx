"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType, DownloadOptions } from 'qr-code-styling';

interface QRCodeProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  dotStyle: DotType;
  cornerStyle: CornerSquareType;
  cornerDotStyle: CornerDotType;
}

export interface QRCodeRef {
  download: (options: DownloadOptions) => void;
}

const QRCode = forwardRef<QRCodeRef, QRCodeProps>(({ value, size, fgColor, bgColor, dotStyle, cornerStyle, cornerDotStyle }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useImperativeHandle(ref, () => ({
    download: (options: DownloadOptions) => {
      qrCodeRef.current?.download(options);
    }
  }));

  useEffect(() => {
    const options = {
      width: size,
      height: size,
      data: value,
      image: '',
      dotsOptions: { color: fgColor, type: dotStyle },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { color: fgColor, type: cornerStyle },
      cornersDotOptions: { color: fgColor, type: cornerDotStyle },
    };

    if (!localRef.current) return;

    if (qrCodeRef.current) {
      qrCodeRef.current.update(options);
    } else {
      qrCodeRef.current = new QRCodeStyling(options);
      // Clear previous QR code before appending a new one
      localRef.current.innerHTML = '';
      qrCodeRef.current.append(localRef.current);
    }
  }, [value, size, fgColor, bgColor, dotStyle, cornerStyle, cornerDotStyle]);

  return <div ref={localRef} />;
});

QRCode.displayName = 'QRCode';

export default QRCode; 