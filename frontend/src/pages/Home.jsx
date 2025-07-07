import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";





const Home = () => {
    const {userData,serverUrl,setUserData,getGeminiResponse} = useContext(userDataContext);
    const navigate = useNavigate();
    const[listening,setListening] = useState(false);
    const [userText,setUserText] = useState("");
    const [aiText,setAiText] = useState("");

    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef(null);
    const [ham,setHam] = useState(false);
    const isRecognizingRef = useRef(false);
    const synth = window.speechSynthesis;

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

    const startRecognition = () => {
        if(!isSpeakingRef.current && !isRecognizingRef.current){
            try {
            recognitionRef.current?.start();
            setListening(true);
        } catch (error) {
            if(!error.message.includes("start")){
                console.error("Recognition error:",error);
            }
        }
        }
    };

    const speak = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current =true;
    utterance.lang = 'hi-IN'; 
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang === 'hi-IN') || voices[0];
    if (selectedVoice) {
    utterance.voice = selectedVoice;
    }
    isSpeakingRef.current =true;
    utterance.onend =()=>{
        setAiText("");
        isSpeakingRef.current =false;
        setTimeout(()=>{
            startRecognition();
        },800);
    }
    synth.cancel();
    synth.speak(utterance);
};

    const handleCommand =(data)=>{
        const {type,userInput,response}=data;
        speak(response);

        if(type === 'google-search'){
            const query = encodeURIComponent(userInput);
            window.open(`https://www.google.com/search?q=${query}`,'_blank');
        }

        if(type === 'calculator-open'){
            window.open(`https://www.google.com/search?q=calculator`,'_blank');
        }

        if(type === 'instagram-open'){
            window.open(`https://www.instagram.com`,'_blank');
        }

        if(type === 'facebook-open'){
            window.open(`https://www.facebook.com`,'_blank');
        }

        if(type === 'weather-show'){
            window.open(`https://www.google.com/search?q=weather`,'_blank');
        }

        if(type === 'youtube-search' || type === 'youtube-play'){
            const query = encodeURIComponent(userInput);
            window.open(`https://www.youtube.com/results?search_query=${query}`,'_blank');
        }
    }
    useEffect(()=>{
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognitionRef.current = recognition;

        let isMounted = true;

        const startTimeout = setTimeout(()=>{
            if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
                try {
                    recognition.start();
                    console.log("Recognition requested to start");
                } catch (e) {
                    if(e.name !== "InvalidStateError"){
                    console.log(e);
                }
                }
            }
        },1000);


        recognition.onstart = () => {
            console.log("Recognition started");
            isRecognizingRef.current = true;
            setListening(true); 
        };

        recognition.onend = () => {
            console.log("Recognition ended");
            isRecognizingRef.current = false;
            setListening(false); 
            if(isMounted && !isSpeakingRef.current){
                setTimeout(()=>{
                    if(isMounted){
                        try {
                            recognition.start();
                            console.log("Recognition started");
                            
                        } catch (e) {
                            if(e.name !== "InvalidStateError"){
                    console.log(e);
                }
                        }
                    }
                },1000);
            }

        };

        recognition.onerror = (event) => {
            console.warn("Recognition error:",event.error);
            isRecognizingRef.current = false;
            setListening(false);
            if(event.error !== "aborted" && isMounted && !isSpeakingRef.current){
                setTimeout(()=>{
                    if(isMounted){
                        try {
                            recognition.start();
                            console.log("Recognition restarted after error");
                            
                        } catch (e) {
                            if(e.name !== "InvalidStateError")
                    console.error(e);
                
                        }
                    }
                },1000);
            }
        };

        
        recognition.onresult =async (e)=>{
            const transcript = e.results[e.results.length-1][0].transcript.trim();
            console.log("heard : " + transcript);

            if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
                setAiText("");
                setUserText(transcript);
                recognition.stop();
                isRecognizingRef.current = false;
                setListening(false);
                const data = await getGeminiResponse(transcript);;
                handleCommand(data);
                setAiText(data.response);
                setUserText("");
            }
        }


            const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name},
                what can I help you with?`);
                greeting.lang = 'hi-IN';
                window.speechSynthesis.speak(greeting);
        




        return()=>{
            isMounted =false;
            clearTimeout(startTimeout);
            recognition.stop();
            setListening(false);
            isRecognizingRef.current = false;
            
        }
    },[])

return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
        <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
        <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
            <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
            <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold text-[19px]  ' onClick={handleLogout}> Log Out</button>
        <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold   text-[19px] px-[20px] py-[10px]  ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

        <div className='w-full h-[2px] bg-gray-400'></div>
            <h1 className='text-white font-semibold text-[19px]'>History</h1>
            <div className='w-full h-[400px] overflow-y-auto flex gap-[20px] flex-col'>
                {userData.history?.map((his)=>(
                    <span className='text-gray-200 text-[18px]  '>{his}</span>
                ))}
        </div>
        </div>
        <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold hidden lg:block text-[19px] mt-[10px] absolute top-[20px] right-[20px] hover:bg-purple-900 hover:text-white' onClick={handleLogout}> Log Out</button>
        <button className='min-w-[150px] h-[50px] bg-white rounded-full cursor-pointer text-black font-semibold  hidden lg:block text-[19px] px-[20px] py-[10px] mt-[10px] absolute top-[100px] right-[20px] hover:bg-purple-900 hover:text-white' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
        <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'> 
            <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
        </div>
        <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
        {!aiText && <img src={userImg} alt="" className='w-[150px] ' />}
        {aiText && <img src={aiImg} alt="" className='w-[150px]' />}

        <h1 className='text-white text-[18px] mb-3 font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
    </div>
)
}

export default Home