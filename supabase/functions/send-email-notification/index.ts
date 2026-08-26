// Supabase Edge Function: send-email-notification
// Triggered via webhook / direct invoke when booking actions occur
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationPayload {
  to: string;
  type: 'booking_confirmed' | 'booking_cancelled_by_user' | 'booking_cancelled_by_secretary' | 'booking_force_cancelled_schedule_change' | 'booking_force_cancelled_priest_unavailable';
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: EmailNotificationPayload = await req.json();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'notifications@church.org';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #fafaf9;">
        <div style="background-color: #102a43; padding: 24px; text-align: center; color: #d4af37;">
          <h1 style="margin: 0; font-size: 22px;">⛪ Confession Appointment System</h1>
          <p style="margin: 4px 0 0 0; font-size: 16px; color: #f4e7b5;">نظام مواعيد سر الاعتراف</p>
        </div>
        
        <div style="padding: 24px; background-color: #ffffff;">
          <h2 style="color: #102a43; font-size: 18px; margin-top: 0;">${payload.titleEn}</h2>
          <p style="color: #334e68; font-size: 15px; line-height: 1.5;">${payload.bodyEn}</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <div dir="rtl" style="text-align: right;">
            <h2 style="color: #102a43; font-size: 18px; margin-top: 0;">${payload.titleAr}</h2>
            <p style="color: #334e68; font-size: 15px; line-height: 1.5;">${payload.bodyAr}</p>
          </div>
          
          ${payload.metadata ? `
          <div style="margin-top: 20px; padding: 12px 16px; background-color: #f0f4f8; border-radius: 6px; font-size: 14px; color: #243b53;">
            ${payload.metadata.priestName ? `<p style="margin: 4px 0;"><strong>Priest / أبونا:</strong> ${payload.metadata.priestName}</p>` : ''}
            ${payload.metadata.date ? `<p style="margin: 4px 0;"><strong>Date / التاريخ:</strong> ${payload.metadata.date}</p>` : ''}
            ${payload.metadata.time ? `<p style="margin: 4px 0;"><strong>Time / الوقت:</strong> ${payload.metadata.time}</p>` : ''}
            ${payload.metadata.reason ? `<p style="margin: 4px 0; color: #b91c1c;"><strong>Notice / ملاحظة:</strong> ${payload.metadata.reason}</p>` : ''}
          </div>
          ` : ''}
        </div>
        
        <div style="background-color: #f5f0e4; padding: 16px; text-align: center; font-size: 12px; color: #67432a;">
          <p style="margin: 0;">Saint Mark Church Shobra</p>
          <p style="margin: 4px 0 0 0;">كنيسة الشهيد العظيم مارمرقس بشبرا</p>
        </div>
      </div>
    `;

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: payload.to,
          subject: `${payload.titleEn} | ${payload.titleAr}`,
          html: htmlBody,
        })
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: log email when Resend key is not configured
    console.log(`[EMAIL_NOTIFICATION_MOCK] To: ${payload.to}, Subject: ${payload.titleEn}`);
    return new Response(JSON.stringify({
      success: true,
      mock: true,
      message: 'Email logged in test mode (no RESEND_API_KEY supplied)',
      recipient: payload.to,
      subject: payload.titleEn
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
