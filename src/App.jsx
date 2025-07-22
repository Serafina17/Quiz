import { useState, useEffect } from "react";
import JSON5 from "json5";
import questionsRaw from "./questions.json5?raw";

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [visitedIndexes, setVisitedIndexes] = useState(new Set([0]));

  const [isStarred, setIsStarred] = useState({});

  const toggleStar = (index) => {
    setIsStarred((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getRandomQuestions = (allQuestions, count = 15) => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const parsed = JSON5.parse(questionsRaw);
    const random15 = getRandomQuestions(parsed);
    setQuestions(random15);
  }, []);

  const handleRandomize = () => {
    const parsed = JSON5.parse(questionsRaw);
    const random15 = getRandomQuestions(parsed);
    setQuestions(random15);
    setAnswers({});
    setScore(null);
    setCurrentIndex(0);
  };

  const handleChange = (qIndex, optionIndex, type) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      if (type === "single") {
        updated[qIndex] = optionIndex;
      } else if (type === "multiple") {
        const current = new Set(updated[qIndex] || []);
        if (current.has(optionIndex)) {
          current.delete(optionIndex);
        } else {
          current.add(optionIndex);
        }
        updated[qIndex] = Array.from(current);
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    let correct = 0;

    questions.forEach((q, index) => {
      const userAns = answers[index];
      if (q.type === "single") {
        if (userAns === q.answer) correct++;
      } else if (q.type === "multiple") {
        const sortedUser = [...(userAns || [])].sort().toString();
        const sortedAns = [...q.answer].sort().toString();
        if (sortedUser === sortedAns) correct++;
      }
    });

    setScore({
      total: questions.length,
      correct,
      pass: correct >= Math.ceil(questions.length / 2),
    });
  };

  return (
    <>
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            color: "#fff",
            border: "none",
            width: "40px",
            height: "40px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {showPanel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "220px",
            backgroundColor: "#000000ff",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            padding: "1rem",
            overflowY: "auto",
            transition: "all 0.3s ease-in-out",
            zIndex: 999,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Jump to</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {questions.map((_, idx) => {
              const isCurrent = idx === currentIndex;

              const isAnswered =
                answers[idx] !== undefined &&
                (questions[idx].type === 'single'
                  ? answers[idx] !== null
                  : Array.isArray(answers[idx]) && answers[idx].length > 0);

              const isVisited = visitedIndexes.has(idx);

              let backgroundColor = "#fff";
              let textColor = "#000";
              let title = "Unvisited";

              if (isCurrent) {
                backgroundColor = "#007bff";
                textColor = "#fff";
                title = "Current Question";
              } else if (isVisited && !isAnswered) {
                backgroundColor = "#ffc107"; 
                textColor = "#000";
                title = "Unanswered";
              } else if (isAnswered) {
                backgroundColor = "#fff";
                textColor = "#000";
                title = "Answered";
              }

              return (
                <button
                  key={idx}
                  title={title}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setVisitedIndexes(prev => {
                      const newSet = new Set(prev);
                      newSet.add(idx);
                      return newSet;
                    });
                    setShowPanel(false);
                  }}
                  style={{
                    width: "40px",
                    height: "40px",
                    textAlign: "center",
                    borderRadius: "4px",
                    border: "1px solid #999",
                    backgroundColor: backgroundColor,
                    color: textColor,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {idx + 1}
                  {isStarred[idx] && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        color: "#ffc107",
                        fontSize: "1rem",
                      }}
                    >
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          padding: "2rem 1rem",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            width: "100%",
            padding: "2rem",
            borderRadius: "8px",
            margin: "0 auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Quiz</h1>
            <div>
              <button onClick={handleRandomize}>Randomize</button>
              <button
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "1.2rem",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: isStarred[currentIndex] ? "#ffc107" : "#e0e0e0",
                  color: "#000",
                  border: "1px solid #ccc",
                }}
                onClick={() => toggleStar(currentIndex)}
              >
                ★
              </button>
            </div>
          </div>

          {questions.length > 0 && (
            <div key={currentIndex} style={{ marginBottom: "1.5rem" }}>
              <p style={{ marginBottom: "0.5rem", color: "#666" }}>
                Question {currentIndex + 1} / {questions.length}
              </p>

              <p>
                <strong>{questions[currentIndex].question}</strong>
              </p>

              {questions[currentIndex].options.map((opt, i) => {
                const isUserChosen =
                  questions[currentIndex].type === "single"
                    ? answers[currentIndex] === i
                    : (answers[currentIndex] || []).includes(i);

                const isCorrectOption =
                  questions[currentIndex].type === "single"
                    ? questions[currentIndex].answer === i
                    : questions[currentIndex].answer.includes(i);

                return (
                  <div
                    key={i}
                    style={{
                      marginLeft: "1rem",
                      marginBottom: "0.25rem",
                      color: "#ffffff",
                    }}
                  >
                    <label style={{ display: "block", opacity: score ? 0.7 : 1 }}>
                      <input
                        type={questions[currentIndex].type === "single" ? "radio" : "checkbox"}
                        name={`q-${currentIndex}`}
                        value={i}
                        checked={isUserChosen}
                        onChange={() => handleChange(currentIndex, i, questions[currentIndex].type)}
                        disabled={score !== null}
                      />{" "}
                      {opt}
                    </label>
                  </div>
                );
              })}

              {score && (
                <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
                  {(() => {
                    const userAns = answers[currentIndex];
                    const correctAns = questions[currentIndex].answer;
                    const isCorrect =
                      questions[currentIndex].type === "single"
                        ? userAns === correctAns
                        : [...(userAns || [])].sort().toString() ===
                          [...correctAns].sort().toString();

                    return (
                      <div style={{ color: isCorrect ? "green" : "red" }}>
                        {isCorrect ? "✔ Correct" : "✘ Incorrect"}
                        {!isCorrect && (
                          <div style={{ color: "#555", fontWeight: "normal", marginTop: "0.5rem" }}>
                            Correct Answer: {Array.isArray(correctAns)
                              ? correctAns.map((i) => questions[currentIndex].options[i]).join(" / ")
                              : questions[currentIndex].options[correctAns]}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {questions.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
              <button
                onClick={() => {
                  const prev = Math.max(currentIndex - 1, 0);
                  setCurrentIndex(prev);
                  setVisitedIndexes(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.add(prev);
                    return newSet;
                  });
                }}
                disabled={currentIndex === 0}
              >Previous</button>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  const next = Math.min(currentIndex + 1, questions.length - 1);
                  setCurrentIndex(next);
                  setVisitedIndexes(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.add(next);
                    return newSet;
                  });
                }}
              >Next</button>
              ) : (
                <button onClick={handleSubmit}>Submit</button>
              )}
            </div>
          )}

          {score && (
            <div style={{ marginTop: "2rem" }}>
              <h2>Result</h2>
              <p>Score: {score.correct} / {score.total}</p>
              <p>Status: {score.pass ? "✅ Pass" : "❌ Fail"}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


export default App;
