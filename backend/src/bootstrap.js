"use strict";

const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const set = require("lodash.set");

const filenames = [
  "elektro_ievads_3f",
  "Elektro_apgaism",
  "Elektro_piekl",
  "POIC_1_temp",
  "POIC_2_temp",
  "POIC_3_temp",
  "POIC_4_temp",
  "POIC_5_temp",
  "POIC_1_co2",
  "POIC_2_co2",
  "POIC_3_co2",
  "POIC_4_co2",
  "POIC_5_co2",
  "udens",
  "Elektro_kond",
  "POIC_1_mitr",
  "POIC_2_mitr",
  "POIC_3_mitr",
  "POIC_4_mitr",
  "POIC_5_mitr",
];

const sensorNames = {
  elektro_ievads_3f: "Elektro ievads 3f",
  Elektro_apgaism: "Elektro apgaismojums",
  Elektro_piekl: "Elektro piekluve",
  POIC_1_temp: "POIC1 temperatura",
  POIC_2_temp: "POIC2 temperatura",
  POIC_3_temp: "POIC3 temperatura",
  POIC_4_temp: "POIC4 temperatura",
  POIC_5_temp: "POIC5 temperatura",
  POIC_1_co2: "POIC1 CO2",
  POIC_2_co2: "POIC2 CO2",
  POIC_3_co2: "POIC3 CO2",
  POIC_4_co2: "POIC4 CO2",
  POIC_5_co2: "POIC5 CO2",
  udens: "Udens",
  Elektro_kond: "Elektro kondicioners",
  POIC_1_mitr: "POIC1 mitrums",
  POIC_2_mitr: "POIC2 mitrums",
  POIC_3_mitr: "POIC3 mitrums",
  POIC_4_mitr: "POIC4 mitrums",
  POIC_5_mitr: "POIC5 mitrums",
};

const rooms = {
  POIC_1: "POIC1",
  POIC_2: "POIC2",
  POIC_3: "POIC3",
  POIC_4: "POIC4",
  POIC_5: "POIC5",
};

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });
  const initHasRun = await pluginStore.get({ key: "initHasRun" });
  await pluginStore.set({ key: "initHasRun", value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        type: "public",
      },
    });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

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
