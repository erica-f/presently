import React from "react"
type contextUser = {
    user: null | string,
    setUser: (c: string ) => void
} 
let UserContext = React.createContext<contextUser>({user: null, setUser: () => {}});

export default UserContext;