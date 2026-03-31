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
  const { jobs } = useFetchedJobs(); // adzuna jobs
  const { auth } = useAuth();
  const { accessToken } = auth;
  const { selectedJobs, setSelectedJobs } = useSelectedJobs();

  const [localLikedIds, setLocalLikedIds]   = useState([]);
  const [adzunaLikedIds, setAdzunaLikedIds] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const axiosConfig = {
    headers: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true,
  };

  // ✅ Single fetch for all liked jobs
  useEffect(() => {
    const fetchAllLikedJobs = async () => {
      try {
        const response = await axios.get('/api/v1/jobs/liked-jobs', axiosConfig);
        setLocalLikedIds(response.data.localLikedJobs || []);
        setAdzunaLikedIds(response.data.adzunaLikedJobs || []);
      } catch (error) {
        console.error('Error fetching liked jobs:', error);
      }
    };
    fetchAllLikedJobs();
  }, [accessToken]);


// ✅ Split by type using the tag
const likedAdzunaJobs = jobs
  .filter((job) => job._type === "adzuna" && adzunaLikedIds.includes(job.id))
  .map((job) => ({
    _type: "adzuna",
    id: job.id,
    title: job.title,
    companyName: job.company?.display_name || "N/A",
    location: job.location?.display_name || "N/A",
    contractType: job.contract_type || "N/A",
    contractTime: job.contract_time || "N/A",
    description: job.description || "",
    created: job.created,
    redirectUrl: job.redirect_url,
  }));

const likedLocalJobs = jobs
  .filter((job) => job._type === "local" && localLikedIds.map(String).includes(String(job._id)))
  .map((job) => ({
    _type: "local",
    id: String(job._id),
    title: job.title,
    companyName: job.company?.name || job.companyName || "N/A",
    location: job.location || "N/A",
    contractType: job.contractType || "N/A",
    contractTime: job.contractTime || "N/A",
    description: job.description || "",
    created: job.createdAt,
    redirectUrl: "#",
  }));

const allLikedJobs = [...likedLocalJobs, ...likedAdzunaJobs];

  // ✅ Single toggle handler
  const toggleLike = async (jobId, isLocal) => {
    const endpoint = isLocal ? '/api/v1/jobs/like-local' : '/api/v1/jobs/like-adzuna';
    const setIds   = isLocal ? setLocalLikedIds : setAdzunaLikedIds;
    const prevIds  = isLocal ? localLikedIds : adzunaLikedIds;

    // Optimistic update
    setIds(prevIds.includes(jobId)
      ? prevIds.filter((id) => id !== jobId)
      : [...prevIds, jobId]
    );

    try {
      const response = await axios.post(endpoint, { jobId }, axiosConfig);
      setIds(response.data.likedJobs || []);
    } catch (error) {
      console.error('Error toggling like:', error);
      setIds(prevIds); // revert
    }
  };

  const toggleSelect  = (jobId) => setSelectedJobs((prev) => (prev === jobId ? null : jobId));
  const toggleDescription = (jobId) =>
    setExpandedDescriptions((prev) => ({ ...prev, [jobId]: !prev[jobId] }));

  const isJobLiked = (job) =>
    job._type === 'local'
      ? localLikedIds.map(String).includes(job.id)
      : adzunaLikedIds.includes(job.id);

  return (
    <div className="flex flex-col items-center justify-start gap-6 p-4 w-full h-full overflow-auto">
      <h1 className="text-2xl text-gray-700">Your Liked Jobs</h1>

      {allLikedJobs.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-orange-700 p-5">You haven't liked any jobs yet.</p>
        </div>
      ) : (
        allLikedJobs.map((job) => (
          <Card
            key={job.id}
            title={
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <Title level={4} style={{ marginBottom: 0, color: '#333' }}>
                    {job.title}
                  </Title>
                  <Text type="secondary">{job.companyName}</Text>
                </div>
                <div className="flex gap-4">
                  {/* ✅ Pass isLocal flag based on job type */}
                  <span
                    onClick={() => toggleLike(job.id, job._type === 'local')}
                    className="cursor-pointer"
                  >
                    {isJobLiked(job) ? (
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
                <Text strong> Location:</Text> {job.location}
              </p>
              <p>
                <ClockCircleOutlined style={{ color: '#C05621' }} />
                <Text strong> Contract Type:</Text> {job.contractType}
              </p>
              <p>
                <Text strong>Contract Time:</Text> {job.contractTime}
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
                {job.created
                  ? formatDistanceToNow(new Date(job.created), { addSuffix: true })
                  : 'N/A'}
              </p>
              <a href={job.redirectUrl} target="_blank" rel="noopener noreferrer">
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