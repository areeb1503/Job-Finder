import React, { useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import axios from '../../../api/axios.js';
import { useAuth } from '../../../Contexts/AuthContext.jsx';

const { TextArea } = Input;

const UploadJobs = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { user, accessToken } = auth;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/jobs/post-job",
        {
          ...values,
        },
        {
          headers: {
            'Content-Type': 'application/json',
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
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">
        Create a Job Listing
      </h1>
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
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-orange-700 font-bold">Job Title</span>}
              name="title"
              rules={[{ required: true, message: "Please input the job title!" }]}
            >
              <Input
                placeholder="Enter job title"
                className="border-orange-700"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-orange-700 font-bold">Location</span>}
              name="location"
              rules={[{ required: true, message: "Please input the location!" }]}
            >
              <Input
                placeholder="Enter job location"
                className="border-orange-700"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-orange-700 font-bold">Company</span>}
              name="company"
              rules={[{ required: true, message: "Please input the company name!" }]}
            >
              <Input
                placeholder="Enter company name"
                className="border-orange-700"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-orange-700 font-bold">Job Link</span>}
              name="job_link"
              rules={[
                { required: true, message: "Please provide the job link!" },
                { type: "url", message: "Please enter a valid URL!" },
              ]}
            >
              <Input
                placeholder="Enter job link"
                className="border-orange-700"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={
            <span className="text-orange-700 font-bold">Job Description</span>
          }
          name="description"
          rules={[{ required: true, message: "Please enter the job description!" }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter job description"
            className="border-orange-700"
          />
        </Form.Item>
        <Form.Item
          label={
            <span className="text-orange-700 font-bold">Skills (comma-separated)</span>
          }
          name="skillKeywords"
        >
          <Input
            placeholder="E.g., React, Node.js, JavaScript"
            className="border-orange-700"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-orange-700 border-none text-white hover:bg-white hover:text-orange-700 hover:border-orange-700 transition-all duration-300"
          >
            Submit Job
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UploadJobs;
