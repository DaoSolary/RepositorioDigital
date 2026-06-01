import { NextResponse } from "next/server";
import { fetchAdminUsersList } from "@/lib/admin-users";

export async function GET() {
  const { items, error } = await fetchAdminUsersList();
  if (error === "Proibido.") {
    return NextResponse.json({ error }, { status: 403 });
  }
  if (error) {
    return NextResponse.json({ error }, { status: error.includes("SERVICE_ROLE") ? 500 : 400 });
  }
  return NextResponse.json({ items });
}
