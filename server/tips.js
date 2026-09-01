function supabaseSettings(env) {
  const url = (env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && serviceKey ? { url, serviceKey } : null;
}

export async function transferUserTip(
  env,
  senderUuid,
  recipientUsername,
  balanceType,
  amount,
  showInChat,
) {
  const settings = supabaseSettings(env);
  if (!settings) throw new Error("Secure account storage is not configured.");

  const response = await fetch(`${settings.url}/rest/v1/rpc/mm2wild_tip_user`, {
    method: "POST",
    headers: {
      apikey: settings.serviceKey,
      Authorization: `Bearer ${settings.serviceKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      p_sender_uuid: senderUuid,
      p_recipient_username: recipientUsername,
      p_balance_type: balanceType,
      p_amount: amount,
      p_show_in_chat: showInChat,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || "The tip could not be sent.");
  return payload;
}
