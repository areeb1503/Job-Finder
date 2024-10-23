import { useContext, useState } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';


// For selecting job to evaluate in the Kaam AI.
const SelectedJobsContext = createContext();

export const SelectedJobsProvider = ({children}) =>{
  const [selectedJobs, setSelectedJobs] = useState(null); // State for single selected job (to store only one job id)
  

  return (
    <SelectedJobsContext.Provider value={{selectedJobs,setSelectedJobs}}>
      {children}
    </SelectedJobsContext.Provider>
  )
}

SelectedJobsProvider.PropTypes = {
  children : PropTypes.node.isRequired
}

export const useSelectedJobs = () => {
  return useContext(SelectedJobsContext);
}
