import { API_PATH } from "../constants/common.constants";
import qs from "qs";

const ALERT_PATH = `${API_PATH}/alerts`;

export const AlertsApiService = {
  fetchItems: (options) => {
    const query = qs.stringify(options, { encodeValuesOnly: true });
    return fetch(`${ALERT_PATH}?${query}`).then(
      async (data) => await data.json()
    );
  },
  delete: (data) => {
    return fetch(`${ALERT_PATH}/${data.id}`, {
      method: "DELETE",
    });
  },
};
