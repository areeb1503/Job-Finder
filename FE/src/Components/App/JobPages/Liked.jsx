import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Input } from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
  CheckCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useSelectedJobs } from '../../../Contexts/SelectedJobsContext';
import { useFetchedJobs } from '../../../Contexts/FetchedJobsContext';
import axios from '../../../api/axios';
import { useAuth } from '../../../Contexts/AuthContext';

const { Title, Text } = Typography;

function Liked() {
  const { jobs } = useFetchedJobs();
  const [likedJobs, setLikedJobs] = useState([]);
  const { selectedJobs, setSelectedJobs } = useSelectedJobs();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const { auth } = useAuth();
  const { user, accessToken } = auth;
  const userId = user?._id;

  // Initialize liked jobs from the server
  useEffect(() => {
    const fetchLikedJobs = async () => {
      try {
        const response = await axios.post(
          '/api/v1/jobs/get-adzuna-liked',
          { userId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        console.log('Fetched liked jobs:', response.data.likedJobs);
        setLikedJobs(response.data.likedJobs || []); // Default to an empty array
      } catch (error) {
        console.error('Error fetching liked jobs:', error);
      }
    };
    fetchLikedJobs();
  }, [userId, accessToken]);

  // Filter liked jobs from all jobs
  const likedJobsData = jobs.filter((job) => likedJobs.includes(job.id));

  const toggleLike = async (jobId) => {
    try {
      // Optimistically update the state before making an API call
      setLikedJobs((prevLikedJobs) =>
        prevLikedJobs.includes(jobId)
          ? prevLikedJobs.filter((id) => id !== jobId)
          : [...prevLikedJobs, jobId]
      );

      // Make API call to toggle like/unlike
      const response = await axios.post(
        '/api/v1/jobs/toggle-like-adzuna',
        { userId, jobId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      // Update state based on server response to ensure consistency
      console.log(response.data.AdzunaLikedJobs);
      setLikedJobs(response.data.AdzunaLikedJobs || []);
    } catch (error) {
      console.error('Error toggling like:', error);

      // Revert the optimistic update if the API call fails
      setLikedJobs((prevLikedJobs) =>
        prevLikedJobs.includes(jobId)
          ? [...prevLikedJobs, jobId]
          : prevLikedJobs.filter((id) => id !== jobId)
      );
    }
  };

  const toggleSelect = (jobId) => {
    setSelectedJobs((prev) => (prev === jobId ? null : jobId));
  };

  const toggleDescription = (jobId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  return (
    <div className="flex flex-col items-center justify-start gap-6 p-4 w-full h-full overflow-auto">
      <h1 className="text-2xl text-gray-700">Your Liked Jobs</h1>
      {likedJobsData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-orange-700 p-5">You haven't liked any jobs yet.</p>
        </div>
      ) : (
        likedJobsData.map((job) => (
          <Card
            key={job.id}
            title={
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <Title level={4} style={{ marginBottom: 0, color: '#333' }}>
                    {job.title}
                  </Title>
                  <Text type="secondary">{job.company.display_name}</Text>
                </div>
                <div className="flex gap-4">
                  <span onClick={() => toggleLike(job.id)} className="cursor-pointer">
                    {likedJobs.includes(job.id) ? (
                      <HeartFilled style={{ color: '#C05621', fontSize: '1.5rem' }} />
                    ) : (
                      <HeartOutlined style={{ color: '#C05621', fontSize: '1.5rem' }} />
                    )}
                  </span>
                  <span
                    onClick={() => toggleSelect(job.id)}
                    className="flex flex-col items-center"
                  >
                    {selectedJobs === job.id ? (
                      <CheckCircleFilled style={{ color: '#C05621', fontSize: '1.5rem' }} />
                    ) : (
                      <CheckCircleOutlined style={{ color: '#C05621', fontSize: '1.5rem' }} />
                    )}
                    <p>Ask Kaam AI</p>
                  </span>
                </div>
              </div>
            }
            bordered={false}
            style={{
              width: '100%',
              maxWidth: '900px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              transition: 'border-color 0.3s ease',
            }}
            hoverable
            className="hover:border-orange-700 mx-auto"
          >
            <div className="flex flex-col gap-4">
              <p className="truncate">
                <EnvironmentOutlined style={{ color: '#C05621' }} />
                <Text strong>Location:</Text> {job.location.display_name}
              </p>
              <p>
                <ClockCircleOutlined style={{ color: '#C05621' }} />
                <Text strong>Contract Type:</Text> {job.contract_type}
              </p>
              <p>
                <Text strong>Contract Time:</Text> {job.contract_time}
              </p>
              <p
                onClick={() => toggleDescription(job.id)}
                className="cursor-pointer"
                style={{ color: '#000000' }}
              >
                <Text strong>Description:</Text>{' '}
                {expandedDescriptions[job.id]
                  ? job.description
                  : `${job.description.slice(0, 250)}...`}
              </p>
              <p>
                <Text strong>Posted:</Text>{' '}
                {formatDistanceToNow(new Date(job.created), { addSuffix: true })}
              </p>
              <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                <Button
                  type="primary"
                  block
                  style={{ backgroundColor: '#C05621', borderColor: '#C05621' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#7f2e13';
                    e.currentTarget.style.borderColor = '#7f2e13';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#C05621';
                    e.currentTarget.style.borderColor = '#C05621';
                  }}
                >
                  Get more Information
                </Button>
              </a>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export default Liked;
