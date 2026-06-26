import React, { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Chip, IconButton, Tooltip, Tabs, Tab, Slider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StyleIcon from "@mui/icons-material/Style";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../utils/api";
import { AIGenerating, SectionHeader, EmptyState } from "../components/UI";

// ── Flip Card Component ──────────────────────────────────
function FlipCard({ card, onMasterToggle, onDelete }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box
      sx={{
        perspective: "1000px",
        height: 200, cursor: "pointer",
        "&:hover": { "& .card-inner": { transform: flipped ? "rotateY(0deg)" : "rotateY(8deg)" } },
      }}
      onClick={() => setFlipped((f) => !f)}
    >
      <Box
        className="card-inner"
        sx={{
          position: "relative", width: "100%", height: "100%",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <Box
          sx={{
            position: "absolute", width: "100%", height: "100%",
            backfaceVisibility: "hidden", borderRadius: "20px",
            background: "linear-gradient(135deg, #7C3AED15, #9F67FF10)",
            border: "2px solid #7C3AED25",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            p: 3, textAlign: "center",
          }}
        >
          <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
            Question
          </Typography>
          <Typography fontWeight={600} lineHeight={1.6}>{card.question}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, opacity: 0.6 }}>
            Tap to reveal answer
          </Typography>
        </Box>

        {/* Back */}
        <Box
          sx={{
            position: "absolute", width: "100%", height: "100%",
            backfaceVisibility: "hidden", borderRadius: "20px",
            background: "linear-gradient(135deg, #EC489915, #F472B610)",
            border: "2px solid #EC489930",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            p: 3, textAlign: "center",
            transform: "rotateY(180deg)",
          }}
        >
          <Typography variant="caption" color="secondary.main" fontWeight={700} sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
            Answer
          </Typography>
          <Typography variant="body2" lineHeight={1.7}>{card.answer}</Typography>
        </Box>
      </Box>

      {/* Actions (outside flip) */}
      <Box
        sx={{
          position: "absolute", top: 8, right: 8,
          display: "flex", gap: 0.5, zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title={card.mastered ? "Mark as unmastered" : "Mark as mastered"}>
          <IconButton
            size="small"
            onClick={() => onMasterToggle(card.id)}
            sx={{
              background: card.mastered ? "#D1FAE5" : "rgba(255,255,255,0.8)",
              color: card.mastered ? "#059669" : "#9CA3AF",
              backdropFilter: "blur(4px)",
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(card.id)}
            sx={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)", color: "#9CA3AF" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {card.mastered && (
        <Chip
          label="Mastered ✓"
          size="small"
          sx={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            background: "#D1FAE5", color: "#059669", fontWeight: 700, fontSize: "0.7rem",
          }}
        />
      )}
    </Box>
  );
}

// ── Study Mode Component ─────────────────────────────────
function StudyMode({ cards, onExit }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[idx];
  const progress = ((idx + 1) / cards.length) * 100;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>Study Mode</Typography>
        <Button variant="outlined" onClick={onExit} size="small">Exit</Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">{idx + 1} / {cards.length}</Typography>
        <Box sx={{ flex: 1, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7C3AED, #EC4899)", borderRadius: 3, transition: "width 0.3s" }} />
        </Box>
      </Box>

      <Box
        sx={{ perspective: "1000px", height: 320, cursor: "pointer", mb: 3 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <Box
          sx={{
            position: "relative", width: "100%", height: "100%",
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Box
            sx={{
              position: "absolute", width: "100%", height: "100%",
              backfaceVisibility: "hidden", borderRadius: "24px",
              background: "linear-gradient(135deg, #7C3AED, #9F67FF)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              p: 4, textAlign: "center",
            }}
          >
            <Typography variant="body1" color="rgba(255,255,255,0.7)" mb={2} fontWeight={500}>
              Q U E S T I O N
            </Typography>
            <Typography variant="h6" color="#fff" fontWeight={600} lineHeight={1.7}>
              {card.question}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mt: 3 }}>
              Tap to flip
            </Typography>
          </Box>

          <Box
            sx={{
              position: "absolute", width: "100%", height: "100%",
              backfaceVisibility: "hidden", borderRadius: "24px",
              background: "linear-gradient(135deg, #EC4899, #F472B6)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              p: 4, textAlign: "center",
              transform: "rotateY(180deg)",
            }}
          >
            <Typography variant="body1" color="rgba(255,255,255,0.7)" mb={2} fontWeight={500}>
              A N S W E R
            </Typography>
            <Typography variant="body1" color="#fff" fontWeight={500} lineHeight={1.8}>
              {card.answer}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="outlined" startIcon={<ArrowBackIcon />}
          onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={idx === 0}
        >
          Previous
        </Button>
        <Button
          variant="contained" endIcon={<ArrowForwardIcon />}
          onClick={() => { setIdx((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
          disabled={idx === cards.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function Flashcards() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [studyMode, setStudyMode] = useState(false);

  const fetchCards = () => api.get("/flashcards").then(setCards).catch(console.error);
  useEffect(() => { fetchCards(); }, []);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/flashcards/generate", { topic, count });
      setCards((prev) => [...data.flashcards, ...prev]);
      setTab(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaster = async (id) => {
    const data = await api.put(`/flashcards/${id}/master`, {});
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, mastered: data.mastered } : c));
  };

  const deleteCard = async (id) => {
    await api.delete(`/flashcards/${id}`);
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const mastered = cards.filter((c) => c.mastered).length;

  if (studyMode && cards.length > 0) {
    return <StudyMode cards={cards} onExit={() => setStudyMode(false)} />;
  }

  return (
    <Box>
      <SectionHeader title="Flashcard Generator 🃏" subtitle="Create and study AI-generated flashcards" />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Generate Cards" />
          <Tab label={`My Cards (${cards.length})`} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Grid container spacing={2.5} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <TextField
                  fullWidth label="Topic for Flashcards"
                  placeholder="e.g. The Solar System, Python Data Types..."
                  value={topic} onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  sx={{ mb: 3 }}
                />

                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                  Number of Flashcards: {count}
                </Typography>
                <Slider
                  value={count} onChange={(_, v) => setCount(v)}
                  min={3} max={15} step={1} marks
                  sx={{ mb: 3, color: "#7C3AED" }}
                />

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

                <Button
                  variant="contained" fullWidth size="large"
                  onClick={generate} disabled={!topic.trim() || loading}
                  startIcon={<StyleIcon />} sx={{ py: 1.5 }}
                >
                  Generate {count} Flashcards
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            {loading ? (
              <Card>
                <CardContent>
                  <AIGenerating message="Creating your flashcards..." />
                </CardContent>
              </Card>
            ) : (
              <Box
                sx={{
                  height: 280, border: "2px dashed", borderColor: "divider",
                  borderRadius: "20px", display: "flex",
                  alignItems: "center", justifyContent: "center", textAlign: "center", p: 3,
                }}
              >
                <Box>
                  <Typography variant="h2" mb={1}>🃏</Typography>
                  <Typography color="text.secondary">
                    Enter a topic and generate your AI flashcards
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Box>
          {/* Stats + Study Mode */}
          {cards.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label={`${cards.length} Total`} />
                <Chip label={`${mastered} Mastered`} sx={{ background: "#D1FAE5", color: "#059669" }} />
                <Chip label={`${cards.length - mastered} Remaining`} sx={{ background: "#FEF3C7", color: "#D97706" }} />
              </Box>
              <Button variant="contained" onClick={() => setStudyMode(true)} startIcon={<StyleIcon />}>
                Study Mode
              </Button>
            </Box>
          )}

          {cards.length === 0 ? (
            <EmptyState
              emoji="🃏"
              title="No flashcards yet"
              message="Generate your first set of flashcards to start studying."
              action={<Button variant="contained" onClick={() => setTab(0)}>Create Flashcards</Button>}
            />
          ) : (
            <Grid container spacing={2.5}>
              {cards.map((card) => (
                <Grid item xs={12} sm={6} lg={4} key={card.id}>
                  <Box sx={{ position: "relative" }}>
                    <FlipCard card={card} onMasterToggle={toggleMaster} onDelete={deleteCard} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}