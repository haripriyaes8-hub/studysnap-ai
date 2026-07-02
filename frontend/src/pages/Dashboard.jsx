import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Avatar, IconButton, Chip, Skeleton,
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart,
} from "recharts";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArticleIcon from "@mui/icons-material/Article";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleIcon from "@mui/icons-material/Style";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../utils/api";
import { StatCard, SectionHeader } from "../components/UI";

const QUICK_ACTIONS = [
  { label: "Explain Topic", icon: <AutoAwesomeIcon />, path: "/explain", color: "#7C3AED", bg: "#F3F0FF" },
  { label: "Summarize Notes", icon: <ArticleIcon />, path: "/notes", color: "#EC4899", bg: "#FFF0F7" },
  { label: "Generate Quiz", icon: <QuizIcon />, path: "/quiz", color: "#06B6D4", bg: "#F0FBFF" },
  { label: "Create Flashcards", icon: <StyleIcon />, path: "/flashcards", color: "#F59E0B", bg: "#FFFBEB" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const chartData = data?.recent_quizzes?.slice().reverse().map((q) => ({
    name: q.topic.length > 10 ? q.topic.slice(0, 10) + "…" : q.topic,
    score: q.percent,
  })) || [];

  return (
    <Box>
      {/* Hero Welcome */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #EC4899 100%)",
          borderRadius: "24px",
          p: { xs: 3, md: 4 },
          mb: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute", top: -60, right: -60,
            width: 220, height: 220, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute", bottom: -40, right: 80,
            width: 140, height: 140, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mb: 0.5 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </Typography>
        <Typography variant="h4" fontWeight={700} color="#fff" gutterBottom>
          {greeting}, {data?.user?.name || "Haripriya"}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 420 }}>
          Ready to level up your studies? Your AI study buddy is here to help.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => navigate("/explain")}
            sx={{
              background: "rgba(255,255,255,0.2) !important",
              backdropFilter: "blur(8px)",
              color: "#fff",
              boxShadow: "none !important",
              "&:hover": { background: "rgba(255,255,255,0.3) !important" },
            }}
          >
            Start Studying ✨
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/quiz")}
            sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)", "&:hover": { borderColor: "#fff" } }}
          >
            Take a Quiz
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2.5} mb={3}>
        {[
          {
            icon: <LocalFireDepartmentIcon />,
            label: "Day Streak",
            value: loading ? "—" : `${data?.stats?.streak_days || 0}🔥`,
            color: "#F59E0B",
          },
          {
            icon: <ArticleIcon />,
            label: "Notes Saved",
            value: loading ? "—" : data?.stats?.notes || 0,
            color: "#EC4899",
          },
          {
            icon: <QuizIcon />,
            label: "Quizzes Taken",
            value: loading ? "—" : data?.stats?.quizzes || 0,
            color: "#06B6D4",
            subtitle: `Avg: ${data?.stats?.avg_score || 0}%`,
          },
          {
            icon: <StyleIcon />,
            label: "Flashcards",
            value: loading ? "—" : data?.stats?.flashcards || 0,
            color: "#7C3AED",
            subtitle: `${data?.stats?.mastered_flashcards || 0} mastered`,
          },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            {loading ? (
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: "20px" }} />
            ) : (
              <StatCard {...stat} />
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Quick Actions */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader title="Quick Actions" subtitle="Jump right in" />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {QUICK_ACTIONS.map((action) => (
                  <Box
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 2,
                      p: 2, borderRadius: "14px",
                      cursor: "pointer",
                      border: `1.5px solid ${action.color}20`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: action.bg,
                        transform: "translateX(4px)",
                        borderColor: `${action.color}50`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: "12px",
                        background: action.bg, border: `1.5px solid ${action.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: action.color, fontSize: 20, flexShrink: 0,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography fontWeight={600} fontSize="0.9rem">
                      {action.label}
                    </Typography>
                    <ArrowForwardIcon sx={{ ml: "auto", color: "text.secondary", fontSize: 18 }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quiz Score Chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Recent Quiz Performance"
                subtitle="Your score trend"
                action={
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/analytics")}>
                    View All
                  </Button>
                }
              />
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Score"]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #7C3AED20" }}
                    />
                    <Area
                      type="monotone" dataKey="score"
                      stroke="#7C3AED" strokeWidth={2.5}
                      fill="url(#scoreGrad)"
                      dot={{ fill: "#7C3AED", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <Typography variant="h3">📊</Typography>
                  <Typography color="text.secondary" mt={1}>
                    Take some quizzes to see your performance here!
                  </Typography>
                  <Button
                    variant="contained" size="small" sx={{ mt: 2 }}
                    onClick={() => navigate("/quiz")}
                  >
                    Take a Quiz
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notes */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                title="Recent Notes"
                action={
                  <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/notes")}>
                    View All
                  </Button>
                }
              />
              {loading ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" width={200} height={80} sx={{ borderRadius: "12px" }} />)}
                </Box>
              ) : data?.recent_notes?.length > 0 ? (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {data.recent_notes.map((note) => (
                    <Box
                      key={note.id}
                      onClick={() => navigate("/notes")}
                      sx={{
                        p: 2, borderRadius: "14px", border: "1.5px solid",
                        borderColor: "divider", cursor: "pointer", minWidth: 180,
                        "&:hover": { borderColor: "primary.main", background: "rgba(124,58,237,0.04)" },
                        transition: "all 0.2s",
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>{note.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(note.created_at).toLocaleDateString("en-IN")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No notes yet. Start summarizing your study materials!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}