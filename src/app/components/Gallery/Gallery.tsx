"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type GalleryElement = {
  id?: number;
  imageUrl: string;
  label: string;
};

type GalleryProps = {
  id: string;
  elements: GalleryElement[];
  type: "streamers" | "champions" | "enemyChampions";
  showLabels?: boolean;
};

export default function Gallery({
  id,
  elements,
  type,
  showLabels,
}: GalleryProps) {
  const router = useRouter();
  const [searchElement, setSearchElement] = useState("");
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const filteredElements = elements.filter((element) =>
    element.label.toLowerCase().includes(searchElement.toLowerCase())
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialParams = params.get(type)?.split(",") || [];
    if (initialParams.at(0) !== "") {
      setSelectedElements(initialParams);
    }
  }, [type]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedElements.length > 0) {
      console.log(selectedElements);
      params.set(type, selectedElements.join(","));
    } else {
      params.delete(type);
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  }, [selectedElements, type, router]);

  const handleCheckboxChange = (label: string) => {
    setSelectedElements((prev) =>
      prev.includes(label)
        ? prev.filter((value) => value !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col justify-center w-full">
      <input
        className="input mb-5 h-[36px] text-[14px] text-white/60 w-full bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-lg border border-gray-three focus:outline-none focus:ring-2 focus:ring-gray-four focus:ring-offset-2 focus:ring-offset-[#09090b] transition-all duration-150 ease-in-out"
        name="text"
        type="text"
        placeholder={`Search for ${type}...`}
        onChange={(e) => setSearchElement(e.target.value)}
        aria-label={`Search for ${type}`}
      />
      <div className="flex flex-wrap justify-center">
        {filteredElements.map((filteredElement, index) => {
          const checked = selectedElements.includes(filteredElement.label);

          return (
            <label
              className="flex flex-col items-center justify-center cursor-pointer p-1"
              htmlFor={id + filteredElement.label}
              key={id + filteredElement.label + index}
            >
              <input
                className="peer hidden"
                type="checkbox"
                id={id + filteredElement.label}
                checked={checked}
                onChange={() => handleCheckboxChange(filteredElement.label)}
                aria-checked={checked}
              />
              <Image
                src={filteredElement.imageUrl}
                alt={filteredElement.label}
                width={80}
                height={80}
                className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
              />
              {showLabels && <span>{filteredElement.label}</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
