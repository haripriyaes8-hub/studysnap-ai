import React, { useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  ToggleButton, ToggleButtonGroup, Chip, Divider, Alert, Collapse,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SchoolIcon from "@mui/icons-material/School";
import ScienceIcon from "@mui/icons-material/Science";
import api from "../utils/api";
import { AIGenerating, SectionHeader } from "../components/UI";

const MODES = [
  { value: "beginner", label: "🌱 Beginner", desc: "Simple, clear explanations with easy analogies" },
  { value: "exam", label: "📝 Exam Mode", desc: "Key points, formulas, and exam-ready summary" },
  { value: "deep", label: "🔬 Deep Learning", desc: "In-depth academic explanation with full detail" },
];

const EXAMPLE_TOPICS = [
  "Photosynthesis", "Newton's Laws", "Machine Learning", "The French Revolution",
  "Derivatives in Calculus", "DNA Replication", "Ohm's Law", "Binary Search",
];

export default function TopicExplainer() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("beginner");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const explain = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post("/explain", { topic, mode });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <SectionHeader
        title="AI Topic Explainer ✨"
        subtitle="Enter any topic and get a tailored explanation instantly"
      />

      {/* Input Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="What topic do you want to understand?"
            placeholder="e.g. Quantum Entanglement, Photosynthesis, Binary Trees..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && explain()}
            sx={{ mb: 2.5 }}
            InputProps={{ sx: { fontSize: "1rem" } }}
          />

          {/* Mode Selection */}
          <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1.5}>
            Explanation Mode
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
            {MODES.map((m) => (
              <Box
                key={m.value}
                onClick={() => setMode(m.value)}
                sx={{
                  px: 2.5, py: 1.5, borderRadius: "14px", cursor: "pointer",
                  border: "2px solid",
                  borderColor: mode === m.value ? "primary.main" : "divider",
                  background: mode === m.value ? "rgba(124,58,237,0.08)" : "transparent",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "primary.light" },
                  flex: { xs: "1 1 calc(100% - 0px)", sm: "0 0 auto" },
                }}
              >
                <Typography fontWeight={600} fontSize="0.9rem">{m.label}</Typography>
                <Typography variant="caption" color="text.secondary">{m.desc}</Typography>
              </Box>
            ))}
          </Box>

          {/* Example Topics */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, alignSelf: "center" }}>
              Try:
            </Typography>
            {EXAMPLE_TOPICS.map((t) => (
              <Chip
                key={t} label={t} size="small" variant="outlined"
                onClick={() => setTopic(t)}
                sx={{ cursor: "pointer", "&:hover": { background: "rgba(124,58,237,0.08)" } }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={explain}
            disabled={!topic.trim() || loading}
            startIcon={<AutoAwesomeIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Explain This Topic
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent>
            <AIGenerating message="AI is crafting your explanation..." />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {/* Result */}
      {result && !loading && (
        <Box>
          {/* Header */}
          <Card sx={{ mb: 2.5, background: "linear-gradient(135deg, #7C3AED08, #EC489908)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h2" lineHeight={1}>{result.emoji || "📚"}</Typography>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{result.title}</Typography>
                  <Chip
                    label={MODES.find((m) => m.value === mode)?.label}
                    size="small"
                    sx={{ mt: 0.5, background: "#7C3AED20", color: "#7C3AED", fontWeight: 600 }}
                  />
                </Box>
              </Box>
              <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                {result.overview}
              </Typography>
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            {/* Key Points */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LightbulbIcon sx={{ color: "#F59E0B" }} />
                    <Typography fontWeight={700}>Key Points</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {result.key_points?.map((point, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <Box
                          sx={{
                            width: 22, height: 22, borderRadius: "6px",
                            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, mt: 0.2,
                          }}
                        >
                          <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700 }}>
                            {i + 1}
                          </Typography>
                        </Box>
                        <Typography variant="body2" lineHeight={1.6}>{point}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Main Explanation */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <SchoolIcon sx={{ color: "#7C3AED" }} />
                    <Typography fontWeight={700}>Explanation</Typography>
                  </Box>
                  <Typography variant="body1" lineHeight={1.9} sx={{ whiteSpace: "pre-line" }}>
                    {result.explanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Examples */}
            {result.examples?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography fontWeight={700} mb={2}>💡 Real-World Examples</Typography>
                    {result.examples.map((ex, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2, borderRadius: "12px", mb: 1.5,
                          background: "rgba(6,182,212,0.08)",
                          border: "1px solid rgba(6,182,212,0.2)",
                        }}
                      >
                        <Typography variant="body2" lineHeight={1.7}>{ex}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Formulas */}
            {result.formulas?.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <ScienceIcon sx={{ color: "#EC4899" }} />
                      <Typography fontWeight={700}>Formulas & Definitions</Typography>
                    </Box>
                    {result.formulas.map((f, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2, borderRadius: "12px", mb: 1.5,
                          background: "rgba(236,72,153,0.06)",
                          border: "1px solid rgba(236,72,153,0.2)",
                          fontFamily: "monospace",
                        }}
                      >
                        <Typography variant="body2" lineHeight={1.7}>{f}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Remember Box */}
            {result.remember && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2.5, borderRadius: "16px",
                    background: "linear-gradient(135deg, #7C3AED15, #EC489910)",
                    border: "1.5px solid #7C3AED30",
                    display: "flex", alignItems: "center", gap: 2,
                  }}
                >
                  <Typography fontSize="1.5rem">🎯</Typography>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="primary.main" mb={0.3}>
                      Key Takeaway
                    </Typography>
                    <Typography variant="body2">{result.remember}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
}