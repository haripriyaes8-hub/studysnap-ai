"""
StudySnap AI - Backend Flask Application
Provides REST API endpoints for AI-powered study features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
import re
from datetime import datetime, date
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# ──────────────────────────────────────────────
# Database Setup
# ──────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(__file__), "studysnap.db")

def get_db():
    """Get a database connection with row_factory for dict-like rows."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize all database tables."""
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            key_takeaways TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            topic TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            difficulty TEXT DEFAULT 'medium',
            date TEXT DEFAULT (date('now')),
            questions TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            topic TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            mastered INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS study_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            topic TEXT,
            duration_minutes INTEGER DEFAULT 0,
            session_date TEXT DEFAULT (date('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS streak_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER DEFAULT 1,
            study_date TEXT UNIQUE,
            minutes_studied INTEGER DEFAULT 0
        )
    """)

    # Seed default user if not exists
    c.execute("INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Aamy', 'aamy@studysnap.ai')")

    conn.commit()
    conn.close()

init_db()

# ──────────────────────────────────────────────
# Gemini AI Helper
# ──────────────────────────────────────────────

def get_gemini_response(prompt: str, system_context: str = "") -> str:
    """Call Gemini API and return text response."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-lite")

    full_prompt = f"{system_context}\n\n{prompt}" if system_context else prompt
    response = model.generate_content(full_prompt)
    return response.text

def clean_json_response(text: str) -> str:
    """Strip markdown code fences from AI JSON responses."""
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()

# ──────────────────────────────────────────────
# Dashboard Endpoints
# ──────────────────────────────────────────────

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """Return dashboard stats for the user."""
    conn = get_db()
    c = conn.cursor()

    # Count notes
    notes_count = c.execute("SELECT COUNT(*) FROM notes WHERE user_id=1").fetchone()[0]

    # Count quizzes and average score
    quiz_row = c.execute("""
        SELECT COUNT(*), AVG(CASE WHEN total > 0 THEN CAST(score AS REAL)/total*100 ELSE 0 END)
        FROM quizzes WHERE user_id=1
    """).fetchone()
    quizzes_count = quiz_row[0]
    avg_score = round(quiz_row[1] or 0, 1)

    # Count flashcards
    flashcards_count = c.execute("SELECT COUNT(*) FROM flashcards WHERE user_id=1").fetchone()[0]
    mastered_count = c.execute("SELECT COUNT(*) FROM flashcards WHERE user_id=1 AND mastered=1").fetchone()[0]

    # Study streak
    today = date.today().isoformat()
    c.execute(
        "INSERT OR IGNORE INTO streak_data (user_id, study_date, minutes_studied) VALUES (1, ?, 5)",
        (today,)
    )
    conn.commit()

    streak_days = c.execute("""
        SELECT COUNT(DISTINCT study_date) FROM streak_data
        WHERE user_id=1
        AND study_date >= date('now', '-30 days')
    """).fetchone()[0]

    # Recent notes
    recent_notes = c.execute("""
        SELECT id, title, created_at FROM notes
        WHERE user_id=1 ORDER BY created_at DESC LIMIT 5
    """).fetchall()

    # Recent quiz scores for chart
    recent_quizzes = c.execute("""
        SELECT topic, score, total, date FROM quizzes
        WHERE user_id=1 ORDER BY date DESC LIMIT 7
    """).fetchall()

    conn.close()

    return jsonify({
        "user": {"name": "Aamy", "email": "aamy@studysnap.ai"},
        "stats": {
            "notes": notes_count,
            "quizzes": quizzes_count,
            "flashcards": flashcards_count,
            "mastered_flashcards": mastered_count,
            "avg_score": avg_score,
            "streak_days": streak_days,
        },
        "recent_notes": [dict(r) for r in recent_notes],
        "recent_quizzes": [
            {
                "topic": r["topic"],
                "score": r["score"],
                "total": r["total"],
                "percent": round(r["score"] / r["total"] * 100) if r["total"] > 0 else 0,
                "date": r["date"]
            }
            for r in recent_quizzes
        ]
    })

# ──────────────────────────────────────────────
# Topic Explainer Endpoints
# ──────────────────────────────────────────────

@app.route("/api/explain", methods=["POST"])
def explain_topic():
    """Explain a topic in the requested mode."""
    data = request.get_json()
    topic = data.get("topic", "").strip()
    mode = data.get("mode", "beginner")  # beginner | exam | deep

    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    mode_instructions = {
        "beginner": "Explain in very simple terms as if talking to a complete beginner. Use analogies, simple language, and relatable examples. Avoid jargon.",
        "exam": "Explain as a concise exam-focused summary. Include definitions, key formulas, important points, and common exam questions with answers.",
        "deep": "Provide an in-depth academic explanation with technical details, underlying mechanisms, historical context, and advanced insights."
    }

    system = f"""You are StudySnap AI, an expert academic tutor helping college students.
{mode_instructions.get(mode, mode_instructions['beginner'])}

Respond in JSON format with this exact structure:
{{
  "title": "Topic title",
  "overview": "2-3 sentence overview",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "explanation": "Main detailed explanation (3-5 paragraphs)",
  "examples": ["example 1", "example 2"],
  "formulas": ["formula 1 if applicable"],
  "remember": "One key thing to always remember",
  "emoji": "A relevant emoji for this topic"
}}
Return only valid JSON, no markdown fences."""

    try:
        raw = get_gemini_response(f"Topic: {topic}", system)
        result = json.loads(clean_json_response(raw))
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed", "raw": raw[:300]}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ──────────────────────────────────────────────
# Notes Summarizer Endpoints
# ──────────────────────────────────────────────

@app.route("/api/notes", methods=["GET"])
def get_notes():
    conn = get_db()
    notes = conn.execute(
        "SELECT * FROM notes WHERE user_id=1 ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(n) for n in notes])

@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json()
    title = data.get("title", "Untitled Note")
    content = data.get("content", "")

    if not content.strip():
        return jsonify({"error": "Content is required"}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO notes (user_id, title, content) VALUES (1, ?, ?)",
        (title, content)
    )
    note_id = c.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"id": note_id, "message": "Note saved"})

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db()
    conn.execute("DELETE FROM notes WHERE id=? AND user_id=1", (note_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Note deleted"})

@app.route("/api/summarize", methods=["POST"])
def summarize_notes():
    """Summarize pasted text content."""
    data = request.get_json()
    content = data.get("content", "").strip()
    summary_type = data.get("type", "short")  # short | detailed | takeaways | formulas
    title = data.get("title", "My Notes")

    if not content:
        return jsonify({"error": "Content is required"}), 400

    type_instructions = {
        "short": "Create a concise 3-5 sentence summary capturing the core essence.",
        "detailed": "Create a comprehensive detailed summary preserving all important information in organized paragraphs.",
        "takeaways": "Extract the 5-8 most important key takeaways as clear, actionable bullet points.",
        "formulas": "Extract and list all formulas, equations, definitions, and technical terms with their explanations."
    }

    system = f"""You are StudySnap AI, a smart academic assistant.
{type_instructions.get(summary_type, type_instructions['short'])}

Respond in JSON:
{{
  "type": "{summary_type}",
  "title": "Auto-generated title for this content",
  "content": "The summary/takeaways as a single string with \\n for line breaks",
  "word_count": 0,
  "reading_time": "X min read"
}}
Return only valid JSON."""

    try:
        raw = get_gemini_response(f"Notes to process:\n\n{content[:4000]}", system)
        result = json.loads(clean_json_response(raw))

        # Save note to DB
        conn = get_db()
        conn.execute(
            "INSERT INTO notes (user_id, title, content, summary) VALUES (1, ?, ?, ?)",
            (title or result.get("title", "Note"), content, result.get("content", ""))
        )
        conn.commit()
        conn.close()

        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ──────────────────────────────────────────────
# Quiz Generator Endpoints
# ──────────────────────────────────────────────

@app.route("/api/quiz/generate", methods=["POST"])
def generate_quiz():
    """Generate MCQ quiz from topic or content."""
    data = request.get_json()
    topic = data.get("topic", "")
    content = data.get("content", "")
    difficulty = data.get("difficulty", "medium")
    num_questions = min(int(data.get("num_questions", 5)), 10)

    if not topic and not content:
        return jsonify({"error": "Topic or content is required"}), 400

    source = f"Topic: {topic}" if topic else f"Content:\n{content[:3000]}"
    diff_instructions = {
        "easy": "Create simple, straightforward questions testing basic recall.",
        "medium": "Create moderately challenging questions requiring understanding.",
        "hard": "Create challenging questions requiring analysis, application, and critical thinking."
    }

    system = f"""You are StudySnap AI quiz generator.
{diff_instructions.get(difficulty, diff_instructions['medium'])}
Generate exactly {num_questions} multiple choice questions.

Respond in JSON:
{{
  "topic": "Topic name",
  "difficulty": "{difficulty}",
  "questions": [
    {{
      "id": 1,
      "question": "Question text?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Why A is correct"
    }}
  ]
}}
Return only valid JSON."""

    try:
        raw = get_gemini_response(source, system)
        result = json.loads(clean_json_response(raw))
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/quiz/save", methods=["POST"])
def save_quiz():
    """Save a completed quiz result."""
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "INSERT INTO quizzes (user_id, topic, score, total, difficulty, questions) VALUES (1,?,?,?,?,?)",
        (
            data.get("topic", "General"),
            data.get("score", 0),
            data.get("total", 0),
            data.get("difficulty", "medium"),
            json.dumps(data.get("questions", []))
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Quiz saved"})

@app.route("/api/quiz/history", methods=["GET"])
def quiz_history():
    conn = get_db()
    quizzes = conn.execute(
        "SELECT id, topic, score, total, difficulty, date FROM quizzes WHERE user_id=1 ORDER BY date DESC LIMIT 20"
    ).fetchall()
    conn.close()
    return jsonify([
        {
            **dict(q),
            "percent": round(q["score"] / q["total"] * 100) if q["total"] > 0 else 0
        }
        for q in quizzes
    ])

# ──────────────────────────────────────────────
# Flashcard Endpoints
# ──────────────────────────────────────────────

@app.route("/api/flashcards", methods=["GET"])
def get_flashcards():
    conn = get_db()
    cards = conn.execute(
        "SELECT * FROM flashcards WHERE user_id=1 ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(c) for c in cards])

@app.route("/api/flashcards/generate", methods=["POST"])
def generate_flashcards():
    """Generate flashcards from topic or content using AI."""
    data = request.get_json()
    topic = data.get("topic", "")
    content = data.get("content", "")
    count = min(int(data.get("count", 8)), 15)

    if not topic and not content:
        return jsonify({"error": "Topic or content is required"}), 400

    source = f"Topic: {topic}" if topic else f"Content:\n{content[:3000]}"

    system = f"""You are StudySnap AI flashcard creator.
Generate exactly {count} flashcards for studying.
Each flashcard should test a distinct concept.

Respond in JSON:
{{
  "topic": "Topic name",
  "flashcards": [
    {{
      "question": "Question on one side of card",
      "answer": "Clear, concise answer"
    }}
  ]
}}
Return only valid JSON."""

    try:
        raw = get_gemini_response(source, system)
        result = json.loads(clean_json_response(raw))

        # Save to DB
        conn = get_db()
        saved_cards = []
        for card in result.get("flashcards", []):
            c = conn.execute(
                "INSERT INTO flashcards (user_id, topic, question, answer) VALUES (1,?,?,?)",
                (result.get("topic", topic), card["question"], card["answer"])
            )
            saved_cards.append({
                "id": c.lastrowid,
                "topic": result.get("topic", topic),
                "question": card["question"],
                "answer": card["answer"],
                "mastered": 0
            })
        conn.commit()
        conn.close()

        return jsonify({"topic": result.get("topic"), "flashcards": saved_cards})
    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/flashcards/<int:card_id>/master", methods=["PUT"])
def toggle_mastered(card_id):
    conn = get_db()
    card = conn.execute("SELECT mastered FROM flashcards WHERE id=?", (card_id,)).fetchone()
    if not card:
        return jsonify({"error": "Card not found"}), 404
    new_val = 0 if card["mastered"] else 1
    conn.execute("UPDATE flashcards SET mastered=? WHERE id=?", (new_val, card_id))
    conn.commit()
    conn.close()
    return jsonify({"mastered": new_val})

@app.route("/api/flashcards/<int:card_id>", methods=["DELETE"])
def delete_flashcard(card_id):
    conn = get_db()
    conn.execute("DELETE FROM flashcards WHERE id=? AND user_id=1", (card_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Flashcard deleted"})

# ──────────────────────────────────────────────
# Analytics Endpoints
# ──────────────────────────────────────────────

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    conn = get_db()

    # Quiz performance over time
    quiz_trend = conn.execute("""
        SELECT date, AVG(CAST(score AS REAL)/total*100) as avg_percent, COUNT(*) as count
        FROM quizzes WHERE user_id=1 AND total > 0
        GROUP BY date ORDER BY date DESC LIMIT 14
    """).fetchall()

    # Topic breakdown
    topic_stats = conn.execute("""
        SELECT topic,
               COUNT(*) as attempts,
               AVG(CAST(score AS REAL)/total*100) as avg_score,
               MAX(CAST(score AS REAL)/total*100) as best_score
        FROM quizzes WHERE user_id=1 AND total > 0
        GROUP BY topic ORDER BY attempts DESC LIMIT 10
    """).fetchall()

    # Difficulty distribution
    diff_dist = conn.execute("""
        SELECT difficulty, COUNT(*) as count,
               AVG(CAST(score AS REAL)/total*100) as avg_score
        FROM quizzes WHERE user_id=1 AND total > 0
        GROUP BY difficulty
    """).fetchall()

    # Flashcard mastery
    fc_mastery = conn.execute("""
        SELECT topic, COUNT(*) as total,
               SUM(mastered) as mastered
        FROM flashcards WHERE user_id=1
        GROUP BY topic
    """).fetchall()

    # Streak data last 30 days
    streak = conn.execute("""
        SELECT study_date, minutes_studied FROM streak_data
        WHERE user_id=1 AND study_date >= date('now', '-30 days')
        ORDER BY study_date
    """).fetchall()

    conn.close()

    return jsonify({
        "quiz_trend": [
            {"date": r["date"], "avg": round(r["avg_percent"], 1), "count": r["count"]}
            for r in quiz_trend
        ],
        "topic_stats": [
            {
                "topic": r["topic"],
                "attempts": r["attempts"],
                "avg_score": round(r["avg_score"], 1),
                "best_score": round(r["best_score"], 1)
            }
            for r in topic_stats
        ],
        "difficulty_distribution": [
            {"difficulty": r["difficulty"], "count": r["count"], "avg_score": round(r["avg_score"], 1)}
            for r in diff_dist
        ],
        "flashcard_mastery": [
            {
                "topic": r["topic"],
                "total": r["total"],
                "mastered": r["mastered"],
                "percent": round(r["mastered"] / r["total"] * 100) if r["total"] > 0 else 0
            }
            for r in fc_mastery
        ],
        "streak": [dict(s) for s in streak]
    })

# ──────────────────────────────────────────────
# Study Planner Endpoints
# ──────────────────────────────────────────────

@app.route("/api/planner/generate", methods=["POST"])
def generate_study_plan():
    """Generate a personalized study schedule."""
    data = request.get_json()
    subjects = data.get("subjects", [])
    exam_date = data.get("exam_date", "")
    hours_per_day = data.get("hours_per_day", 3)
    weak_areas = data.get("weak_areas", [])

    if not subjects:
        return jsonify({"error": "At least one subject is required"}), 400

    system = f"""You are StudySnap AI study planner.
Create a detailed, realistic study schedule.

Respond in JSON:
{{
  "title": "Study Plan Title",
  "overview": "Brief plan overview",
  "daily_plans": [
    {{
      "day": "Day 1 - Monday",
      "date": "2025-01-01",
      "sessions": [
        {{
          "time": "9:00 AM - 11:00 AM",
          "subject": "Subject name",
          "topic": "Specific topic to cover",
          "type": "Study/Review/Practice",
          "priority": "High/Medium/Low"
        }}
      ],
      "daily_goal": "What to achieve today"
    }}
  ],
  "tips": ["Study tip 1", "Study tip 2", "Study tip 3"],
  "resources": ["Resource suggestion 1", "Resource suggestion 2"]
}}
Generate a 7-day plan. Return only valid JSON."""

    prompt = f"""
Subjects: {', '.join(subjects)}
Exam date: {exam_date or 'in 2 weeks'}
Study hours per day: {hours_per_day}
Weak areas: {', '.join(weak_areas) if weak_areas else 'None specified'}
"""

    try:
        raw = get_gemini_response(prompt, system)
        result = json.loads(clean_json_response(raw))
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "AI response parsing failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "app": "StudySnap AI", "version": "1.0.0"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)