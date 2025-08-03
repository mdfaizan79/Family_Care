import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Family Care Hospital</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Comprehensive, compassionate care for your entire family</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/book-appointment" className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition duration-300 shadow-lg font-medium text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </Link>
              <Link to="/doctors" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition duration-300 shadow-lg font-medium text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Our Doctors
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Our Specialized Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: "Cardiology",
                description: "State-of-the-art cardiac care with advanced diagnostics and treatment options for heart conditions."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Neurology",
                description: "Expert neurological care for disorders of the brain, spine, and nervous system with personalized treatment plans."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Pediatrics",
                description: "Comprehensive healthcare for infants, children, and adolescents in a child-friendly environment."
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-center">
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
                <Link to="/departments" className="mt-4 text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/departments" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md font-medium">
              View All Departments
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-12 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 bg-red-600 md:w-48 flex items-center justify-center py-6 md:py-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-red-600 font-semibold">24/7 Emergency Services</div>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Immediate Medical Attention</h2>
                <p className="mt-3 text-gray-600">Our emergency department is equipped to handle all medical emergencies with rapid response teams available round-the-clock.</p>
                <div className="mt-4">
                  <div className="flex items-center text-red-600 font-bold text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Emergency Hotline: +91-12345-67890
                  </div>
                  <div className="mt-4 flex gap-4">
                    <a href="tel:+911234567890" className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Now
                    </a>
                    <Link to="/contact" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Get Directions
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">What Our Patients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The doctors at Family Care Hospital were incredibly attentive and professional. I felt well cared for throughout my treatment.",
                name: "Priya Sharma",
                role: "Patient"
              },
              {
                quote: "The online appointment booking system is so convenient. I was able to schedule my visit quickly and the staff was ready when I arrived.",
                name: "Rahul Verma",
                role: "Patient"
              },
              {
                quote: "I've been bringing my family here for years. The pediatric department is exceptional with children and makes them feel comfortable.",
                name: "Anita Patel",
                role: "Parent"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Family Care Hospital</h3>
              <p className="text-blue-200">Providing comprehensive healthcare services with compassion and excellence.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/departments" className="text-blue-200 hover:text-white transition">Departments</Link></li>
                <li><Link to="/doctors" className="text-blue-200 hover:text-white transition">Doctors</Link></li>
                <li><Link to="/book-appointment" className="text-blue-200 hover:text-white transition">Appointments</Link></li>
                <li><Link to="/contact" className="text-blue-200 hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="text-blue-200 not-italic">
                <p>123 Healthcare Avenue</p>
                <p>New Delhi, India 110001</p>
                <p className="mt-2">Email: info@familycare.com</p>
                <p>Phone: +91-12345-67890</p>
              </address>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Working Hours</h4>
              <ul className="text-blue-200 space-y-1">
                <li>Monday - Friday: 8:00 AM - 8:00 PM</li>
                <li>Saturday: 8:00 AM - 5:00 PM</li>
                <li>Sunday: 10:00 AM - 2:00 PM</li>
                <li className="font-semibold text-white mt-2">Emergency: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-6 text-center text-blue-300">
            <p>&copy; {new Date().getFullYear()} Family Care Hospital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
