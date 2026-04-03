import React, { useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import {
  EnvironmentOutlined,
  LinkOutlined,
  FileTextOutlined,
  TeamOutlined,
  TagsOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import axios from "../../../api/axios.js";
import { useAuth } from "../../../Contexts/AuthContext.jsx";

import { Typography } from "antd";

const { Title } = Typography;

const { TextArea } = Input;

const UploadJobs = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { user, accessToken } = auth || {};

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/jobs/post-job",
        { ...values },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      message.success(response.data.message || "Job posted successfully!");
      form.resetFields();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-4xl">
        <Title level={1} className="text-orange-700 mb-8 text-center">
          Create a Job Listing
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: "",
            location: "",
            company: "",
            description: "",
            job_link: "",
            skillKeywords: "",
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="text-orange-700 font-semibold">
                    Job Title
                  </span>
                }
                name="title"
                rules={[
                  { required: true, message: "Please input the job title!" },
                ]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-orange-700" />}
                  placeholder="Enter job title"
                  className="rounded-md shadow-sm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="text-orange-700 font-semibold">Location</span>
                }
                name="location"
                rules={[
                  { required: true, message: "Please input the location!" },
                ]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-orange-700" />}
                  placeholder="Enter job location"
                  className="rounded-md shadow-sm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="text-orange-700 font-semibold">Company</span>
                }
                name="company"
                rules={[
                  { required: true, message: "Please input the company name!" },
                ]}
              >
                <Input
                  prefix={<TeamOutlined className="text-orange-700" />}
                  placeholder="Enter company name"
                  className="rounded-md shadow-sm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span className="text-orange-700 font-semibold">Job Link</span>
                }
                name="job_link"
                rules={[
                  { required: true, message: "Please provide the job link!" },
                  { type: "url", message: "Please enter a valid URL!" },
                ]}
              >
                <Input
                  prefix={<LinkOutlined className="text-orange-700" />}
                  placeholder="Enter job link"
                  className="rounded-md shadow-sm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={
              <span className="text-orange-700 font-semibold">
                Job Description
              </span>
            }
            name="description"
            rules={[
              {
                required: true,
                message: "Please enter the job description!",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter job description"
              className="rounded-md shadow-sm"
            />
          </Form.Item>
          <Form.Item
            label={
              <span className="text-orange-700 font-semibold">
                Skills (comma-separated)
              </span>
            }
            name="skillKeywords"
          >
            <Input
              prefix={<TagsOutlined className="text-orange-700" />}
              placeholder="E.g., React, Node.js, JavaScript"
              className="rounded-md shadow-sm"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full rounded-md bg-orange-700 border-none text-white hover:bg-white hover:text-orange-700 hover:shadow-md hover:border-orange-700 transition-all duration-300"
            >
              Submit Job
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UploadJobs;
