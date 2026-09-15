import { useState, useContext } from 'react'
import UserContext from '../contexts/UserContext';

const login = () => {
    let [userEmail, setUserEmail] = useState('');
    let [password, setPassword] = useState('');
    let { user, setUser } = useContext(UserContext);

    async function postData(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        e.preventDefault();
        try {
            let login = {
                userEmail: userEmail,
                password: password
            }
            let url = `/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(login)
            });
            let data = await response.json();
            if (data.success) {
                setUser(userEmail);
            } else {
                console.log("Couldn't log in");
            }
        } catch (error) {
            console.log("Couldn't log in: " + error);
        }
    }

    async function logOut(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        try {
            await fetch(`/logout`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({})
            });
            setUser(null);
        } catch (error) {
            console.log("Couldn't log out: " + error);
        }
    }

    return (
        <div>
            {user ?
                <div>
                    <button onClick={(e) => logOut(e)}> Logout</button>
                </div>
                :
                <form method="post">
                    <label htmlFor="userEmail">Email</label>
                    <input type="text" name="userEmail" value={userEmail} onChange={e => setUserEmail(e.target.value)} /> <br />
                    <label htmlFor="password">Password </label>
                    <input type="text" name="password" value={password} onChange={e => setPassword(e.target.value)} /> <br />
                    <input type="submit" value="Enter" onClick={(e) => postData(e)} />
                </form>
            }
        </div>
    )
}

export default login
