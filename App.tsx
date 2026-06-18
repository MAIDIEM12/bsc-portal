import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, GraduationCap, Briefcase, Users, FileText, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const PROVINCES = [
  "An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh",
  "Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng",
  "Cần Thơ","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp",
  "Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng",
  "Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
  "Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình",
  "Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi",
  "Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên",
  "Thanh Hóa","Thừa Thiên Huế","Tiền Giang","TP. Hồ Chí Minh","Trà Vinh",
  "Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"
];

const REQ = "Vui lòng điền thông tin này";

const inputClass = (error?: string) => cn(
  "flex w-full rounded-lg border border-brand-border bg-white px-[0.8rem] py-[0.6rem] text-[0.9rem] text-brand-text focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-colors",
  error && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">{children}</label>
);
const Err = ({ msg }: { msg?: string }) => msg ? <span className="text-xs text-red-500">{msg}</span> : null;

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-[0.4rem] w-full">
      <Label>{label}</Label>
      <input className={cn(inputClass(error), className)} ref={ref} {...props} />
      <Err msg={error} />
    </div>
  )
);
Input.displayName = "Input";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: string[]; placeholder?: string }>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="flex flex-col gap-[0.4rem] w-full">
      <Label>{label}</Label>
      <select className={cn(inputClass(error), "cursor-pointer", className)} ref={ref} {...props}>
        <option value="">{placeholder || "-- Chọn --"}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <Err msg={error} />
    </div>
  )
);
Select.displayName = "Select";

const formatNumber = (val: any) => {
  const digits = String(val ?? '').replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat('en-US').format(parseInt(digits, 10));
};

const defaultValues = {
  position: "", full_name: "", gender: "", dob: "",
  pob: "", marital_status: "", phone: "", email: "",
  permanent_province: "", current_address: "",
  education_level: "", edu_school: "", edu_major: "", edu_year: "",
  other_certs: "", english: "", eng_other_text: "", other_lang: "",
  computer_skills: [] as string[], comp_other_text: "",
  exp1_time: "", exp1_company: "", exp1_position: "", exp1_reason: "", exp1_salary: "",
  exp2_time: "", exp2_company: "", exp2_position: "", exp2_reason: "", exp2_salary: "",
  exp3_time: "", exp3_company: "", exp3_position: "", exp3_reason: "", exp3_salary: "",
  job_desc: "",
  ref1_name: "", ref1_title: "", ref1_company: "", ref1_phone: "",
  ref2_name: "", ref2_title: "", ref2_company: "", ref2_phone: "",
  expected_salary: "", start_date: ""
};

export default function App() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<any>({ defaultValues });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState<'form' | 'complete'>('form');
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = formatNumber(e.target.value); };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.details || res.error || 'Request failed');
      setSuccess(true); setCurrentTab('complete');
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Không thể gửi form. Vui lòng thử lại.'));
    } finally { setIsSubmitting(false); }
  };

  const currentEng = watch('english');
  const currentComp: string[] = watch('computer_skills') || [];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text font-sans">
      <header className="bg-brand-card border-b border-brand-border px-8 h-[72px] flex justify-between items-center shrink-0 relative z-10">
        <img src="data:image/png;base64,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" alt="Blue Sky Corporation" className="h-10 object-contain" />
        <nav className="hidden md:flex gap-8">
          <button type="button" onClick={() => setCurrentTab('form')}
            className={`text-xs font-medium uppercase tracking-wider pb-0.5 border-b-2 transition-colors ${currentTab==='form'?'text-brand-primary border-brand-primary':'text-brand-primary-light border-transparent hover:text-brand-primary'}`}>
            01 Form Dữ Liệu
          </button>
          <button type="button" onClick={() => { if(success) setCurrentTab('complete'); }} disabled={!success}
            className={`text-xs font-medium uppercase tracking-wider pb-0.5 border-b-2 transition-colors ${currentTab==='complete'?'text-brand-primary border-brand-primary':'text-brand-primary-light border-transparent'} ${!success?'opacity-50 cursor-not-allowed':'hover:text-brand-primary'}`}>
            02 Hoàn Thành
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-card p-8 rounded-[24px] shadow-[0_4px_20px_rgba(90,90,64,0.05)] border border-brand-border flex flex-col gap-8">
            <div className="flex items-center gap-4 border-b border-brand-border pb-6">
              <div className="h-12 w-12 bg-brand-accent/30 text-brand-primary rounded-xl flex items-center justify-center"><FileText size={24} /></div>
              <div>
                <h1 className="text-2xl font-bold font-sans tracking-tight">PHIẾU THÔNG TIN ỨNG VIÊN</h1>
                <p className="text-brand-primary-light text-sm mt-1">Điền các thông tin dưới đây để tạo phiếu thông tin ứng viên.</p>
              </div>
            </div>

            {currentTab === 'form' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

              {/* I. THÔNG TIN CÁ NHÂN */}
              <section className="flex flex-col gap-6">
                <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                  <User className="text-brand-primary" size={20} /> I. Thông tin cá nhân
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Vị trí ứng tuyển *" {...register("position",{required:REQ})} error={errors.position?.message as string} />
                  <Input label="Họ và Tên *" {...register("full_name",{required:REQ})} error={errors.full_name?.message as string} />
                  <div className="flex flex-col gap-[0.4rem]">
                    <Label>Giới tính *</Label>
                    <div className="flex items-center gap-6 h-[2.6rem]">
                      {["Nam","Nữ"].map(v=>(
                        <label key={v} className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                          <input type="radio" value={v} {...register("gender",{required:REQ})} className="w-4 h-4 text-brand-primary" />{v}
                        </label>
                      ))}
                    </div>
                    <Err msg={errors.gender?.message as string} />
                  </div>
                  <div className="flex flex-col gap-[0.4rem]">
                    <Label>Tình trạng hôn nhân *</Label>
                    <div className="flex items-center gap-4 h-[2.6rem]">
                      {["Độc thân","Đã kết hôn","Ly hôn"].map(v=>(
                        <label key={v} className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                          <input type="radio" value={v} {...register("marital_status",{required:REQ})} className="w-4 h-4 text-brand-primary" />{v}
                        </label>
                      ))}
                    </div>
                    <Err msg={errors.marital_status?.message as string} />
                  </div>
                  <Input label="Ngày sinh *" type="date" {...register("dob",{required:REQ})} error={errors.dob?.message as string} />
                  <Select label="Nơi sinh *" options={PROVINCES} placeholder="-- Chọn tỉnh/thành --"
                    {...register("pob",{required:REQ})} error={errors.pob?.message as string} />
                  <Input label="Số điện thoại *" type="tel" {...register("phone",{required:REQ})} error={errors.phone?.message as string} />
                  <Input label="Địa chỉ email *" type="email"
                    {...register("email",{required:REQ,pattern:{value:/^\S+@\S+$/i,message:"Email không hợp lệ"}})}
                    error={errors.email?.message as string} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Hộ khẩu thường trú *" options={PROVINCES} placeholder="-- Chọn tỉnh/thành --"
                    {...register("permanent_province",{required:REQ})} error={errors.permanent_province?.message as string} />
                  <Input label="Địa chỉ hiện tại *" placeholder="Số nhà, đường, phường/xã, quận/huyện"
                    {...register("current_address",{required:REQ})} error={errors.current_address?.message as string} />
                </div>
              </section>

              <hr className="border-brand-border" />

              {/* II. HỌC VẤN & KỸ NĂNG */}
              <section className="flex flex-col gap-6">
                <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                  <GraduationCap className="text-brand-primary" size={20} /> II. Học vấn & Kỹ năng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select label="Trình độ học vấn *" options={["PTTH","Trung cấp","Cao đẳng","Đại học","Trên đại học"]}
                    {...register("education_level",{required:REQ})} error={errors.education_level?.message as string} />
                  <Input label="Năm tốt nghiệp *" type="number" placeholder="VD: 2020"
                    {...register("edu_year",{required:REQ,min:{value:1980,message:"Năm không hợp lệ"},max:{value:new Date().getFullYear(),message:"Năm không hợp lệ"}})}
                    error={errors.edu_year?.message as string} />
                  <Input label="Tên trường *" placeholder="Tên trường học" {...register("edu_school",{required:REQ})} error={errors.edu_school?.message as string} />
                  <Input label="Chuyên ngành *" placeholder="Chuyên ngành học" {...register("edu_major",{required:REQ})} error={errors.edu_major?.message as string} />
                </div>
                <Input label="Chứng chỉ khác (nếu có)" placeholder="VD: Chứng chỉ kế toán, PMP, ACCA..." {...register("other_certs")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-[0.4rem]">
                    <Label>Trình độ ngoại ngữ *</Label>
                    <div className="flex flex-wrap gap-4 mt-1">
                      {["IELTS","TOEFL","TOEIC","Khác","Không có"].map(v=>(
                        <label key={v} className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                          <input type="radio" value={v} {...register("english",{required:REQ})} className="w-4 h-4 text-brand-primary" />{v}
                        </label>
                      ))}
                    </div>
                    <Err msg={errors.english?.message as string} />
                    {currentEng && currentEng !== 'Không có' && (
                      <div className="mt-2">
                        <Input label="Điểm / Chi tiết" placeholder="VD: IELTS 7.0, TOEIC 800..." {...register("eng_other_text")} />
                      </div>
                    )}
                    <div className="mt-2">
                      <Input label="Ngôn ngữ khác (nếu có)" placeholder="VD: Tiếng Nhật N2, Tiếng Hàn..." {...register("other_lang")} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[0.4rem]">
                    <Label>Trình độ vi tính *</Label>
                    <div className="flex flex-col gap-3 mt-1">
                      {["MS Word, Excel, PowerPoint","Adobe Photoshop, AI","Khác"].map(v=>(
                        <label key={v} className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                          <input type="checkbox" value={v}
                            {...register("computer_skills",{validate:(v:string[])=>v?.length>0||REQ})}
                            className="rounded w-4 h-4 text-brand-primary" />{v}
                        </label>
                      ))}
                    </div>
                    <Err msg={errors.computer_skills?.message as string} />
                    {currentComp.includes('Khác') && (
                      <div className="mt-2">
                        <Input label="Chi tiết kỹ năng khác" placeholder="VD: AutoCAD, SQL, Power BI..." {...register("comp_other_text")} />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-brand-border" />

              {/* III. KINH NGHIỆM */}
              <section className="flex flex-col gap-6">
                <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                  <Briefcase className="text-brand-primary" size={20} /> III. Kinh nghiệm làm việc
                </h2>
                {[1,2,3].map(num=>(
                  <div key={num} className="bg-brand-bg p-6 rounded-xl flex flex-col gap-4 border border-brand-border">
                    <h3 className="font-semibold text-[0.85rem] text-brand-primary uppercase tracking-wider">
                      Công ty {num} {num===1?'*':'(nếu có)'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <Input label={`Thời gian${num===1?' *':''}`} placeholder="YYYY - YYYY"
                        {...register(`exp${num}_time`,num===1?{required:REQ}:{})}
                        error={num===1?errors[`exp${num}_time`]?.message as string:undefined} />
                      <Input label={`Công ty${num===1?' *':''}`} placeholder="Tên công ty"
                        {...register(`exp${num}_company`,num===1?{required:REQ}:{})}
                        error={num===1?errors[`exp${num}_company`]?.message as string:undefined} />
                      <Input label={`Chức vụ${num===1?' *':''}`} placeholder="Chức vụ"
                        {...register(`exp${num}_position`,num===1?{required:REQ}:{})}
                        error={num===1?errors[`exp${num}_position`]?.message as string:undefined} />
                      <Input label={`Lý do nghỉ${num===1?' *':''}`} placeholder="Lý do"
                        {...register(`exp${num}_reason`,num===1?{required:REQ}:{})}
                        error={num===1?errors[`exp${num}_reason`]?.message as string:undefined} />
                      <Input label={`Lương thực lãnh${num===1?' *':''}`} placeholder="VND"
                        {...register(`exp${num}_salary`,{onChange:handleSalaryChange,...(num===1?{required:REQ}:{})})}
                        error={num===1?errors[`exp${num}_salary`]?.message as string:undefined} />
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-[0.4rem]">
                  <Label>Mô tả công việc và trách nhiệm chính liên quan đến vị trí ứng tuyển *</Label>
                  <textarea {...register("job_desc",{required:REQ})} rows={4}
                    className={cn("w-full rounded-lg border border-brand-border bg-white px-[0.8rem] py-[0.6rem] text-[0.9rem] focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-colors resize-y",errors.job_desc&&"border-red-500")}
                    placeholder="Mô tả công việc và trách nhiệm chính..." />
                  <Err msg={errors.job_desc?.message as string} />
                </div>
              </section>

              <hr className="border-brand-border" />

              {/* IV. THAM KHẢO & MONG MUỐN */}
              <section className="flex flex-col gap-6">
                <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                  <Users className="text-brand-primary" size={20} /> IV. Tham khảo & Mong muốn
                </h2>
                <p className="text-[0.85rem] text-brand-primary-light -mt-4">
                  Vui lòng cung cấp thông tin 2 đồng nghiệp để chúng tôi tham khảo về chuyên môn của anh/chị.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2].map(num=>(
                    <div key={num} className="flex flex-col gap-4 p-6 border border-brand-border rounded-xl bg-brand-bg/50">
                      <h3 className="font-semibold text-[0.85rem] text-brand-primary uppercase tracking-wider">Đồng nghiệp {num}</h3>
                      <Input label="Họ và tên *" {...register(`ref${num}_name`,{required:REQ})} error={errors[`ref${num}_name`]?.message as string} />
                      <Input label="Chức vụ *" {...register(`ref${num}_title`,{required:REQ})} error={errors[`ref${num}_title`]?.message as string} />
                      <Input label="Công ty *" {...register(`ref${num}_company`,{required:REQ})} error={errors[`ref${num}_company`]?.message as string} />
                      <Input label="Số điện thoại *" type="tel" {...register(`ref${num}_phone`,{required:REQ})} error={errors[`ref${num}_phone`]?.message as string} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Input label="Mức lương mong muốn (VND/Tháng) *"
                    {...register("expected_salary",{required:REQ,onChange:handleSalaryChange})}
                    error={errors.expected_salary?.message as string} />
                  <Input label="Thời gian bắt đầu đi làm *" type="date"
                    {...register("start_date",{required:REQ})} error={errors.start_date?.message as string} />
                </div>
              </section>

              <div className="pt-8 mt-4 border-t border-brand-border flex justify-center">
                <button type="submit" disabled={isSubmitting}
                  className="bg-brand-primary text-white px-8 py-3 rounded-full text-[0.875rem] font-medium shadow-[0_4px_10px_rgba(29,78,216,0.2)] hover:bg-opacity-90 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[240px] justify-center">
                  {isSubmitting?<><Loader2 className="animate-spin" size={20}/>Đang gửi...</>:<><Send size={20}/>Gửi Phiếu Ứng Viên</>}
                </button>
              </div>

            </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="w-20 h-20 bg-brand-accent/30 rounded-full flex items-center justify-center text-brand-primary mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-sans font-bold text-brand-primary">Hoàn Thành!</h2>
                <p className="text-brand-primary-light max-w-md mx-auto text-[0.95rem] leading-relaxed">
                  Phiếu thông tin ứng viên của bạn đã được gửi đến nhà tuyển dụng thành công.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
