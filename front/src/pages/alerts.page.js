import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { AlertsApiService } from "../api/alerts.service";

export const AlertsPage = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    AlertsApiService.fetchItems({
      populate: "alert_condition",
    }).then((response) => setData(response.data));
  }, []);

  return (
    <div className="App">
      <MaterialTable
        columns={[
          { title: "Id", field: "id" },
          { title: "Message", field: "attributes.alert_condition.data.attributes.message" },
          { title: "Logic", field: "attributes.alert_condition.data.attributes.logic" },
          { title: "Except Value", field: "attributes.value" },
          { title: "Condition Value", field: "attributes.alert_condition.data.attributes.value" },
          { title: "Created", field: "attributes.createdAt", type: "datetime" },
        ]}
        data={data}
        title="Alerts"
        editable={{
          onRowDelete: (rowData) => {
            AlertsApiService.delete(rowData)
              .then(() =>
                AlertsApiService.fetchItems({
                  populate: "alert_condition",
                })
              )
              .then((response) => setData(response.data));
          },
        }}
      />
    </div>
  );
};
