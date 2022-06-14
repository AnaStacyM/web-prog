import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DeviceApiService } from "../api/deviceApi.service";
import Typography from "@mui/material/Typography";

const Plots = ({ plotList, placeOptions, deviceOptions }) => {
  const [plots, setPlots] = useState([]);
  useEffect(() => {
    if (plotList.length) {
      const callback = setInterval(() => {
        DeviceApiService.fetchItems(plotList.map((plot) => plot.device)).then(
          (data) => {
            setPlots(
              plotList.map((plot) => {
                return {
                  ...plot,
                  data: data
                    .find((x) => x.id == plot.device)
                    ?.values.map((val) => ({
                      ...val,
                      createdDate: new Date(val.createdDate),
                    }))
                    .filter(({ createdDate }) => {
                      return createdDate >= plot.from && createdDate <= plot.to;
                    })
                    .map((x) => ({
                      ...x,
                      createdDate:
                        x.createdDate.toLocaleDateString() +
                        " " +
                        x.createdDate.toLocaleTimeString(),
                    })),
                };
              })
            );
          }
        );
      }, 2000);
      return () => clearInterval(callback);
    } else {
      setPlots([]);
    }
  }, [plotList]);
  return plots.map((plot) => {
    return (
      <>
        <Typography variant="h3">{placeOptions[+plot.place]} - {deviceOptions[+plot.device]}</Typography>
        <BarChart
          width={1024}
          height={400}
          data={plot.data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="createdDate" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </>
    );
  });
};

export default Plots;
