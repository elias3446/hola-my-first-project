import { useEffect, useRef } from "react";
import { Button } from "./button";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryUploadWidgetProps {
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  folder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  buttonClassName?: string;
  cropping?: boolean;
  croppingAspectRatio?: number;
}

export function CloudinaryUploadWidget({
  onUploadSuccess,
  onUploadError,
  folder = "uploads",
  maxFiles = 1,
  maxFileSize = 10485760, // 10MB default
  allowedFormats = ["jpg", "png", "jpeg", "gif", "webp"],
  buttonText = "Subir imagen",
  buttonVariant = "default",
  buttonClassName,
  cropping = false,
  croppingAspectRatio,
}: CloudinaryUploadWidgetProps) {
  const cloudinaryRef = useRef<any>();
  const widgetRef = useRef<any>();

  useEffect(() => {
    // Load Cloudinary script
    if (!window.cloudinary) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        cloudinaryRef.current = window.cloudinary;
      };
    } else {
      cloudinaryRef.current = window.cloudinary;
    }

    return () => {
      // Cleanup
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  const openWidget = () => {
    if (!cloudinaryRef.current) {
      console.error("Cloudinary script not loaded yet");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Validate Cloudinary credentials
    if (!cloudName || typeof cloudName !== 'string' || cloudName.length > 100) {
      console.error("Invalid Cloudinary cloud name");
      return;
    }
    if (!uploadPreset || typeof uploadPreset !== 'string' || uploadPreset.length > 100) {
      console.error("Invalid Cloudinary upload preset");
      return;
    }

    // Create widget options
    const widgetOptions: any = {
      cloudName,
      uploadPreset,
      folder,
      maxFiles,
      maxFileSize,
      clientAllowedFormats: allowedFormats,
      sources: ["local", "url", "camera"],
      multiple: maxFiles > 1,
      showAdvancedOptions: false,
      showCompletedButton: true,
      styles: {
        palette: {
          window: "hsl(var(--background))",
          windowBorder: "hsl(var(--border))",
          tabIcon: "hsl(var(--primary))",
          menuIcons: "hsl(var(--foreground))",
          textDark: "hsl(var(--foreground))",
          textLight: "hsl(var(--muted-foreground))",
          link: "hsl(var(--primary))",
          action: "hsl(var(--primary))",
          inactiveTabIcon: "hsl(var(--muted-foreground))",
          error: "hsl(var(--destructive))",
          inProgress: "hsl(var(--primary))",
          complete: "hsl(var(--primary))",
          sourceBg: "hsl(var(--card))",
        },
      },
    };

    // Add cropping options if enabled
    if (cropping) {
      widgetOptions.cropping = true;
      widgetOptions.showSkipCropButton = false;
      if (croppingAspectRatio) {
        widgetOptions.croppingAspectRatio = croppingAspectRatio;
      }
    }

    // Create or update widget
    if (!widgetRef.current) {
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        widgetOptions,
        (error: any, result: any) => {
          if (error) {
            console.error("Upload error:", error);
            onUploadError?.(error);
            return;
          }

          if (result.event === "success") {
            console.log("Upload successful:", result.info);
            onUploadSuccess?.(result.info);
          }
        }
      );
    }

    widgetRef.current.open();
  };

  return (
    <Button
      type="button"
      variant={buttonVariant}
      onClick={openWidget}
      className={cn("gap-2", buttonClassName)}
    >
      <Upload className="h-4 w-4" />
      {buttonText}
    </Button>
  );
}
