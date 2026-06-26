import React from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Chip, CircularProgress } from "@mui/material";

// ── Stat Card ──────────────────────────────────────────
export function StatCard({ icon, label, value, color = "#7C3AED", subtitle }) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute", top: -20, right: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: `${color}18`,
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: "14px",
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 2, fontSize: 24, color,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" fontWeight={700} color={color}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500} mt={0.5}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// ── Glass Card ─────────────────────────────────────────
export function GlassCard({ children, sx = {} }) {
  return (
    <Card
      sx={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

// ── Section Header ─────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

// ── Loading Spinner ────────────────────────────────────
export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box
      sx={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        py: 8, gap: 2,
      }}
    >
      <CircularProgress sx={{ color: "#7C3AED" }} size={48} />
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    </Box>
  );
}

// ── AI Generating State ─────────────────────────────────
export function AIGenerating({ message = "AI is thinking..." }) {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">✨</Typography>
      </Box>
      <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
        {message}
      </Typography>
      <Box sx={{ width: 280, mx: "auto", mt: 2 }}>
        <LinearProgress
          sx={{
            borderRadius: 4, height: 6,
            backgroundColor: "rgba(124,58,237,0.15)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4)",
              borderRadius: 4,
            },
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        This may take 5–15 seconds
      </Typography>
    </Box>
  );
}

// ── Difficulty Chip ────────────────────────────────────
export function DifficultyChip({ difficulty }) {
  const colors = {
    easy: { bg: "#D1FAE5", text: "#059669" },
    medium: { bg: "#FEF3C7", text: "#D97706" },
    hard: { bg: "#FEE2E2", text: "#DC2626" },
  };
  const c = colors[difficulty] || colors.medium;
  return (
    <Chip
      label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      size="small"
      sx={{ background: c.bg, color: c.text, fontWeight: 600, fontSize: "0.75rem" }}
    />
  );
}

// ── Score Badge ────────────────────────────────────────
export function ScoreBadge({ score, total }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const color = pct >= 80 ? "#059669" : pct >= 60 ? "#D97706" : "#DC2626";
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={pct}
          size={72}
          thickness={5}
          sx={{ color }}
        />
        <Box sx={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Typography variant="body2" fontWeight={700} color={color}>
            {pct}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        {score}/{total} correct
      </Typography>
    </Box>
  );
}

// ── Empty State ────────────────────────────────────────
export function EmptyState({ emoji = "📭", title, message, action }) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h2" mb={1}>{emoji}</Typography>
      <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: "auto" }}>
        {message}
      </Typography>
      {action && <Box mt={3}>{action}</Box>}
    </Box>
  );
}