import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import "./RegisterBusiness.scss";

type BusinessCategory = "activities" | "services" | "";

interface ServiceFormData {
  email: string; personalName: string; password: string; confirmPassword: string;
  businessName: string; serviceType: string; address: string; postcode: string;
  description: string; priceList: string; additionalInfo: string;
  contactPhone: string; contactEmail: string; website: string;
  photo: File | null;
}

interface ActivityFormData {
  email: string; personalName: string; password: string; confirmPassword: string;
  businessName: string; activityType: string; address: string; postcode: string;
  description: string; contactPhone: string; contactEmail: string; website: string;
  document: File | null;
  photo: File | null;
}

type ValidationErrors = Record<string, string>;

const ACTIVITY_TYPES = [
  { key: "hotel",      label: "Dog Hotel",   icon: "/images/paint/hotel.png",      desc: "Boarding & accommodation" },
  { key: "cafe",       label: "Dog Café",    icon: "/images/paint/cafe.png",       desc: "Dog-friendly café"        },
  { key: "restaurant", label: "Restaurant",  icon: "/images/paint/restaurant.png", desc: "Dog-welcoming dining"     },
  { key: "park",       label: "Dog Park",    icon: "/images/paint/park.png",       desc: "Outdoor dog spaces"       },
  { key: "beach",      label: "Beach/Trail", icon: "/images/paint/beach.png",      desc: "Nature & outdoor access"  },
  { key: "pub",        label: "Pub/Bar",     icon: "/images/paint/pub.png",        desc: "Dog-friendly drinks"      },
  { key: "shop",       label: "Retail Shop", icon: "/images/paint/shop.png",       desc: "Dog-welcoming stores"     },
  { key: "other",      label: "Other",       icon: "/images/paint/other.png",      desc: "Other dog-friendly venue" },
];

const SERVICE_TYPES = [
  { key: "groomer",      label: "Groomer",      icon: "/images/paint/groomer.png",      desc: "Grooming & styling" },
  { key: "vet",          label: "Veterinary",   icon: "/images/paint/vet.png",          desc: "Medical care"       },
  { key: "pet_shop",     label: "Pet Shop",     icon: "/images/paint/pet-shop.png",     desc: "Supplies & products"},
  { key: "behaviourist", label: "Behaviourist", icon: "/images/paint/behaviourist.png", desc: "Behaviour therapy"  },
  { key: "trainer",      label: "Dog Trainer",  icon: "/images/paint/trainer.png",      desc: "Training & classes" },
  { key: "walker",       label: "Dog Walker",   icon: "/images/paint/walker.png",       desc: "Walking services"   },
  { key: "sitter",       label: "Dog Sitter",   icon: "/images/paint/sitter.png",       desc: "In-home sitting"    },
  { key: "daycare",      label: "Day Care",     icon: "/images/paint/daycare.png",      desc: "Day boarding"       },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Small helpers ────────────────────────────────────────────────────────────
const FieldError: React.FC<{ error?: string }> = ({ error }) =>
  error ? (
    <span className="rb-field-error" role="alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      {error}
    </span>
  ) : null;

const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number; labels: string[] }> = ({ current, total, labels }) => (
  <div className="rb-steps" role="list" aria-label="Registration steps">
    {Array.from({ length: total }).map((_, i) => {
      const state = i + 1 === current ? "active" : i + 1 < current ? "done" : "pending";
      return (
        <React.Fragment key={i}>
          <div className={`rb-step rb-step--${state}`} role="listitem" aria-current={state === "active" ? "step" : undefined}>
            <div className="rb-step__node">
              {state === "done"
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                : <span>{i + 1}</span>}
            </div>
            <span className="rb-step__label">{labels[i]}</span>
          </div>
          {i < total - 1 && <div className={`rb-step__line ${state === "done" ? "rb-step__line--done" : ""}`} aria-hidden="true" />}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── UI Primitives ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; optional?: boolean; error?: string; children: React.ReactNode }> = ({ label, optional, error, children }) => (
  <div className="rb-field">
    <label className="rb-label">{label}{optional && <span className="rb-optional"> (optional)</span>}</label>
    {children}
    <FieldError error={error} />
  </div>
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  ({ hasError, className = "", ...props }, ref) => (
    <input ref={ref} className={`rb-input ${hasError ? "rb-input--error" : ""} ${className}`} {...props} />
  )
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }> = ({ hasError, ...props }) => (
  <textarea className={`rb-textarea ${hasError ? "rb-input--error" : ""}`} {...props} />
);

const PasswordField: React.FC<{ label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string }> = (
  { label, value, onChange, error, placeholder }
) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error}>
      <div className="rb-pw-wrap">
        <Input type={show ? "text" : "password"} value={value} placeholder={placeholder || "Min 8 characters"}
          onChange={e => onChange(e.target.value)} hasError={!!error} autoComplete="new-password" />
        <button type="button" className="rb-pw-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
          <EyeIcon visible={show} />
        </button>
      </div>
    </Field>
  );
};

const TypeGrid: React.FC<{ types: { key: string; label: string; icon: string; desc: string }[]; selected: string; onSelect: (k: string) => void; error?: string }> = (
  { types, selected, onSelect, error }
) => (
  <div>
    {error && <FieldError error={error} />}
    <div className="rb-type-grid" role="listbox">
      {types.map(t => (
        <button key={t.key} type="button" role="option" aria-selected={selected === t.key}
          className={`rb-type-chip ${selected === t.key ? "rb-type-chip--selected" : ""}`}
          onClick={() => onSelect(t.key)}>
          <span className="rb-type-chip__icon" aria-hidden="true">
            <img src={t.icon} alt="" />
          </span>
          <span className="rb-type-chip__label">{t.label}</span>
          <span className="rb-type-chip__desc">{t.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

// ─── Photo Upload ─────────────────────────────────────────────────────────────
const PhotoUpload: React.FC<{ photo: File | null; error?: string; onPhotoChange: (f: File | null) => void }> = ({ photo, error, onPhotoChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    if (!f) { setPreview(null); onPhotoChange(null); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) { alert("Only JPG, PNG or WEBP images are allowed."); return; }
    if (f.size > 8 * 1024 * 1024) { alert("Image must be under 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    onPhotoChange(f);
  };

  return (
    <div
      className={`rb-photo-upload ${error ? "rb-photo-upload--error" : ""} ${photo ? "rb-photo-upload--has-photo" : ""}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0] || null); }}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
    >
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e => handleFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
      {preview ? (
        <div className="rb-photo-upload__preview">
          <img src={preview} alt="Business photo preview" />
          <button type="button" className="rb-photo-upload__remove"
            onClick={e => { e.stopPropagation(); handleFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
            ✕ Remove
          </button>
        </div>
      ) : (
        <div className="rb-photo-upload__placeholder">
          <div className="rb-photo-upload__icon">📷</div>
          <p className="rb-photo-upload__cta">Upload a photo of your business</p>
          <p className="rb-photo-upload__sub">Logo, storefront or interior · JPG, PNG, WEBP · max 8 MB</p>
        </div>
      )}
    </div>
  );
};

// ─── Shared field groups ──────────────────────────────────────────────────────
const AccountFields: React.FC<{ email: string; personalName: string; password: string; confirmPassword: string; errors: ValidationErrors; onChange: (k: string, v: string) => void }> = (
  { email, personalName, password, confirmPassword, errors, onChange }
) => (
  <>
    <div className="rb-field-row">
      <Field label="Your full name" error={errors.personalName}>
        <Input type="text" value={personalName} placeholder="e.g. Sarah Johnson" autoComplete="name"
          onChange={e => onChange("personalName", e.target.value)} hasError={!!errors.personalName} />
      </Field>
      <Field label="Email address" error={errors.email}>
        <Input type="email" value={email} placeholder="hello@yourbusiness.com" autoComplete="email"
          onChange={e => onChange("email", e.target.value)} hasError={!!errors.email} />
      </Field>
    </div>
    <div className="rb-field-row">
      <PasswordField label="Password" value={password} placeholder="Create a strong password"
        onChange={v => onChange("password", v)} error={errors.password} />
      <PasswordField label="Confirm password" value={confirmPassword} placeholder="Repeat your password"
        onChange={v => onChange("confirmPassword", v)} error={errors.confirmPassword} />
    </div>
  </>
);

const AddressFields: React.FC<{ address: string; postcode: string; errors: ValidationErrors; onChange: (k: string, v: string) => void }> = (
  { address, postcode, errors, onChange }
) => (
  <div className="rb-field-row">
    <Field label="Address" error={errors.address}>
      <Input type="text" value={address} placeholder="123 Dog Lane, London" autoComplete="street-address"
        onChange={e => onChange("address", e.target.value)} hasError={!!errors.address} />
    </Field>
    <Field label="Postcode" error={errors.postcode}>
      <Input type="text" value={postcode} placeholder="EC1A 1BB" autoComplete="postal-code"
        onChange={e => onChange("postcode", e.target.value.toUpperCase())} hasError={!!errors.postcode} />
    </Field>
  </div>
);

const ContactFields: React.FC<{ contactPhone: string; contactEmail: string; website: string; onChange: (k: string, v: string) => void; errors?: ValidationErrors }> = (
  { contactPhone, contactEmail, website, onChange, errors }
) => (
  <>
    <div className="rb-field-row">
      <Field label="Phone number" error={errors?.contactPhone}>
        <Input type="tel" value={contactPhone} placeholder="+44 7700 900000" autoComplete="tel"
          onChange={e => onChange("contactPhone", e.target.value)} hasError={!!errors?.contactPhone} />
      </Field>
      <Field label="Public contact email" error={errors?.contactEmail}>
        <Input type="email" value={contactEmail} placeholder="hello@yourbusiness.com"
          onChange={e => onChange("contactEmail", e.target.value)} hasError={!!errors?.contactEmail} />
      </Field>
    </div>
    <Field label="Website" optional>
      <Input type="url" value={website} placeholder="https://yourbusiness.com" autoComplete="url"
        onChange={e => onChange("website", e.target.value)} />
    </Field>
  </>
);

// ─── Service Step 1 ───────────────────────────────────────────────────────────
const ServiceStep1: React.FC<{
  data: ServiceFormData;
  errors: ValidationErrors;
  onChange: (k: keyof ServiceFormData, v: string) => void;
  onPhotoChange: (f: File | null) => void;
}> = ({ data, errors, onChange, onPhotoChange }) => (
  <div className="rb-form-section">
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Your Account</h3>
      <AccountFields email={data.email} personalName={data.personalName} password={data.password} confirmPassword={data.confirmPassword}
        errors={errors} onChange={(k, v) => onChange(k as keyof ServiceFormData, v)} />
    </div>
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Business Details</h3>
      <Field label="Business / practice name" error={errors.businessName}>
        <Input type="text" value={data.businessName} placeholder="e.g. Pawfect Grooms"
          onChange={e => onChange("businessName", e.target.value)} hasError={!!errors.businessName} />
      </Field>
      <div className="rb-field" style={{ marginTop: "1.5rem" }}>
        <label className="rb-label">Type of service</label>
        <TypeGrid types={SERVICE_TYPES} selected={data.serviceType} onSelect={v => onChange("serviceType", v)} error={errors.serviceType} />
        <a href="mailto:hello@barkbuddy.com?subject=New service type request" className="rb-not-listed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Not listed? Contact us — we can add it!
        </a>
      </div>
      <AddressFields address={data.address} postcode={data.postcode} errors={errors} onChange={(k, v) => onChange(k as keyof ServiceFormData, v)} />
      <Field label="Description" error={errors.description}>
        <Textarea rows={3} value={data.description}
          placeholder="Tell dog owners what you offer, what makes you special, and what to expect…"
          onChange={e => onChange("description", e.target.value)} hasError={!!errors.description} />
      </Field>
      <Field label="Business photo" error={errors.photo}>
        <PhotoUpload photo={data.photo} error={errors.photo} onPhotoChange={onPhotoChange} />
      </Field>
      <Field label="Price list" optional>
        <Textarea rows={4} value={data.priceList} placeholder="e.g. Full groom from £45 · Bath & blow-dry from £30"
          onChange={e => onChange("priceList", e.target.value)} />
      </Field>
      <Field label="Additional information" optional>
        <Textarea rows={3} value={data.additionalInfo} placeholder="Opening hours, special offers, what makes you unique..."
          onChange={e => onChange("additionalInfo", e.target.value)} />
      </Field>
    </div>
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Contact Details</h3>
      <ContactFields contactPhone={data.contactPhone} contactEmail={data.contactEmail}
        website={data.website} onChange={(k, v) => onChange(k as keyof ServiceFormData, v)} errors={errors} />
    </div>
  </div>
);

// ─── Activity Step 1 ──────────────────────────────────────────────────────────
const ActivityStep1: React.FC<{
  data: ActivityFormData;
  errors: ValidationErrors;
  onChange: (k: keyof ActivityFormData, v: string) => void;
  onPhotoChange: (f: File | null) => void;
}> = ({ data, errors, onChange, onPhotoChange }) => (
  <div className="rb-form-section">
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Your Account</h3>
      <AccountFields email={data.email} personalName={data.personalName} password={data.password} confirmPassword={data.confirmPassword}
        errors={errors} onChange={(k, v) => onChange(k as keyof ActivityFormData, v)} />
    </div>
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Venue Details</h3>
      <Field label="Venue / place name" error={errors.businessName}>
        <Input type="text" value={data.businessName} placeholder="e.g. The Barkery Café"
          onChange={e => onChange("businessName", e.target.value)} hasError={!!errors.businessName} />
      </Field>
      <div className="rb-field" style={{ marginTop: "1.5rem" }}>
        <label className="rb-label">Type of venue</label>
        <TypeGrid types={ACTIVITY_TYPES} selected={data.activityType} onSelect={v => onChange("activityType", v)} error={errors.activityType} />
      </div>
      <AddressFields address={data.address} postcode={data.postcode} errors={errors} onChange={(k, v) => onChange(k as keyof ActivityFormData, v)} />
      <Field label="Description" error={errors.description}>
        <Textarea rows={3} value={data.description}
          placeholder="Tell dog owners about your venue, what makes it special, and what to expect…"
          onChange={e => onChange("description", e.target.value)} hasError={!!errors.description} />
      </Field>
      <Field label="Venue photo" error={errors.photo}>
        <PhotoUpload photo={data.photo} error={errors.photo} onPhotoChange={onPhotoChange} />
      </Field>
    </div>
    <div className="rb-section-block">
      <h3 className="rb-section-heading">Contact Details</h3>
      <ContactFields contactPhone={data.contactPhone} contactEmail={data.contactEmail}
        website={data.website} onChange={(k, v) => onChange(k as keyof ActivityFormData, v)} errors={errors} />
    </div>
  </div>
);

// ─── Activity Step 2 ──────────────────────────────────────────────────────────
const ActivityStep2: React.FC<{ data: ActivityFormData; errors: ValidationErrors; onFileChange: (f: File | null) => void }> = ({ data, errors, onFileChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) onFileChange(f);
  }, [onFileChange]);

  return (
    <div className="rb-form-section">
      <div className="rb-doc-banner">
        <span className="rb-doc-banner__icon" aria-hidden="true">🐾</span>
        <div>
          <h3 className="rb-doc-banner__title">Prove you're dog-friendly!</h3>
          <p className="rb-doc-banner__text">To keep BarkBuddy trustworthy, we need proof your venue genuinely welcomes dogs.</p>
        </div>
      </div>
      <div className="rb-doc-examples">
        <p className="rb-doc-examples__title">Accepted documents:</p>
        <ul>
          <li>📄 PDF or image of your dog-friendly policy</li>
          <li>🪧 Photo of your "Dogs Welcome" sign at the entrance</li>
          <li>🍽️ Screenshot of your menu noting dogs are welcome</li>
          <li>📋 Any official statement or certificate</li>
        </ul>
      </div>
      <div
        className={`rb-upload-zone ${dragOver ? "rb-upload-zone--drag" : ""} ${data.document ? "rb-upload-zone--has-file" : ""} ${errors.document ? "rb-upload-zone--error" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
        onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => onFileChange(e.target.files?.[0] || null)} style={{ display: "none" }} />
        {data.document ? (
          <div className="rb-upload-zone__success">
            <span aria-hidden="true" style={{ fontSize: "1.5rem" }}>✅</span>
            <div>
              <p className="rb-upload-zone__filename">{data.document.name}</p>
              <p className="rb-upload-zone__filesize">{(data.document.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" className="rb-upload-zone__remove" onClick={e => { e.stopPropagation(); onFileChange(null); }}>Remove</button>
          </div>
        ) : (
          <div className="rb-upload-zone__placeholder">
            <div className="rb-upload-zone__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p className="rb-upload-zone__cta">Drop your document here</p>
            <p className="rb-upload-zone__sub">or click to browse · PDF, JPG, PNG, WEBP · max 10 MB</p>
          </div>
        )}
      </div>
      {errors.document && <FieldError error={errors.document} />}
      <div className="rb-verify-flow" role="list">
        {[
          { n: 1, text: "You submit your document now" },
          { n: 2, text: <span>Our team reviews it within <strong>72 hours</strong></span> },
          { n: 3, text: "You get an email — approved or next steps" },
        ].map((s, i, arr) => (
          <React.Fragment key={s.n}>
            <div className="rb-verify-step" role="listitem">
              <span className="rb-verify-step__num" aria-hidden="true">{s.n}</span>
              <p>{s.text}</p>
            </div>
            {i < arr.length - 1 && <span className="rb-verify-step__arrow" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="rb-no-doc-note" role="note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
        <p>Without proof we can't list your venue. Questions? <a href="mailto:hello@barkbuddy.com">hello@barkbuddy.com</a></p>
      </div>
    </div>
  );
};

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateService(d: ServiceFormData): ValidationErrors {
  const e: ValidationErrors = {};
  if (!d.personalName.trim())  e.personalName  = "Name is required";
  if (!d.email.trim())         e.email         = "Email is required";
  else if (!EMAIL_RE.test(d.email)) e.email    = "Enter a valid email";
  if (!d.password)             e.password      = "Password is required";
  else if (d.password.length < 8) e.password   = "Must be at least 8 characters";
  if (!d.confirmPassword)      e.confirmPassword = "Please confirm your password";
  else if (d.password !== d.confirmPassword) e.confirmPassword = "Passwords don't match";
  if (!d.businessName.trim())  e.businessName  = "Business name is required";
  if (!d.serviceType)          e.serviceType   = "Please select a service type";
  if (!d.address.trim())       e.address       = "Address is required";
  if (!d.postcode.trim())      e.postcode      = "Postcode is required";
  if (!d.description.trim())   e.description   = "Please add a description";
  if (!d.contactPhone.trim())  e.contactPhone  = "Phone number is required";
  if (!d.contactEmail.trim())  e.contactEmail  = "Contact email is required";
  else if (!EMAIL_RE.test(d.contactEmail)) e.contactEmail = "Enter a valid contact email";
  if (!d.photo)                e.photo         = "Please upload a photo of your business";
  return e;
}

function validateActivity1(d: ActivityFormData): ValidationErrors {
  const e: ValidationErrors = {};
  if (!d.personalName.trim())  e.personalName  = "Name is required";
  if (!d.email.trim())         e.email         = "Email is required";
  else if (!EMAIL_RE.test(d.email)) e.email    = "Enter a valid email";
  if (!d.password)             e.password      = "Password is required";
  else if (d.password.length < 8) e.password   = "Must be at least 8 characters";
  if (!d.confirmPassword)      e.confirmPassword = "Please confirm your password";
  else if (d.password !== d.confirmPassword) e.confirmPassword = "Passwords don't match";
  if (!d.businessName.trim())  e.businessName  = "Venue name is required";
  if (!d.activityType)         e.activityType  = "Please select a venue type";
  if (!d.address.trim())       e.address       = "Address is required";
  if (!d.postcode.trim())      e.postcode      = "Postcode is required";
  if (!d.description.trim())   e.description   = "Please add a description";
  if (!d.contactPhone.trim())  e.contactPhone  = "Phone number is required";
  if (!d.contactEmail.trim())  e.contactEmail  = "Contact email is required";
  else if (!EMAIL_RE.test(d.contactEmail)) e.contactEmail = "Enter a valid contact email";
  if (!d.photo)                e.photo         = "Please upload a photo of your venue";
  return e;
}

//  Success 
const SuccessScreen: React.FC<{ category: BusinessCategory; businessName: string }> = ({ category, businessName }) => (
  <div className="rb-success">
    <span className="rb-success__icon" aria-hidden="true"><img src="../../images/icons/success.png" alt="Success Picture" /></span>
    <h2 className="rb-success__title">{category === "services" ? "You're registered!" : "Application submitted!"}</h2>
    <p className="rb-success__text">
      {category === "services"
        ? `Welcome, ${businessName}! Please check your email to verify your account so we can begin reviewing your details. The review process takes up to 24 hours. Once approved, you'll receive your login details to access and manage your dashboard. We’ll contact you if we need any additional information.`
        : `Thank you for applying, ${businessName}! Please check your email to verify your submission so we can begin reviewing your details. The review process takes up to 72 hours. You’ll receive an email with the outcome once the review is complete. We’ll be in touch if we need any additional information.`}
    </p>
    <Link to="/" className="rb-success__btn">↩ Back to BarkBuddy</Link>
  </div>
);

// Main Page 
const RegisterBusinessPage: React.FC = () => {
  const [category, setCategory] = useState<BusinessCategory>("");
  const [step,     setStep]     = useState(0);
  const [errors,   setErrors]   = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const [serviceData, setServiceData] = useState<ServiceFormData>({
    email: "", personalName: "", password: "", confirmPassword: "",
    businessName: "", serviceType: "", address: "", postcode: "",
    description: "", priceList: "", additionalInfo: "",
    contactPhone: "", contactEmail: "", website: "",
    photo: null,
  });

  const [activityData, setActivityData] = useState<ActivityFormData>({
    email: "", personalName: "", password: "", confirmPassword: "",
    businessName: "", activityType: "", address: "", postcode: "",
    description: "", contactPhone: "", contactEmail: "", website: "",
    document: null, photo: null,
  });

  // Refs always hold the latest data so handleNext never validates stale state
  const serviceDataRef  = useRef(serviceData);
  const activityDataRef = useRef(activityData);
  serviceDataRef.current  = serviceData;
  activityDataRef.current = activityData;

  // String fields patch
  const patchService = (k: keyof ServiceFormData, v: string) => {
    setServiceData(p => ({ ...p, [k]: v }));
    setErrors(p => { const e = { ...p }; delete e[k]; return e; });
  };
  const patchActivity = (k: keyof ActivityFormData, v: string) => {
    setActivityData(p => ({ ...p, [k]: v }));
    setErrors(p => { const e = { ...p }; delete e[k]; return e; });
  };

  // File patches — separate so File objects never go through string patchers
  const patchServicePhoto = (f: File | null) => {
    setServiceData(p => ({ ...p, photo: f }));
    setErrors(p => { const e = { ...p }; delete e.photo; return e; });
  };
  const patchActivityPhoto = (f: File | null) => {
    setActivityData(p => ({ ...p, photo: f }));
    setErrors(p => { const e = { ...p }; delete e.photo; return e; });
  };
  const patchFile = (file: File | null) => {
    setActivityData(p => ({ ...p, document: file }));
    setErrors(p => { const e = { ...p }; delete e.document; return e; });
  };

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitService = async () => {
    setLoading(true); setApiError("");
    try {
      const form = new FormData();
      // Append all string fields
      (Object.keys(serviceData) as (keyof ServiceFormData)[]).forEach(k => {
        if (k === "photo") return; // handled separately
        const v = serviceData[k];
        if (v !== null && v !== undefined) form.append(k, v as string);
      });
      // Append photo file
      if (serviceData.photo) form.append("photo", serviceData.photo);

      const res  = await fetch(`${API_BASE}/business/register/service`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors); scrollToTop(); return; }
        throw new Error(data.message);
      }
      setDone(true);
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please try again.");
      scrollToTop();
    } finally { setLoading(false); }
  };

  const checkEmailAvailable = async (email: string): Promise<boolean> => {
    try {
      const res  = await fetch(`${API_BASE}/business/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.available === true;
    } catch { return true; }
  };

  const submitActivity = async () => {
    if (!activityData.document) { setErrors({ document: "Please upload a document proving your venue is dog-friendly" }); return; }
    setLoading(true); setApiError("");
    try {
      const form = new FormData();
      // Append all string fields
      (Object.keys(activityData) as (keyof ActivityFormData)[]).forEach(k => {
        if (k === "document" || k === "photo") return; // handled separately
        const v = activityData[k];
        if (v !== null && v !== undefined) form.append(k, v as string);
      });
      if (activityData.document) form.append("document", activityData.document);
      if (activityData.photo)    form.append("photo",    activityData.photo);

      const res  = await fetch(`${API_BASE}/business/register/activity`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors); scrollToTop(); return; }
        throw new Error(data.message);
      }
      setDone(true);
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please try again.");
      scrollToTop();
    } finally { setLoading(false); }
  };

  const handleNext = async () => {
    setApiError("");

    if (category === "services" && step === 1) {
      const errs = validateService(serviceDataRef.current);
      if (Object.keys(errs).length) { setErrors(errs); scrollToTop(); return; }
      submitService();
      return;
    }

    if (category === "activities" && step === 1) {
      const errs = validateActivity1(activityDataRef.current);
      if (Object.keys(errs).length) { setErrors(errs); scrollToTop(); return; }
      setLoading(true);
      const available = await checkEmailAvailable(activityDataRef.current.email);
      setLoading(false);
      if (!available) {
        setErrors({ email: "An account with this email already exists. Please log in or use a different email." });
        scrollToTop();
        return;
      }
      setErrors({});
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (category === "activities" && step === 2) {
      if (!activityData.document) { setErrors({ document: "Please upload a document proving your venue is dog-friendly" }); return; }
      submitActivity();
    }
  };

  const stepLabels   = category === "services" ? ["Your Details"] : ["Your Details", "Dog-Friendly Proof"];
  const businessName = category === "services" ? serviceData.businessName : activityData.businessName;

  if (done) return (
    <div className="rb-page"><SuccessScreen category={category} businessName={businessName} /></div>
  );

  return (
    <div className="rb-page">
      {step === 0 && (
        <div className="rb-hero">
          <div className="rb-hero__left">
            <div className="rb-hero__copy">
              <h1 className="rb-hero__title">
                Grow your<br /><em>dog-friendly</em><br />business
              </h1>
              <p className="rb-hero__sub">
                Join thousands of venues and service providers already connecting with dog owners across the UK.
              </p>
            </div>
            <Link to="/" className="biz-login__home-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Back to BarkBuddy</Link>
          </div>
          <div className="rb-hero__right">
            <h2 className="rb-hero__right-heading">
              What type of business<br />do you want to register?
            </h2>
            <div className="rb-cat-grid">
              {[
                { cat: "activities" as BusinessCategory, icon: "/images/paint/dog-friendly.png", title: "Activities & Venues", desc: "Hotels, cafés, restaurants, parks, beaches — places where dogs are welcome", tags: ["Hotel","Café","Restaurant","Park","+more"] },
                { cat: "services"   as BusinessCategory, icon: "/images/paint/services.png",     title: "Services",            desc: "Groomers, vets, trainers, behaviourists — professionals who care for dogs",  tags: ["Groomer","Vet","Trainer","Walker","+more"] },
              ].map(c => (
                <button key={c.cat} className={`rb-cat-card rb-cat-card--${c.cat}`}
                  onClick={() => { setCategory(c.cat); setStep(1); }} aria-label={`Register as ${c.title}`}>
                  <div className="rb-cat-card__icon" aria-hidden="true"><img src={c.icon} alt="" /></div>
                  <div className="rb-cat-card__body">
                    <h3 className="rb-cat-card__title">{c.title}</h3>
                    <p className="rb-cat-card__desc">{c.desc}</p>
                    <div className="rb-cat-card__tags" aria-hidden="true">{c.tags.map(t => <span key={t}>{t}</span>)}</div>
                  </div>
                  <div className="rb-cat-card__arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </button>
              ))}
            </div>
            <div className="rb-hero__login">
              <p>Already have a business account?</p>
              <Link to="/business/login" className="rb-hero__login-btn">Sign in here</Link>
            </div>
          </div>
        </div>
      )}

      {step > 0 && (
        <div className="rb-layout">
          <aside className="rb-sidebar" aria-label="Registration progress">
            <div className="rb-sidebar__inner">
              <div className="rb-sidebar__category">
                <div className="rb-sidebar__cat-img">
                  <img src={category === "services" ? "/images/paint/services.png" : "/images/paint/dog-friendly.png"} alt="" aria-hidden="true" />
                </div>
                <div>
                  <p className="rb-sidebar__cat-label">Registering as</p>
                  <p className="rb-sidebar__cat-name">{category === "services" ? "Service Provider" : "Activity / Venue"}</p>
                </div>
              </div>
              <StepIndicator current={step} total={stepLabels.length} labels={stepLabels} />
              <div className="rb-sidebar__perks">
                <p className="rb-sidebar__perks-title">What you get</p>
                <ul role="list">
                  {[
                    { icon: "/images/paint/directory.png", text: "Listed on BarkBuddy's directory" },
                    { icon: "/images/paint/dog-owners.png", text: "Reach thousands of dog owners"  },
                    { icon: "/images/paint/reviews.png",   text: "Community reviews & ratings"     },
                    { icon: "/images/paint/enquiries.png", text: "Direct booking enquiries"        },
                    { icon: "/images/paint/free.png",      text: "Always free to list"             },
                  ].map(({ icon, text }) => (
                    <li key={text}>
                      <span className="rb-sidebar__perk-icon" aria-hidden="true"><img src={icon} alt="" /></span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rb-sidebar__footer">
                <button className="rb-sidebar__change" onClick={() => { setStep(0); setCategory(""); setErrors({}); setApiError(""); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                  Change category
                </button>
                <p className="rb-sidebar__help">Questions? <a href="mailto:hello@barkbuddy.com">paws@barkbuddy.co.uk</a></p>
              </div>
            </div>
          </aside>

          <main className="rb-main" ref={mainRef}>
            <div className="rb-main__inner">
              <div className="rb-main__header">
                <h1 className="rb-main__title">
                  {step === 1 ? (category === "services" ? "Tell us about your service" : "Tell us about your venue") : "Verify your dog-friendly status"}
                </h1>
                <p className="rb-main__sub">
                  {step === 1 ? "Fill in your details below — you can always update them from your dashboard later." : "One last step! We need to confirm your venue genuinely welcomes dogs."}
                </p>
              </div>

              {category === "services"   && step === 1 && (
                <ServiceStep1  data={serviceData}  errors={errors} onChange={patchService}  onPhotoChange={patchServicePhoto} />
              )}
              {category === "activities" && step === 1 && (
                <ActivityStep1 data={activityData} errors={errors} onChange={patchActivity} onPhotoChange={patchActivityPhoto} />
              )}
              {category === "activities" && step === 2 && (
                <ActivityStep2 data={activityData} errors={errors} onFileChange={patchFile} />
              )}

              {apiError && (
                <div className="rb-api-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
                  {apiError}
                </div>
              )}

              <div className="rb-form-actions">
                {step > 1 && (
                  <button className="rb-btn-back" onClick={() => { setStep(s => s - 1); setErrors({}); setApiError(""); }} type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                    Back
                  </button>
                )}
                <button className={`rb-btn-next ${loading ? "rb-btn-next--loading" : ""}`} onClick={handleNext} disabled={loading} type="button" aria-busy={loading}>
                  {loading
                    ? <><span className="rb-spinner" aria-hidden="true" />Processing…</>
                    : <>{category === "services" && step === 1 ? "Create Account" : category === "activities" && step === 2 ? "Submit Application" : "Continue"}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                      </>
                  }
                </button>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default RegisterBusinessPage;