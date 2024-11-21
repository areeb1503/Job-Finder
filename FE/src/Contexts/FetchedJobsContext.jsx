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
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error.response?.data?.message || error.message);
        setErr(true);
      }
    };

    fetchJobs();
  }, [auth, jobs]);

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


/*
const dummyData = {
  "mean": 1340096.46,
  "count": 34068,
  "results": [
    {
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
      "description": "Job Description : We are seeking a skilled Software Engineer with 5 years of experience. Candidate should possess a combination of technical expertise, leadership skills, and domain knowledge. Here are some Key skills that are required. Experience Required : - Development of SW applications using Python, C++, C# - Proficiency with IDEs / Dev Environments such as Anaconda, Visual Studio, Jupyter NoteBook etc. - Implementing SW applications using DBs such as SQL - Development using REST based web…", // Include
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
    }
  ]
}
*/