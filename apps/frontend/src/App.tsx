import React, { useEffect, useState } from "react";
import { ExampleType } from "shared-types";

const App: React.FC = () => {
  const [examples, setExamples] = useState<ExampleType[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExamples = () => {
    fetch("/api/examples")
      .then((res) => res.json())
      .then(setExamples);
  };

  useEffect(() => {
    fetchExamples();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: crypto.randomUUID(), name }),
    });
    setName("");
    setLoading(false);
    fetchExamples();
  };

  return (
    <div>
      <h1>Examples</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New example name"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !name.trim()}>
          Add
        </button>
      </form>
      <ul>
        {examples.map((e) => (
          <li key={e.id}>{e.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
