import { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [err,setErr] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        try {
          //fetch Job data from the backend // https://localhost:8000/api/v1/users/register

        } catch (error) {
          console.log("Error fetching user", error);
          setErr(true);
        }
      }, []);

      return (
        <AuthContext.Provider>
            {children}
        </AuthContext.Provider>
      )
    
}

AuthProvider.PropTypes = {
    children : PropTypes.node.isRequired
}

export const useAuth = () =>{
    return useContext(AuthContext);
}