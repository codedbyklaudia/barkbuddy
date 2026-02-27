import React, { useState } from "react";
import "./Contact.scss";

// Types 
type FormState = {
  name:    string;
  email:   string;
  subject: string;
  message: string;
};

type Status = "idle" | "sending" | "success" | "error";

const SUBJECTS = [
  "General question",
  "Dog care tips",
  "Business listing",
  "Bug or technical issue",
  "Partnership or collaboration",
  "Other",
];

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// Icons 
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    width="20" height="20" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    width="48" height="48" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="8 12 11 15 16 9"/>
  </svg>
);

// Component 
const Contact: React.FC = () => {
  const [form, setForm]     = useState<FormState>({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError]   = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const validate = (): string => {
    if (!form.name.trim())                        return "Please enter your name.";
    if (!form.email.trim())                       return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.message.trim())                     return "Please write your message.";
    if (form.message.trim().length < 10)          return "Message is too short — please give us a bit more detail.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setStatus("sending");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Something went wrong. Please try emailing us directly.");
        setStatus("error");
      }
    } catch {
      setError("Could not reach the server. Please email us directly at website.barkbuddy@gmail.com");
      setStatus("error");
    }
  };

  return (
    <div className="contact-page">

      {/*  Left panel  */}
      <aside className="contact-panel contact-panel--dark">
        <div className="contact-panel__inner">

          <div className="contact-panel__eyebrow">Get in touch</div>

          <h1 className="contact-panel__title">
            We'd love<br />to hear<br /><em>from you</em>
          </h1>

          <p className="contact-panel__sub">
            Whether it's a question, a suggestion, or just a hello from you
            and your bark buddy - we read every message!
          </p>

          {/* Direct email */}
          <a href="mailto:website.barkbuddy@gmail.com" className="contact-email-link">
            <span className="contact-email-link__icon"><MailIcon /></span>
            <span className="contact-email-link__text">website.barkbuddy@gmail.com</span>
          </a>
        

          {/* Response time note */}
          <div className="contact-panel__note">
            <div className="contact-panel__note-dot" />
            <span>We typically reply within 48 hours</span>
          </div>

          {/* Social Media */}
          <div className="contact-socialmedia">
            <p className="contact-socialmedia-para">You can also reach us on social media!</p>
            <div className="contact-socialmedia-icons">
            <a href="#" className="contact-social-link" aria-label="TikTok">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#B79EBE">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a href="#" className="contact-social-link" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#B79EBE">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="contact-social-link" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#B79EBE">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Right panel form  */}
      <main className="contact-panel contact-panel--light">
        <div className="contact-panel__inner">

          {status === "success" ? (

            /*  Success state  */
            <div className="contact-success">
              <div className="contact-success__icon">
                <CheckIcon />
              </div>
              <h2 className="contact-success__title">Message sent!</h2>
              <p className="contact-success__body">
                Thank you for reaching out. We'll get back to you within 48 hours.
              </p>
              <button
                className="contact-success__reset"
                onClick={() => {
                  setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
                  setStatus("idle");
                }}
              >
                Send another message
              </button>
            </div>

          ) : (

            /* Form  */
            <>
              <div className="contact-form-header">
                <h2 className="contact-form-header__title">Send us a message</h2>
                <p className="contact-form-header__sub">
                  Fill in the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {error && (
                <div className="contact-error" role="alert">
                  {error}
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit} noValidate>

                {/* Name + Email row */}
                <div className="contact-form__row">
                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="cf-name">
                      Your name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      className="contact-field__input"
                      placeholder="Klaudia"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label className="contact-field__label" htmlFor="cf-email">
                      Email address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      className="contact-field__input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                

                {/* Subject */}
                <div className="contact-field">
                  <label className="contact-field__label" htmlFor="cf-subject">
                    Subject
                  </label>
                  <div className="contact-field__select-wrap">
                    <select
                      id="cf-subject"
                      name="subject"
                      className="contact-field__select"
                      value={form.subject}
                      onChange={handleChange}
                    >
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <svg className="contact-field__select-arrow" viewBox="0 0 12 12" fill="currentColor" width="12" height="12" aria-hidden="true">
                      <path d="M6 8L2 4h8L6 8z"/>
                    </svg>
                  </div>
                </div>
                </div>

                {/* Message */}
                <div className="contact-field">
                  <label className="contact-field__label" htmlFor="cf-message">
                    Message <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="cf-message"
                    name="message"
                    className="contact-field__textarea"
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                  <span className="contact-field__count">
                    {form.message.length} characters
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="contact-submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <span className="contact-submit__spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </>
                  )}
                </button>

                <p className="contact-form__privacy">
                  Your message is sent directly to our inbox. We never share your details.
                </p>

              </form>
            </>
          )}

        </div>
      </main>

    </div>
  );
};

export default Contact;