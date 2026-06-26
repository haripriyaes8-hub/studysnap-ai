import React, { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Tabs, Tab, Divider, IconButton, Chip, Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArticleIcon from "@mui/icons-material/Article";
import api from "../utils/api";
import { AIGenerating, SectionHeader, EmptyState } from "../components/UI";

const SUMMARY_TYPES = [
  { value: "short", label: "⚡ Quick Summary", desc: "3-5 sentence overview" },
  { value: "detailed", label: "📖 Detailed", desc: "Comprehensive breakdown" },
  { value: "takeaways", label: "🎯 Key Takeaways", desc: "Bullet point essentials" },
  { value: "formulas", label: "🔬 Formulas & Terms", desc: "Equations and definitions" },
];

export default function NotesSummarizer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summaryType, setSummaryType] = useState("short");
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchNotes = () => {
    api.get("/notes").then(setNotes).catch(console.error);
  };

  useEffect(() => { fetchNotes(); }, []);

  const summarize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post("/summarize", { content, title, type: summaryType });
      setResult(data);
      fetchNotes();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      <SectionHeader
        title="Notes Summarizer 📝"
        subtitle="Paste your notes and let AI extract the most important information"
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Summarize Notes" />
          <Tab label={`Saved Notes (${notes.length})`} />
        </Tabs>
      </Box>

      {/* Tab 0: Summarize */}
      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <TextField
                  fullWidth label="Note Title (optional)"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }} size="small"
                />
                <TextField
                  fullWidth multiline rows={10}
                  label="Paste your notes here..."
                  placeholder="Paste your lecture notes, textbook content, or any study material here. The AI will process and summarize it for you."
                  value={content} onChange={(e) => setContent(e.target.value)}
                  sx={{ mb: 2.5 }}
                />

                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1.5}>
                  Summary Type
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                  {SUMMARY_TYPES.map((t) => (
                    <Box
                      key={t.value}
                      onClick={() => setSummaryType(t.value)}
                      sx={{
                        px: 2, py: 1.2, borderRadius: "12px", cursor: "pointer",
                        border: "2px solid",
                        borderColor: summaryType === t.value ? "primary.main" : "divider",
                        background: summaryType === t.value ? "rgba(124,58,237,0.08)" : "transparent",
                        transition: "all 0.2s",
                        flex: { xs: "1 1 calc(50% - 4px)", sm: "0 0 auto" },
                      }}
                    >
                      <Typography fontWeight={600} fontSize="0.85rem">{t.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained" fullWidth size="large"
                  onClick={summarize} disabled={!content.trim() || loading}
                  startIcon={<ArticleIcon />} sx={{ py: 1.5 }}
                >
                  Generate {SUMMARY_TYPES.find((t) => t.value === summaryType)?.label}
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                  Your note will also be saved automatically
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            {loading && (
              <Card>
                <CardContent>
                  <AIGenerating message="Processing your notes..." />
                </CardContent>
              </Card>
            )}

            {error && <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>}

            {result && !loading && (
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box>
                      <Typography fontWeight={700}>{result.title}</Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip label={result.reading_time} size="small" />
                        <Chip
                          label={SUMMARY_TYPES.find((t) => t.value === summaryType)?.label}
                          size="small"
                          sx={{ background: "#7C3AED20", color: "#7C3AED" }}
                        />
                      </Box>
                    </Box>
                    <Tooltip title={copied ? "Copied!" : "Copy"}>
                      <IconButton onClick={copyResult} size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{
                      background: "rgba(124,58,237,0.04)",
                      borderRadius: "12px", p: 2.5,
                      border: "1px solid rgba(124,58,237,0.12)",
                      maxHeight: 360, overflowY: "auto",
                    }}
                  >
                    <Typography
                      variant="body2" lineHeight={1.9}
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {result.content}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {!result && !loading && !error && (
              <Box
                sx={{
                  height: "100%", minHeight: 300, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  border: "2px dashed", borderColor: "divider",
                  borderRadius: "20px", p: 3, textAlign: "center",
                }}
              >
                <Box>
                  <Typography variant="h3" mb={1}>📋</Typography>
                  <Typography color="text.secondary">
                    Your AI-generated summary will appear here
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Saved Notes */}
      {tab === 1 && (
        notes.length === 0 ? (
          <EmptyState
            emoji="📝"
            title="No notes yet"
            message="Summarize your first note to see it here."
          />
        ) : (
          <Grid container spacing={2.5}>
            {notes.map((note) => (
              <Grid item xs={12} md={6} lg={4} key={note.id}>
                <Card sx={{ height: "100%", "&:hover .delete-btn": { opacity: 1 } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Typography fontWeight={700} fontSize="0.95rem" sx={{ flex: 1, pr: 1 }}>
                        {note.title}
                      </Typography>
                      <IconButton
                        className="delete-btn"
                        size="small" color="error"
                        sx={{ opacity: 0, transition: "opacity 0.2s" }}
                        onClick={() => deleteNote(note.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="body2" color="text.secondary"
                      sx={{
                        display: "-webkit-box", WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                        lineHeight: 1.7,
                      }}
                    >
                      {note.summary || note.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                      {new Date(note.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}
    </Box>
  );
}