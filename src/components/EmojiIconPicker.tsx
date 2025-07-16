import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EmojiIconPickerProps {
  currentIcon: string;
  onIconSelect: (icon: string) => void;
  onClose: () => void;
}



const ICON_CATEGORIES = [
  { name: "Folders", emojis: ["📁", "📂", "🗂️", "📋", "📊", "📈", "📉", "📌"] },
  { name: "Work", emojis: ["💼", "🔧", "⚙️", "🛠️", "🔨", "💡", "🔍", "🎯"] },
  { name: "Creative", emojis: ["🎨", "🎭", "🎵", "🎪", "✨", "🌟", "⭐", "💫"] },
  { name: "Documents", emojis: ["📚", "📖", "📝", "✏️", "🖊️", "📄", "📃", "🗒️"] },
  { name: "Nature", emojis: ["🌱", "🌙", "☀️", "🌈", "🔥", "💧", "🌟", "✨"] },
  { name: "Transport", emojis: ["🚀", "✈️", "🚗", "🚲", "⛵", "🏠", "🏢", "🏭"] },
  { name: "Hearts", emojis: ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍"] },
  { name: "Celebration", emojis: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉"] }
];

export default function EmojiIconPicker({ currentIcon, onIconSelect, onClose }: EmojiIconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Folders");

  const handleIconClick = (icon: string) => {
    onIconSelect(icon);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentCategoryEmojis = ICON_CATEGORIES.find(cat => cat.name === selectedCategory)?.emojis || [];

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-background-main border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Choose Folder Icon</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Icon Display */}
        <div className="mb-4 p-3 bg-background-hover rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentIcon}</span>
            <span className="text-sm text-text-secondary">Current icon</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 mb-3">
            {ICON_CATEGORIES.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="text-xs px-2 py-1 h-auto"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="max-h-64 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {currentCategoryEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleIconClick(emoji)}
                className={`
                  p-2 text-xl rounded-lg transition-all duration-200 
                  hover:bg-background-hover hover:scale-110
                  ${emoji === currentIcon ? 'bg-accent-blue bg-opacity-20 ring-2 ring-accent-blue' : ''}
                `}
                title={`Select ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
