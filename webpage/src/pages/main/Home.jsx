import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BannerHeader from "../../components/BannerHeader";


function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/hocho/home', { withCredentials: true })
            .then((response) => {
                setData(response.data);
                console.log('Home API data:', response.data);
            })
            .catch((error) => {
                console.error('Error fetching home data:', error);
                setData({}); // Đặt dữ liệu mặc định nếu API thất bại
            });
    }, []);

    return (
        <>
            <Header />

            <BannerHeader/>

            <Footer />
        </>
    );
}

export default Home;