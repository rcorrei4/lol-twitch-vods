"use client";

import Gallery, {
  GalleryElement,
} from "@application/components/Gallery/Gallery";
import { useEffect, useRef, useState } from "react";

type TabsProps = {
  champions: GalleryElement[];
  streamers: GalleryElement[];
};

export default function Tabs({ champions, streamers }: TabsProps) {
  const tabs = [
    {
      id: 1,
      title: "Streamer",
      render: () => {
        return (
          <Gallery
            id={"streamers-1"}
            type="streamers"
            elements={streamers}
            showLabels={true}
          />
        );
      },
    },
    {
      id: 2,
      title: "Champion",
      render: () => {
        return (
          <Gallery id={"champions-1"} type="champions" elements={champions} />
        );
      },
    },
    {
      id: 3,
      title: "Enemy",
      render: () => {
        return (
          <Gallery
            id={"champions-2"}
            type="enemyChampions"
            elements={champions}
          />
        );
      },
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [tabStyle, setTabStyle] = useState({ left: 0, width: 0 });
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabRef.current) {
      const activeTabElement = tabRef.current.querySelector(".active");
      if (activeTabElement instanceof HTMLElement) {
        setTabStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
        });
      }
    }
  }, [activeTab]);

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center relative w-full" ref={tabRef}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`flex-1 px-2.5 py-3 text-center cursor-pointer border-solid border-2 border-transparent transition-colors ease-in-out duration-300 ${
              activeTab === tab.id ? "border-b-primary active" : ""
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.title}
          </div>
        ))}
        <div
          className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out"
          style={tabStyle}
        ></div>
      </div>
      <div className="mt-5 px-5 w-full">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={` ${activeTab === tab.id ? "block w-full" : "hidden"}`}
          >
            {tab.render()}
          </div>
        ))}
      </div>
    </div>
  );
}
