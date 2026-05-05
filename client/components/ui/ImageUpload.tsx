"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Upload, X, Crop } from "lucide-react";
import Image from "next/image";

import { BACKEND_URL } from "@/lib/api";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  label?: string;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);

        return;
      }
      const file = new File([blob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      resolve(file);
    }, "image/jpeg");
  });
}

export default function ImageUpload({
  value,
  onChange,
  label = "Product Image",
}: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [preview, setPreview] = useState<string | null>(
    value ? BACKEND_URL + value : null,
  );

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        onOpen();
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (croppedFile) {
        setPreview(URL.createObjectURL(croppedFile));
        onChange(croppedFile);
        onClose();
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    setImageSrc(null);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        {label}
      </span>

      {preview ? (
        <div className="relative group w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
          <Image
            fill
            alt="Preview"
            className="w-full h-full object-cover"
            src={preview}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              isIconOnly
              color="danger"
              size="sm"
              variant="flat"
              onPress={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          className="relative group w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary hover:dark:border-primary rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 text-gray-500  hover:text-primary transition-colors cursor-pointer"
          htmlFor="image-upload"
        >
          <span className="cursor-pointer flex flex-col items-center gap-2 ">
            <Upload className="w-8 h-8" />
            <span className="text-xs">Upload Image</span>
            <input
              accept="image/*"
              className="hidden"
              id="image-upload"
              type="file"
              onChange={handleFileChange}
            />
          </span>
        </label>
      )}

      <Modal
        backdrop="blur"
        isOpen={isOpen}
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Crop Image</ModalHeader>
          <ModalBody>
            <div className="relative w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  aspect={1}
                  crop={crop}
                  image={imageSrc}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
            <div className="mt-4 px-2">
              <label className="text-sm" htmlFor="zoom-input">
                Zoom
              </label>
              <input
                aria-label="Zoom"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
                id="zoom-input"
                max={3}
                min={1}
                step={0.1}
                type="range"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              startContent={<Crop className="w-4 h-4" />}
              onPress={handleSave}
            >
              Crop & Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
