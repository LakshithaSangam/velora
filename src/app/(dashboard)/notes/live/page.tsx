"use client";

import { useState } from "react";
import { ConsentGate } from "@/components/meetings/ConsentGate";
import { LiveMeetingSession } from "@/components/meetings/LiveMeetingSession";

export default function LiveMeetingPage() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Live meeting notes</h1>
      {confirmed ? <LiveMeetingSession /> : <ConsentGate onConfirm={() => setConfirmed(true)} />}
    </div>
  );
}
