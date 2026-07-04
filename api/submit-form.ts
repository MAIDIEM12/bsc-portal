import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Resend } from 'resend';

const fmt = (val: any) => {
  const d = String(val ?? '').replace(/\D/g, '');
  if (!d) return String(val ?? '');
  return new Intl.NumberFormat('en-US').format(parseInt(d, 10));
};

const fmtDate = (val: string) => {
  if (!val) return '';
  if (val.includes('-') && val.length === 10) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const d = req.body;

    const templatePath = path.resolve(process.cwd(), 'template.docx');
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: 'Template not found' });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true, linebreaks: true, nullGetter: () => ''
    });

    doc.render({
      full_name:       d.full_name || '',
      phone:           d.phone || '',
      email:           d.email || '',
      source:          d.source || '',
      position:        d.position || '',
      self_intro:      d.self_intro || '',
      years_exp:       d.years_exp || '',
      exp_company:     d.exp_company || '',
      exp_time:        d.exp_time || '',
      exp_position:    d.exp_position || '',
      portfolio:       d.portfolio || '—',
      current_salary:  fmt(d.current_salary),
      expected_salary: fmt(d.expected_salary),
      is_employed:     d.is_employed || '',
      notice_period:   d.notice_period || '—',
      start_date:      fmtDate(d.start_date),
      why_bsc:         d.why_bsc || '',
      ref1_name:       d.ref1_name || '—',
      ref1_phone:      d.ref1_phone || '—',
      ref2_name:       d.ref2_name || '—',
      ref2_phone:      d.ref2_phone || '—',
    });

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const filename = `${(d.position||'UV').replace(/\s+/g,'_')}_${(d.full_name||'').replace(/\s+/g,'_')}_BSC.docx`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const hrEmail = process.env.HR_EMAIL || 'hcns@blueskycorp.com.vn';

    const { error: emailError } = await resend.emails.send({
      from: 'BSC Tuyển dụng <onboarding@resend.dev>',
      to: hrEmail,
      subject: `[Ứng viên] ${d.full_name} — ${d.position}`,
      text: `Xin chào HR,\n\n${d.full_name} vừa nộp đơn ứng tuyển vị trí ${d.position}.\n📞 ${d.phone} | 📧 ${d.email}\nNguồn: ${d.source}\nKinh nghiệm: ${d.years_exp}\n\nVui lòng xem file đính kèm.\n\nBlue Sky Portal`,
      attachments: [{ filename, content: buf }]
    });

    if (emailError) throw new Error(emailError.message);
    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed', details: error.message || String(error) });
  }
}
