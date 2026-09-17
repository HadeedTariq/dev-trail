import { toast } from "@/hooks/use-toast";
import { validateImage } from "@/lib/utils";
import { ImageIcon, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

type ImageUploaderProps = {
  title?: string;
  imagePreview?: string;
  setImageFile: (file: File | null) => void;
  isUploading?: boolean;
};

const ImageUploader = ({
  title = "Upload Image",
  imagePreview = "",
  setImageFile,
  isUploading,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string>(imagePreview);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // const error = await validateImage(file);
    // if (error) {
    //   toast({
    //     title:
    //       error ||
    //       "Invalid image. Please upload a square (1:1) image with a minimum resolution of 1200 × 1200 pixels.",
    //     description:
    //       "For best results, use a centered product image with sufficient padding and a clean white or transparent background.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setImageFile(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
          preview
            ? "border-muted"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="mx-auto max-h-64 rounded-md object-contain"
            />
            <button
              onClick={handleRemove}
              disabled={isUploading ? true : false}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Remove image</span>
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-4 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag and drop your image here
            </p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>
        )}

        <input
          type="file"
          ref={inputRef}
          onChange={handleChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
