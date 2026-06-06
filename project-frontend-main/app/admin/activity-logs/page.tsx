// testing
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getActivityLogs } from "@/lib/api/admin";
import type { ActivityLog } from "@/lib/api/types";
import { ArrowLeft, Shield, Activity } from "lucide-react";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs({ limit: 100 })
      .then((res) => {
        if (res.success && res.data?.logs) setLogs(res.data.logs);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground">No activity logs found.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  <span className="font-medium">{log.action}</span>
                  {log.user_id && <span className="text-muted-foreground">User: {log.user_id.slice(0, 8)}...</span>}
                  {log.status && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{log.status}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
