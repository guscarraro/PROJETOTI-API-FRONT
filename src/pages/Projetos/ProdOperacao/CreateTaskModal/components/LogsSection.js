import React from "react";
import { Label, LogBox, LogItem } from "../style";

export default function LogsSection({ logs }) {
  return (
    <div>
      <Label>Log</Label>
      <LogBox>
        {(Array.isArray(logs) ? logs : []).map((l, idx) => (
          <LogItem key={`${l.at}-${idx}`}>
            <div>
              <b>{l.by}</b> •{" "}
              <span style={{ opacity: 0.75 }}>{new Date(l.at).toLocaleString()}</span>
            </div>
            <div style={{ marginTop: 2 }}>{l.action}</div>
          </LogItem>
        ))}
      </LogBox>
    </div>
  );
}
