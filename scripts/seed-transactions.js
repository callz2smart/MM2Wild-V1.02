

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

function loadEnv(path) {
  const content = readFileSync(path, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const env = loadEnv(envPath);
const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const username = process.argv[2] || "Redbet_holder";
const count = parseInt(process.argv[3] || "30", 10);


const methodPool = [
  ...Array(10).fill("rakeback"),
  ...Array(5).fill("mm2_deposit"),
  ...Array(3).fill("mm2_withdraw"),
  ...Array(4).fill("crypto_deposit"),
  ...Array(3).fill("crypto_withdraw"),
  ...Array(2).fill("tip_sent"),
  ...Array(2).fill("tip_received"),
  ...Array(2).fill("affiliate"),
];


const depositWithdrawMethods = ["mm2_deposit", "mm2_withdraw", "crypto_deposit", "crypto_withdraw"];
const completedOnly = ["completed"];
const depositWithdrawStatusPool = [
  ...Array(14).fill("completed"),
  ...Array(3).fill("pending"),
  ...Array(1).fill("declined"),
];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTransaction(userUuid) {
  const method = randomChoice(methodPool);
  const status = depositWithdrawMethods.includes(method)
    ? randomChoice(depositWithdrawStatusPool)
    : randomChoice(completedOnly);


  let amount;
  if (method === "rakeback") amount = Math.floor(Math.random() * 50);
  else if (method === "mm2_deposit") amount = Math.floor(Math.random() * 2000) + 50;
  else if (method === "mm2_withdraw") amount = Math.floor(Math.random() * 1500) + 100;
  else if (method === "crypto_deposit") amount = Math.floor(Math.random() * 3000) + 100;
  else if (method === "crypto_withdraw") amount = Math.floor(Math.random() * 2500) + 100;
  else if (method === "tip_sent" || method === "tip_received") amount = Math.floor(Math.random() * 500) + 10;
  else amount = Math.floor(Math.random() * 300) + 5;


  const daysAgo = Math.random() * 14;
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    user_uuid: userUuid,
    method,
    status,
    amount,
    created_at: date.toISOString(),
  };
}

async function main() {

  const userResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/mm2wild_users?username=eq.${encodeURIComponent(username)}&select=uuid,username`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );
  const users = await userResponse.json();
  if (!userResponse.ok || !users[0]) {
    console.error(`User "${username}" not found.`);
    process.exit(1);
  }

  const userUuid = users[0].uuid;
  console.log(`Seeding ${count} transactions for ${username} (${userUuid})...`);


  const transactions = Array.from({ length: count }, () => generateTransaction(userUuid));


  const batchSize = 25;
  let inserted = 0;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mm2wild_transactions`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "content-type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(batch),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Insert failed:", result);
      process.exit(1);
    }
    inserted += result.length;
  }

  const byMethod = transactions.reduce((acc, t) => {
    acc[t.method] = (acc[t.method] || 0) + 1;
    return acc;
  }, {});
  const byStatus = transactions.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  console.log(`Done! Inserted ${inserted} transactions.`);
  console.log("  By method:", byMethod);
  console.log("  By status:", byStatus);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
