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

function Recommend() {
  const { jobs } = useFetchedJobs(); // already tagged with _type
  const [searchTerm, setSearchTerm] = useState('');
  const [localLikedIds, setLocalLikedIds] = useState([]);
  const [adzunaLikedIds, setAdzunaLikedIds] = useState([]);
  const { selectedJobs, setSelectedJobs } = useSelectedJobs();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const { auth } = useAuth();
  const { accessToken } = auth; // ✅ removed userId — backend uses req.user._id from JWT

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    withCredentials: true,
  };

  // Sync filteredJobs when jobs load
  useEffect(() => {
    if (jobs) setFilteredJobs(jobs);
  }, [jobs]);

  // Filter by search term
  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  // ✅ Single fetch for both liked job types
  useEffect(() => {
    const fetchLikedJobs = async () => {
      try {
        const response = await axios.get('/api/v1/jobs/liked-jobs', axiosConfig);
        setLocalLikedIds(response.data.localLikedJobs || []);
        setAdzunaLikedIds(response.data.adzunaLikedJobs || []);
      } catch (error) {
        console.error('Error fetching liked jobs:', error);
      }
    };
    fetchLikedJobs();
  }, [accessToken]);

  // ✅ Single toggle handler for both job types
  const toggleLike = async (job) => {
    const isLocal = job._type === 'local';
    const jobId   = isLocal ? String(job._id) : job.id;
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
      setIds(prevIds); // revert on failure
    }
  };

  const isJobLiked = (job) => {
    if (job._type === 'local') return localLikedIds.map(String).includes(String(job._id));
    return adzunaLikedIds.includes(job.id);
  };

  const toggleSelect = (jobId) => setSelectedJobs((prev) => (prev === jobId ? null : jobId));

  const toggleDescription = (jobId) =>
    setExpandedDescriptions((prev) => ({ ...prev, [jobId]: !prev[jobId] }));

  // ✅ Resolve correct fields based on job type
  const getJobFields = (job) => {
    if (job._type === 'local') {
      return {
        id: String(job._id),
        company: job.company?.name || job.companyName || 'N/A',
        location: job.location || 'N/A',
        contractType: job.contractType || 'N/A',
        contractTime: job.contractTime || 'N/A',
        description: job.description || '',
        created: job.createdAt || null,
        redirectUrl: job.redirectUrl || '#',
      };
    }
    return {
      id: job.id,
      company: job.company?.display_name || 'N/A',
      location: job.location?.display_name || job.location || 'N/A',
      contractType: job.contract_type || 'N/A',
      contractTime: job.contract_time || 'N/A',
      description: job.description || '',
      created: job.created || null,
      redirectUrl: job.redirect_url || '#',
    };
  };

  return (
    <div className="flex flex-col items-center justify-start gap-6 p-4 w-full h-full overflow-auto">
      <h1 className="text-2xl text-gray-700">Recommended from Resume</h1>
      <div className="w-full max-w-md mb-6">
        <Input
          placeholder="Search by job title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="large"
          prefix={<SearchOutlined style={{ color: '#C05621' }} />}
          style={{ borderColor: '#C05621', outline: 'none' }}
        />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div
            className="w-12 h-12 border-4 border-orange-700 border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="loading"
          />
          <p className="text-orange-700 p-5">Loading Jobs according to your Skills...</p>
        </div>
      ) : (
        filteredJobs.map((job) => {
          const fields = getJobFields(job);
          return (
            <Card
              key={fields.id}
              title={
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <Title level={4} style={{ marginBottom: 0, color: '#333' }}>
                      {job.title}
                    </Title>
                    <Text type="secondary">{fields.company}</Text>
                  </div>
                  <div className="flex gap-4">
                    {/* ✅ Pass full job object so toggleLike knows the type */}
                    <span onClick={() => toggleLike(job)} className="cursor-pointer">
                      {isJobLiked(job) ? (
                        <HeartFilled style={{ color: '#C05621', fontSize: '1.5rem' }} />
                      ) : (
                        <HeartOutlined style={{ color: '#C05621', fontSize: '1.5rem' }} />
                      )}
                    </span>
                    <span
                      onClick={() => toggleSelect(fields.id)}
                      className="flex flex-col items-center"
                    >
                      {selectedJobs === fields.id ? (
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
                  <Text strong> Location:</Text> {fields.location}
                </p>
                <p>
                  <ClockCircleOutlined style={{ color: '#C05621' }} />
                  <Text strong> Contract Type:</Text> {fields.contractType}
                </p>
                <p>
                  <Text strong>Contract Time:</Text> {fields.contractTime}
                </p>
                <p
                  onClick={() => toggleDescription(fields.id)}
                  className="cursor-pointer"
                  style={{ color: '#000000' }}
                >
                  <Text strong>Description:</Text>{' '}
                  {expandedDescriptions[fields.id]
                    ? fields.description
                    : `${fields.description.slice(0, 250)}...`}
                </p>
                <p>
                  <Text strong>Posted:</Text>{' '}
                  {fields.created
                    ? formatDistanceToNow(new Date(fields.created), { addSuffix: true })
                    : 'N/A'}
                </p>
                <a href={fields.redirectUrl} target="_blank" rel="noopener noreferrer">
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
          );
        })
      )}
    </div>
  );
}

export default Recommend;



/*
{
  "mean": 1340096.46,
  "count": 34068,
  "results": [
    {
      "salary_is_predicted": "0",
      "longitude": 78.50806,
      "title": "Software Engineer - C++/Python", // Include
      "location": { 
        "area": [
          "India",  
          "Telangana",
          "Hyderabad"
        ],
        "display_name": "Hyderabad, Telangana", // Include
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "contract_type": "permanent", // Include
      "id": "4878395401",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODc4Mzk1NDAxIn0.zMsPHYBWfNUvSryPKOSzEd32iqfh6an-p4UoTvk0gi4",
      "contract_time": "full_time", // Include
      "__CLASS__": "Adzuna::API::Response::Job",
      "company": {
        "display_name": "RADIANT DIGITAL SOLUTIONS PRIVATE LIMITED", // Include
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "created": "2024-09-27T06:24:15Z", // Include 
      "redirect_url": "https://www.adzuna.in/land/ad/4878395401?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=F64D1C01C8704F4CAAD9F1C2DAD9578295AE5237", // Include
      "description": "Job Description : We are seeking a skilled Software Engineer with 5 years of experience. Candidate should possess a combination of technical expertise, leadership skills, and domain knowledge. Here are some Key skills that are required. Experience Required : - Development of SW applications using Python, C++, C# - Proficiency with IDEs / Dev Environments such as Anaconda, Visual Studio, Jupyter NoteBook etc. - Implementing SW applications using DBs such as SQL - Development using REST based web…",
      "latitude": 17.40275
    },
    {
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Sigmond Morgan IT Solutions Private Limited"
      },
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "latitude": 19.00821,
      "description": "Company Description. CIFDAQ Blockchain Ecosystem offers a new combination in the Blockchain domain. CIFDAQ provides trust and scalability through its blockchain ecosystem that will tackle various ingredients of blockchain ecosystems such as legal & technical framework, standards & interoperability, & a diverse, representative mix of players and users in the crypto and blockchain industry. CIFDAQ Blockchain Ecosystem consists of several modules and products that will be inter-connected by an inn…",
      "redirect_url": "https://www.adzuna.in/land/ad/4890707688?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=F493207AD6A717F0864A99EA1E44684CE9C6DEBF",
      "created": "2024-10-06T07:02:14Z",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "display_name": "Mumbai, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Mumbai"
        ]
      },
      "longitude": 72.84415,
      "title": "Quantitative Developer - C++/Python",
      "salary_is_predicted": "0",
      "id": "4890707688",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDg5MDcwNzY4OCIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.55iwbTLkhI0R1_pQDAkNHooiLW8_A-ChHkSjMHk0NVQ",
      "contract_type": "permanent"
    },
    {
      "contract_type": "permanent",
      "id": "4865982317",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDg2NTk4MjMxNyIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.3Ro101Y5tIkg45-mhoLsVHPFAJO1N_0ADwQ9gkAL66s",
      "longitude": 77.59837,
      "title": "C++ Developer - Java/Python",
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs"
      },
      "location": {
        "area": [
          "India",
          "Karnataka",
          "Bangalore"
        ],
        "display_name": "Bangalore, Karnataka",
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "created": "2024-09-17T05:49:31Z",
      "latitude": 12.95703,
      "description": "Job Title : C++ Developer Experience : 5-8 Years Location : Bangalore (Hybrid) Notice Period : Immediate Job Overview : We are seeking an experienced C++ Developer to join our product-based client's team. The ideal candidate will possess strong programming skills in C++ and have extensive experience working with Linux operating systems. A background in IoT and RFID technologies, along with familiarity in event-driven architectures, will be key to success in this role. Key Responsibilities : - D…",
      "redirect_url": "https://www.adzuna.in/land/ad/4865982317?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=C78376828DDA1D116B1D5B6585A4D2F06FADB5B9",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "VAYUZ Technologies"
      }
    },
    {
      "title": "Senior Software Engineer - C++/Python",
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "area": [
          "India"
        ],
        "display_name": "India",
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDgzNDk1NjY3NCIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.z2xVEukeMdWOXnG2iYbDEJV5lx0-8jZbc5DsQ16Y65s",
      "id": "4834956674",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Kautilya Management Consultants"
      },
      "created": "2024-08-22T05:13:57Z",
      "description": "Job Description : - Design and develop high-end software products with a focus on performance, scalability, and reliability. - Utilize C++ and Python to build robust and efficient software solutions. Technical Expertise : - Apply best practices in software engineering to create high-quality code and maintainable systems. - Collaborate with cross-functional teams to gather requirements, design architecture, and implement features. Innovation & Problem Solving : - Solve complex technical challeng…",
      "redirect_url": "https://www.adzuna.in/land/ad/4834956674?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=5F1815729C8732D0AA059D947AAA7B682E7E7A32"
    },
    {
      "redirect_url": "https://www.adzuna.in/land/ad/4859504510?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=1128769951FCA63C7D2D18C160EB1FC43D54F002",
      "description": "Technical Experience : 1. Proven experience (5 years) in software development with a strong emphasis on simulation, physics engines, or related areas. 2. Solid understanding of 3D graphics, real-time rendering, and simulation techniques 3. Proficiency in C++, Python, and/or other relevant programming languages 4. Experience with technologies, such as CUDA, Pytorch, DGL, PYG, cuGraph and related GPU programming frameworks. 5. Familiarity with Agile development methodologies. 6. Prior experience …",
      "created": "2024-09-11T05:40:01Z",
      "company": {
        "display_name": "Kudzu Infotech",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODU5NTA0NTEwIn0.nj71a_8KSqD-Q4glkxgtOf0mC_zf5StZ0rrWYfth6Ao",
      "id": "4859504510",
      "contract_type": "permanent",
      "location": {
        "display_name": "India",
        "area": [
          "India"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs",
        "tag": "it-jobs"
      },
      "salary_is_predicted": "0",
      "title": "Graph Data Scientist - C++/Python"
    },
    {
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Ximax Solutions"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "redirect_url": "https://www.adzuna.in/land/ad/4871295075?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=71E29D46FAB6A7B5C5B5B3F35A082287934525C2",
      "description": "We are hiring Verification Engineer for a client in Bengaluru and below is the detailed Job Description. Key Responsibilities : 1. Develop and execute verification plans, test benches, and test cases. 2. Write and maintain verification code (e.g., SystemVerilog, UVM) for complex digital designs. 3. Collaborate with design engineers to understand design specifications. 4. Identify and debug issues found during verification. 5. Develop and maintain verification environments and frameworks. 6. Con…",
      "created": "2024-09-21T06:13:57Z",
      "location": {
        "display_name": "India",
        "area": [
          "India"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "tag": "it-jobs"
      },
      "salary_is_predicted": "0",
      "title": "Verification Engineer - C/C++/Python",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODcxMjk1MDc1In0.bCvRnhF7KZxIf3j7zlpduF0TBBzWLZ7EumzUqiBZq18",
      "id": "4871295075",
      "contract_type": "permanent"
    },
    {
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0OTAwMzM5NjkwIn0.xfDQ-953GsOjI8HhZoMHXbOzAPhZ8RLNwLpACzu29dg",
      "id": "4900339690",
      "longitude": 73.84735,
      "title": "Software Developer - .Net/C++/Python",
      "salary_is_predicted": "0",
      "category": {
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs",
        "tag": "it-jobs"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "display_name": "Pune, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Pune"
        ]
      },
      "created": "2024-10-13T09:34:21Z",
      "latitude": 18.5062,
      "description": "SECRET TECHNOLOGIES INDIA (VMS Group) is looking for IT Freshers & Experiences Walk-In Interview (Java/.Net/PHP/Android/Web Developer/Python /Testing /Data ME, MCA, BCA, BSC, Any Graduate Joining: Immediate Responsibilities & Duties: - Strong knowledge of Java/.Net/PHP/Android/Web Developer/Python /Testing /Data Science/AWS programming required. - Should have knowledge of basic Programming languages like C, Java and any database - Strong knowledge of OOPS Concept. Required Experience, Skills: -…",
      "redirect_url": "https://www.adzuna.in/land/ad/4900339690?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=074EBCD06220F7EC9966FD822BD1646B456E8A45",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "display_name": "Secret Technologies India",
        "__CLASS__": "Adzuna::API::Response::Company"
      }
    },
    {
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODg3OTcyOTU2In0.nmp7d2YJOYjLOSYxcTvttyINIuTh6gaQmwjirpcKh8c",
      "id": "4887972956",
      "contract_type": "permanent",
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "area": [
          "India"
        ],
        "display_name": "India"
      },
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "salary_is_predicted": "0",
      "title": "Blockchain Developer - C++/Java/Python",
      "redirect_url": "https://www.adzuna.in/land/ad/4887972956?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=01EA5BD6204D3D71FB06ADD3B05722238C337514",
      "description": "Responsibilities : - Design, develop, and implement robust and scalable blockchain solutions. - Collaborate with cross-functional teams to define and implement blockchain strategies. - Research and evaluate new blockchain technologies and tools. - Optimize blockchain performance and security. - Troubleshoot and resolve blockchain-related issues. - Stay up-to-date with the latest advancements in blockchain technology. Qualifications : - Minimum 8-10 years of experience in software development, w…",
      "created": "2024-10-04T06:58:58Z",
      "company": {
        "display_name": "HIC Global Solutions",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job"
    },
    {
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "company": {
        "display_name": "Ara Resources Pvt Ltd",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "created": "2024-08-24T05:15:30Z",
      "redirect_url": "https://www.adzuna.in/land/ad/4837638881?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=EF0755B962F7A42FF9B6023339F73C59BBDD5431",
      "latitude": 18.5062,
      "description": "About The Company : ARA's client enables cyber, data and operational resilience for every organization with the Data Resiliency Cloud, the industry's first and only at scale SaaS solution. Customers can radically simplify data protection, streamline data governance, and gain data visibility and insights as they accelerate cloud adoption. It pioneered a SaaS-based approach to eliminate complex infrastructure and related management costs, and deliver data resilience via a single platform spanning…",
      "salary_is_predicted": "0",
      "title": "Senior Software Engineer - C++ /Python/Golang",
      "longitude": 73.84735,
      "location": {
        "display_name": "Pune, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Pune"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "tag": "it-jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs"
      },
      "contract_type": "permanent",
      "id": "4837638881",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODM3NjM4ODgxIn0.1vd6HaERcllHM30tfw9MfR8YFSdkXKK-ZXU3pHVGY9E"
    },
    {
      "created": "2024-10-18T09:41:05Z",
      "description": "Job Functions: - Software product development, in Python, C++, and Linux, in an agile framework. - Your development responsibilities will be primarily in three areas; real-time audio processing (e.g., altering audio while maintaining synchrony in duplex conversations); integration APIs and protocols (text, VoIP, signalling, logging, configuration, ); and application-level functionality (e.g., business logic, monitoring, failover, - ). - Provide expertise and engineering for call center integrat…",
      "latitude": 12.95703,
      "redirect_url": "https://www.adzuna.in/land/ad/4905982216?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=45B9888FDDBB829843F2C09B1D2A9997AE89BBEA",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Career Makers"
      },
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDkwNTk4MjIxNiIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.D1K4u--8r_mmsQ184tjxV_FDapKlyV5WkRkz2uoVSds",
      "id": "4905982216",
      "title": "Senior Software Engineer - C++/Python/VoIP",
      "longitude": 77.59837,
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "area": [
          "India",
          "Karnataka",
          "Bangalore"
        ],
        "display_name": "Bangalore, Karnataka"
      }
    }
  ],
  "__CLASS__": "Adzuna::API::Response::JobSearchResults"
}
*/



/*
{
  "mean": 1340096.46,
  "count": 34068,
  "results": [
    {
      "salary_is_predicted": "0",
      "longitude": 78.50806,
      "title": "Software Engineer - C++/Python", // Include
      "location": { 
        "area": [
          "India",  
          "Telangana",
          "Hyderabad"
        ],
        "display_name": "Hyderabad, Telangana", // Include
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "contract_type": "permanent", // Include
      "id": "4878395401",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODc4Mzk1NDAxIn0.zMsPHYBWfNUvSryPKOSzEd32iqfh6an-p4UoTvk0gi4",
      "contract_time": "full_time", // Include
      "__CLASS__": "Adzuna::API::Response::Job",
      "company": {
        "display_name": "RADIANT DIGITAL SOLUTIONS PRIVATE LIMITED", // Include
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "created": "2024-09-27T06:24:15Z", // Include 
      "redirect_url": "https://www.adzuna.in/land/ad/4878395401?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=F64D1C01C8704F4CAAD9F1C2DAD9578295AE5237", // Include
      "description": "Job Description : We are seeking a skilled Software Engineer with 5 years of experience. Candidate should possess a combination of technical expertise, leadership skills, and domain knowledge. Here are some Key skills that are required. Experience Required : - Development of SW applications using Python, C++, C# - Proficiency with IDEs / Dev Environments such as Anaconda, Visual Studio, Jupyter NoteBook etc. - Implementing SW applications using DBs such as SQL - Development using REST based web…",
      "latitude": 17.40275
    },
    {
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Sigmond Morgan IT Solutions Private Limited"
      },
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "latitude": 19.00821,
      "description": "Company Description. CIFDAQ Blockchain Ecosystem offers a new combination in the Blockchain domain. CIFDAQ provides trust and scalability through its blockchain ecosystem that will tackle various ingredients of blockchain ecosystems such as legal & technical framework, standards & interoperability, & a diverse, representative mix of players and users in the crypto and blockchain industry. CIFDAQ Blockchain Ecosystem consists of several modules and products that will be inter-connected by an inn…",
      "redirect_url": "https://www.adzuna.in/land/ad/4890707688?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=F493207AD6A717F0864A99EA1E44684CE9C6DEBF",
      "created": "2024-10-06T07:02:14Z",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "display_name": "Mumbai, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Mumbai"
        ]
      },
      "longitude": 72.84415,
      "title": "Quantitative Developer - C++/Python",
      "salary_is_predicted": "0",
      "id": "4890707688",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDg5MDcwNzY4OCIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.55iwbTLkhI0R1_pQDAkNHooiLW8_A-ChHkSjMHk0NVQ",
      "contract_type": "permanent"
    },
    {
      "contract_type": "permanent",
      "id": "4865982317",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDg2NTk4MjMxNyIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.3Ro101Y5tIkg45-mhoLsVHPFAJO1N_0ADwQ9gkAL66s",
      "longitude": 77.59837,
      "title": "C++ Developer - Java/Python",
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs"
      },
      "location": {
        "area": [
          "India",
          "Karnataka",
          "Bangalore"
        ],
        "display_name": "Bangalore, Karnataka",
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "created": "2024-09-17T05:49:31Z",
      "latitude": 12.95703,
      "description": "Job Title : C++ Developer Experience : 5-8 Years Location : Bangalore (Hybrid) Notice Period : Immediate Job Overview : We are seeking an experienced C++ Developer to join our product-based client's team. The ideal candidate will possess strong programming skills in C++ and have extensive experience working with Linux operating systems. A background in IoT and RFID technologies, along with familiarity in event-driven architectures, will be key to success in this role. Key Responsibilities : - D…",
      "redirect_url": "https://www.adzuna.in/land/ad/4865982317?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=C78376828DDA1D116B1D5B6585A4D2F06FADB5B9",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "VAYUZ Technologies"
      }
    },
    {
      "title": "Senior Software Engineer - C++/Python",
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "area": [
          "India"
        ],
        "display_name": "India",
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDgzNDk1NjY3NCIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.z2xVEukeMdWOXnG2iYbDEJV5lx0-8jZbc5DsQ16Y65s",
      "id": "4834956674",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Kautilya Management Consultants"
      },
      "created": "2024-08-22T05:13:57Z",
      "description": "Job Description : - Design and develop high-end software products with a focus on performance, scalability, and reliability. - Utilize C++ and Python to build robust and efficient software solutions. Technical Expertise : - Apply best practices in software engineering to create high-quality code and maintainable systems. - Collaborate with cross-functional teams to gather requirements, design architecture, and implement features. Innovation & Problem Solving : - Solve complex technical challeng…",
      "redirect_url": "https://www.adzuna.in/land/ad/4834956674?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=5F1815729C8732D0AA059D947AAA7B682E7E7A32"
    },
    {
      "redirect_url": "https://www.adzuna.in/land/ad/4859504510?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=1128769951FCA63C7D2D18C160EB1FC43D54F002",
      "description": "Technical Experience : 1. Proven experience (5 years) in software development with a strong emphasis on simulation, physics engines, or related areas. 2. Solid understanding of 3D graphics, real-time rendering, and simulation techniques 3. Proficiency in C++, Python, and/or other relevant programming languages 4. Experience with technologies, such as CUDA, Pytorch, DGL, PYG, cuGraph and related GPU programming frameworks. 5. Familiarity with Agile development methodologies. 6. Prior experience …",
      "created": "2024-09-11T05:40:01Z",
      "company": {
        "display_name": "Kudzu Infotech",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODU5NTA0NTEwIn0.nj71a_8KSqD-Q4glkxgtOf0mC_zf5StZ0rrWYfth6Ao",
      "id": "4859504510",
      "contract_type": "permanent",
      "location": {
        "display_name": "India",
        "area": [
          "India"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs",
        "tag": "it-jobs"
      },
      "salary_is_predicted": "0",
      "title": "Graph Data Scientist - C++/Python"
    },
    {
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Ximax Solutions"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "redirect_url": "https://www.adzuna.in/land/ad/4871295075?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=71E29D46FAB6A7B5C5B5B3F35A082287934525C2",
      "description": "We are hiring Verification Engineer for a client in Bengaluru and below is the detailed Job Description. Key Responsibilities : 1. Develop and execute verification plans, test benches, and test cases. 2. Write and maintain verification code (e.g., SystemVerilog, UVM) for complex digital designs. 3. Collaborate with design engineers to understand design specifications. 4. Identify and debug issues found during verification. 5. Develop and maintain verification environments and frameworks. 6. Con…",
      "created": "2024-09-21T06:13:57Z",
      "location": {
        "display_name": "India",
        "area": [
          "India"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "tag": "it-jobs"
      },
      "salary_is_predicted": "0",
      "title": "Verification Engineer - C/C++/Python",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODcxMjk1MDc1In0.bCvRnhF7KZxIf3j7zlpduF0TBBzWLZ7EumzUqiBZq18",
      "id": "4871295075",
      "contract_type": "permanent"
    },
    {
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0OTAwMzM5NjkwIn0.xfDQ-953GsOjI8HhZoMHXbOzAPhZ8RLNwLpACzu29dg",
      "id": "4900339690",
      "longitude": 73.84735,
      "title": "Software Developer - .Net/C++/Python",
      "salary_is_predicted": "0",
      "category": {
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs",
        "tag": "it-jobs"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "display_name": "Pune, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Pune"
        ]
      },
      "created": "2024-10-13T09:34:21Z",
      "latitude": 18.5062,
      "description": "SECRET TECHNOLOGIES INDIA (VMS Group) is looking for IT Freshers & Experiences Walk-In Interview (Java/.Net/PHP/Android/Web Developer/Python /Testing /Data ME, MCA, BCA, BSC, Any Graduate Joining: Immediate Responsibilities & Duties: - Strong knowledge of Java/.Net/PHP/Android/Web Developer/Python /Testing /Data Science/AWS programming required. - Should have knowledge of basic Programming languages like C, Java and any database - Strong knowledge of OOPS Concept. Required Experience, Skills: -…",
      "redirect_url": "https://www.adzuna.in/land/ad/4900339690?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=074EBCD06220F7EC9966FD822BD1646B456E8A45",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "display_name": "Secret Technologies India",
        "__CLASS__": "Adzuna::API::Response::Company"
      }
    },
    {
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODg3OTcyOTU2In0.nmp7d2YJOYjLOSYxcTvttyINIuTh6gaQmwjirpcKh8c",
      "id": "4887972956",
      "contract_type": "permanent",
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "area": [
          "India"
        ],
        "display_name": "India"
      },
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "salary_is_predicted": "0",
      "title": "Blockchain Developer - C++/Java/Python",
      "redirect_url": "https://www.adzuna.in/land/ad/4887972956?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=01EA5BD6204D3D71FB06ADD3B05722238C337514",
      "description": "Responsibilities : - Design, develop, and implement robust and scalable blockchain solutions. - Collaborate with cross-functional teams to define and implement blockchain strategies. - Research and evaluate new blockchain technologies and tools. - Optimize blockchain performance and security. - Troubleshoot and resolve blockchain-related issues. - Stay up-to-date with the latest advancements in blockchain technology. Qualifications : - Minimum 8-10 years of experience in software development, w…",
      "created": "2024-10-04T06:58:58Z",
      "company": {
        "display_name": "HIC Global Solutions",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job"
    },
    {
      "contract_time": "full_time",
      "__CLASS__": "Adzuna::API::Response::Job",
      "company": {
        "display_name": "Ara Resources Pvt Ltd",
        "__CLASS__": "Adzuna::API::Response::Company"
      },
      "created": "2024-08-24T05:15:30Z",
      "redirect_url": "https://www.adzuna.in/land/ad/4837638881?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=EF0755B962F7A42FF9B6023339F73C59BBDD5431",
      "latitude": 18.5062,
      "description": "About The Company : ARA's client enables cyber, data and operational resilience for every organization with the Data Resiliency Cloud, the industry's first and only at scale SaaS solution. Customers can radically simplify data protection, streamline data governance, and gain data visibility and insights as they accelerate cloud adoption. It pioneered a SaaS-based approach to eliminate complex infrastructure and related management costs, and deliver data resilience via a single platform spanning…",
      "salary_is_predicted": "0",
      "title": "Senior Software Engineer - C++ /Python/Golang",
      "longitude": 73.84735,
      "location": {
        "display_name": "Pune, Maharashtra",
        "area": [
          "India",
          "Maharashtra",
          "Pune"
        ],
        "__CLASS__": "Adzuna::API::Response::Location"
      },
      "category": {
        "tag": "it-jobs",
        "__CLASS__": "Adzuna::API::Response::Category",
        "label": "IT Jobs"
      },
      "contract_type": "permanent",
      "id": "4837638881",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoibXBiWDRrNk83eEdkVmNYRXZKWGhzdyIsImkiOiI0ODM3NjM4ODgxIn0.1vd6HaERcllHM30tfw9MfR8YFSdkXKK-ZXU3pHVGY9E"
    },
    {
      "created": "2024-10-18T09:41:05Z",
      "description": "Job Functions: - Software product development, in Python, C++, and Linux, in an agile framework. - Your development responsibilities will be primarily in three areas; real-time audio processing (e.g., altering audio while maintaining synchrony in duplex conversations); integration APIs and protocols (text, VoIP, signalling, logging, configuration, ); and application-level functionality (e.g., business logic, monitoring, failover, - ). - Provide expertise and engineering for call center integrat…",
      "latitude": 12.95703,
      "redirect_url": "https://www.adzuna.in/land/ad/4905982216?se=mpbX4k6O7xGdVcXEvJXhsw&utm_medium=api&utm_source=0762915d&v=45B9888FDDBB829843F2C09B1D2A9997AE89BBEA",
      "__CLASS__": "Adzuna::API::Response::Job",
      "contract_time": "full_time",
      "company": {
        "__CLASS__": "Adzuna::API::Response::Company",
        "display_name": "Career Makers"
      },
      "contract_type": "permanent",
      "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNDkwNTk4MjIxNiIsInMiOiJtcGJYNGs2Tzd4R2RWY1hFdkpYaHN3In0.D1K4u--8r_mmsQ184tjxV_FDapKlyV5WkRkz2uoVSds",
      "id": "4905982216",
      "title": "Senior Software Engineer - C++/Python/VoIP",
      "longitude": 77.59837,
      "salary_is_predicted": "0",
      "category": {
        "tag": "it-jobs",
        "label": "IT Jobs",
        "__CLASS__": "Adzuna::API::Response::Category"
      },
      "location": {
        "__CLASS__": "Adzuna::API::Response::Location",
        "area": [
          "India",
          "Karnataka",
          "Bangalore"
        ],
        "display_name": "Bangalore, Karnataka"
      }
    }
  ],
  "__CLASS__": "Adzuna::API::Response::JobSearchResults"
}
*/