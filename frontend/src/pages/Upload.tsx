import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function UploadComponent() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showClassificationDialog, setShowClassificationDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  }, []);

  const handleFiles = (fileList: globalThis.File[]) => {
    if (fileList.length === 0) return;

    const file = fileList[0];
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };

    setPendingFile(newFile);
    setShowClassificationDialog(true);
  };

  const handleClassification = async (classificationType: "prescription" | "lab_report") => {
    if (!pendingFile) return;

    setShowClassificationDialog(false);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", pendingFile.file);

      const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const endpoint = classificationType === "prescription"
        ? `${BACKEND_URL}/upload-prescription`
        : `${BACKEND_URL}/upload-lab-report`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      setFiles((prev) => [...prev, { ...pendingFile, type: classificationType }]);
      
      toast.success(`${classificationType === "prescription" ? "Prescription" : "Lab Report"} uploaded and processed successfully`);
      
      console.log("Processing result:", result);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload and process document");
    } finally {
      setIsProcessing(false);
      setPendingFile(null);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.info("File removed");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="px-5 py-6">
      <Drawer open={showClassificationDialog} onOpenChange={setShowClassificationDialog}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Classify document</DrawerTitle>
            <DrawerDescription>Please select the type of document you're uploading</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4 pb-2">
            <Button
              className="h-auto w-full justify-start py-4"
              variant="outline"
              onClick={() => handleClassification("prescription")}
            >
              <div className="text-left">
                <div className="text-subtitle">Prescription</div>
                <div className="text-caption text-muted-foreground">
                  Doctor's prescription with medications and dosage
                </div>
              </div>
            </Button>
            <Button
              className="h-auto w-full justify-start py-4"
              variant="outline"
              onClick={() => handleClassification("lab_report")}
            >
              <div className="text-left">
                <div className="text-subtitle">Lab report</div>
                <div className="text-caption text-muted-foreground">
                  Blood test, lipid profile, or other lab results
                </div>
              </div>
            </Button>
          </div>
          <DrawerFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowClassificationDialog(false);
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="space-y-5">
        <Card
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer border-2 border-dashed p-8 transition-smooth",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            isProcessing && "pointer-events-none opacity-50"
          )}
        >
          <input
            type="file"
            multiple={false}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-subtitle text-foreground">
              {isProcessing ? "Processing..." : "Drop a file or tap to upload"}
            </h3>
            <p className="mt-2 text-caption text-muted-foreground">Supports PDF, JPG, PNG up to 10MB</p>
            {!isProcessing && (
              <Button className="mt-5" variant="default">
                Choose file
              </Button>
            )}
          </div>
        </Card>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-subtitle text-foreground">Uploaded ({files.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFiles([]);
                  toast.info("All files cleared");
                }}
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="p-4 transition-smooth hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-body font-medium text-foreground">{file.name}</p>
                        <p className="text-caption text-muted-foreground">
                          {formatFileSize(file.size)} •{" "}
                          {file.type === "prescription" ? "Prescription" : "Lab report"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <Card className="p-5 bg-muted/50">
            <h3 className="mb-3 text-subtitle text-foreground">What can you upload?</h3>
            <ul className="space-y-2 text-body text-muted-foreground">
              <li>• Blood test results and lab reports</li>
              <li>• X-rays, MRIs, and scan images</li>
              <li>• Prescriptions and medication lists</li>
              <li>• Doctor's notes and consultation summaries</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}