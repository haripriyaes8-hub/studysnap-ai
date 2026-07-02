import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box, AppBar, Toolbar, IconButton, Typography, useTheme, useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import api from "../utils/api";

export default function AppLayout({ darkMode, onToggleDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    api.get("/dashboard")
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Error fetching user data:", err));
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: "100vh",
          background: darkMode
            ? "linear-gradient(135deg, #0F0A1E 0%, #1A1235 100%)"
            : "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)",
        }}
      >
        {/* Mobile TopBar */}
        {isMobile && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              background: darkMode ? "#1A1235" : "#fff",
              borderBottom: "1px solid",
              borderColor: "divider",
              color: "text.primary",
            }}
          >
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                StudySnap AI
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Page content */}
        <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1200, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}