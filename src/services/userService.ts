import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function getUserByEmail(email: string) {
  await connectDB();
  return User.findOne({ email: email.toLowerCase() }).lean();
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  await connectDB();
  return User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.passwordHash,
  });
}
