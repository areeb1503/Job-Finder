import { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
  const [auth, setAuth] = useState({})
      return (
        <AuthContext.Provider value={{auth, setAuth}}>
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