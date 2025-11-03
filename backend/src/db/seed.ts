import bcrypt from "bcryptjs";
import { initDb, createUser } from "./mysql";

async function main() {
  await initDb();
  const adminPass = await bcrypt.hash("admin123", 10);
  await createUser({ email: "admin@example.com", passwordHash: adminPass, role: "admin" });

  // seed two staff rows
  const k = (await import("./mysql")).dbClient();
  const { v4: uuid } = await import("uuid");
  await k('staff').insert([
    { id: uuid(), firstName: "Linh", lastName: "Nguyen", email: "linh@example.com", department: "Kitchen", location: "Hanoi" },
    { id: uuid(), firstName: "An", lastName: "Tran", email: "an@example.com", department: "Store", location: "Hanoi" }
  ]);

  console.log("Seeded MySQL DB with admin and 2 staff.");
}

main();
