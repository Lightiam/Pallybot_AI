import React, { useState, useRef } from 'react';
import { Image, Loader2, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface CreatePostProps {
  onPostCreated: () => void;
}

// Image requirements constants
const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  minWidth: 600,
  minHeight: 400,
  maxSizeMB: 5,
  aspectRatio: 16 / 9,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedExtensions: '.jpg, .jpeg, .png, .webp'
};

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Check dimensions
        if (img.width > IMAGE_CONFIG.maxWidth || img.height > IMAGE_CONFIG.maxHeight) {
          setImageError(`Image dimensions must not exceed ${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight} pixels`);
          resolve(false);
          return;
        }

        if (img.width < IMAGE_CONFIG.minWidth || img.height < IMAGE_CONFIG.minHeight) {
          setImageError(`Image dimensions must be at least ${IMAGE_CONFIG.minWidth}x${IMAGE_CONFIG.minHeight} pixels`);
          resolve(false);
          return;
        }

        // Check aspect ratio
        const aspectRatio = img.width / img.height;
        const allowedVariance = 0.1; // 10% tolerance
        if (Math.abs(aspectRatio - IMAGE_CONFIG.aspectRatio) > allowedVariance) {
          setImageError(`Image should have an aspect ratio close to ${IMAGE_CONFIG.aspectRatio.toFixed(2)} (16:9)`);
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        setImageError('Failed to load image');
        resolve(false);
      };
    });
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setImageError(null);

    // Check file format
    if (!IMAGE_CONFIG.acceptedFormats.includes(file.type)) {
      setImageError(`Unsupported file format. Please use ${IMAGE_CONFIG.acceptedExtensions}`);
      return;
    }

    // Check file size
    if (file.size > IMAGE_CONFIG.maxSizeMB * 1024 * 1024) {
      setImageError(`Image size must be less than ${IMAGE_CONFIG.maxSizeMB}MB`);
      return;
    }

    // Validate dimensions and aspect ratio
    const isValid = await validateImage(file);
    if (!isValid) return;

    // If all validations pass
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        await handleImageSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) {
      toast.error('Please add some content or an image');
      return;
    }

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let imageUrl = null;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        });

      if (insertError) throw insertError;

      setContent('');
      removeImage();
      onPostCreated();
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />

        {/* Image Upload Area */}
        <div 
          className="mt-4 relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '512px' }}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <div className="text-sm text-gray-600">
                <span className="text-purple-600 font-medium">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {`${IMAGE_CONFIG.acceptedExtensions.toUpperCase()} up to ${IMAGE_CONFIG.maxSizeMB}MB`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {`Recommended size: ${IMAGE_CONFIG.minWidth}x${IMAGE_CONFIG.minHeight} to ${IMAGE_CONFIG.maxWidth}x${IMAGE_CONFIG.maxHeight}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Aspect ratio: 16:9
              </p>
            </div>
          )}

          {imageError && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {imageError}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_CONFIG.acceptedFormats.join(',')}
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-end space-x-4 mt-4">
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !selectedImage) || !!imageError}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <span>Post</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;