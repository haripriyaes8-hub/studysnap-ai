import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Avatar, Divider, IconButton, Tooltip, useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArticleIcon from "@mui/icons-material/Article";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleIcon from "@mui/icons-material/Style";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SchoolIcon from "@mui/icons-material/School";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Topic Explainer", icon: <AutoAwesomeIcon />, path: "/explain" },
  { label: "Notes Summarizer", icon: <ArticleIcon />, path: "/notes" },
  { label: "Quiz Generator", icon: <QuizIcon />, path: "/quiz" },
  { label: "Flashcards", icon: <StyleIcon />, path: "/flashcards" },
  { label: "Analytics", icon: <BarChartIcon />, path: "/analytics" },
  { label: "Study Planner", icon: <CalendarMonthIcon />, path: "/planner" },
];

export default function Sidebar({ darkMode, onToggleDark, mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNav = (path) => {
    navigate(path);
    onMobileClose?.();
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: darkMode
          ? "linear-gradient(180deg, #1A1235 0%, #0F0A1E 100%)"
          : "linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)",
        color: "#fff",
        p: 2,
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, py: 2 }}>
        <Box
          sx={{
            width: 42, height: 42, borderRadius: "12px",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <SchoolIcon sx={{ fontSize: 24, color: "#fff" }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            StudySnap
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            AI Study Buddy
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", my: 1 }} />

      {/* Nav Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: "12px",
                  py: 1.2,
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  backdropFilter: active ? "blur(8px)" : "none",
                  "&:hover": {
                    background: "rgba(255,255,255,0.12)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 40, opacity: active ? 1 : 0.75 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400,
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
                {active && (
                  <Box
                    sx={{
                      width: 4, height: 24, borderRadius: 2,
                      background: "#fff", ml: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", my: 1 }} />

      {/* User + Dark Mode */}
      <Box sx={{ px: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 36, height: 36,
                background: "rgba(255,255,255,0.25)",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              A
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>Haripriya</Typography>
              <Typography variant="caption" sx={{ opacity: 0.65 }}>Student</Typography>
            </Box>
          </Box>
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton
              onClick={onToggleDark}
              size="small"
              sx={{ color: "#fff", background: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
            >
              {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
            overflow: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none" },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };