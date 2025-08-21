import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface HighQualityImageUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * Uploader de imágenes optimizado para máxima calidad
 * Especialmente diseñado para imágenes de cover y perfiles
 * - Sin compresión automática
 * - Tamaño máximo de archivo aumentado para alta calidad
 * - Preserva calidad original de la imagen
 */
export function HighQualityImageUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 25165824, // 24MB para máxima calidad
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: HighQualityImageUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        // Acepta todos los formatos de imagen comunes
        allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'],
      },
      autoProceed: false,
      // Configuraciones para preservar calidad
      meta: {
        preserveQuality: true,
        highQuality: true
      }
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        note="Para máxima calidad, usa imágenes de alta resolución. Formatos recomendados: PNG o JPEG de alta calidad."
      />
    </div>
  );
}