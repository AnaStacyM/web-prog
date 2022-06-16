import React from "react";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import { useParams } from "react-router-dom";
import { DateTimePicker } from "@material-ui/pickers";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Switch from "@mui/material/Switch";
import { getPlotData } from "../utils/histogramHelper";
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
export const DevicePage = () => {
  const { id } = useParams();
  const [enableAverage, setEnableAverage] = useState(false);
  const [enablePreviousPeriod, setEnablePreviousPeriod] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [detalization, setDetalization] = useState("day");
  const [plot, setPlot] = useState([]);

  const handleChangeDetalization = (e) => {
    setDetalization(e.target.value);
  };

  const handleMakePlot = async () => {
    const startedAt = moment(startDate);
    const endAt = moment(endDate);

    DeviceApiService.findOne(id, { populate: "device_data" }).then(
      (response) => {
        const data = response.data.attributes.device_data.data;
        const plot = getPlotData(data, startedAt, endAt, detalization, {
          average: enableAverage,
          prevPeriod: enablePreviousPeriod,
        });
        setPlot(plot);
      }
    );
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
          value={detalization}
          label="Detalization"
          onChange={handleChangeDetalization}
        >
          <MenuItem value={"month"}>Month</MenuItem>
          <MenuItem value={"day"}>Day</MenuItem>
          <MenuItem value={"hour"}>Hour</MenuItem>
        </Select>
        <FormGroup>
          <FormControlLabel
            control={<Switch defaultChecked />}
            checked={enableAverage}
            onChange={(e) => setEnableAverage(e.target.checked)}
            label="Average consumption"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            checked={enablePreviousPeriod}
            onChange={(e) => setEnablePreviousPeriod(e.target.checked)}
            label="Consumption difference with the previous period"
          />
        </FormGroup>
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
      </FormControl>
    </Grid>
  );
};
