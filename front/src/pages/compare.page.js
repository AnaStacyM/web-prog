import React, { useEffect } from "react";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import { useParams } from "react-router-dom";
import { DateTimePicker } from "@material-ui/pickers";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import moment from "moment";
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
import { RoomApiService } from "../api/roomsApi.service";
import _ from "lodash";
const plt = [
  { date: moment(new Date()).subtract(1, "m").toDate(), value: 10 },
  { date: moment(new Date()).subtract(1, "hours").toDate(), value: 90 },
];
export const ComparePage = () => {
  const { id } = useParams();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [type, setType] = useState("co2");
  const [plot, setPlot] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  const handleChangeType = (e) => {
    setType(e.target.value);
  };

  useEffect(() => {
    RoomApiService.fetchItems().then((response) =>
      setRooms(
        response.data.map((x) => ({ id: x.id, name: x.attributes.name }))
      )
    );
  }, []);

  const handleMakePlot = async () => {
    const startedAt = moment(startDate);
    const endAt = moment(endDate);

    const rawData = await Promise.all(
      selectedRooms.map(
        async (roomId) =>
          await DeviceApiService.fetchItems({
            populate: ["room", "device_data"],
            filters: {
              type: {
                $eq: type,
              },
              room: {
                id: {
                  $eq: roomId,
                },
              },
            },
          })
      )
    );
    console.log(startedAt, endAt);
    const data = rawData.map((devicesData, idx) => ({
      name: rooms[idx].name,
      value: _.mean(
        _.flatten(
          devicesData.data.map((dev) => {
            return dev.attributes.device_data.data
              .filter((item) => {
                return moment(item.attributes.createdAt).isBetween(
                  startedAt,
                  endAt
                );
              })
              .map((item) => item.attributes.value);
          })
        )
      ),
    }));
    console.log(data);
    setPlot(data);
  };
  return (
    <Grid
      container
      maxWidth="xl"
      style={{ margin: "16px auto" }}
      direction="column"
      spacing={4}
    >
      <DateTimePicker
        label="Start date"
        inputVariant="outlined"
        value={startDate}
        onChange={setStartDate}
      />
      <DateTimePicker
        label="End date"
        inputVariant="outlined"
        value={endDate}
        onChange={setEndDate}
      />
      <FormControl>
        <InputLabel id="select-label">Detalization</InputLabel>
        <Select
          labelId="select-label"
          id="select"
          value={type}
          label="Detalization"
          onChange={handleChangeType}
        >
          <MenuItem value="co2">CO2</MenuItem>
          <MenuItem value="temp">Temperatura</MenuItem>
          <MenuItem value="mitr">Mitrums</MenuItem>
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel id="select-label-rooms">Room</InputLabel>
        <Select
          labelId="select-label-rooms"
          id="select-rooms"
          multiple
          value={selectedRooms}
          onChange={(e) => setSelectedRooms(e.target.value)}
          input={<OutlinedInput label="Name" />}
        >
          {rooms.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleMakePlot}>
        Make plot
      </Button>

      {plot.length > 0 && (
        <BarChart
          width={1200}
          height={600}
          data={plot}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      )}
    </Grid>
  );
};
