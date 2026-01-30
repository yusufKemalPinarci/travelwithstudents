import React, { useState } from 'react';
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import InputField from '../components/InputField';

export default function Contact() {
  const [form, setForm] = useState({
      name: '',
      email: '',
      subject: '',
      message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle submit logic
      console.log('Form submitted:', form);
      alert('Message sent! We will get back to you shortly.');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
         
         {/* Left Side: Contact Info */}
         <div className="space-y-8">
             <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get in touch</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Have questions about specific tours, safety, or joining as a student guide? We're here to help.
                </p>
             </div>

             <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                        <EnvelopeIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Chat to support</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">We usually respond within 24 hours.</p>
                        <a href="mailto:support@travelwithstudent.com" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            support@travelwithstudent.com
                        </a>
                    </div>
                 </div>

                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                        <MapPinIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Visit us</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Come say hello at our office HQ.</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                            University Technopark<br/>
                            Istanbul, Turkey
                        </p>
                    </div>
                 </div>
                 
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                        <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Call us</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Mon-Fri from 8am to 5pm.</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">+90 (212) 555-0123</p>
                    </div>
                 </div>
             </div>
         </div>

         {/* Right Side: Contact Form */}
         <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-slate-100">
             <form onSubmit={handleSubmit} className="space-y-5">
                 <InputField 
                    id="name"
                    label="Name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                 />
                 <InputField 
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                 />
                 <InputField 
                    id="subject"
                    label="Subject"
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm({...form, subject: e.target.value})}
                 />
                 
                 <div>
                    <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-1">
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Tell us a little about your inquiry..."
                        value={form.message}
                        onChange={(e) => setForm({...form, message: e.target.value})}
                    />
                 </div>

                 <Button type="submit" fullWidth size="lg">Send Message</Button>
             </form>
         </div>

      </div>
    </div>
  );
}
