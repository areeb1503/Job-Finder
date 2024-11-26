import React, { useEffect, useState } from "react";
import { Card, Row, Col, Tag, Typography, Button, message } from "antd";
import {
  EnvironmentOutlined,
  LinkOutlined,
  FileTextOutlined,
  TeamOutlined,
  TagsOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "../../../api/axios";
import { useAuth } from "../../../Contexts/AuthContext.jsx";

const { Text, Title } = Typography;

const YourJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const { accessToken } = auth;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/jobs/get-all-jobs", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      setJobs(response.data.data); // Set fetched jobs
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch jobs!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Title
          level={2}
          className="text-center text-orange-700 mb-6"
        >
          Your Job Listings
        </Title>
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            {/* Tailwind Spinner */}
            <div className="w-16 h-16 border-4 border-orange-700 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : jobs.length > 0 ? (
          <Row gutter={[16, 16]}>
            {jobs.map((job) => (
              <Col xs={24} sm={12} md={8} key={job._id}>
                <Card
                  hoverable
                  className="shadow-md rounded-lg border border-orange-700"
                  actions={[
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-700"
                    >
                      <LinkOutlined /> View Job
                    </a>,
                    <Button
                      type="link"
                      danger
                      className="text-orange-700"
                    >
                      <DeleteOutlined /> Delete
                    </Button>,
                  ]}
                >
                  <Title level={4} className="text-orange-700">
                    {job.title}
                  </Title>
                  <Text>
                    <EnvironmentOutlined className="mr-2 text-orange-700" />
                    {job.location}
                  </Text>
                  <br />
                  <Text>
                    <TeamOutlined className="mr-2 text-orange-700" />
                    {job.company || "N/A"}
                  </Text>
                  <div className="mt-3">
                    <FileTextOutlined className="mr-2 text-orange-700" />
                    <Text>{job.description}</Text>
                  </div>
                  <div className="mt-3">
                    <TagsOutlined className="mr-2 text-orange-700" />
                    {job.skillKeywords?.length ? (
                      job.skillKeywords.map((skill, index) => (
                        <Tag
                          color="orange"
                          key={index}
                          className="text-orange-700"
                        >
                          {skill}
                        </Tag>
                      ))
                    ) : (
                      <Text>No skills listed</Text>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="flex justify-center items-center min-h-screen">
            <Text>No jobs found.</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourJobs;
