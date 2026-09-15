import { useState, useContext } from 'react'
import { useNavigate } from 'react-router'
import UserContext from '../contexts/AuthContext';

const login = () => {
    let [userEmail, setUserEmail] = useState('');
    let [password, setPassword] = useState('');
    let { user, setUser } = useContext(UserContext);
    let navigate = useNavigate();

    async function login(e: React.MouseEvent<HTMLInputElement, MouseEvent>) {
        e.preventDefault();
        console.log("login");
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
                if (userEmail == 'test@test.com')
                    setUser(userEmail);

                navigate("/");
            } else {
                console.log("Couldn't log in");
            }
        } catch (error) {
            console.log("Couldn't log in: " + error);
        }
    }


    if (user) {
        navigate("/");
    }

    return (
        <div className="grid grid-cols-2 justify-center justify-items-center w-full">
            <section className="w-md rounded-lg border border-black gap-px">
                <form method="post">
                    <label htmlFor="userEmail">Email</label>
                    <input type="text" name="userEmail" value={userEmail} onChange={e => setUserEmail(e.target.value)} /> <br />
                    <label htmlFor="password">Password </label>
                    <input type="text" name="password" value={password} onChange={e => setPassword(e.target.value)} /> <br />
                    <input type="submit" value="Log in" onClick={(e) => login(e)} />
                </form>
            </section>
            <section className="w-lg rounded-lg border border-black">

            </section>
        </div>
    )
}

export default login
