import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

import * as dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const APEX_ID = "2c43f221-d333-435c-98b4-93f1f0e001a1";
const NORTHWEST_ID = "767c7ea2-fd71-403e-9057-77c92ca2a319";
const EASTERN_ID = "648f529c-ffbd-48ba-8d29-636b7ef4a843";

async function generateToken(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found: " + email);
    
    return sign({ 
        id: user.id, 
        email: user.email,
        role: user.role, 
        contractorId: user.contractorId 
    }, JWT_SECRET, { expiresIn: '1h' });
}

async function fetchNotifications(token: string) {
    const res = await fetch("http://localhost:5001/api/v1/notifications", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    const text = await res.text();
    let data = null;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.log("Failed to parse JSON. Raw text:", text);
    }
    return { status: res.status, data };
}

async function createNotification(recipientId: string, title: string) {
    await prisma.notification.create({
        data: {
            recipientId,
            title,
            message: "Test message",
            type: "ALERT"
        }
    });
}

async function testNotificationIsolation() {
    console.log("=== Testing Notification Isolation ===");

    // Find users
    const apexUser = await prisma.user.findUnique({ where: { email: "apex.contractor@minesight.com" } });
    const nwUser = await prisma.user.findUnique({ where: { email: "northwest.contractor@minesight.com" } });
    const eastUser = await prisma.user.findUnique({ where: { email: "eastern.contractor@minesight.com" } });

    // Seed some specific notifications
    await createNotification(apexUser!.id, "Apex specific alert");
    await createNotification(nwUser!.id, "Northwest specific alert");
    await createNotification(eastUser!.id, "Eastern specific alert");

    // Generate tokens
    const apexToken = await generateToken("apex.contractor@minesight.com");
    const nwToken = await generateToken("northwest.contractor@minesight.com");
    const eastToken = await generateToken("eastern.contractor@minesight.com");

    // Fetch for Apex
    const apexNotifs = await fetchNotifications(apexToken);
    console.log(`Apex Fetch Status: ${apexNotifs.status}`);
    const hasApex = apexNotifs.data.data.some((n: any) => n.title === "Apex specific alert");
    const hasNW = apexNotifs.data.data.some((n: any) => n.title === "Northwest specific alert");
    const hasEast = apexNotifs.data.data.some((n: any) => n.title === "Eastern specific alert");
    console.log(`Apex sees Apex? ${hasApex} | sees Northwest? ${hasNW} | sees Eastern? ${hasEast}`);

    // Fetch for Northwest
    const nwNotifs = await fetchNotifications(nwToken);
    console.log(`Northwest Fetch Status: ${nwNotifs.status}`);
    console.log(`NW sees NW? ${nwNotifs.data.data.some((n: any) => n.title === "Northwest specific alert")} | sees Apex? ${nwNotifs.data.data.some((n: any) => n.title === "Apex specific alert")}`);

    // Fetch for Eastern
    const eastNotifs = await fetchNotifications(eastToken);
    console.log(`Eastern Fetch Status: ${eastNotifs.status}`);
    console.log(`East sees East? ${eastNotifs.data.data.some((n: any) => n.title === "Eastern specific alert")} | sees NW? ${eastNotifs.data.data.some((n: any) => n.title === "Northwest specific alert")}`);

    console.log("======================================");
}

testNotificationIsolation()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
