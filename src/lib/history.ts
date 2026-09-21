
import { supabase } from "./supabase";

export async function logHistory(params: {
  familyId: string;
  taskId: number;
  username: string;
  taskName: string;
  points: number;
}) {
  await supabase.from("task_history").insert({
    family_id: params.familyId,
    task_id: params.taskId,
    username: params.username,
    task_name: params.taskName,
    points: params.points,
  });
}

export async function undoHistoryToday(taskId: number) {
  // Hapus catatan riwayat utk task ini yang completed_at-nya HARI INI
  // (biar gak dobel ke-hitung kalau dicentang-batal-centang lagi di hari yang sama)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  await supabase
    .from("task_history")
    .delete()
    .eq("task_id", taskId)
    .gte("completed_at", startOfToday.toISOString());
}