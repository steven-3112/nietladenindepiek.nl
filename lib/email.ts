import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewSubmissionEmail(
  moderatorEmails: string[],
  guideName: string,
  models: string[]
) {
  try {
    await resend.emails.send({
      from: 'Niet Laden in de Piek <noreply@nietladenindepiek.nl>',
      to: moderatorEmails,
      subject: 'Nieuwe handleiding ter goedkeuring',
      html: `
        <h2>Nieuwe handleiding ingediend</h2>
        <p><strong>Ingediend door:</strong> ${guideName}</p>
        <p><strong>Voor modellen:</strong> ${models.join(', ')}</p>
        <p>
          <a href="${process.env.NEXTAUTH_URL}/admin/handleidingen" 
             style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Bekijk en keur goed
          </a>
        </p>
      `,
    });
  } catch (error) {
    console.error('Error sending new submission email:', error);
  }
}

export async function sendApprovalEmail(
  submitterEmail: string,
  guideName: string,
  models: string[]
) {
  if (!submitterEmail) return;

  try {
    await resend.emails.send({
      from: 'Niet Laden in de Piek <noreply@nietladenindepiek.nl>',
      to: submitterEmail,
      subject: 'Je handleiding is goedgekeurd!',
      html: `
        <h2>Goedgekeurd!</h2>
        <p>Hallo ${guideName},</p>
        <p>Je handleiding voor ${models.join(', ')} is goedgekeurd en staat nu online!</p>
        <p>Bedankt voor je bijdrage aan een beter energienet. 💚</p>
        <p>
          <a href="${process.env.NEXTAUTH_URL}" 
             style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Bekijk op de website
          </a>
        </p>
      `,
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}

export async function sendRejectionEmail(
  submitterEmail: string,
  guideName: string,
  models: string[],
  reason?: string
) {
  if (!submitterEmail) return;

  try {
    await resend.emails.send({
      from: 'Niet Laden in de Piek <noreply@nietladenindepiek.nl>',
      to: submitterEmail,
      subject: 'Je handleiding kon helaas niet worden goedgekeurd',
      html: `
        <h2>Handleiding niet goedgekeurd</h2>
        <p>Hallo ${guideName},</p>
        <p>Helaas konden we je handleiding voor ${models.join(', ')} niet goedkeuren.</p>
        ${reason ? `<p><strong>Reden:</strong> ${reason}</p>` : ''}
        <p>Je kunt een nieuwe handleiding indienen op de website.</p>
        <p>Bedankt voor je begrip.</p>
      `,
    });
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}

export default resend;

