import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  const JWT_SECRET = process.env.JWT_SECRET || "minesight-sih-2026-fallback-secret";
  
  const user = await prisma.user.findUnique({ where: { email: "apex.contractor@minesight.com" } });
  if (!user) throw new Error("No user");

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
    contractorId: user.contractorId
  }, JWT_SECRET, { expiresIn: '1h' });

  const notifs = await prisma.notification.findMany({ where: { recipientId: user.id } });
  if (notifs.length === 0) throw new Error("No notifs");
  
  const notif = notifs[0];
  console.log("Notif recipient:", notif.recipientId);
  console.log("Token user id:", user.id);

  const res = await fetch(`http://localhost:5001/api/v1/notifications/${notif.id}/read`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${token}` }
  });
  console.log(await res.json());
}
test();
