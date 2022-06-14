import { API_PATH } from "../constants/common.constants";
import qs from "qs";
const DEVICE_PATH = `${API_PATH}/devices`;

export const DeviceApiService = {
  fetchItems: (options) => {
    const query = qs.stringify(options, { encodeValuesOnly: true });
    return fetch(`${DEVICE_PATH}?${query}`).then(
      async (data) => await data.json()
    );
  },
  findOne: (id, options) => {
    const query = qs.stringify(options, { encodeValuesOnly: true });
    return fetch(`${DEVICE_PATH}/${id}?${query}`).then(
      async (data) => await data.json()
    );
  },
  create: async (task) => {
    try {
      const response = await fetch(DEVICE_PATH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: task }),
      });
      if (!response.ok) {
        throw new Error((await response.json()).error.message);
      }
      return response.json();
    } catch (e) {
      alert(e.message);
    }
  },
  update: (data) => {
    return fetch(`${DEVICE_PATH}/${data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
  delete: (data) => {
    return fetch(`${DEVICE_PATH}/${data.id}`, {
      method: "DELETE",
    });
  },
};
