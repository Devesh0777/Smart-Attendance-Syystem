import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const Html5QrcodePlugin = ({ fps, qrbox, disableFlip, qrCodeSuccessCallback, qrCodeErrorCallback }) => {
  const qrcodeRegionId = 'html5qr-code-full-region';
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    if (typeof Html5Qrcode !== 'undefined') {
      const html5QrcodeScanner = new Html5Qrcode(qrcodeRegionId, {
        formFactor: 'portrait',
        disableFlip: disableFlip !== undefined ? disableFlip : false,
      });

      const config = { fps, qrbox };

      const onScanSuccess = (decodedText) => {
        qrCodeSuccessCallback(decodedText);
      };

      const onScanError = () => {
        // Ignore scan errors
      };

      html5QrcodeScanner.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        onScanError
      );

      html5QrcodeScanner._html5qrcode = html5QrcodeScanner;

      return () => {
        html5QrcodeScanner.stop();
      };
    }
  }, [fps, qrbox, disableFlip, qrCodeSuccessCallback, qrCodeErrorCallback]);

  return <div id={qrcodeRegionId} style={{ width: '100%', height: '400px' }} />;
};

export default Html5QrcodePlugin;
