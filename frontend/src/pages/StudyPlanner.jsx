import React, { useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Chip, IconButton, Slider, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import api from "../utils/api";
import { AIGenerating, SectionHeader } from "../components/UI";

const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" },
  Medium: { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
  Low: { bg: "#D1FAE5", text: "#059669", border: "#A7F3D0" },
};

const SESSION_TYPE_COLORS = {
  Study: "#7C3AED",
  Review: "#06B6D4",
  Practice: "#EC4899",
};

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState([""]);
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [weakAreas, setWeakAreas] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSubject = () => setSubjects((s) => [...s, ""]);
  const removeSubject = (i) => setSubjects((s) => s.filter((_, idx) => idx !== i));
  const updateSubject = (i, val) => setSubjects((s) => s.map((x, idx) => idx === i ? val : x));

  const generate = async () => {
    const validSubjects = subjects.filter((s) => s.trim());
    if (!validSubjects.length) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const data = await api.post("/planner/generate", {
        subjects: validSubjects,
        exam_date: examDate,
        hours_per_day: hoursPerDay,
        weak_areas: weakAreas ? weakAreas.split(",").map((s) => s.trim()) : [],
      });
      setPlan(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <SectionHeader
        title="AI Study Planner 📅"
        subtitle="Generate a personalized study schedule tailored to your needs"
      />

      <Grid container spacing={2.5} alignItems="flex-start">
        {/* Input */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={700} mb={2}>Plan Details</Typography>

              {/* Subjects */}
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Subjects / Topics *
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                {subjects.map((s, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth size="small"
                      placeholder={`Subject ${i + 1}`}
                      value={s} onChange={(e) => updateSubject(i, e.target.value)}
                    />
                    {subjects.length > 1 && (
                      <IconButton size="small" onClick={() => removeSubject(i)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />} size="small" variant="outlined"
                  onClick={addSubject} sx={{ alignSelf: "flex-start" }}
                >
                  Add Subject
                </Button>
              </Box>

              <TextField
                fullWidth label="Exam Date (optional)" type="date"
                value={examDate} onChange={(e) => setExamDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} size="small"
              />

              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Study Hours Per Day: {hoursPerDay}h
              </Typography>
              <Slider
                value={hoursPerDay} onChange={(_, v) => setHoursPerDay(v)}
                min={1} max={10} step={0.5} marks
                sx={{ mb: 2, color: "#7C3AED" }}
              />

              <TextField
                fullWidth label="Weak Areas (comma-separated)" multiline rows={2}
                placeholder="e.g. Thermodynamics, Integration, Pointers"
                value={weakAreas} onChange={(e) => setWeakAreas(e.target.value)}
                sx={{ mb: 2.5 }} size="small"
              />

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px", fontSize: "0.8rem" }}>{error}</Alert>}

              <Button
                variant="contained" fullWidth size="large"
                onClick={generate}
                disabled={!subjects.some((s) => s.trim()) || loading}
                startIcon={<CalendarMonthIcon />}
              >
                Generate Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Output */}
        <Grid item xs={12} md={8}>
          {loading && (
            <Card>
              <CardContent>
                <AIGenerating message="Creating your personalized study plan..." />
              </CardContent>
            </Card>
          )}

          {plan && !loading && (
            <Box>
              {/* Plan Header */}
              <Card sx={{ mb: 2.5, background: "linear-gradient(135deg, #7C3AED10, #EC489908)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight={700} mb={1}>{plan.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {plan.overview}
                  </Typography>
                </CardContent>
              </Card>

              {/* Daily Plans */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {plan.daily_plans?.map((day, di) => (
                  <Card key={di}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography fontWeight={700}>{day.day}</Typography>
                        {day.date && (
                          <Typography variant="caption" color="text.secondary">{day.date}</Typography>
                        )}
                      </Box>

                      {day.daily_goal && (
                        <Box
                          sx={{
                            p: 1.5, borderRadius: "10px", mb: 2,
                            background: "rgba(124,58,237,0.06)",
                            border: "1px solid rgba(124,58,237,0.15)",
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} color="primary.main">🎯 Daily Goal: </Typography>
                          <Typography variant="caption">{day.daily_goal}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {day.sessions?.map((session, si) => {
                          const typeColor = SESSION_TYPE_COLORS[session.type] || "#7C3AED";
                          const priColor = PRIORITY_COLORS[session.priority] || PRIORITY_COLORS.Medium;
                          return (
                            <Box
                              key={si}
                              sx={{
                                display: "flex", alignItems: "center", gap: 2,
                                p: 1.5, borderRadius: "12px",
                                border: "1.5px solid", borderColor: `${typeColor}20`,
                                flexWrap: "wrap",
                              }}
                            >
                              <Box sx={{ width: 3, height: 36, borderRadius: 2, background: typeColor, flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography fontWeight={600} fontSize="0.875rem">{session.subject}</Typography>
                                <Typography variant="caption" color="text.secondary">{session.topic}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                {session.time && <Chip label={session.time} size="small" />}
                                <Chip
                                  label={session.type} size="small"
                                  sx={{ background: `${typeColor}18`, color: typeColor, fontWeight: 600 }}
                                />
                                {session.priority && (
                                  <Chip
                                    label={session.priority} size="small"
                                    sx={{ background: priColor.bg, color: priColor.text, fontWeight: 600 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Tips */}
              {plan.tips?.length > 0 && (
                <Card sx={{ mt: 2.5 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography fontWeight={700} mb={2}>💡 Study Tips</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {plan.tips.map((tip, i) => (
                        <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                          <Box
                            sx={{
                              width: 22, height: 22, borderRadius: "50%",
                              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, mt: 0.2,
                            }}
                          >
                            <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>{i + 1}</Typography>
                          </Box>
                          <Typography variant="body2" lineHeight={1.7}>{tip}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {!plan && !loading && (
            <Box
              sx={{
                height: 400, border: "2px dashed", borderColor: "divider",
                borderRadius: "20px", display: "flex",
                alignItems: "center", justifyContent: "center", textAlign: "center", p: 3,
              }}
            >
              <Box>
                <Typography variant="h2" mb={1}>📅</Typography>
                <Typography color="text.secondary">
                  Fill in your details and generate a personalized 7-day study plan
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}