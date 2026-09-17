import { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Mountain,
  MessageSquareText,
  Type,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const [activeCategory, setActiveCategory] = useState("");

  const categories = [
    {
      id: "abstract",
      name: "Abstract & Modern",
      icon: Sparkles,
      description: "Contemporary designs for modern spaces",
    },
    {
      id: "nature",
      name: "Nature & Landscapes",
      icon: Mountain,
      description: "Timeless natural beauty",
    },
    {
      id: "islamic",
      name: "Islamic & Calligraphy",
      icon: MessageSquareText,
      description: "Spiritual art and Arabic calligraphy",
    },
    {
      id: "motivational",
      name: "Motivational & Typography",
      icon: Type,
      description: "Inspiring quotes and text art",
    },
    {
      id: "cityscapes",
      name: "Cityscapes & Architecture",
      icon: Building2,
      description: "Urban designs and landmarks",
    },
  ];

  return (
    <nav className="w-full border-b border-gray-200 dark:border-[#443ACD]/20 bg-white dark:bg-[#0a0a0a] shadow-sm">
      <div className="container">
        <div className="flex items-center justify-center space-x-1 py-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory("")}
                className={`
                  relative group px-5 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "bg-[#443ACD]/10 dark:bg-[#443ACD]/20 text-[#443ACD] dark:text-[#6B63FF]"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#443ACD] dark:hover:text-[#6B63FF] hover:bg-gray-50 dark:hover:bg-[#443ACD]/5"
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <Icon
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isActive ? "scale-110" : ""
                    }`}
                  />
                  <span>{category.name}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      isActive ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Animated underline */}
                <div
                  className={`
                    absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#443ACD] to-[#6B63FF]
                    transition-all duration-300
                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                />

                {/* Hover tooltip */}
                <div
                  className={`
                    absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2
                    bg-gray-900 dark:bg-[#443ACD] text-white text-xs rounded-lg
                    whitespace-nowrap shadow-lg z-50
                    transition-all duration-300
                    ${
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2 pointer-events-none"
                    }
                  `}
                >
                  {category.description}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-[#443ACD] rotate-45" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Featured banner - appears on hover */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${activeCategory ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="py-3 px-4 bg-gradient-to-r from-[#443ACD]/5 to-transparent dark:from-[#443ACD]/10">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#443ACD] text-white">
                New
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                Explore our latest collection in{" "}
                {categories.find((c) => c.id === activeCategory)?.name}
              </span>
              <button className="text-[#443ACD] dark:text-[#6B63FF] font-medium hover:underline">
                Shop Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
