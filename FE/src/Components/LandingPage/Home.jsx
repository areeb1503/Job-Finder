import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { Card, Row, Col, Rate, Spin, message, Divider } from 'antd';  // Import Divider from Ant Design
import axios from '../../api/axios';

function Home() {
  // State to hold feedback data and loading state
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Spring animation for Home page content
  const props = useSpring({
    to: { opacity: 1, transform: 'translateY(0)' },
    from: { opacity: 0, transform: 'translateY(20px)' },
    config: { duration: 500 },
  });

  // Spring animation for feedback section
  const feedbackSectionProps = useSpring({
    to: { opacity: 1, transform: 'translateY(0)' },
    from: { opacity: 0, transform: 'translateY(30px)' },
    config: { duration: 500 },
  });

  // Fetch feedbacks from the API
  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/api/v1/feedback/get-all-feedback');
      const sortedFeedbacks = response.data.sort((a, b) => b.rating - a.rating); // Sort by rating (highest to lowest)
      setFeedbacks(sortedFeedbacks); // Update state with sorted feedbacks
    } catch (error) {
      message.error('Failed to load feedbacks!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col items-center">
      <animated.div
        style={props}
        className="relative overflow-hidden text-black rounded-lg sm:mx-16 mx-2 sm:py-16 flex flex-col items-center justify-center"
      >
        <div className="relative z-10 max-w-screen-xl px-4 pb-20 pt-10 sm:py-24 mx-auto sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold sm:text-5xl mb-4">
            Find your next opportunity or top talent with <strong>KAAM</strong>.
          </h2>
          <p className="text-lg sm:text-xl mb-8">
            Upload your resume, get personalized job matches, and let our AI craft the perfect cover letter.
          </p>

          <Link
            className="inline-flex text-white items-center px-6 py-3 font-medium bg-orange-700 rounded-lg hover:opacity-75"
            to="/signup" // Adjust the link to your desired path
          >
            Get Started
          </Link>
        </div>
      </animated.div>

      {/* Ant Design Divider with orange color for sleek, modern line */}
      <Divider style={{ borderColor: '#D1D5DB', borderWidth: 1, margin: '20px 0', width: '100%' }} />

      {/* Animated Feedback Section */}
      <animated.div style={feedbackSectionProps} className="max-w-screen-xl w-full px-6 py-5 text-center">
        <h2 className="text-3xl font-bold text-black mb-8 text-shadow-md">
          What Our Users Say.
        </h2>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spin size="large" />
          </div>
        ) : feedbacks.length > 0 ? (
          <Row gutter={[16, 16]}>
            {feedbacks.map((feedback) => (
              <Col xs={24} sm={12} md={8} key={feedback._id}>
                <Card
                  hoverable
                  className="shadow-md rounded-lg border border-orange-700"
                >
                  <h3 className="text-lg font-bold text-orange-700">{feedback.userId.fullname}</h3>
                  <p className="text-sm text-gray-600">{feedback.userId.email}</p>
                  <div className="mt-3">
                    <Rate disabled defaultValue={feedback.rating} />
                  </div>
                  <p className="mt-2">{feedback.feedbackText}</p>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No feedbacks available yet.</p>
        )}
      </animated.div>
    </div>
  );
}

export default Home;
