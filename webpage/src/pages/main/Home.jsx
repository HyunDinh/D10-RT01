import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BannerHeader from "../../components/BannerHeader";
import BackToTop from "../../components/BacktoTop.jsx";

function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/hocho/home', {withCredentials: true})
            .then((response) => {
                setData(response.data);
                console.log('Home API data:', response.data);
            })
            .catch((error) => {
                console.error('Error fetching home data:', error);
                setData({}); // Set default data if API fails
            });
    }, []);

    return (<> {/* Wrap in div to ensure min-height */}
            <Header/>
            <BannerHeader/>
            <div style={{background: '#f0f0f0'}}>
                Long content for scroll testing
            </div>
            <Footer/>
            <BackToTop/>
        </>);
}

export default Home;