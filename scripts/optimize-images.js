import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputFolder = "./src/assets/photos";
const outputFolder = "./src/assets/photos-optimized";

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

const files = fs.readdirSync(inputFolder);

async function optimizeImages() {
    for (const file of files) {
        const inputPath = path.join(inputFolder, file);

        if (
            !file.match(/\.(jpg|jpeg|png)$/i)
        ) {
            continue;
        }

        const fileName = path.parse(file).name;

        const outputPath = path.join(
            outputFolder,
            `${fileName}.webp`
        );

        try {
            await sharp(inputPath)
                .rotate()
                .resize({
                    width: 1200,
                    withoutEnlargement: true,
                })
                .webp({
                    quality: 78,
                })
                .toFile(outputPath);

            console.log(`✓ Optimized: ${file}`);
        } catch (error) {
            console.error(
                `✗ Failed: ${file}`,
                error
            );
        }
    }

    console.log("\n🎉 Done!");
}

optimizeImages();