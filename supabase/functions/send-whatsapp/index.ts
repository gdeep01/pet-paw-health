import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  to: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error("Missing Twilio credentials");
      throw new Error("Twilio credentials not configured");
    }

    const { to, message }: WhatsAppRequest = await req.json();

    if (!to || !message) {
      throw new Error("Missing 'to' or 'message' field");
    }

    // Format phone number for WhatsApp
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = TWILIO_WHATSAPP_NUMBER.startsWith("whatsapp:") 
      ? TWILIO_WHATSAPP_NUMBER 
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

    console.log(`Sending WhatsApp message from ${formattedFrom} to ${formattedTo}`);
    console.log(`TWILIO_WHATSAPP_NUMBER value: ${TWILIO_WHATSAPP_NUMBER}`);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: formattedFrom,
        Body: message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", result);
      throw new Error(result.message || "Failed to send WhatsApp message");
    }

    console.log("WhatsApp message sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
