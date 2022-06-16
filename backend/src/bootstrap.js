"use strict";

const fs = require("fs");
const mime = require("mime-types");
const set = require("lodash.set");

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  console.log(fileName);
  const filePath = `./data/images/${fileName}`;

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  console.log(fileName, size);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);
  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  };
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  try {
    if (files) {
      for (const [key, file] of Object.entries(files)) {
        // Get file name without the extension
        const [fileName] = file.name.split(".");
        // Upload each individual file
        const uploadedFile = await strapi
          .plugin("upload")
          .service("upload")
          .upload({
            files: file,
            data: {
              fileInfo: {
                alternativeText: fileName,
                caption: fileName,
                name: fileName,
              },
            },
          });

        // Attach each file to its entry
        set(entry, key, uploadedFile[0].id);
      }
    }

    // Actually create the entry in Strapi
    const createdEntry = await strapi.entityService.create(
      `api::${model}.${model}`,
      {
        data: entry,
      }
    );
  } catch (e) {
    console.log("model", entry, e);
  }
}

module.exports = async () => {
  const data = JSON.parse(fs.readFileSync("./data/values.json"));
  const common = JSON.parse(fs.readFileSync(`./data/data.json`, "utf8"));
  common.forEach(async (room) => {
    const count = await strapi
      .query("api::room.room")
      .count({ where: { name: room.name } });
    if (!count) {
      console.log("Create entity service");
      const createdRoom = await strapi.entityService.create("api::room.room", {
        data: {
          name: room.name,
          building_plan: getFileData(room.building_plan),
        },
      });
      Promise.all(
        room.devices.map(async (device) => {
          const createdDevice = await strapi.entityService.create(
            "api::device.device",
            {
              data: {
                ...device,
                room: createdRoom,
              },
            }
          );
          const dataset = data.find((x) => x.name === device.name).data;
          if (dataset) {
            await Promise.all(
              dataset.map(async (item) => {
                return await strapi.entityService.create(
                  "api::devices-data.devices-data",
                  {
                    data: {
                      value: item.value,
                      createdAt: item.date,
                      updatedAt: item.date,
                      device: createdDevice.id,
                    },
                  }
                );
              })
            );
          }
        })
      );
    }
  });
};
