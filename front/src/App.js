import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import * as React from "react";
import Navigation from "./components/Navigation";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

function App() {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Router>
        <Navigation />
        <Routes>
          {ROUTES.map(({ path, Component }) => (
            <Route
              key={path}
              exact
              path={path}
              element={<Component />}
            ></Route>
          ))}
        </Routes>
      </Router>
    </MuiPickersUtilsProvider>
  );
}

export default App;
