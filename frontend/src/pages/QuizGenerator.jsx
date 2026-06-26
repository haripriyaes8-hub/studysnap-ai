import React, { useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Alert, Chip, Divider, RadioGroup, FormControlLabel, Radio,
  LinearProgress, Collapse, Tabs, Tab,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import QuizIcon from "@mui/icons-material/Quiz";
import ReplayIcon from "@mui/icons-material/Replay";
import api from "../utils/api";
import { AIGenerating, SectionHeader, DifficultyChip, ScoreBadge } from "../components/UI";

const DIFFICULTIES = ["easy", "medium", "hard"];
const QUESTION_COUNTS = [3, 5, 7, 10];

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQ, setNumQ] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState(0);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const data = await api.post("/quiz/generate", { topic, difficulty, num_questions: numQ });
      setQuiz(data);
      setTab(1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    const score = quiz.questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
    setSubmitted(true);

    const result = {
      topic: quiz.topic, score, total: quiz.questions.length, difficulty,
      questions: quiz.questions, answers,
    };

    try {
      await api.post("/quiz/save", result);
      setHistory((prev) => [{ ...result, id: Date.now(), percent: Math.round(score / quiz.questions.length * 100) }, ...prev]);
    } catch (_) {}
  };

  const score = submitted
    ? quiz.questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0)
    : 0;

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setError("");
    setTab(0);
  };

  return (
    <Box>
      <SectionHeader
        title="AI Quiz Generator 🧠"
        subtitle="Test your knowledge with AI-generated quizzes on any topic"
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Generate Quiz" />
          <Tab label="Take Quiz" disabled={!quiz} />
        </Tabs>
      </Box>

      {/* Tab 0: Setup */}
      {tab === 0 && (
        <Card sx={{ maxWidth: 600 }}>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth label="Quiz Topic" size="large"
              placeholder="e.g. Photosynthesis, World War II, Python Functions..."
              value={topic} onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
              sx={{ mb: 3 }}
            />

            {/* Difficulty */}
            <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
              Difficulty Level
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {DIFFICULTIES.map((d) => {
                const colors = { easy: "#059669", medium: "#D97706", hard: "#DC2626" };
                const bgs = { easy: "#D1FAE5", medium: "#FEF3C7", hard: "#FEE2E2" };
                return (
                  <Button
                    key={d}
                    variant={difficulty === d ? "contained" : "outlined"}
                    onClick={() => setDifficulty(d)}
                    sx={{
                      flex: 1, fontWeight: 600, borderRadius: "10px",
                      ...(difficulty === d
                        ? { background: `${colors[d]} !important`, borderColor: colors[d] }
                        : { color: colors[d], borderColor: `${colors[d]}50`, background: bgs[d] }),
                    }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </Button>
                );
              })}
            </Box>

            {/* Question Count */}
            <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
              Number of Questions
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {QUESTION_COUNTS.map((n) => (
                <Button
                  key={n} variant={numQ === n ? "contained" : "outlined"}
                  onClick={() => setNumQ(n)}
                  sx={{ flex: 1, fontWeight: 700, borderRadius: "10px" }}
                >
                  {n}
                </Button>
              ))}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

            <Button
              variant="contained" fullWidth size="large"
              onClick={generateQuiz} disabled={!topic.trim() || loading}
              startIcon={<QuizIcon />} sx={{ py: 1.5 }}
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && tab === 0 && (
        <Box mt={2}>
          <Card>
            <CardContent>
              <AIGenerating message={`Generating ${numQ} ${difficulty} questions about "${topic}"...`} />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tab 1: Quiz */}
      {tab === 1 && quiz && (
        <Box>
          {/* Quiz Header */}
          <Box
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              mb: 2.5, flexWrap: "wrap", gap: 1,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>{quiz.topic}</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                <DifficultyChip difficulty={difficulty} />
                <Chip label={`${quiz.questions?.length} Questions`} size="small" />
              </Box>
            </Box>

            {submitted ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" startIcon={<ReplayIcon />} onClick={resetQuiz}>
                  New Quiz
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained" onClick={submitQuiz}
                disabled={Object.keys(answers).length < quiz.questions?.length}
              >
                Submit Quiz ({Object.keys(answers).length}/{quiz.questions?.length} answered)
              </Button>
            )}
          </Box>

          {/* Score */}
          {submitted && (
            <Card
              sx={{
                mb: 3,
                background: score / quiz.questions.length >= 0.8
                  ? "linear-gradient(135deg, #D1FAE5, #A7F3D0)"
                  : score / quiz.questions.length >= 0.6
                  ? "linear-gradient(135deg, #FEF3C7, #FDE68A)"
                  : "linear-gradient(135deg, #FEE2E2, #FECACA)",
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                <ScoreBadge score={score} total={quiz.questions.length} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {score / quiz.questions.length >= 0.8 ? "Excellent! 🎉" :
                      score / quiz.questions.length >= 0.6 ? "Good job! 👍" : "Keep practicing! 💪"}
                  </Typography>
                  <Typography color="text.secondary">
                    You got {score} out of {quiz.questions.length} questions correct
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {quiz.questions?.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = submitted && userAnswer === q.correct;
              const isWrong = submitted && userAnswer && userAnswer !== q.correct;

              return (
                <Card
                  key={q.id}
                  sx={{
                    border: "2px solid",
                    borderColor: submitted
                      ? isCorrect ? "#059669" : isWrong ? "#DC2626" : "divider"
                      : "divider",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 2 }}>
                      <Box
                        sx={{
                          width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                          background: "linear-gradient(135deg, #7C3AED, #9F67FF)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>
                          {idx + 1}
                        </Typography>
                      </Box>
                      <Typography fontWeight={600} lineHeight={1.6}>{q.question}</Typography>
                    </Box>

                    <RadioGroup
                      value={answers[q.id] || ""}
                      onChange={(e) => {
                        if (!submitted) setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                      }}
                    >
                      {q.options?.map((opt) => {
                        const letter = opt.charAt(0);
                        const isThisCorrect = submitted && letter === q.correct;
                        const isThisWrong = submitted && letter === userAnswer && !isThisCorrect;
                        return (
                          <FormControlLabel
                            key={opt} value={letter}
                            control={<Radio size="small" />}
                            label={opt}
                            disabled={submitted}
                            sx={{
                              px: 1.5, py: 0.5, borderRadius: "10px", mb: 0.5,
                              border: "1.5px solid",
                              borderColor: isThisCorrect ? "#059669"
                                : isThisWrong ? "#DC2626" : "transparent",
                              background: isThisCorrect ? "#D1FAE580"
                                : isThisWrong ? "#FEE2E280" : "transparent",
                              transition: "all 0.15s",
                              "& .MuiFormControlLabel-label": { fontSize: "0.9rem" },
                            }}
                          />
                        );
                      })}
                    </RadioGroup>

                    {/* Explanation */}
                    <Collapse in={submitted}>
                      <Box
                        sx={{
                          mt: 2, p: 2, borderRadius: "10px",
                          background: isCorrect ? "#D1FAE530" : "#FEE2E230",
                          border: `1px solid ${isCorrect ? "#059669" : "#DC2626"}30`,
                          display: "flex", gap: 1, alignItems: "flex-start",
                        }}
                      >
                        {isCorrect
                          ? <CheckCircleIcon sx={{ color: "#059669", mt: 0.3, flexShrink: 0 }} />
                          : <CancelIcon sx={{ color: "#DC2626", mt: 0.3, flexShrink: 0 }} />}
                        <Box>
                          {!isCorrect && (
                            <Typography variant="body2" fontWeight={600} mb={0.3} color="#059669">
                              Correct answer: {q.correct}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                            {q.explanation}
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {!submitted && (
            <Box mt={2.5} textAlign="center">
              <Button
                variant="contained" size="large"
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < quiz.questions?.length}
                sx={{ px: 6 }}
              >
                Submit Quiz
              </Button>
              {Object.keys(answers).length < quiz.questions?.length && (
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Answer all {quiz.questions?.length} questions to submit
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}