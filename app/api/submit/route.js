import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { answers, answeredCount, totalQuestions } = await request.json();

    const dadEmail = process.env.PARENT_EMAIL_DAD;
    const momEmail = process.env.PARENT_EMAIL_MOM;

    let answersHtml = '';
    answers.forEach(section => {
      answersHtml += '<div style="margin-bottom: 30px;"><h3 style="color: #D4AF37; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">' + section.icon + ' ' + section.section + '</h3>';
      section.questions.forEach(q => {
        answersHtml += '<div style="margin-bottom: 24px;"><p style="color: #CD1126; font-size: 12px; letter-spacing: 1px; margin-bottom: 8px;">Q' + q.number + '</p><p style="color: #ccc; font-size: 14px; margin-bottom: 12px;">' + q.question + '</p><div style="background: rgba(0,0,0,0.3); border-left: 3px solid #D4AF37; padding: 16px; border-radius: 4px;"><p style="color: #fff; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">' + q.answer + '</p></div></div>';
      });
      answersHtml += '</div>';
    });

    const submittedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const submittedTime = new Date().toLocaleTimeString();

    const html = '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a;"><div style="text-align: center; margin-bottom: 40px;"><h1 style="color: #D4AF37; font-size: 28px; letter-spacing: 6px; margin: 0;">DREW MASTRINO</h1><p style="color: #888; font-size: 12px; letter-spacing: 3px; margin-top: 8px;">DECISION REFLECTION</p><div style="width: 60px; height: 3px; background: linear-gradient(90deg, transparent, #CD1126, transparent); margin: 20px auto;"></div></div><div style="background: #1a1a1a; border-radius: 12px; padding: 30px; color: #fff; margin-bottom: 30px;"><h2 style="color: #4CAF50; margin-top: 0; text-align: center;">✓ Drew has submitted his answers</h2><p style="color: #ccc; line-height: 1.7; text-align: center;">Drew completed <strong>' + answeredCount + '</strong> of <strong>' + totalQuestions + '</strong> questions.</p><p style="color: #888; font-size: 14px; text-align: center;">Submitted on ' + submittedDate + ' at ' + submittedTime + '</p></div><div style="background: #1a1a1a; border-radius: 12px; padding: 30px; color: #fff;">' + answersHtml + '</div><p style="text-align: center; color: #444; font-size: 12px; margin-top: 40px; letter-spacing: 3px;">SEMPER FIDELIS - ALWAYS FAITHFUL</p></div>';

    await resend.emails.send({
      from: 'Drew Questionnaire <onboarding@resend.dev>',
      to: [dadEmail, momEmail],
      subject: "Drew's Decision Reflection - Complete Answers",
      html: html,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
