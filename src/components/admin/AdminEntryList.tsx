"use client";

import { useEffect, useState, useCallback } from "react";
import { BUTTERFLY_THEMES } from "@/types/submission";
import type { ButterflyType } from "@/types/submission";

interface AdminEntry {
  id: string;
  nickname: string;
  message: string;
  butterflyType: ButterflyType;
  voiceUrl: string | null;
  createdAtMs: number | null;
  deletionRequested: boolean;
  deletionRequestedAt: string | null;
}

export default function AdminEntryList({ adminKey }: { adminKey: string }) {
  const [entries, setEntries] = useState<AdminEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/entries", {
        headers: { Authorization: `Bearer ${adminKey}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      const sorted = [...data.entries].sort((a: AdminEntry, b: AdminEntry) => {
        if (a.deletionRequested !== b.deletionRequested) {
          return a.deletionRequested ? -1 : 1;
        }
        return 0;
      });
      setEntries(sorted);
    } catch {
      setError("読み込みに失敗しました。ページを再読み込みしてください。");
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/entries", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setEntries((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
      setConfirmId(null);
    } catch {
      setError("削除に失敗しました。もう一度お試しください。");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#1a1625] px-4 pb-16 pt-8 text-white/90">
      <h1 className="mb-1 font-body text-sm font-semibold">送信者一覧（管理者用）</h1>
      <p className="mb-6 font-body text-[11px] text-white/40">
        削除は元に戻せません。テスト投稿や、本人から削除依頼があった投稿を消す用途に使ってください。
      </p>

      {error && <p className="mb-4 font-body text-xs text-rose-300">{error}</p>}

      {entries === null && !error && (
        <p className="font-body text-xs text-white/40">読み込み中…</p>
      )}

      {entries !== null && (
        <>
          <p className="mb-4 font-body text-[11px] text-white/40">全{entries.length}件</p>
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-2xl border p-4 ${
                  entry.deletionRequested
                    ? "border-rose-400/60 bg-rose-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="font-body text-sm font-semibold">
                    {entry.nickname || "（名前未設定）"}
                  </span>
                  <span className="font-body text-[10px] text-white/40">
                    {BUTTERFLY_THEMES[entry.butterflyType]?.labelJa ?? entry.butterflyType}
                  </span>
                </div>
                {entry.deletionRequested && (
                  <p className="mb-1 font-body text-[11px] font-semibold text-rose-300">
                    🔴 削除依頼あり
                    {entry.deletionRequestedAt &&
                      `（${new Date(entry.deletionRequestedAt).toLocaleString("ja-JP")}）`}
                  </p>
                )}
                <p className="mb-1 font-body text-[10px] text-white/30">
                  {entry.createdAtMs ? new Date(entry.createdAtMs).toLocaleString("ja-JP") : "日時不明"}
                  {entry.voiceUrl && " ・ ボイスあり"}
                </p>
                <p className="mb-3 whitespace-pre-wrap font-body text-xs leading-relaxed text-white/70">
                  {entry.message}
                </p>

                {confirmId === entry.id ? (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[11px] text-rose-300">本当に削除しますか？</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="rounded-full bg-rose-500 px-3 py-1 font-body text-[11px] text-white disabled:opacity-50"
                    >
                      {deletingId === entry.id ? "削除中…" : "削除する"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-full border border-white/20 px-3 py-1 font-body text-[11px] text-white/60"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(entry.id)}
                    className="rounded-full border border-rose-400/40 px-3 py-1 font-body text-[11px] text-rose-300"
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            {entries.length === 0 && (
              <p className="font-body text-xs text-white/40">投稿がありません。</p>
            )}
          </div>
        </>
      )}
    </main>
  );
}
