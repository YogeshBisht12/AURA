import React, { useContext } from 'react'
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const {userData,serverUrl,setUserData} = useContext(userDataContext);
    const navigate = useNavigate();

    const handleLogout = async()=>{
        try {
            const result = await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true});
            navigate("/signin");
            setUserData(null);
        } catch (error) {
            setUserData(null);
            console.log(error);
            
        }
    }
return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] '>
        <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold text-[19px] mt-[10px] absolute top-[20px] right-[20px]' onClick={handleLogout}> Log Out</button>
        <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold text-[19px] px-[20px] py-[10px] mt-[10px] absolute top-[100px] right-[20px]' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
        <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
            <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
        </div>
        <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
    </div>
)
}

export default Home