import { Button, Progress } from '@gemfolio/ui';
import { Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxFiles = 10,
  maxSize = 8 * 1024 * 1024, // 8MB
  disabled = false,
  className,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(acceptedFiles.map((file) => ({ file, progress: 0 })));

      try {
        // Simulate progress for each file
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((uf) => ({
              ...uf,
              progress: Math.min(uf.progress + 10, 90),
            }))
          );
        }, 200);

        await onUpload(acceptedFiles);

        clearInterval(progressInterval);
        setUploadingFiles((prev) => prev.map((uf) => ({ ...uf, progress: 100 })));

        // Clear after short delay
        setTimeout(() => {
          setUploadingFiles([]);
        }, 1000);
      } catch {
        setUploadingFiles((prev) =>
          prev.map((uf) => ({
            ...uf,
            error: 'Error al subir archivo',
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: disabled || isUploading,
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? 'Suelta los archivos aquí...'
            : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Máximo {maxFiles} archivos, {Math.round(maxSize / 1024 / 1024)}MB cada uno
        </p>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-destructive">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((uf, index) => (
            <div
              key={uf.file.name}
              className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{uf.file.name}</p>
                {uf.error ? (
                  <p className="text-xs text-destructive">{uf.error}</p>
                ) : (
                  <Progress value={uf.progress} className="mt-1 h-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeUploadingFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
