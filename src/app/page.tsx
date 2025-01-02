"use server";

import fs from "fs";
import path from "path";
import { Button } from "./components/Button/Button";
import Tabs from "./components/Tabs/Tabs";

export default async function Home() {
  const championsDir = path.join(process.cwd(), "public/champions");
  const fileNames = fs.readdirSync(championsDir);
  const championsImages = fileNames.map((fileName) => `/champions/${fileName}`);

  return (
    <div>
      <Tabs championsImages={championsImages} />
      <Button
        className="fixed bottom-10 right-10 shadow-2xl shadow-gray-two"
        type="submit"
      >
        Get results
      </Button>
    </div>
  );
}
