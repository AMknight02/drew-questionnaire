import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { type } = await request.json();

    const dadEmail = process.env.PARENT_EMAIL_DAD;
    const momEmail = process.env.PARENT_EMAIL_MOM;

    let subject, html;

    if (type === 'started') {
      subject = "Drew has started his Decision Reflection";
      html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #D4AF37; font-size: 24px; letter-spacing: 4px; margin: 0;">DREW MASTRINO</h1><p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 8px;">DECISION REFLECTION</p></div><div style="background: #1a1a1a; border-radius: 12px; padding: 30px; color: #fff;"><h2 style="color: #CD1126; margin-top: 0;">Drew has begun</h2><p style="color: #ccc; line-height: 1.7;">Drew has started working on his questionnaire. He is taking the time to think through this decision carefully.</p><p style="color: #888; font-size: 14px; margin-top: 20px;">You will receive another update when he reaches 50% completion, and again when he submits his final answers.</p></div><p style="text-align: center; color: #444; font-size: 12px; margin-top: 30px; letter-spacing: 2px;">SEMPER FIDELIS</p></div>';
    } else if (type === 'halfway') {
      subject = "Drew is 50% through his Decision Reflection";
      html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #D4AF37; font-size: 24px; letter-spacing: 4px; margin: 0;">DREW MASTRINO</h1><p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 8px;">DECISION REFLECTION</p></div><div style="background: #1a1a1a; border-radius: 12px; padding: 30px; color: #fff;"><h2 style="color: #D4AF37; margin-top: 0;">Halfway there</h2><p style="color: #ccc; line-height: 1.7;">Drew has completed 50% of his questionnaire. He is putting real thought into this.</p><p style="color: #888; font-size: 14px; margin-top: 20px;">You will receive his complete answers when he is ready to share them with you.</p></div><p style="text-align: center; color: #444; font-size: 12px; margin-top: 30px; letter-spacing: 2px;">SEMPER FIDELIS</p></div>';
    }

    await resend.emails.send({
      from: 'Drew Questionnaire <onboarding@resend.dev>',
      to: [dadEmail, momEmail],
      subject: subject,
      html: html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
