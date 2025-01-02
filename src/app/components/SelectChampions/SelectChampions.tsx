"use client";

import Image from "next/image";
import { useState } from "react";

type SelectChampionsProps = {
  championsImages: string[];
};

export default function SelectChampions({
  championsImages,
}: SelectChampionsProps) {
  const [searchChampion, setSearchChampion] = useState("");
  const filteredChampions = championsImages.filter((championImage) => {
    return championImage.toLowerCase().includes(searchChampion.toLowerCase());
  });

  return (
    <div className="flex flex-col justify-center w-full">
      <input
        className="input mb-5 h-[36px] text-[14px] text-white/60 w-full bg-gray-two text-[#f4f4f5] px-3 py-1 rounded-lg border border-gray-three focus:outline-none focus:ring-2 focus:ring-gray-four focus:ring-offset-2 focus:ring-offset-[#09090b] transition-all duration-150 ease-in-out"
        name="text"
        type="text"
        placeholder="Search for a champion..."
        onChange={(e) => setSearchChampion(e.target.value)}
      />
      <div className="flex flex-wrap justify-center">
        {filteredChampions.map((championImage) => {
          return (
            <label
              className="cursor-pointer p-1 w-3/12 sm:w-2/12 lg:w-2/12 xl:w-auto"
              htmlFor={`image-check` + championImage}
              key={`image-check` + championImage}
            >
              <input
                className="peer hidden"
                type="checkbox"
                id={`image-check` + championImage}
              />
              <Image
                key={championImage}
                src={championImage}
                alt={"test"}
                width={80}
                height={80}
                layout="responsive"
                className="transition-transform duration-150 peer-checked:shadow-[0_0_0_5px] peer-checked:shadow-primary peer-checked:scale-90"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
