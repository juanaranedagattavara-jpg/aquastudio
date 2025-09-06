import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body?.email) {
      return NextResponse.json(
        { ok: false, error: "Email requerido" }, 
        { status: 400 }
      );
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { ok: false, error: "Formato de email inválido" }, 
        { status: 400 }
      );
    }

    // TODO: Enlazar con N8n/CRM (fetch POST a tu webhook)
    // await fetch(process.env.N8N_WEBHOOK_URL!, { 
    //   method: "POST", 
    //   headers: { "Content-Type": "application/json" }, 
    //   body: JSON.stringify(body) 
    // });

    // Por ahora solo logueamos (en producción esto iría a tu CRM)
    console.log("Lead capturado:", { email: body.email, timestamp: new Date() });

    return NextResponse.json({ 
      ok: true, 
      message: "Lead capturado exitosamente" 
    });

  } catch (error) {
    console.error("Error en captura de lead:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
