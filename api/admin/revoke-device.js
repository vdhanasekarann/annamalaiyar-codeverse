// api/admin/revoke-device.js
await db.query(
  "UPDATE users SET token_version = token_version + 1 WHERE email=$1",
  [email]
);
