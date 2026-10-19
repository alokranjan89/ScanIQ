import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import request from "supertest";

test("password reset is one-time and account deletion invalidates the account", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "ScanIQ <test@example.com>";

    const [{ default: app }, { default: prisma }] = await Promise.all([
        import("../app.js"),
        import("../config/prisma.js"),
    ]);

    const originalFetch = globalThis.fetch;
    const email = `auth-flow-${randomUUID()}@example.com`;
    const oldPassword = "OriginalPassword123!";
    const newPassword = "UpdatedPassword123!";
    const changedPassword = "ChangedPassword123!";
    const barcode = `99${randomUUID().replace(/\D/g, "").padEnd(11, "0").slice(0, 11)}`;
    let resetToken = "";

    globalThis.fetch = async (_input, init) => {
        const body = JSON.parse(String(init?.body)) as { text: string };
        const link = body.text.match(/https?:\/\/\S+/)?.[0];
        assert.ok(link);
        resetToken = new URL(link).searchParams.get("token") ?? "";
        return new Response(JSON.stringify({ id: "email_test_id" }), { status: 200 });
    };

    try {
        const registration = await request(app)
            .post("/api/v1/auth/register")
            .send({ email, password: oldPassword })
            .expect(201);
        const accessToken = registration.body.data.accessToken as string;
        const userId = registration.body.data.user.id as number;
        const product = await prisma.product.create({
            data: { barcode, name: "Account deletion test product", updatedAt: new Date() },
        });
        await prisma.scan.create({
            data: { userId, productId: product.id, scannedCode: barcode },
        });
        await prisma.favorite.create({
            data: { userId, productId: product.id },
        });

        await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({ email })
            .expect(200);
        assert.match(resetToken, /^[A-Za-z0-9_-]{43}$/);

        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ token: resetToken, password: newPassword })
            .expect(200);
        await request(app)
            .post("/api/v1/auth/reset-password")
            .send({ token: resetToken, password: newPassword })
            .expect(400);

        await request(app)
            .post("/api/v1/auth/login")
            .send({ email, password: oldPassword })
            .expect(401);
        await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(401);
        const login = await request(app)
            .post("/api/v1/auth/login")
            .send({ email, password: newPassword })
            .expect(200);
        let updatedAccessToken = login.body.data.accessToken as string;

        const passwordChange = await request(app)
            .patch("/api/v1/auth/me/password")
            .set("Authorization", `Bearer ${updatedAccessToken}`)
            .send({ currentPassword: newPassword, newPassword: changedPassword })
            .expect(200);
        const changedSessionToken = passwordChange.body.data.accessToken as string;
        await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${changedSessionToken}`)
            .expect(200);
        await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${updatedAccessToken}`)
            .expect(401);
        await request(app)
            .post("/api/v1/auth/login")
            .send({ email, password: newPassword })
            .expect(401);
        const changedLogin = await request(app)
            .post("/api/v1/auth/login")
            .send({ email, password: changedPassword })
            .expect(200);
        updatedAccessToken = changedLogin.body.data.accessToken as string;

        await request(app)
            .delete("/api/v1/auth/me")
            .set("Authorization", `Bearer ${updatedAccessToken}`)
            .send({ password: "wrong-password" })
            .expect(400);
        await request(app)
            .delete("/api/v1/auth/me")
            .set("Authorization", `Bearer ${updatedAccessToken}`)
            .set("X-Forwarded-For", "203.0.113.2")
            .send({ password: changedPassword })
            .expect(200);
        await request(app)
            .get("/api/v1/auth/me")
            .set("Authorization", `Bearer ${updatedAccessToken}`)
            .expect(401);
        assert.equal(await prisma.scan.count({ where: { userId } }), 0);
        assert.equal(await prisma.favorite.count({ where: { userId } }), 0);
        assert.ok(await prisma.product.findUnique({ where: { id: product.id } }));
    } finally {
        globalThis.fetch = originalFetch;
        await prisma.user.deleteMany({ where: { email } });
        await prisma.product.deleteMany({ where: { barcode } });
    }
});
