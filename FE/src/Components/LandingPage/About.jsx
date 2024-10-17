import React from 'react';
import { useSpring, animated } from '@react-spring/web';

function About() {
  // Create a spring animation for opacity
  const props = useSpring({
    from: { opacity: 0 }, // Start with opacity 0
    to: { opacity: 1 }, // End with opacity 1
    config: { duration: 500 }, // Duration of the animation
  });

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col items-center">
      <animated.div
        style={props}
        className="relative overflow-hidden text-black rounded-lg sm:mx-16 mx-2 sm:py-16 flex flex-col-reverse lg:flex-col items-start justify-center"
      >
        <img
          src="https://tailus.io/sources/blocks/left-image/preview/images/startup.png"
          alt="Kaam platform"
          className="w-full lg:w-1/2 lg:mx-auto lg:mb-8 lg:mt-0 sm:order-1 mb-8 lg:mb-0 sm:mr-8 lg:mr-0" // Responsive image placement
        />

        <div className="relative z-10 max-w-screen-xl px-4 pb-20 pt-10 sm:py-24 mx-auto sm:px-6 lg:px-8 text-left lg:text-center"> 
          <h2 className="text-3xl font-bold mb-4">
            Welcome to <strong>Kaam</strong>, your all-in-one destination for seamless job searching and recruitment!
          </h2>
          <p className="text-lg mb-8">
            We are committed to transforming the way job seekers and employers connect by leveraging cutting-edge technology to simplify the hiring process.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-4">Our platform is designed to:</h3>
          <ul className="list-disc list-inside space-y-4 text-lg">
            <li><strong>Empower Job Seekers:</strong> We provide a personalized job search experience, allowing users to upload resumes and receive recommendations for job opportunities based on their unique skills. By integrating with industry-leading services like Adzuna and our own jobs, we ensure you have access to a wide range of opportunities tailored to your qualifications.</li>
            <li><strong>Intelligent Skill Matching:</strong> Our platform extracts key skills from your resume and matches them with relevant job listings, streamlining your search for the perfect position.</li>
            <li><strong>AI-Powered Assistance:</strong> To help you stand out, our built-in AI chatbot generates personalized cover letters tailored to specific job applications, ensuring your application is not just another generic submission.</li>
            <li><strong>Comprehensive Employer Tools:</strong> Employers can easily post, edit, and manage job listings while benefiting from a targeted talent pool of candidates whose skills align with their needs.</li>
            <li><strong>Feedback and Continuous Improvement:</strong> Your experience matters to us. That’s why we have a dedicated Feedback Page where you can share your suggestions, helping us continuously improve the platform for all users.</li>
          </ul>

          <p className="mt-6 mb-8">
            At <strong>Kaam</strong>, we aim to make the job search process more efficient, personalized, and less stressful. Whether you’re seeking your dream job or the perfect candidate, our platform is here to help you every step of the way. Join us today and take your job search or recruitment efforts to the next level!
          </p>
        </div>
      </animated.div>
    </div>
  );
}

export default About