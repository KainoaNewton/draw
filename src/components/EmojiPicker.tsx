import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, X, Smile, Shapes } from "lucide-react";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  currentEmoji?: string;
}

type TabType = "emojis" | "icons";

const EMOJI_CATEGORIES = {
  recent: ["📁", "📂", "🎨", "💼", "🚀", "⭐", "💡", "🔥", "📊", "🎯", "💻", "🌟"],
  folders: ["📁", "📂", "🗂️", "📋", "📊", "📈", "📉", "📄", "📃", "📑", "🗃️", "🗄️", "📇", "🗂", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚"],
  work: ["💼", "🎯", "🔧", "⚙️", "🔨", "🛠️", "📦", "🎨", "✏️", "📝", "💻", "⌨️", "🖥️", "📱", "📞", "☎️", "📠", "🖨️", "🖱️", "💾", "💿", "📀", "🎮", "🕹️"],
  symbols: ["⭐", "🔥", "💡", "🚀", "🎉", "🏆", "💎", "🔮", "⚡", "🌟", "✨", "💫", "🎊", "🎈", "🎁", "🎀", "🎗️", "🏅", "🥇", "🥈", "🥉", "🏵️", "🎖️", "🔱"],
  nature: ["🌱", "🌿", "🍀", "🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🌵", "🌲", "🌳", "🌴", "🌾", "🌊", "🌈", "☀️", "🌙", "⭐", "🌟", "💫", "✨", "☁️", "⛅"],
  hearts: ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💖", "💕", "💗", "💘", "💝", "💞", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "💋", "💌", "💐", "🌹"],
  faces: ["😀", "😊", "🤔", "😎", "🤓", "😴", "🤗", "😇", "🙂", "😉", "😍", "🥰", "😋", "😌", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😗", "😙", "😚"],
  objects: ["🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄", "🎯"],
  food: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽"],
};

const ICON_CATEGORIES = {
  recent: ["📁", "💼", "⚙️", "🎯", "📊", "💡", "🔧", "📈", "🎨", "⭐", "🚀", "🔥"],
  shapes: ["⭐", "🔥", "💎", "⚡", "🌟", "✨", "💫", "🔮", "🎯", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎸", "🎻"],
  arrows: ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄", "🔙", "🔚", "🔛", "🔜", "🔝", "🔀", "🔁", "🔂"],
  symbols: ["✅", "❌", "⭕", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪", "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬛", "⬜", "◼️", "◻️", "▪️"],
  tech: ["💻", "🖥️", "🖨️", "⌨️", "🖱️", "🖲️", "💾", "💿", "📀", "📱", "☎️", "📞", "📠", "📺", "📻", "🎙️", "🎚️", "🎛️", "🧭", "⏱️", "⏲️", "⏰", "🕰️", "⌛"],
  business: ["💼", "📊", "📈", "📉", "💹", "💰", "💳", "💎", "⚖️", "🔧", "🔨", "⚙️", "🛠️", "⛏️", "🔩", "⚗️", "🧪", "🧬", "🔬", "🔭", "📡", "💉", "🩹", "🩺"],
  misc: ["🎲", "🧩", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄", "🎴", "🎭", "🖼️", "🎨", "🧵", "🪡", "🧶", "🪢", "👑", "💍", "💄", "👜", "👛", "🎒", "👓", "🕶️"],
};

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect, currentEmoji }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("emojis");
  const [selectedCategory, setSelectedCategory] = useState<string>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveTab("emojis");
      setSelectedCategory("recent");
    }
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  // Get current categories based on active tab
  const currentCategories = activeTab === "emojis" ? EMOJI_CATEGORIES : ICON_CATEGORIES;

  // Filter items based on search
  const filteredItems = searchQuery
    ? Object.values(currentCategories).flat().filter(item =>
        item.includes(searchQuery)
        // Could add item names/descriptions here for better search
      )
    : currentCategories[selectedCategory as keyof typeof currentCategories] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-text-primary text-lg font-semibold">
              Choose Folder Icon
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-background-hover"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Tab Bar */}
          <div className="flex bg-background-input rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab("emojis");
                setSelectedCategory("recent");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "emojis"
                  ? "bg-accent-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              <Smile className="h-4 w-4" />
              Emojis
            </button>
            <button
              onClick={() => {
                setActiveTab("icons");
                setSelectedCategory("recent");
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "icons"
                  ? "bg-accent-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-hover"
              }`}
            >
              <Shapes className="h-4 w-4" />
              Icons
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-input border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue"
            />
          </div>

          {!searchQuery && (
            <>
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(currentCategories).map(([category, items]) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className="text-xs capitalize flex items-center gap-1.5 px-3 py-1.5"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className="text-sm">{items[0]}</span>
                    {category}
                    <span className="text-xs opacity-60">({items.length})</span>
                  </Button>
                ))}
              </div>
            </>
          )}

          {/* Items Grid */}
          <div className="flex-1 min-h-0">
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-background-hover scrollbar-track-transparent">
              {filteredItems.map((item, index) => (
                <Button
                  key={`${item}-${index}`}
                  variant="ghost"
                  className={`h-12 w-12 text-2xl p-0 hover:bg-background-hover transition-all duration-150 rounded-lg ${
                    currentEmoji === item
                      ? "bg-accent-blue/20 border-2 border-accent-blue ring-2 ring-accent-blue/30"
                      : hoveredEmoji === item
                      ? "bg-background-hover/80"
                      : ""
                  }`}
                  onClick={() => handleEmojiClick(item)}
                  onMouseEnter={() => setHoveredEmoji(item)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  title={`Select ${item}`}
                >
                  {item}
                </Button>
              ))}
            </div>

            {searchQuery && filteredItems.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No {activeTab} found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Current Selection & Preview */}
          <div className="flex-shrink-0 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary">Current:</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentEmoji || "📁"}</span>
                  <span className="text-sm text-text-muted">→</span>
                  <span className="text-3xl">{hoveredEmoji || currentEmoji || "📁"}</span>
                </div>
              </div>

              {hoveredEmoji && hoveredEmoji !== currentEmoji && (
                <Button
                  onClick={() => handleEmojiClick(hoveredEmoji)}
                  size="sm"
                  className="bg-accent-blue hover:bg-accent-blue/80"
                >
                  Select {hoveredEmoji}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
