import React, { useEffect, useState } from "react";
import { Avatar } from "@material-ui/core";
import MaterialTable from "material-table";
import { RoomApiService } from "../api/roomsApi.service";
import { BASE_PATH } from "../constants/common.constants";
import { useNavigate } from "react-router-dom";

export const RoomsPage = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    RoomApiService.fetchItems({
      populate: "building_plan_image",
    }).then((responseData) => setData(responseData.data));
  }, []);
  if (data === null) return null;
  return (
    <div className="App">
      <MaterialTable
        columns={[
          { title: "Id", field: "id" },
          { title: "Name", field: "attributes.name" },
          {
            title: "Building Plane",
            field: "attributes.building_plan_image.data.attributes.url",
            render: (data) => {
              console.log(data);
              const imageData = data.attributes.building_plan_image.data;
              if (imageData) {
                const image = imageData.attributes.url;
                return <Avatar alt={image} src={`${BASE_PATH}${image}`} />;
              }
            },
          },
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
        title="Rooms"
        onRowClick={(e, row) => navigate("/rooms/" + row.id)}
        editable={{
          onRowDelete: async (rowData) => {
            await RoomApiService.delete(rowData);
            const response = await RoomApiService.fetchItems({
              populate: "building_plan_image",
            });
            setData(response);
          },
        }}
      />
    </div>
  );
};
