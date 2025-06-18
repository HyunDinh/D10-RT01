import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
    const [data, setData] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/hocho/home', {withCredentials: true})
            .then(response => setData(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <Header/>
            <Footer/>
        </div>
    );
}

export default Home;