import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";


const Navigation = () => {
  const navigate = useNavigate();
  return (
    <AppBar position="static">
      <Container
        maxWidth="xl"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Typography
          variant="h5"
          component="a"
          href=""
          sx={{
            mr: 2,
            flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: "bold",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          IoT
        </Typography>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          {ROUTES.filter(({ hideInNavigation }) => !hideInNavigation).map(
            (page) => (
              <Button
                onClick={() => navigate(page.path)}
                key={page.path}
                sx={{ my: 2, color: "white", display: "block", mx: 2 }}
              >
                {page.name}
              </Button>
            )
          )}
        </Box>
      </Container>
    </AppBar>
  );
};

export default Navigation;
