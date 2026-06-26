import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#7C3AED", light: "#9F67FF", dark: "#5B21B6", contrastText: "#fff" },
    secondary: { main: "#EC4899", light: "#F472B6", dark: "#BE185D", contrastText: "#fff" },
    info: { main: "#06B6D4" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#1E1B4B", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontWeight: 400, lineHeight: 1.7 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          fontSize: "0.95rem",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%)",
          boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)",
            boxShadow: "0 6px 20px rgba(124, 58, 237, 0.45)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(124, 58, 237, 0.08)",
          border: "1px solid rgba(124, 58, 237, 0.08)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(124, 58, 237, 0.14)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7C3AED",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#9F67FF", light: "#C084FC", dark: "#7C3AED", contrastText: "#fff" },
    secondary: { main: "#F472B6", light: "#F9A8D4", dark: "#EC4899", contrastText: "#fff" },
    info: { main: "#22D3EE" },
    background: { default: "#0F0A1E", paper: "#1A1235" },
    text: { primary: "#F1F5F9", secondary: "#94A3B8" },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #7C3AED 0%, #9F67FF 100%)",
          boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: "rgba(26, 18, 53, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(159, 103, 255, 0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(159,103,255,0.3)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#9F67FF" },
          },
        },
      },
    },
  },
});