import { useEffect, useState } from "react";
import API from "../services/api";

export default function TestBackend() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    API.get("/auth/test")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Backend not connected ❌");
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Testing Backend Connection</h1>
      <h2>{message}</h2>
    </div>
  );
}
