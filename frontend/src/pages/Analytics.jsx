import React, { useEffect, useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Skeleton, LinearProgress,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../utils/api";
import { SectionHeader, EmptyState } from "../components/UI";

const COLORS = ["#7C3AED", "#EC4899", "#06B6D4", "#F59E0B", "#10B981"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics").then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <SectionHeader title="Analytics 📊" subtitle="Track your study performance" />
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: "20px" }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const hasData = data?.topic_stats?.length > 0;

  return (
    <Box>
      <SectionHeader
        title="Progress Analytics 📊"
        subtitle="Track your performance, identify weak areas, and measure growth"
      />

      {!hasData ? (
        <EmptyState
          emoji="📊"
          title="No data yet"
          message="Take some quizzes and create flashcards to see your analytics here."
        />
      ) : (
        <Grid container spacing={2.5}>
          {/* Quiz Trend */}
          {data.quiz_trend?.length > 0 && (
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2.5}>📈 Quiz Score Trend</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={[...data.quiz_trend].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]} contentStyle={{ borderRadius: 12 }} />
                      <Line
                        type="monotone" dataKey="avg" stroke="#7C3AED"
                        strokeWidth={2.5} dot={{ fill: "#7C3AED", r: 4 }} activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Difficulty Distribution */}
          {data.difficulty_distribution?.length > 0 && (
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2.5}>🎯 Difficulty Breakdown</Typography>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.difficulty_distribution}
                        dataKey="count" nameKey="difficulty"
                        cx="50%" cy="50%" outerRadius={70}
                        label={({ difficulty, count }) => `${difficulty}: ${count}`}
                        labelLine={false}
                      >
                        {data.difficulty_distribution.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Topic Performance */}
          {data.topic_stats?.length > 0 && (
            <Grid item xs={12} md={7}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2.5}>📚 Topic Performance</Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.topic_stats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="topic" type="category" tick={{ fontSize: 11 }} width={90} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 12 }} />
                      <Bar dataKey="avg_score" fill="#7C3AED" radius={[0, 6, 6, 0]} name="Avg Score" />
                      <Bar dataKey="best_score" fill="#EC4899" radius={[0, 6, 6, 0]} name="Best Score" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Flashcard Mastery */}
          {data.flashcard_mastery?.length > 0 && (
            <Grid item xs={12} md={5}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2.5}>🃏 Flashcard Mastery</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {data.flashcard_mastery.map((item, i) => (
                      <Box key={i}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "70%" }}>
                            {item.topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.mastered}/{item.total}
                          </Typography>
                        </Box>
                        <Box sx={{ position: "relative" }}>
                          <LinearProgress
                            variant="determinate"
                            value={item.percent}
                            sx={{
                              height: 8, borderRadius: 4,
                              background: "#E5E7EB",
                              "& .MuiLinearProgress-bar": {
                                background: item.percent === 100
                                  ? "linear-gradient(90deg, #059669, #10B981)"
                                  : "linear-gradient(90deg, #7C3AED, #EC4899)",
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">{item.percent}% mastered</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Study Streak */}
          {data.streak?.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography fontWeight={700} mb={2.5}>🔥 Study Activity (Last 30 Days)</Typography>
                  <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap" }}>
                    {Array.from({ length: 30 }, (_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (29 - i));
                      const dateStr = d.toISOString().split("T")[0];
                      const hasActivity = data.streak?.some((s) => s.study_date === dateStr);
                      return (
                        <Chip
                          key={i} size="small"
                          label={d.getDate()}
                          sx={{
                            width: 36, height: 28, fontSize: "0.7rem",
                            background: hasActivity
                              ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                              : "#F3F4F6",
                            color: hasActivity ? "#fff" : "#9CA3AF",
                            fontWeight: hasActivity ? 700 : 400,
                            cursor: "default",
                          }}
                        />
                      );
                    })}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Purple = active study day
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}