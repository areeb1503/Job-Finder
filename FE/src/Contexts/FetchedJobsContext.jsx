import { useContext, useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import axios, {axiosPrivate} from "../api/axios";

const FetchedJobsContext = createContext();

export const FetchedJobsProvider = ({ children }) => {
  const { auth } = useAuth();
  const { user, accessToken } = auth || {};
  const [err, setErr] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user || !accessToken || jobs.length > 0) return;
      try {
        const response = await axios.post(
          "/api/v1/jobs/extract-jobs",
          { user },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const fetchedJobs = response?.data?.data || [];

        //  Tag each job with its type so we can distinguish later
        const taggedJobs = fetchedJobs.map((job) => ({
          ...job,
          _type: job._id ? "local" : "adzuna",
        }));

        setJobs(taggedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error.response?.data?.message || error.message);
        setErr(true);
      }
    };
    fetchJobs();
  }, [user, accessToken]);

  return (
    <FetchedJobsContext.Provider value={{ err, jobs, setErr, setJobs }}>
      {children}
    </FetchedJobsContext.Provider>
  );
};

FetchedJobsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useFetchedJobs = () => useContext(FetchedJobsContext);


