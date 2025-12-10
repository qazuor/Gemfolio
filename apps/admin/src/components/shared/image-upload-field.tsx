import { type UploadEndpoint, useUploadThing } from '@gemfolio/storage';
import { Button, cn, Input } from '@gemfolio/ui';
import { ImageIcon, Link2, Loader2, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  endpoint?: UploadEndpoint;
  placeholder?: string;
  description?: string;
  maxSize?: number;
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

type InputMode = 'upload' | 'url';

export function ImageUploadField({
  value,
  onChange,
  endpoint = 'brandingAsset',
  placeholder = 'https://ejemplo.com/imagen.png',
  maxSize = 2 * 1024 * 1024,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'] },
  className,
  disabled = false,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res: { url: string }[]) => {
      if (res && res.length > 0) {
        onChange(res[0].url);
        setIsUploading(false);
        setUploadError(null);
      }
    },
    onUploadError: (error: Error) => {
      setUploadError(error.message || 'Error al subir el archivo');
      setIsUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        await startUpload(acceptedFiles);
      } catch {
        setUploadError('Error al subir el archivo');
        setIsUploading(false);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize,
    disabled: disabled || isUploading,
  });

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setUploadError(null);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlInputBlur = () => {
    if (urlInput.trim() && urlInput !== value) {
      handleUrlSubmit();
    }
  };

  const handleUrlInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mode Toggle */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <Button
          type="button"
          variant={mode === 'upload' ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMode('upload')}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          Subir
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'secondary' : 'ghost'}
          size="sm"
          className="flex-1 gap-2"
          onClick={() => setMode('url')}
          disabled={disabled}
        >
          <Link2 className="h-4 w-4" />
          URL
        </Button>
      </div>

      {/* Current Image Preview */}
      {value && (
        <div className="relative rounded-lg border bg-muted/30 p-2">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-white">
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-muted-foreground">{value}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleClear}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div
          {...getRootProps()}
          className={cn(
            'relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Subiendo...</p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isDragActive ? 'Suelta el archivo aquí...' : 'Arrastra o haz clic para subir'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Máximo {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={handleUrlInputChange}
            onBlur={handleUrlInputBlur}
            onKeyDown={handleUrlInputKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          {urlInput && urlInput !== value && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleUrlSubmit}
              disabled={disabled}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          )}
          {urlInput && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setUrlInput('');
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Errors */}
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections.map(({ file, errors }) => (
            <p key={file.name}>
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
