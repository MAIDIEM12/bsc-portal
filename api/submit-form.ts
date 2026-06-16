import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    
    const templatePath = path.resolve(process.cwd(), 'template.docx');
    if (!fs.existsSync(templatePath)) {
      console.error('Template path not found:', templatePath);
      res.status(500).json({ error: 'Template not found at ' + templatePath });
      return;
    }
    const content = fs.readFileSync(templatePath, 'binary');

    const zoom = new PizZip(content);
    const doc = new Docxtemplater(zoom, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: function(part) {
          if (!part.module) return "";
          if (part.module === "rawxml") return "";
          return "";
      }
    });

    const checkmarks = {
      cb_male: data.gender === 'Nam' ? '☒' : '☐',
      cb_female: data.gender === 'Nữ' ? '☒' : '☐',
      cb_single: data.marital_status === 'Độc thân' ? '☒' : '☐',
      cb_married: data.marital_status === 'Đã kết hôn' ? '☒' : '☐',
      cb_divorced: data.marital_status === 'Ly hôn' ? '☒' : '☐',
      cb_hs: data.education_levels?.includes('PTTH') ? '☒' : '☐',
      cb_inter: data.education_levels?.includes('Trung cấp') ? '☒' : '☐',
      cb_college: data.education_levels?.includes('Cao đẳng') ? '☒' : '☐',
      cb_uni: data.education_levels?.includes('Đại học') ? '☒' : '☐',
      cb_post: data.education_levels?.includes('Trên đại học') ? '☒' : '☐',
      cb_ielts: data.english === 'IELTS' ? '☒' : '☐',
      cb_toefl: data.english === 'TOEFL' ? '☒' : '☐',
      cb_toeic: data.english === 'TOEIC' ? '☒' : '☐',
      cb_ms: data.computer === 'MS Word, Excel, Powerpoint' ? '☒' : '☐',
      cb_adobe: data.computer === 'Adobe Photoshop, AI' ? '☒' : '☐',
    };

    let start_date_str = data.start_date || '';
    let sd_dd = '  ', sd_mm = '  ', sd_yyyy = '    ';
    const parts = start_date_str.includes('/') ? start_date_str.split('/') : start_date_str.split('-');
    if (parts.length === 3) {
       if (start_date_str.includes('/')) {
           sd_dd = parts[0]; sd_mm = parts[1]; sd_yyyy = parts[2];
       } else {
           sd_yyyy = parts[0]; sd_mm = parts[1]; sd_dd = parts[2];
       }
    }

    const formatBackendSalary = (val: any) => {
      if (!val) return "";
      const str = String(val).trim();
      if (str.includes(',')) return str;
      const digits = str.replace(/\D/g, "");
      if (!digits) return str;
      return new Intl.NumberFormat('en-US').format(parseInt(digits, 10));
    };

    const renderData = {
      ...data,
      ...checkmarks,
      expected_salary: formatBackendSalary(data.expected_salary),
      exp1_salary: formatBackendSalary(data.exp1_salary),
      exp2_salary: formatBackendSalary(data.exp2_salary),
      exp3_salary: formatBackendSalary(data.exp3_salary),
      sd_dd,
      sd_mm,
      sd_yyyy
    };

    doc.render(renderData);

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const filename = `${data.position || 'Vi_tri'}_${data.full_name || 'Ho_va_ten'}_Phieu_thong_tin_ung_vien.docx`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const hrEmail = process.env.HR_EMAIL || 'hcns@blueskycorp.com.vn';

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'BSC HR <onboarding@resend.dev>',
      to: hrEmail,
      subject: `[Applicant] ${data.full_name} - ${data.position}`,
      text: `Kính gửi HR,\n\nỨng viên ${data.full_name} vừa nộp form ứng tuyển cho vị trí ${data.position}.\n\nVui lòng xem file đính kèm để biết thêm chi tiết.\n\nTrân trọng,\nHệ thống Form`,
      attachments: [
        {
          filename: filename,
          content: buf
        }
      ]
    });

    if (emailError) {
      throw new Error(emailError.message);
    }

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process request', details: error.message || String(error) });
  }
}
