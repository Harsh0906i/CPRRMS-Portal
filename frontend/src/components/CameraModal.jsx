import React, { useEffect, useRef, useState } from "react";

export default function CameraModal({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(error);
      alert("Unable to access camera.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    setCapturedImage(image);

    stopCamera();
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Save Photo (Backend later)
  const handleSave = () => {
    alert("Next Step me backend upload karenge.");
  };

  // Close Modal
  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl p-6 w-[750px] shadow-xl">

        {/* Header */}

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-xl font-bold">
            Cancer Photo Capture
          </h2>

          <button
            onClick={handleClose}
            className="text-red-600 text-2xl font-bold"
          >
            ✕
          </button>

        </div>

        {/* Camera / Image */}

        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-lg border"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg border"
          />
        )}

        {/* Hidden Canvas */}

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Buttons */}

        <div className="flex justify-center gap-4 mt-6">

          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-5 py-3 bg-yellow-500 text-white rounded-lg"
              >
                ↺ Retake
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-3 bg-green-600 text-white rounded-lg"
              >
                ✔ Save
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              📷 Capture
            </button>
          )}

        </div>

      </div>

    </div>
  );
}