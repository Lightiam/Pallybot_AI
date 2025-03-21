import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, Clock, Briefcase, BarChart as ChartBar, Users, BookOpen, Code, GraduationCap, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState('Software Engineer');
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/training');
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4 mr-2" />
            AI-Powered Skill Development
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Accelerate Your
            <br />
            <span className="text-purple-600">Technical Growth</span>
            <br />
            Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Level up your technical skills with personalized AI guidance. Master new technologies, 
            receive expert feedback, and track your progress with our comprehensive learning platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={handleStartLearning}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg shadow-lg shadow-purple-200">
              Start Learning
            </button>
            <Link to="/training" className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-lg border-2 border-purple-200">
              Explore Paths
            </Link>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold mb-4">Choose Your Path</h3>
              <div className="space-y-2">
                {['Software Engineering', 'Data Science', 'DevOps', 'Cloud Architecture'].map((job) => (
                  <button
                    key={job}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedJob === job
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Skill Assessment</h3>
                  <span className="text-sm text-purple-600">AI-powered evaluation</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-gray-800">
                    Our AI will analyze your current {selectedJob} skills and create a personalized learning path to help you reach your career goals.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob === 'Software Engineering' && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">System Design</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Algorithms</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Cloud Services</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">CI/CD</span>
                      </>
                    )}
                    {selectedJob === 'Data Science' && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Machine Learning</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Statistical Analysis</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Data Visualization</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Big Data</span>
                      </>
                    )}
                    {selectedJob === 'DevOps' && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Kubernetes</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Docker</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Infrastructure as Code</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Monitoring</span>
                      </>
                    )}
                    {selectedJob === 'Cloud Architecture' && (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">AWS</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Azure</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">GCP</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Serverless</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Accelerate Your Technical Growth</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines AI-powered learning with practical exercises to help you master new skills faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="h-8 w-8 text-purple-600" />}
              title="Interactive Coding Environments"
              description="Practice in real-time with our browser-based IDE and get instant feedback on your code."
            />
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-purple-600" />}
              title="AI-Powered Learning"
              description="Receive personalized guidance and recommendations based on your learning style and goals."
            />
            <FeatureCard 
              icon={<ChartBar className="h-8 w-8 text-purple-600" />}
              title="Skill Analytics"
              description="Track your progress with detailed analytics and identify areas for improvement."
            />
            <FeatureCard 
              icon={<BookOpen className="h-8 w-8 text-purple-600" />}
              title="Comprehensive Curriculum"
              description="Access a wide range of courses and learning paths designed by industry experts."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-purple-600" />}
              title="Community Learning"
              description="Connect with peers, share knowledge, and collaborate on projects."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-purple-600" />}
              title="Accelerated Growth"
              description="Learn faster with our proven methodology and adaptive learning system."
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have accelerated their careers with our platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="I went from junior to senior developer in just 8 months using this platform. The personalized learning path was exactly what I needed."
            author="Sarah Johnson"
            role="Senior Frontend Developer"
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
          />
          <TestimonialCard 
            quote="The interactive coding environments and real-time feedback helped me master complex algorithms that I struggled with for years."
            author="Michael Chen"
            role="Software Engineer at Google"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
          />
          <TestimonialCard 
            quote="As a self-taught developer, this platform filled in all my knowledge gaps and prepared me for technical interviews at top companies."
            author="Emily Rodriguez"
            role="Backend Developer"
            image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Accelerate Your Technical Growth?</h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Join our platform today and start your journey towards technical excellence.
          </p>
          <button 
            onClick={handleStartLearning}
            className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium text-lg">
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  role: string;
  image: string;
}> = ({ quote, author, role, image }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <p className="text-gray-700 mb-6 italic">"{quote}"</p>
    <div className="flex items-center">
      <img src={image} alt={author} className="h-12 w-12 rounded-full object-cover mr-4" />
      <div>
        <h4 className="font-semibold text-gray-900">{author}</h4>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  </div>
);

export default LandingPage;