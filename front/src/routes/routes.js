import { AlertsPage } from "../pages/alerts.page";
import { ComparePage } from "../pages/compare.page";
import { DevicePage } from "../pages/device.page";
import { DevicesPage } from "../pages/devices.page";
import { RoomPage } from "../pages/room.page";
import { RoomsPage } from "../pages/rooms.page";

export const ROUTES = [
  {
    name: "Devices",
    path: "/devices",
    Component: DevicesPage,
  },
  {
    name: "Main Page",
    path: "/",
    Component: DevicesPage,
    hideInNavigation: true,
  },
  {
    name: "Device Page",
    path: "/devices/:id",
    Component: DevicePage,
    hideInNavigation: true,
  },
  {
    name: "Rooms",
    path: "/rooms",
    Component: RoomsPage,
  },
  {
    name: "Room",
    path: "/rooms/:id",
    Component: RoomPage,
    hideInNavigation: true,
  },
  {
    name: "Alerts",
    path: "/alerts",
    Component: AlertsPage,
  },
  {
    name: "Compare",
    path: "/compare",
    Component: ComparePage,
  },
];
