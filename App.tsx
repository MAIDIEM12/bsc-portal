import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { User, GraduationCap, Briefcase, Users, FileText, CheckCircle2, Download, Send, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-[0.4rem] w-full">
        <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">{label}</label>
        <input
          className={cn(
            "flex w-full rounded-lg border border-brand-border bg-white px-[0.8rem] py-[0.6rem] text-[0.9rem] text-brand-text focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

const formatNumber = (val: any) => {
  if (typeof val !== 'string') val = String(val ?? '');
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat('en-US').format(parseInt(digits, 10));
};

const defaultValues = {
  position: "",
  full_name: "",
  gender: "Nam", // Keep basic defaults for radio/select items if needed, or clear them as well. Let's make gender empty.
  dob: "",
  pob: "",
  id_number: "",
  id_date: "",
  id_place: "",
  education_level: "",
  marital_status: "",
  tax_code: "",
  social_insurance: "",
  phone: "",
  email: "",
  permanent_address: "",
  current_address: "",
  education_levels: [],
  uni_school: "",
  uni_time: "",
  uni_major: "",
  english: "",
  computer: "",
  exp1_time: "",
  exp1_company: "",
  exp1_position: "",
  exp1_reason: "",
  exp1_salary: "",
  exp2_time: "",
  exp2_company: "",
  exp2_position: "",
  exp2_reason: "",
  exp2_salary: "",
  exp3_time: "",
  exp3_company: "",
  exp3_position: "",
  exp3_reason: "",
  exp3_salary: "",
  expected_salary: "",
  start_date: ""
};

export default function App() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<any>({ defaultValues });
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    e.target.value = formatNumber(value);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState<'form' | 'complete'>('form');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSuccess(false);
    try {
     /api/submit-form 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Request failed');
      }

      setSuccess(true);
      setCurrentTab('complete');
    } catch (err: any) {
      console.error(err);
      alert('Lỗi: ' + (err.message || 'Không thể gửi form. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentEng = watch('english');
  const currentComp = watch('computer');

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text font-sans">
      <header className="bg-brand-card border-b border-brand-border px-8 h-[72px] flex justify-between items-center shrink-0 relative z-10">
        <div className="flex items-center gap-1">
          <span className="font-sans text-2xl font-bold text-[#46b7e0] tracking-tight ml-2">Blue Sky Corp</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <button 
            type="button"
            onClick={() => setCurrentTab('form')}
            className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider pb-0.5 border-b-2 transition-colors ${currentTab === 'form' ? 'text-brand-primary border-brand-primary' : 'text-brand-primary-light border-transparent hover:text-brand-primary'}`}
          >
            <span>01</span> Form Dữ Liệu
          </button>
          <button 
             type="button"
             onClick={() => { if (success) setCurrentTab('complete'); }}
             disabled={!success}
             className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider pb-0.5 border-b-2 transition-colors ${currentTab === 'complete' ? 'text-brand-primary border-brand-primary' : 'text-brand-primary-light border-transparent'} ${!success ? 'opacity-50 cursor-not-allowed' : 'hover:text-brand-primary cursor-pointer'}`}
          >
            <span>02</span> Hoàn Thành
          </button>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-brand-card p-8 rounded-[24px] shadow-[0_4px_20px_rgba(90,90,64,0.05)] border border-brand-border flex flex-col gap-8">
            <div className="flex items-center gap-4 border-b border-brand-border pb-6">
              <div className="h-12 w-12 bg-brand-accent/30 text-brand-primary rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-sans tracking-tight">PHIẾU THÔNG TIN ỨNG VIÊN</h1>
                <p className="text-brand-primary-light text-sm mt-1">Điền các thông tin dưới đây để tạo phiếu thông tin ứng viên.</p>
              </div>
            </div>

          {currentTab === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            
            {/* 1. PERSONAL INFO */}
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                <User className="text-brand-primary" size={20} />
                I. Thông tin cá nhân
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Vị trí ứng tuyển *" {...register("position", { required: "Required" })} error={errors.position?.message as string} />
                <Input label="Họ và Tên *" {...register("full_name", { required: "Required" })} error={errors.full_name?.message as string} />
                
                <div className="flex flex-col gap-[0.4rem]">
                  <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">Giới tính *</label>
                  <div className="flex items-center gap-4 h-[2.6rem]">
                    <label className="flex items-center gap-2 text-[0.9rem]"><input type="radio" value="Nam" {...register("gender", { required: "Required" })} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Nam</label>
                    <label className="flex items-center gap-2 text-[0.9rem]"><input type="radio" value="Nữ" {...register("gender")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Nữ</label>
                  </div>
                  {errors.gender && <span className="text-xs text-red-500">{errors.gender.message as string}</span>}
                </div>

                <div className="flex flex-col gap-[0.4rem]">
                  <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">Tình trạng hôn nhân *</label>
                  <div className="flex items-center gap-4 h-[2.6rem]">
                    <label className="flex items-center gap-2 text-[0.9rem]"><input type="radio" value="Độc thân" {...register("marital_status", { required: "Required" })} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Độc thân</label>
                    <label className="flex items-center gap-2 text-[0.9rem]"><input type="radio" value="Đã kết hôn" {...register("marital_status")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Đã kết hôn</label>
                    <label className="flex items-center gap-2 text-[0.9rem]"><input type="radio" value="Ly hôn" {...register("marital_status")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Ly hôn</label>
                  </div>
                </div>

                <Input label="Ngày sinh" type="text" placeholder="dd/mm/yyyy" {...register("dob")} />
                <Input label="Nơi sinh" {...register("pob")} />
                
                <Input label="Số CMND *" {...register("id_number", { required: "Required" })} error={errors.id_number?.message as string} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Ngày cấp" type="text" placeholder="dd/mm/yyyy" {...register("id_date")} />
                  <Input label="Nơi cấp" {...register("id_place")} />
                </div>
                
                <Input label="Trình độ học vấn" {...register("education_level")} />
                <Input label="Mã số thuế cá nhân" {...register("tax_code")} />
                <Input label="Số bảo hiểm xã hội" {...register("social_insurance")} />
                <Input label="Số điện thoại *" type="tel" {...register("phone", { required: "Required" })} error={errors.phone?.message as string} />
                <Input label="Địa chỉ email *" type="email" {...register("email", { required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })} error={errors.email?.message as string} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input label="Hộ khẩu thường trú" {...register("permanent_address")} />
                <Input label="Địa chỉ hiện tại" {...register("current_address")} />
              </div>
            </section>

            <hr className="border-brand-border" />

            {/* 2. EDUCATION HISTORY */}
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                <GraduationCap className="text-brand-primary" size={20} />
                2. Quá trình đào tạo & Kỹ năng
              </h2>

              <div className="bg-brand-bg p-6 rounded-xl flex flex-col gap-4 border border-brand-border">
                <h3 className="font-semibold text-[0.85rem] text-brand-primary uppercase tracking-wider">Chọn trình độ và điền thông tin chi tiết:</h3>
                
                {['High School', 'Intermediate', 'College', 'University', 'Postgraduate'].map((lvl, index) => {
                  const keyMap = ['hs', 'inter', 'college', 'uni', 'post'][index];
                  const vietMap = ['PTTH', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Trên đại học'][index];
                  return (
                    <div key={lvl} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <label className="flex items-center gap-2 w-40 shrink-0 text-[0.9rem] font-medium">
                        <input type="checkbox" value={vietMap} {...register("education_levels")} className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4" />
                        {vietMap}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                        <Input label="Tên trường" placeholder="Tên trường" {...register(`${keyMap}_school`)} />
                        <Input label="Thời gian" placeholder="YYYY - YYYY" {...register(`${keyMap}_time`)} />
                        <Input label="Chuyên ngành" placeholder="Chuyên ngành" {...register(`${keyMap}_major`)} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <Input label="Các chứng chỉ khác" {...register("other_certs")} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-[0.4rem]">
                  <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">Trình độ ngoại ngữ (Tiếng Anh)</label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['IELTS', 'TOEFL', 'TOEIC', 'Khác'].map(cert => (
                      <label key={cert} className="flex items-center gap-2 text-[0.9rem]">
                        <input type="radio" value={cert} {...register("english")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> {cert}
                      </label>
                    ))}
                  </div>
                  {currentEng === 'Khác' && <div className="mt-2"><Input label="Chi tiết" {...register("eng_other_text")} /></div>}
                  <div className="mt-2"><Input label="Ngôn ngữ khác (nếu có)" {...register("other_lang")} /></div>
                </div>

                <div className="flex flex-col gap-[0.4rem]">
                  <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">Trình độ vi tính</label>
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-2 text-[0.9rem]">
                      <input type="radio" value="MS Word, Excel, Powerpoint" {...register("computer")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> MS Word, Excel, Powerpoint
                    </label>
                    <label className="flex items-center gap-2 text-[0.9rem]">
                      <input type="radio" value="Adobe Photoshop, AI" {...register("computer")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Adobe Photoshop, AI
                    </label>
                    <label className="flex items-center gap-2 text-[0.9rem]">
                      <input type="radio" value="Khác" {...register("computer")} className="w-4 h-4 text-brand-primary focus:ring-brand-primary" /> Khác
                    </label>
                  </div>
                  {currentComp === 'Khác' && <div className="mt-2"><Input label="Chi tiết" {...register("comp_other_text")} /></div>}
                </div>
              </div>
            </section>

            <hr className="border-brand-border" />

            {/* 3. WORK EXPERIENCE */}
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                <Briefcase className="text-brand-primary" size={20} />
                3. Kinh nghiệm làm việc (Tại 3 công ty gần nhất)
              </h2>

              {[1, 2, 3].map(num => (
                <div key={num} className="bg-brand-bg p-6 rounded-xl flex flex-col gap-4 border border-brand-border">
                  <h3 className="font-semibold text-[0.85rem] text-brand-primary uppercase tracking-wider">Công ty {num}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                    <Input label="Thời gian" placeholder="YYYY - YYYY" {...register(`exp${num}_time`)} />
                    <Input label="Công ty" placeholder="Tên công ty" {...register(`exp${num}_company`)} />
                    <Input label="Chức vụ" placeholder="Chức vụ" {...register(`exp${num}_position`)} />
                    <Input label="Lí do nghỉ việc" placeholder="Lí do" {...register(`exp${num}_reason`)} />
                    <Input label="Lương thực lãnh" placeholder="Tổng/Net" {...register(`exp${num}_salary`, { onChange: handleSalaryChange })} />
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.75rem] font-semibold text-brand-primary-light uppercase tracking-wider">Mô tả công việc và trách nhiệm chính liên quan đến vị trí ứng tuyển tại các đơn vị</label>
                <textarea 
                  {...register("job_desc")} 
                  rows={4}
                  className="w-full rounded-lg border border-brand-border bg-white px-[0.8rem] py-[0.6rem] text-[0.9rem] text-brand-text focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-colors resize-y"
                  placeholder="Mô tả công việc và trách nhiệm..."
                />
              </div>
            </section>

            <hr className="border-brand-border" />

            {/* 4. REFERENCES */}
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4 flex items-center gap-3">
                <Users className="text-brand-primary" size={20} />
                4. Người liên hệ (Liệt kê 2 người)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(num => (
                  <div key={num} className="flex flex-col gap-4 p-6 border border-brand-border rounded-xl bg-brand-bg/50">
                    <h3 className="font-semibold text-[0.85rem] text-brand-primary uppercase tracking-wider">Người liên hệ {num}</h3>
                    <Input label="Họ và tên" {...register(`ref${num}_name`)} />
                    <Input label="Chức vụ" {...register(`ref${num}_title`)} />
                    <Input label="Công ty" {...register(`ref${num}_company`)} />
                    <Input label="Số điện thoại" {...register(`ref${num}_phone`)} />
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-brand-border" />

            {/* 5. OTHER */}
            <section className="flex flex-col gap-6">
              <h2 className="font-sans text-xl font-semibold border-l-4 border-brand-primary pl-4">5. Thông tin khác</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Mức lương mong muốn (VND/Tháng) *" {...register("expected_salary", { required: "Required", onChange: handleSalaryChange })} error={errors.expected_salary?.message as string} />
                <Input label="Thời gian bắt đầu đi làm *" type="text" placeholder="dd/mm/yyyy" {...register("start_date", { required: "Required" })} error={errors.start_date?.message as string} />
              </div>
            </section>

            {/* SUBMIT */}
            <div className="pt-8 mt-4 border-t border-brand-border flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary text-white border-none px-8 py-3 rounded-full text-[0.875rem] font-medium shadow-[0_4px_10px_rgba(29,78,216,0.2)] cursor-pointer hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto min-w-[240px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={20} /> Đang gửi form...</>
                ) : (
                  <><Send size={20} /> Gửi Phiếu Ứng Viên</>
                )}
              </button>
              
              {success && (
                <div className="flex items-center gap-2 text-brand-primary text-sm font-medium bg-brand-accent/50 px-4 py-2 rounded-xl">
                  <CheckCircle2 size={16} />
                  Gửi thông tin thành công!
                </div>
              )}
            </div>

          </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <div className="w-20 h-20 bg-brand-accent/30 rounded-full flex items-center justify-center text-brand-primary mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-sans font-bold text-brand-primary">Hoàn Thành!</h2>
              <p className="text-brand-primary-light max-w-md mx-auto text-[0.95rem] leading-relaxed">
                Phiếu thông tin ứng viên của bạn đã được gửi thành công. Chúng tôi sẽ kiểm tra và liên hệ lại với bạn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentTab('form')}
                  className="px-8 py-3 rounded-full text-[0.875rem] font-medium border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                >
                  Chỉnh sửa thông tin
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="bg-brand-primary text-white border-none px-8 py-3 rounded-full text-[0.875rem] font-medium shadow-[0_4px_10px_rgba(29,78,216,0.2)] cursor-pointer hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={20} /> Đang tải...</>
                  ) : (
                    <><Download size={20} /> Tải xuống lại</>
                  )}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
