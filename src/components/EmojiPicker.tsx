import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  currentEmoji?: string;
}

const EMOJI_CATEGORIES = {
  folders: ["📁", "📂", "🗂️", "📋", "📊", "📈", "📉", "📄", "📃", "📑"],
  objects: ["💼", "🎯", "🔧", "⚙️", "🔨", "🛠️", "📦", "🎨", "✏️", "📝"],
  symbols: ["⭐", "🔥", "💡", "🚀", "🎉", "🏆", "💎", "🔮", "⚡", "🌟"],
  nature: ["🌱", "🌿", "🍀", "🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🌵"],
  hearts: ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💖"],
  faces: ["😀", "😊", "🤔", "😎", "🤓", "😴", "🤗", "😇", "🙂", "😉"],
};

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect, currentEmoji }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>("folders");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Choose an Icon</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                className={`h-12 w-12 text-2xl p-0 hover:bg-background-hover ${
                  currentEmoji === emoji ? "bg-accent-blue/20 border border-accent-blue/40" : ""
                }`}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>

          {/* Current Selection */}
          {currentEmoji && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-text-secondary">Current:</span>
              <span className="text-2xl">{currentEmoji}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
