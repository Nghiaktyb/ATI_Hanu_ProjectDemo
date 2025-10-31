import { db } from "./memory";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  db.users.push({
    id: uuid(),
    email: "admin@example.com",
    passwordHash: adminPass,
    role: "admin",
  });

  const e1 = {
    id: uuid(),
    firstName: "Linh",
    lastName: "Nguyen",
    email: "linh@example.com",
    department: "Kitchen",
    location: "Hanoi",
  };
  const e2 = {
    id: uuid(),
    firstName: "An",
    lastName: "Tran",
    email: "an@example.com",
    department: "Store",
    location: "Hanoi",
  };
  db.staff.push(e1, e2);

  console.log("Seeded memory DB with admin and 2 staff.");
}

main();
