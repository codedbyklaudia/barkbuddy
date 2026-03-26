import React, { useState } from "react";
import { MailOpen,ChevronsRight} from "lucide-react";
import { Link } from "react-router-dom";
import "./Contact.scss";
import Footer from "./Footer";

// Types
type FormState = { name: string; email: string; subject: string; message: string };
type Status    = "idle" | "sending" | "success" | "error";

const SUBJECTS = [
  "General question", "Dog care tips", "Business listing",
  "Bug or technical issue", "Partnership or collaboration", "Other",
];

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// Icons 
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    width="52" height="52" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    width="16" height="16" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

// Component 
const Contact: React.FC = () => {
  const [form, setForm]     = useState<FormState>({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError]   = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const validate = (): string => {
    if (!form.name.trim())                               return "Please enter your name.";
    if (!form.email.trim())                              return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.message.trim())                            return "Please write your message.";
    if (form.message.trim().length < 10)                 return "Message is too short — please give us a bit more detail.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setStatus("sending"); setError("");
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus("success"); }
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Something went wrong. Please try emailing us directly.");
        setStatus("error");
      }
    } catch {
      setError("Could not reach the server. Please email us directly at paws@barkbuddy.co.uk");
      setStatus("error");
    }
  };

  return (
    <div className="contact-page">

      {/* Hero  */}
      <section className="contact-hero">

        <div className="contact-hero__left">
          <div className="contact-hero__heading-block">

            <p className="contact-hero__eyebrow">Contact us</p>

            <h1 className="contact-hero__title">
              We'd love to <br/>hear<em> from you</em>
            </h1>

            <p className="contact-hero__sub">
              Whether it's a question, a suggestion, or just a hello from
              you and your bark buddy - we read every message!
            </p>

            <div className="contact-hero__ctas">
              <a href="#contact-form" className="contact-hero__cta contact-hero__cta--primary">
                Send a message <ChevronsRight />
              </a>
              <a href="mailto:paws@barkbuddy.org.uk" className="contact-hero__cta contact-hero__cta--ghost">
                paws@barkbuddy.org.uk
              </a>
            </div>

          </div>
        </div>

        <div className="contact-hero__right" aria-hidden="true">
          <img src="../images/Illustrations/Contact-Us.png" alt="Contact Us Dog Picture" className="contact-hero__image" />
        </div>

        <svg className="contact-hero__wave" viewBox="0 0 1440 72"
          preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0,72 L0,36 Q360,0 720,36 Q1080,72 1440,36 L1440,72 Z" fill="#F8F6F4"/>
        </svg>

      </section>

      {/* Form + sidebar */}
      <div className="contact-body" id="contact-form">
        <div className="contact-body__inner">

          {/* Form card */}
          <div className="contact-form-card">
            {status === "success" ? (
              <div className="contact-success">
                <div className="contact-success__icon"><CheckIcon /></div>
                <h2 className="contact-success__title">Message sent!</h2>
                <p className="contact-success__body">
                  Thank you for reaching out. We'll get back to you within 48 hours.
                </p>
                <button className="contact-success__reset"
                  onClick={() => { setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); setStatus("idle"); }}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="contact-form-header">
                  <h2 className="contact-form-header__title">Send us a message</h2>
                  <p className="contact-form-header__sub">
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                {error && <div className="contact-error" role="alert">{error}</div>}

                <form className="contact-form" onSubmit={handleSubmit} noValidate>

                  <div className="contact-form__row">
                    <div className="contact-field">
                      <label className="contact-field__label" htmlFor="cf-name">
                        Your name <span aria-hidden="true">*</span>
                      </label>
                      <input id="cf-name" name="name" type="text"
                        className="contact-field__input" placeholder="Name"
                        value={form.name} onChange={handleChange} autoComplete="name" required />
                    </div>
                    <div className="contact-field">
                      <label className="contact-field__label" htmlFor="cf-email">
                        Email address <span aria-hidden="true">*</span>
                      </label>
                      <input id="cf-email" name="email" type="email"
                        className="contact-field__input" placeholder="you@example.com"
                        value={form.email} onChange={handleChange} autoComplete="email" required />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="cf-subject">Subject</label>
                    <div className="contact-field__select-wrap">
                      <select id="cf-subject" name="subject" className="contact-field__select"
                        value={form.subject} onChange={handleChange}>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <svg className="contact-field__select-arrow" viewBox="0 0 12 12"
                        fill="currentColor" width="12" height="12" aria-hidden="true">
                        <path d="M6 8L2 4h8L6 8z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="cf-message">
                      Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea id="cf-message" name="message" className="contact-field__textarea"
                      placeholder="Tell us what's on your mind…"
                      value={form.message} onChange={handleChange} rows={6} required />
                    <span className="contact-field__count">{form.message.length} characters</span>
                  </div>

                  <div className="contact-form__footer">
                    <button type="submit" className="contact-submit" disabled={status === "sending"}>
                      {status === "sending" ? (
                        <><span className="contact-submit__spinner" aria-hidden="true" />Sending…</>
                      ) : (
                        <>Send message <SendIcon /></>
                      )}
                    </button>
                    <p className="contact-form__privacy">
                      Your message is sent directly to our inbox. We never share your details.
                    </p>
                  </div>

                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="contact-sidebar">

            {/* Dark card — email + response time */}
            <div className="contact-sidebar__card contact-sidebar__card--dark">
              <p className="contact-sidebar__label">Get in touch</p>
              <h3 className="contact-sidebar__title">Prefer to email us directly?</h3>
              <p className="contact-sidebar__body">
                Drop us a message anytime - we read everything and reply within 48 hours.
              </p>
              <a href="mailto:paws@barkbuddy.org.uk" className="contact-sidebar__email-link">
                <MailOpen size={15} />
                paws@barkbuddy.org.uk
              </a>
              <div className="contact-sidebar__note">
                <span className="contact-sidebar__dot" />
                <span>We typically reply within 48 hours</span>
              </div>
            </div>

            {/* Social media card */}
            <div className="contact-sidebar__card">
              <p className="contact-sidebar__label">Follow us</p>
              <h3 className="contact-sidebar__title">Stay in touch on social</h3>
              <p className="contact-sidebar__body--light">
                Follow BarkBuddy for tips, updates and funny content.
              </p>
              <div className="contact-sidebar__socials">
                <a href="https://www.tiktok.com/@bark.buddy.uk" aria-label="TikTok" className="contact-social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
                <a href="https://www.instagram.com/barkbuddy.uk" aria-label="Instagram" className="contact-social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61575431181164" className="contact-social-btn" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;