# 🧑‍💻 Next.js Authentication Demo with Prisma + SQLite
A minimal **Next.js 16** + **Prisma ORM** + **SQLite** project 
---

1. Create a New Next.js App


npx create-next-app@latest nextjs-auth-demo
cd nextjs-auth-demo
When prompted:
✅ Use App Router
✅ Use JavaScript
✅ Include ESLint
✅ Use Turbopack (optional)


2. Install Required Dependencies
npm install prisma @prisma/client bcrypt

3. Initialize Prisma
npx prisma init

This creates:
/prisma/schema.prisma

.env
Edit .env:
DATABASE_URL="file:./dev.db"

4. Define Database Schema
Edit prisma/schema.prisma:

```
    generator client {
    provider = "prisma-client-js"
    }

    datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
    }

    model User {
    id        Int      @id @default(autoincrement())
    name      String
    email     String   @unique
    password  String
    createdAt DateTime @default(now())
    }
```

Apply migration and create the database:
npx prisma migrate dev --name init

5. Project Structure
If you’re using src/ directory (Next.js default):

```
    nextjs-auth-demo/
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── register/
    │   │   │   │   └── route.js
    │   │   │   └── login/
    │   │   │       └── route.js
    │   │   ├── register/
    │   │   │   └── page.js
    │   │   ├── login/
    │   │   │   └── page.js
    │   │   ├── layout.js
    │   │   └── page.js
    │   └── lib/
    │       └── prisma.js
    ├── .env
    ├── package.json
    └── README.md
```

6. Configure Prisma Client
File: src/lib/prisma.js

```
    import { PrismaClient } from "@prisma/client";

    let prisma;

    if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
    } else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
    }

    export { prisma };
```

7. Create Register API Route
File: src/app/api/register/route.js

```
    import { prisma } from "@/lib/prisma";
    import bcrypt from "bcrypt";

    export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
        return Response.json({ error: "User already exists" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        });

        return Response.json({ message: "User registered successfully", user });
    } catch (err) {
        console.error(err);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
    }
```

8. Create Login API Route
File: src/app/api/login/route.js

```
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return Response.json({ error: "Invalid credentials" }, { status: 401 });

    return Response.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

9. Create Frontend Pages
🔹 Register Page (src/app/register/page.js)

```
"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "30px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <br />
        <button type="submit">Sign Up</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
```

 Login Page (src/app/login/page.js)
```
"use client";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "30px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
```

10. Update package.json Scripts
Replace your scripts section with this:

```
"scripts": {
  "dev": "next dev --turbopack",
  "build": "prisma generate && next build",
  "postinstall": "prisma generate",
  "start": "next start",
  "lint": "next lint"
}
```


11. Verify Prisma Setup
Run this to open the Prisma Studio (visual DB browser):

npx prisma studio
This opens http://localhost:5555

→ You’ll see your User table with all registered users.


12. Run the App
npm run dev
Then open:
📝 http://localhost:3000/register → Register a new user
🔐 http://localhost:3000/login → Login


13. Build and Deploy (Optional)
To build for production:
npm run build
npm start