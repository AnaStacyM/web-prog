import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";
import { DeviceApiService } from "../api/deviceApi.service";
import { useNavigate } from "react-router-dom";

export const DevicesPage = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    DeviceApiService.fetchItems().then((responseData) =>
      setData(responseData.data)
    );
  }, []);
  return (
    <div className="App">
      <MaterialTable
        columns={[
          { title: "Id", field: "id" },
          { title: "Name", field: "attributes.name" },
          { title: "x", field: "attributes.position_x" },
          { title: "y", field: "attributes.position_y" },
          {
            title: "Created",
            field: "attributes.createdAt",
            type: "datetime",
          },
          {
            title: "Updated",
            field: "attributes.updatedAt",
            type: "datetime",
          },
        ]}
        data={data}
        title="Devices"
        onRowClick={(e, row) => navigate("/devices/" + row.id)}
        editable={{
          onRowDelete: async (rowData) => {
            await DeviceApiService.delete(rowData);
            const responseData = await DeviceApiService.fetchItems();
            setData(responseData.data);
          },
        }}
      />
    </div>
  );
};
