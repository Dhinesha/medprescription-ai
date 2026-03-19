import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, prompt, type } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userContent: any[] = [];

    if (type === "scan_prescription") {
      systemPrompt = `You are a medical prescription analyzer. Analyze the prescription image and extract:
1. All medicine names with dosage (mg/ml)
2. Frequency (once/twice/thrice daily)
3. Timing (morning/afternoon/night)
4. Before or after food
5. Duration (number of days)

Respond ONLY in this JSON format:
{
  "medicines": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "morning": true,
      "afternoon": false,
      "night": true,
      "beforeFood": false,
      "afterFood": true,
      "duration": "5 days"
    }
  ],
  "foodSuggestions": [
    "Eat light, easily digestible food while on antibiotics",
    "Avoid dairy products 2 hours before/after taking this medication"
  ],
  "warnings": ["Do not take on empty stomach"]
}`;

      if (is_pdf) {
        // For PDFs, send as application/pdf mime type
        const cleanedBase64 = image_base64.replace(/\s/g, "");
        userContent = [
          {
            type: "image_url",
            image_url: { url: `data:application/pdf;base64,${cleanedBase64}` },
          },
          { type: "text", text: "Analyze this prescription document and extract all medicine details including name, dosage, frequency, timing, food instructions, and duration." },
        ];
      } else {
        // For images
        let cleanedBase64 = image_base64;
        if (cleanedBase64.includes(",") && cleanedBase64.startsWith("data:")) {
          cleanedBase64 = cleanedBase64.split(",")[1];
        }
        cleanedBase64 = cleanedBase64.replace(/\s/g, "");
        userContent = [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${cleanedBase64}` },
          },
          { type: "text", text: "Analyze this prescription image and extract all medicine details." },
        ];
      }
    } else if (type === "chat") {
      systemPrompt = `You are MedAssist, a helpful medical AI assistant. You ONLY answer medical and health-related questions. 

Your capabilities:
- Explain medicines, their uses, side effects, and interactions
- Provide general health and nutrition advice
- Explain medical terms and conditions
- Suggest when to see a doctor
- Provide food suggestions for specific medications (what to eat/avoid)
- Help understand prescription details

IMPORTANT RULES:
- ONLY answer medical/health related questions
- For non-medical questions, politely say: "I'm a medical assistant and can only help with health-related questions."
- Always add a disclaimer: "This is for informational purposes only. Please consult your doctor for medical advice."
- Never diagnose conditions or replace professional medical advice
- Format responses with clear sections using markdown`;

      userContent = [{ type: "text", text: prompt }];
    } else if (type === "set_reminders") {
      systemPrompt = `You are a medication schedule assistant. Based on the medicines provided, create a daily schedule with exact timings.

Respond ONLY in this JSON format:
{
  "schedule": [
    {
      "time": "08:00 AM",
      "label": "Morning",
      "medicines": ["Paracetamol 650mg", "Vitamin D3"],
      "foodInstruction": "Take after breakfast"
    }
  ],
  "foodTips": [
    "Have breakfast before 8:30 AM for morning medicines",
    "Keep a 30-minute gap between food and medicine"
  ]
}`;

      userContent = [{ type: "text", text: prompt }];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI API error:", err);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ result: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
