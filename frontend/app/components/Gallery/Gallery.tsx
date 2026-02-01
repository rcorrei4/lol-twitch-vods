import { useEffect, useState } from "react";
import { VscClearAll } from "react-icons/vsc";
import { useSearchParams } from "react-router";
import { Button } from "~/components/Button/Button";
import { TextBox } from "../TextBox/TextBox";

export type GalleryElement = {
  id?: string;
  imageUrl?: string | null;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchElement, setSearchElement] = useState("");
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const filteredElements = elements.filter((element) =>
    element.label.toLowerCase().includes(searchElement.toLowerCase()),
  );

  // Initialize selected elements from URL params
  useEffect(() => {
    const initialParams = searchParams.get(type)?.split(",") || [];
    if (initialParams.at(0) !== "") {
      setSelectedElements(initialParams);
    }
  }, [type, searchParams]);

  // Update URL params when selected elements change
  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (selectedElements.length > 0) {
          prev.set(type, selectedElements.join(","));
        } else {
          prev.delete(type);
        }
        return prev;
      },
      { replace: true },
    );
  }, [selectedElements, type, setSearchParams]);

  const handleCheckboxChange = (label: string) => {
    setSelectedElements((prev) =>
      prev.includes(label)
        ? prev.filter((value) => value !== label)
        : [...prev, label],
    );
  };

  return (
    <div className="flex flex-col justify-center w-full gap-2">
      <TextBox
        name="text"
        placeholder={`Search for ${type}...`}
        onChange={(e) => setSearchElement(e.target.value)}
        aria-label={`Search for ${type}`}
      />
      <div className={`flex justify-start`}>
        <Button
          variant={"simple"}
          accentColor="secondary"
          size="sm"
          className={`w-auto flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
            selectedElements.length > 0
              ? "opacity-100 max-h-10"
              : "opacity-0 max-h-0"
          }`}
          onClick={() => setSelectedElements([])}
        >
          Clear
          <VscClearAll size={20} />
        </Button>
      </div>
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
              <img
                src={filteredElement.imageUrl ?? ""}
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
