import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid, Card, CardContent, Chip, Container } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/Quiz";
import StyleIcon from "@mui/icons-material/Style";
import ArticleIcon from "@mui/icons-material/Article";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const FEATURES = [
  { icon: "✨", title: "AI Topic Explainer", desc: "Get instant explanations in Beginner, Exam, or Deep Learning mode" },
  { icon: "📝", title: "Notes Summarizer", desc: "Paste notes and get concise summaries, takeaways, and key formulas" },
  { icon: "🧠", title: "Quiz Generator", desc: "Auto-generate MCQ quizzes with scoring and explanations" },
  { icon: "🃏", title: "Flashcards", desc: "Create and study flashcards with beautiful flip animations" },
  { icon: "📊", title: "Progress Analytics", desc: "Track your scores, mastery, and study streaks over time" },
  { icon: "📅", title: "Study Planner", desc: "Get a personalized AI-generated weekly study schedule" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #FDF4FF 100%)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Nav */}
      <Box
        sx={{
          px: { xs: 2, md: 6 }, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(124,58,237,0.1)",
          backdropFilter: "blur(8px)",
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(248,250,252,0.85)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38, height: 38, borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}
          >
            🎓
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="#1E1B4B">StudySnap AI</Typography>
          </Box>
        </Box>
        <Button
          variant="contained" size="small"
          onClick={() => navigate("/dashboard")}
        >
          Open App
        </Button>
      </Box>

      {/* Hero */}
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", pt: { xs: 8, md: 12 }, pb: 6 }}>
          <Chip
            label="✨ Powered by Gemini AI"
            sx={{
              mb: 3, background: "linear-gradient(135deg, #7C3AED20, #EC489920)",
              color: "#7C3AED", fontWeight: 700, fontSize: "0.85rem",
              border: "1px solid #7C3AED30",
            }}
          />
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #06B6D4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              mb: 2, lineHeight: 1.2,
              fontSize: { xs: "2rem", md: "3.2rem" },
            }}
          >
            Your AI-Powered
            <br />Study Buddy 🎓
          </Typography>
          <Typography
            variant="h6" color="text.secondary"
            sx={{ maxWidth: 480, mx: "auto", mb: 4, fontWeight: 400, lineHeight: 1.7 }}
          >
            Explain topics, summarize notes, generate quizzes, create flashcards, and
            track your progress — all powered by AI.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained" size="large"
              onClick={() => navigate("/dashboard")}
              startIcon={<AutoAwesomeIcon />}
              sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
            >
              Start Studying for Free
            </Button>
            <Button
              variant="outlined" size="large"
              onClick={() => navigate("/explain")}
              sx={{ px: 4, py: 1.5, fontSize: "1rem", borderColor: "#7C3AED", color: "#7C3AED" }}
            >
              Try AI Explainer
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography
          variant="h4" fontWeight={700} textAlign="center"
          mb={1} color="#1E1B4B"
        >
          Everything you need to ace your exams
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={5}>
          Six powerful AI tools, one seamless experience
        </Typography>

        <Grid container spacing={2.5}>
          {FEATURES.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card
                sx={{
                  height: "100%", cursor: "pointer",
                  transition: "all 0.25s ease",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 40px rgba(124,58,237,0.18)" },
                }}
                onClick={() => navigate("/dashboard")}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h2" mb={2} lineHeight={1}>{f.icon}</Typography>
                  <Typography fontWeight={700} mb={1} fontSize="1.05rem">{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box
          sx={{
            mt: 6, p: 5, borderRadius: "28px",
            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #EC4899 100%)",
            textAlign: "center", color: "#fff",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={1}>
            Ready to study smarter? 🚀
          </Typography>
          <Typography sx={{ opacity: 0.85, mb: 3, maxWidth: 400, mx: "auto" }}>
            Join thousands of students using AI to learn faster and score higher.
          </Typography>
          <Button
            variant="contained" size="large"
            onClick={() => navigate("/dashboard")}
            sx={{
              background: "rgba(255,255,255,0.2) !important",
              backdropFilter: "blur(8px)", color: "#fff",
              px: 5, py: 1.5, fontSize: "1rem",
              boxShadow: "none !important",
              "&:hover": { background: "rgba(255,255,255,0.3) !important" },
            }}
          >
            Get Started Now ✨
          </Button>
        </Box>
      </Container>
    </Box>
  );
}