import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  Smile,
  Shapes,
  Folder,
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Upload,
  Settings,
  User,
  Users,
  Heart,
  Star,
  Home,
  Building,
  Camera,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Wifi,
  Battery,
  Zap,
  Sun,
  Coffee,
  Gift,
  ShoppingCart,
  CreditCard,
  Bookmark,
  Tag,
  Flag,
  Bell,
  Lock,
  Key,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X as XIcon,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Copy,
  Scissors,
  Clipboard,
  Link,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  MessageCircle,
  Send,
  Share,
  ThumbsUp,
  ThumbsDown,
  Smile as SmileIcon,
  Frown,
  Meh
} from "lucide-react";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  currentEmoji?: string;
}

type TabType = "emojis" | "icons";

// Only actual emojis for the Emojis tab (deduplicated)
const EMOJI_CATEGORIES = {
  recent: ["📁", "📂", "🎨", "💼", "🚀", "⭐", "💡", "🔥", "📊", "🎯", "💻", "🌟"],
  folders: ["🗂️", "📋", "📈", "📉", "📄", "📃", "📑", "🗃️", "🗄️", "📇", "📰", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📚"],
  work: ["🔧", "⚙️", "🔨", "🛠️", "📦", "✏️", "📝", "⌨️", "🖥️", "📱", "📞", "☎️", "📠", "🖨️", "🖱️", "💾", "💿", "📀", "🎮", "🕹️"],
  symbols: ["🎉", "🏆", "💎", "🔮", "⚡", "✨", "💫", "🎊", "🎈", "🎁", "🎀", "🎗️", "🏅", "🥇", "🥈", "🥉", "🏵️", "🎖️", "🔱"],
  nature: ["🌱", "🌿", "🍀", "🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "🌵", "🌲", "🌳", "🌴", "🌾", "🌊", "🌈", "☀️", "🌙", "☁️", "⛅"],
  hearts: ["❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💖", "💕", "💗", "💘", "💝", "💞", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "💋", "💌", "💐"],
  faces: ["😀", "😊", "🤔", "😎", "🤓", "😴", "🤗", "😇", "🙂", "😉", "😍", "🥰", "😋", "😌", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😗", "😙", "😚"],
  objects: ["🎪", "🎭", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "🎻", "🎲", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄"],
  food: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽"],
};

// Lucide icon components for the Icons tab (deduplicated)
const ICON_CATEGORIES = {
  recent: [Folder, FolderOpen, File, FileText, Settings, User, Heart, Star, Home, Building, Camera, Globe],
  files: [Image, Video, Music, Archive, Download, Upload, Copy, Clipboard],
  navigation: [ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MapPin, ExternalLink, Link, RefreshCw, RotateCcw, RotateCw],
  interface: [Users, Bell, Lock, Key, Shield, Eye, EyeOff, Edit, Trash2, Plus, Minus],
  communication: [Phone, Mail, MessageCircle, Send, Share, Wifi, Battery, Calendar, Clock, Info, HelpCircle],
  actions: [Check, XIcon, Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize, ThumbsUp, ThumbsDown, Flag],
  emotions: [SmileIcon, Frown, Meh, Gift, Coffee, Sun],
  business: [CreditCard, ShoppingCart, Bookmark, Tag, Zap, AlertCircle, CheckCircle, XCircle, Scissors, Search],
};

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect, currentEmoji }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("emojis");
  const [searchQuery, setSearchQuery] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setActiveTab("emojis");
    }
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  const handleIconClick = (IconComponent: React.ComponentType) => {
    // For icons, we'll use the component name as the emoji value
    const iconName = IconComponent.displayName || IconComponent.name || "📁";
    onEmojiSelect(iconName);
    onClose();
  };

  // Get current categories based on active tab
  const currentCategories = activeTab === "emojis" ? EMOJI_CATEGORIES : ICON_CATEGORIES;

  // Get all items from all categories (no category filtering)
  const allItems = Object.values(currentCategories).flat();

  // Filter items based on search
  const filteredItems = searchQuery
    ? allItems.filter(item => {
        if (activeTab === "emojis") {
          // For emojis, filter by the emoji string itself
          return (item as string).includes(searchQuery);
        } else {
          // For icons, filter by component name
          const iconName = (item as React.ComponentType).displayName || (item as React.ComponentType).name || "";
          return iconName.toLowerCase().includes(searchQuery.toLowerCase());
        }
      })
    : allItems;

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
              onClick={() => setActiveTab("emojis")}
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
              onClick={() => setActiveTab("icons")}
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



          {/* Items Grid */}
          <div className="flex-1 min-h-0">
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-background-hover scrollbar-track-transparent">
              {filteredItems.map((item, index) => {
                if (activeTab === "emojis") {
                  // Render emoji
                  const emoji = item as string;
                  return (
                    <Button
                      key={`${emoji}-${index}`}
                      variant="ghost"
                      className={`h-12 w-12 text-2xl p-0 hover:bg-background-hover transition-all duration-150 rounded-lg ${
                        currentEmoji === emoji
                          ? "bg-accent-blue/20 border-2 border-accent-blue ring-2 ring-accent-blue/30"
                          : ""
                      }`}
                      onClick={() => handleEmojiClick(emoji)}
                      title={`Select ${emoji}`}
                    >
                      {emoji}
                    </Button>
                  );
                } else {
                  // Render icon
                  const IconComponent = item as React.ComponentType<{ className?: string }>;
                  const iconName = IconComponent.displayName || IconComponent.name || "Icon";
                  return (
                    <Button
                      key={`${iconName}-${index}`}
                      variant="ghost"
                      className={`h-12 w-12 p-0 hover:bg-background-hover transition-all duration-150 rounded-lg ${
                        currentEmoji === iconName
                          ? "bg-accent-blue/20 border-2 border-accent-blue ring-2 ring-accent-blue/30"
                          : ""
                      }`}
                      onClick={() => handleIconClick(IconComponent)}
                      title={`Select ${iconName}`}
                    >
                      <IconComponent className="h-6 w-6 text-text-primary" />
                    </Button>
                  );
                }
              })}
            </div>

            {searchQuery && filteredItems.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No {activeTab} found for "{searchQuery}"</p>
              </div>
            )}
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}
