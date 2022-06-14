import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link, useParams } from "react-router-dom";
import { DeviceApiService } from "../api/deviceApi.service";
import { RoomApiService } from "../api/roomsApi.service";
import { BASE_PATH } from "../constants/common.constants";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
export const RoomPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const [sensorName, setSensorName] = useState("");
  const [sensorType, setSensorType] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => {
    setSensorType(event.target.value);
  };
  const handleSave = () => {
    DeviceApiService.create({
      name: sensorName,
      type: sensorType,
      position_x: position[0],
      position_y: position[1],
      room: id,
    })
      .then(() => {
        handleClose();
        RoomApiService.findOne(id, {
          populate: ["building_plan_image", "devices"],
        }).then((responseData) => setRoom(responseData.data));
      })
      .catch((e) => {
        alert(e);
        handleClose();
      });
  };
  useEffect(() => {
    RoomApiService.findOne(id, {
      populate: ["building_plan_image", "devices"],
    }).then((responseData) => setRoom(responseData.data));
  }, [id]);
  if (!room) {
    return <CircularProgress color="secondary" />;
  }
  return (
    <Grid container maxWidth="xl" style={{ margin: "16px auto" }}>
      <Grid item>
        <Typography variant="h3" component="h2">
          {room.attributes.name} #{room.id}
        </Typography>
        <Typography>{room.attributes.createdAt}</Typography>
        <div style={{ position: "relative" }}>
          <img
            src={`${BASE_PATH}${room.attributes.building_plan_image.data.attributes.url}`}
            alt={room.attributes.name}
            loading="lazy"
            onClick={(e) => {
              setPosition([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);
              handleOpen();
            }}
          />
          {room.attributes.devices.data.map((device) => {
            const id = device.id;
            const { position_x, position_y, name } = device.attributes;
            return (
              <Link
                key={id}
                to={"/devices/" + id}
                style={{
                  position: "absolute",
                  left: position_x,
                  top: position_y,
                  background: "purple",
                  color: "white",
                  opacity: 0.7,
                  padding: 2,
                  borderRadius: 4,
                }}
              >
                {name}
              </Link>
            );
          })}
        </div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              sx={{ mb: 2 }}
              variant="h6"
              component="h2"
            >
              Sensor
            </Typography>
            <TextField
              label="Name"
              sx={{ mb: 2 }}
              fullWidth
              variant="outlined"
              value={sensorName}
              onChange={(e) => setSensorName(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel id="select-label-type">Type</InputLabel>
              <Select
                labelId="select-label-type"
                id="select-type"
                value={sensorType}
                label="Type"
                onChange={handleChange}
              >
                <MenuItem value="co2">CO2</MenuItem>
                <MenuItem value="mitr">Temperatura</MenuItem>
                <MenuItem value="temp">Mitrums</MenuItem>
              </Select>
              <Button sx={{ mb: 2 }} onClick={handleSave} variant="contained">
                Save
              </Button>
            </FormControl>
          </Box>
        </Modal>
      </Grid>
    </Grid>
  );
};
