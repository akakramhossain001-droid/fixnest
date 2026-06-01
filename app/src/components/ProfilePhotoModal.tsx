import { X, Camera, Image as ImageIcon, Trash2, User } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onUpdateImage: (newUrl: string | null) => void;
}

export default function ProfilePhotoModal({ isOpen, onClose, imageUrl, onUpdateImage }: ProfilePhotoModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle animation out
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Wait for animation
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(reader.result as string);
        handleClose();
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDelete = () => {
    onUpdateImage(null);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="absolute inset-0 z-[100] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Main Content Area */}
      <div className={`relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none p-4 transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Close Button top right */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto transition-colors"
        >
          <X size={20} />
        </button>

        {/* Large Avatar View */}
        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl flex items-center justify-center bg-teal-light pointer-events-auto">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={64} className="text-teal" />
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="user"
        className="hidden" 
      />

      {/* Bottom Sheet Menu */}
      <div 
        className={`relative z-10 bg-white rounded-t-3xl shadow-2xl p-6 transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        <h3 className="font-heading font-bold text-lg text-text-primary mb-4 px-2">Profile Photo</h3>
        
        <div className="space-y-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-teal-light/50 flex items-center justify-center text-teal">
              <ImageIcon size={20} />
            </div>
            <span className="font-medium text-text-primary">Choose from Gallery</span>
          </button>

          <button 
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-teal-light/50 flex items-center justify-center text-teal">
              <Camera size={20} />
            </div>
            <span className="font-medium text-text-primary">Take photo</span>
          </button>

          <button 
            onClick={handleDelete}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Trash2 size={20} />
            </div>
            <span className="font-medium text-red-500">Remove photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
