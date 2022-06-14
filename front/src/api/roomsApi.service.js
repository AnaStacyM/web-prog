import { API_PATH } from "../constants/common.constants";
import qs from "qs";

const PLACE_PATH = `${API_PATH}/rooms`;

export const RoomApiService = {
  fetchItems: (options) => {
    const query = qs.stringify(options, { encodeValuesOnly: true });
    return fetch(`${PLACE_PATH}?${query}`).then(
      async (data) => await data.json()
    );
  },
  findOne: (id, options) => {
    const query = qs.stringify(options, { encodeValuesOnly: true });
    return fetch(`${PLACE_PATH}/${id}?${query}`).then(
      async (data) => await data.json()
    );
  },
  create: (room) => {
    return fetch(PLACE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: room }),
    }).then((data) => data.json());
  },
  update: (data) => {
    return fetch(`${PLACE_PATH}/${data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
  delete: (data) => {
    return fetch(`${PLACE_PATH}/${data.id}`, {
      method: "DELETE",
    });
  },
};
