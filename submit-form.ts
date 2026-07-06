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
      full_name:        d.full_name || '',
      birth_year:       d.birth_year || '',
      phone:            d.phone || '',
      email:            d.email || '',
      current_district: d.current_district || '',
      hometown:         d.hometown || '',
      source:           d.source === 'Referral' ? `Người quen: ${d.source_referrer||''}` : d.source === 'Other' ? `Khác: ${d.source_other||''}` : (d.source || ''),
      position:         d.position || '',
      self_intro:       d.self_intro || '',
      years_exp:        d.years_exp || '',
      exp1_company:     d.exp1_company || '',
      exp1_title:       d.exp1_title || '',
      exp1_period:      fmtPeriod(d.exp1_from_month, d.exp1_from_year, d.exp1_to_month, d.exp1_to_year),
      exp2_company:     d.exp2_company || '',
      exp2_title:       d.exp2_title || '',
      exp2_period:      fmtPeriod(d.exp2_from_month, d.exp2_from_year, d.exp2_to_month, d.exp2_to_year),
      exp3_company:     d.exp3_company || '',
      exp3_title:       d.exp3_title || '',
      exp3_period:      fmtPeriod(d.exp3_from_month, d.exp3_from_year, d.exp3_to_month, d.exp3_to_year),
      portfolio:        d.portfolio || '—',
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
      text: `Xin chào HR,\n\n${d.full_name} (${d.birth_year}) vừa nộp đơn ứng tuyển vị trí ${d.position}.\n📞 ${d.phone} | 📧 ${d.email}\nKinh nghiệm: ${d.years_exp}\n\nVui lòng xem file đính kèm.\n\nBSC Portal`,
      attachments: [{ filename, content: buf }]
    });

    if (emailError) throw new Error(emailError.message);
    res.status(200).json({ success: true });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed', details: error.message || String(error) });
  }
}
