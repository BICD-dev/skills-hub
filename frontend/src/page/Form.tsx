import { useState, type ChangeEvent, type FormEvent, type JSX } from "react";
import * as yup from "yup";
import { TREM_BRANCHES } from "../constants/tremBranches";
import { COURSES } from "../constants/courses";
import { Field } from "../component/Field";
import { CourseOption } from "../component/CourseOption";
import { register } from "../api/register.api";
// import { useNavigate } from "react-router-dom";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isMember: string;
  branch: string;
  physicalCourse: string;
  onlineCourses: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface SectionTitleProps {
  label: string;
  number: string;
}

interface ErrMsgProps {
  msg: string;
}

// ─── INPUT STYLES ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder-black/30 outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 hover:border-yellow-500";

const selectCls =
  "w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black outline-none transition-all duration-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200 hover:border-yellow-500 cursor-pointer appearance-none";

// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
const formSchema = yup.object().shape({
  firstName: yup.string().trim().required("Required"),
  lastName: yup.string().trim().required("Required"),
  phone: yup.string().trim().required("Required"),
  email: yup.string().trim().email("Valid email required").required("Valid email required"),
  isMember: yup.string().required("Required"),
  branch: yup.string().when("isMember", {
    is: "yes",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  physicalCourse: yup.string().required("Select a physical course"),
  onlineCourses: yup.array().of(yup.string()).min(1, "Select at least one online course").required("Select at least one online course"),
});

// ─── MAIN FORM ────────────────────────────────────────────────────────────────
export default function LeadConferenceForm(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    isMember: "",
    branch: "",
    physicalCourse: "",
    onlineCourses: [],
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [mounted] = useState<boolean>(true); // check if this might cause bugs later on
//   const navigate = useNavigate();

  const toggleOnline = (id: string): void => {
    setForm((prev) => {
      const current = prev.onlineCourses;
      if (current.includes(id)) return { ...prev, onlineCourses: current.filter((c) => c !== id) };
      if (current.length >= 2) return prev; // max 2
      return { ...prev, onlineCourses: [...current, id] };
    });
  };

  const validate = async (): Promise<boolean> => {
    try {
      await formSchema.validate(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear branch if isMember changes to anything other than "yes"
      if (name === "isMember" && value !== "yes") {
        updated.branch = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const isValid = await validate();
    if (isValid){
        try {
            // call the api
        const result = await register({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            isMember: form.isMember === "yes",
            branch: form.isMember === "yes" ? form.branch : undefined,
            physicalCourse: form.physicalCourse,
            onlineCourses: form.onlineCourses,
        });
        
       console.log("Registration successful:", result);
         // redirect to payment page with the reference
        window.location.href = result.data.checkoutUrl;
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again later.");
            return;
        }
        
 setSubmitted(true);
        
    };
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-6 font-sans">
        <div
          className="bg-white border-4 border-black p-12 max-w-md w-full text-center shadow-[8px_8px_0_black]"
          style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-2">
            You're Registered!
          </h2>
          <p className="text-black/60 font-medium mb-8">
            The next step is to pay the application fee to confirm your spot. You will be redirected to the payment page shortly. 
          </p>
         
        </div>
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-white font-body">
        {/* ── HEADER ── */}
        <div className="bg-black px-6 py-5 flex items-center gap-6 border-b-4 border-yellow-400">
          {/* Logo placeholder */}
          <div className="w-14 h-14 border-2 border-yellow-400 flex items-center justify-center shrink-0">
        <img src="/assets/logo1.PNG" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-0.5">
              TREM latterhouse sanctuary
            </p>
            <h1 className="font-display text-4xl text-white leading-none tracking-wide">
              LEAD CONFERENCE
            </h1>
          </div>
          <div className="ml-auto hidden sm:flex flex-col items-end">
            <span className="text-white/40 text-xs uppercase tracking-widest">Registration</span>
            <span className="text-yellow-400 font-black text-sm">2026 Edition</span>
          </div>
        </div>

        {/* ── ACCENT STRIPE ── */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-400" />

        {/* ── FORM CARD ── */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div
            className={`bg-white border-4 border-black shadow-[8px_8px_0_black] ${mounted ? "opacity-100" : "opacity-0"}`}
            style={{ animation: mounted ? "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : "none" }}
          >
            {/* Card header */}
            <div className="bg-yellow-400 px-8 py-5 border-b-4 border-black">
              <h2 className="font-display text-3xl tracking-wide text-black">
                ATTENDEE REGISTRATION
              </h2>
              <p className="text-sm text-black/60 font-medium mt-0.5">
                Fill in your details to secure your spot at LEAD Conference.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6" noValidate>
              {/* ── SECTION: Personal Info ── */}
              <div className="stagger-1">
                <SectionTitle label="Personal Information" number="01" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="First Name" required>
                    <input
                      name="firstName"
                      className={inputCls + (errors.firstName ? " border-red-600" : "")}
                      placeholder="e.g. John"
                      value={form.firstName}
                      onChange={onChange}
                    />
                    {errors.firstName && <ErrMsg msg={errors.firstName} />}
                  </Field>
                  <Field label="Last Name" required>
                    <input
                      name="lastName"
                      className={inputCls + (errors.lastName ? " border-red-600" : "")}
                      placeholder="e.g. Doe"
                      value={form.lastName}
                      onChange={onChange}
                    />
                    {errors.lastName && <ErrMsg msg={errors.lastName} />}
                  </Field>
                  <Field label="Phone Number" required>
                    <input
                      name="phone"
                      className={inputCls + (errors.phone ? " border-red-600" : "")}
                      placeholder="+234 800 000 0000"
                      value={form.phone}
                      onChange={onChange}
                      type="tel"
                    />
                    {errors.phone && <ErrMsg msg={errors.phone} />}
                  </Field>
                  <Field label="Email Address" required>
                    <input
                      name="email"
                      className={inputCls + (errors.email ? " border-red-600" : "")}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={onChange}
                      type="email"
                    />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </Field>
                </div>
              </div>

              <Divider />

              {/* ── SECTION: TREM Membership ── */}
              <div className="stagger-2">
                <SectionTitle label="TREM Membership" number="02" />
                <div className="mt-4">
                  <Field label="Are you a member of TREM?" required>
                    <div className="select-wrapper">
                      <select
                        name="isMember"
                        className={selectCls + (errors.isMember ? " border-red-600" : "")}
                        value={form.isMember}
                        onChange={onChange}
                      >
                        <option value="">– Select an option –</option>
                        <option value="yes">Yes, I am a TREM member</option>
                        <option value="no">No, I am not a member</option>
                      </select>
                    </div>
                    {errors.isMember && <ErrMsg msg={errors.isMember} />}
                  </Field>

                  {form.isMember === "yes" && (
                    <div className="mt-4 reveal">
                      <Field label="Which TREM Branch do you attend?" required>
                        <div className="select-wrapper">
                          <select
                            name="branch"
                            className={selectCls + (errors.branch ? " border-red-600" : "")}
                            value={form.branch}
                            onChange={onChange}
                          >
                            <option value="">– Select your branch –</option>
                            {TREM_BRANCHES.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                        {errors.branch && <ErrMsg msg={errors.branch} />}
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* ── SECTION: Physical Courses ── */}
              <div className="stagger-3">
                <SectionTitle label="Physical Course" number="03" />
                <p className="text-xs text-black/40 uppercase tracking-widest mt-1 mb-4">
                  Select exactly one physical course
                </p>
                <div className="flex flex-col gap-2">
                  {COURSES.physical.map((course) => (
                    <CourseOption
                      key={course.id}
                      course={course}
                      type="physical"
                      selected={form.physicalCourse === course.id}
                      onChange={() => setForm((prev) => ({ ...prev, physicalCourse: course.id }))}
                    />
                  ))}
                </div>
                {errors.physicalCourse && <ErrMsg msg={errors.physicalCourse} />}
              </div>

              <Divider />

              {/* ── SECTION: Online Courses ── */}
              <div className="stagger-4">
                <SectionTitle label="Online Courses" number="04" />
                <div className="flex items-center justify-between mt-1 mb-4">
                  <p className="text-xs text-black/40 uppercase tracking-widest">
                    Select up to 2 online courses
                  </p>
                  <span
                    className={`text-xs font-black px-2 py-1 border-2 border-black ${
                      form.onlineCourses.length === 2
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {form.onlineCourses.length} / 2
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {COURSES.online.map((course) => (
                    <CourseOption
                      key={course.id}
                      course={course}
                      type="online"
                      selected={form.onlineCourses.includes(course.id)}
                      onChange={() => toggleOnline(course.id)}
                      disabled={
                        !form.onlineCourses.includes(course.id) &&
                        form.onlineCourses.length >= 2
                      }
                    />
                  ))}
                </div>
                {errors.onlineCourses && <ErrMsg msg={errors.onlineCourses} />}
              </div>

              <Divider />

              {/* ── SUBMIT ── */}
              <div className="stagger-5 pt-2">
                <button
                  type="submit"
                  className="w-full bg-yellow-400 border-4 border-black text-black font-black uppercase tracking-widest py-4 text-lg transition-all duration-200 hover:bg-black hover:text-yellow-400 hover:shadow-none active:translate-y-0.5 shadow-[4px_4px_0_black]"
                >
                  Complete Registration →
                </button>
                <p className="text-center text-xs text-black/30 mt-4 uppercase tracking-widest">
                  Fields marked with <span className="text-red-600">*</span> are required
                </p>
              </div>
            </form>
          </div>

          {/* ── FOOTER ── */}
          <div className="stagger-6 text-center mt-8">
            <div className="h-1 w-16 bg-yellow-400 mx-auto mb-4" />
            <p className="text-xs text-black/40 uppercase tracking-widest">
              © 2026 TREM Oko Oba latterhuse sanctuary · Lead Conference
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────
function SectionTitle({ label, number }: SectionTitleProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-4xl text-yellow-400 leading-none">{number}</span>
      <h3 className="font-black uppercase tracking-widest text-black text-sm">{label}</h3>
    </div>
  );
}

function Divider(): JSX.Element {
  return <div className="border-t-2 border-dashed border-black/10" />;
}

function ErrMsg({ msg }: ErrMsgProps): JSX.Element {
  return (
    <span className="text-xs font-bold text-red-600 flex items-center gap-1 mt-1">
      <span>⚠</span> {msg}
    </span>
  );
}