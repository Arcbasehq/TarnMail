import { NextRequest, NextResponse } from "next/server";
import { verifyAltcha } from "@/lib/altcha";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      return NextResponse.json(
        { error: "Web3Forms access key not configured" },
        { status: 500 }
      );
    }

    const altchaPayload = String(formData.get("altcha") ?? "");
    if (!altchaPayload) {
      return NextResponse.json(
        { error: "Please complete the captcha" },
        { status: 400 }
      );
    }

    const ok = await verifyAltcha(altchaPayload);
    if (!ok) {
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 }
      );
    }

    const data = {
      access_key: accessKey,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      subject: "Contact Form - tarnmail",
      from_name: "tarnmail Contact Form",
    };

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.message || "Failed to send message" },
      { status: response.status }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}