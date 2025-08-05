import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept: string;
  onUpload: (file: File) => Promise<void>;
  currentFile?: string;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function FileUpload({ 
  accept, 
  onUpload, 
  currentFile, 
  placeholder = "Drag & drop a file here",
  className,
  "data-testid": testId
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = accept.includes('image');
  const isAudio = accept.includes('audio');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    // In a real implementation, you'd call an onClear callback
    console.log('Clear file');
  };

  return (
    <div className={className} data-testid={testId}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="file-input"
      />

      {currentFile ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isImage ? (
                  <img
                    src={currentFile}
                    alt="Uploaded file"
                    className="w-16 h-16 object-cover rounded"
                    data-testid="uploaded-image-preview"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    {isAudio ? (
                      <Music className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">File uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {isImage ? 'Image file' : isAudio ? 'Audio file' : 'File'} ready
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                data-testid="button-clear-file"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          data-testid="upload-area"
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {isImage ? (
                <Image className="w-8 h-8 text-muted-foreground" />
              ) : isAudio ? (
                <Music className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            
            <h3 className="font-medium text-foreground mb-2">
              {isUploading ? "Uploading..." : placeholder}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {isImage 
                ? "PNG, JPG, GIF up to 10MB" 
                : isAudio 
                  ? "MP3, WAV, OGG up to 50MB"
                  : "Select a file to upload"
              }
            </p>
            
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              data-testid="button-browse-files"
            >
              Browse Files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
