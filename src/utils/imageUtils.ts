const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;

export interface CompressedImage {
  base64: string;
  thumbnail: string;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error("File size exceeds 5MB limit"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        // Create canvas for full image
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          } else {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", 0.8);

        // Create thumbnail (200x200)
        const thumbCanvas = document.createElement("canvas");
        const thumbSize = 200;
        thumbCanvas.width = thumbSize;
        thumbCanvas.height = thumbSize;
        const thumbCtx = thumbCanvas.getContext("2d");
        
        const aspectRatio = width / height;
        let thumbWidth = thumbSize;
        let thumbHeight = thumbSize;
        
        if (aspectRatio > 1) {
          thumbHeight = thumbSize / aspectRatio;
        } else {
          thumbWidth = thumbSize * aspectRatio;
        }
        
        const offsetX = (thumbSize - thumbWidth) / 2;
        const offsetY = (thumbSize - thumbHeight) / 2;
        
        thumbCtx?.drawImage(img, offsetX, offsetY, thumbWidth, thumbHeight);
        const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.7);

        resolve({ base64, thumbnail });
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
