import React from "react";
import "../styles/AboutUs.css";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

const teamMembers = [{
    name: "Nguyen Van A", role: "Founder & CEO", bio: "Passionate about education and technology.",
}, {
    name: "Tran Thi B", role: "Lead Developer", bio: "Loves building impactful web applications.",
}, {
    name: "Le Van C", role: "UI/UX Designer", bio: "Designs beautiful and user-friendly interfaces.",
},];

const AboutUs = () => {
    return (<><Header/>
            <div className="aboutus-container">
                <h1>About Us</h1>
                <p className="aboutus-intro">
                    Welcome to our platform! We are dedicated to connecting tutors and learners, making education
                    accessible and effective for everyone.
                </p>
                <section className="aboutus-mission">
                    <h2>Our Mission</h2>
                    <p>
                        To empower students and tutors through technology, providing a seamless and supportive
                        environment for teaching and learning.
                    </p>
                </section>
                <section className="aboutus-team">
                    <h2>Meet the Team</h2>
                    <div className="aboutus-team-list">
                        {teamMembers.map((member, idx) => (<div className="aboutus-team-member" key={idx}>
                                <h3>{member.name}</h3>
                                <h4>{member.role}</h4>
                                <p>{member.bio}</p>
                            </div>))}
                    </div>
                </section>
            </div>
            <Footer/>
        </>);
};

export default AboutUs;