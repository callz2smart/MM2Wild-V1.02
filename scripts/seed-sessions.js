

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
const count = parseInt(process.argv[3] || "10", 10);

const locations = [
  { countryCode: "RO", countryName: "Romania" },
  { countryCode: "US", countryName: "United States" },
  { countryCode: "NO", countryName: "Norway" },
  { countryCode: "GB", countryName: "United Kingdom" },
  { countryCode: "DE", countryName: "Germany" },
  { countryCode: "NL", countryName: "Netherlands" },
  { countryCode: "FR", countryName: "France" },
  { countryCode: "CA", countryName: "Canada" },
];

const browsers = [
  { browser: "Google Chrome", os: "macOS" },
  { browser: "Google Chrome", os: "Windows" },
  { browser: "Safari", os: "macOS" },
  { browser: "Firefox", os: "Windows" },
  { browser: "Microsoft Edge", os: "Windows" },
];

function randomIp() {

  const testRanges = [
    () => `192.0.2.${1 + Math.floor(Math.random() * 254)}`,
    () => `198.51.100.${1 + Math.floor(Math.random() * 254)}`,
    () => `203.0.113.${1 + Math.floor(Math.random() * 254)}`,
    () => {

      const parts = ["2001", "db8"];
      for (let i = 0; i < 6; i++) {
        parts.push(Math.floor(Math.random() * 0xffff).toString(16));
      }
      return parts.join(":");
    },
  ];
  return randomChoice(testRanges)();
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSession(userUuid, index) {
  const location = randomChoice(locations);
  const browserConfig = randomChoice(browsers);
  const isCurrent = index === 0;


  const daysAgo = isCurrent ? 0 : Math.random() * 240;
  const lastActive = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  return {
    user_uuid: userUuid,
    browser: browserConfig.browser,
    os: browserConfig.os,
    ip_address: randomIp(),
    country_code: location.countryCode,
    country_name: location.countryName,
    is_current: isCurrent,
    last_active: lastActive.toISOString(),
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
  console.log(`Seeding ${count} sessions for ${username} (${userUuid})...`);


  await fetch(`${SUPABASE_URL}/rest/v1/mm2wild_sessions?user_uuid=eq.${userUuid}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });


  const sessions = Array.from({ length: count }, (_, i) => generateSession(userUuid, i));


  const batchSize = 25;
  let inserted = 0;
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/mm2wild_sessions`, {
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

  const byCountry = sessions.reduce((acc, s) => {
    acc[s.country_name] = (acc[s.country_name] || 0) + 1;
    return acc;
  }, {});

  console.log(`Done! Inserted ${inserted} sessions.`);
  console.log("  By country:", byCountry);
  console.log(`  Current session: ${sessions[0].browser} (${sessions[0].os}) — ${sessions[0].country_name}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
