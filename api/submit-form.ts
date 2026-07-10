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

const fmtPeriod = (fromM: string, fromY: string, toM: string, toY: string) => {
  const from = fromM && fromY ? `${fromM}/${fromY}` : fromY || fromM || '';
  const to = toM === 'current' ? 'Hiện tại' : (toM && toY ? `${toM}/${toY}` : toY || toM || '');
  if (!from && !to) return '';
  if (!to) return from;
  if (!from) return to;
  return `${from} – ${to}`;
};

const fmtSource = (d: any) => {
  if (d.source === 'Referral') return `Người quen: ${d.source_referrer || ''}`;
  if (d.source === 'Other') return `Khác: ${d.source_other || ''}`;
  return d.source || '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const d = req.body;
    const templatePath = path.resolve(process.cwd(), 'template.docx');
    if (!fs.existsSync(templatePath)) return res.status(500).json({ error: 'Template not found' });

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => '' });

    doc.render({
      full_name:        d.full_name || '',
      birth_year:       d.birth_year || '',
      phone:            d.phone || '',
      email:            d.email || '',
      current_district: d.current_district || '',
      hometown:         d.hometown || '',
      source:           fmtSource(d),
      position:         d.position || '',
      education_level:  d.education_level || '',
      edu_major:        d.edu_major || '',
      exp1_company:     d.exp1_company || '',
      exp1_title:       d.exp1_title || '',
      exp1_period:      fmtPeriod(d.exp1_from_month, d.exp1_from_year, d.exp1_to_month, d.exp1_to_year),
      exp1_task1:       d.exp1_task1 || '',
      exp1_task2:       d.exp1_task2 || '',
      exp1_task3:       d.exp1_task3 || '',
      exp1_actual_salary: fmt(d.exp1_actual_salary),
      exp1_leave_reason: d.exp1_leave_reason || '',
      exp2_company:     d.exp2_company || '',
      exp2_title:       d.exp2_title || '',
      exp2_period:      fmtPeriod(d.exp2_from_month, d.exp2_from_year, d.exp2_to_month, d.exp2_to_year),
      exp2_task1:       d.exp2_task1 || '',
      exp2_task2:       d.exp2_task2 || '',
      exp2_task3:       d.exp2_task3 || '',
      exp2_actual_salary: fmt(d.exp2_actual_salary),
      exp2_leave_reason: d.exp2_leave_reason || '',
      expected_salary:  fmt(d.expected_salary),
      start_date:       fmtDate(d.start_date),
      ref1_name:        d.ref1_name || '—',
      ref1_title:       d.ref1_title || '—',
      ref1_company:     d.ref1_company || '—',
      ref1_phone:       d.ref1_phone || '—',
      ref2_name:        d.ref2_name || '—',
      ref2_title:       d.ref2_title || '—',
      ref2_company:     d.ref2_company || '—',
      ref2_phone:       d.ref2_phone || '—',
    });

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const filename = `${(d.position||'UV').replace(/\s+/g,'_')}_${(d.full_name||'').replace(/\s+/g,'_')}_BSC.docx`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const hrEmail = process.env.HR_EMAIL || 'hcns@blueskycorp.com.vn';

    const { error: emailError } = await resend.emails.send({
      from: 'BSC Tuyển dụng <onboarding@resend.dev>',
      to: hrEmail,
      subject: `[Ứng viên] ${d.full_name} — ${d.position}`,
      text: `Xin chào HR,\n\n${d.full_name} (${d.birth_year}) vừa nộp phiếu ứng tuyển vị trí ${d.position}.\n📞 ${d.phone} | 📧 ${d.email}\nTrình độ: ${d.education_level}\n\nVui lòng xem file đính kèm.\n\nBSC Portal`,
      attachments: [{ filename, content: buf }]
    });

    if (emailError) throw new Error(emailError.message);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed', details: error.message || String(error) });
  }
}
