const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_URL = "https://ddragon.leagueoflegends.com/";
const OUTPUT_DIR = path.join(__dirname, "../../public/champions/");

async function getCurrentPatchVersion() {
  try {
    const patchVersionUrl = BASE_URL + "api/versions.json";
    const response = await axios.get(patchVersionUrl);
    return response.data[0]; // Return the latest patch version
  } catch (error) {
    console.error("Error fetching patch version:", error.message);
    throw error;
  }
}

async function getAllChampionsNames(currentVersion) {
  try {
    const championsUrl = `${BASE_URL}cdn/${currentVersion}/data/en_US/champion.json`;
    const response = await axios.get(championsUrl);
    return Object.keys(response.data.data); // Extract champion names
  } catch (error) {
    console.error("Error fetching champion data:", error.message);
    throw error;
  }
}

async function getIcons(champions, currentVersion) {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const champion of champions) {
      const url = `${BASE_URL}cdn/${currentVersion}/img/champion/${champion}.png`;
      const filePath = path.join(OUTPUT_DIR, `${champion}.png`);

      console.log(`Downloading: ${champion}`);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      response.data.pipe(fs.createWriteStream(filePath));
      await new Promise((resolve) => response.data.on("end", resolve));
      console.log(`Saved: ${filePath}`);
    }

    console.log("All icons downloaded successfully!");
  } catch (error) {
    console.error("Error downloading icons:", error.message);
  }
}

async function main() {
  try {
    console.log("Fetching current patch version...");
    const currentVersion = await getCurrentPatchVersion();

    console.log("Fetching champion names...");
    const champions = await getAllChampionsNames(currentVersion);

    console.log(`Downloading icons for patch ${currentVersion}...`);
    await getIcons(champions, currentVersion);
  } catch (error) {
    console.error("Script failed:", error.message);
  }
}

main();
