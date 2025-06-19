import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/hocho/home', {withCredentials: true})
            .then((response) => {
                setData(response.data);
                console.log('Home API data:', response.data); // Debug dữ liệu
            })
            .catch((error) => {
                console.error('Error fetching home data:', error);
            });
    }, []);

    return (
        <>
            <Header/>
            <Footer/>
        </>
    );
}

export default Home;