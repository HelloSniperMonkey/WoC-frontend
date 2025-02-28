import React from 'react';
import Navigation from '../components/Navigation';
import AnimatedBG from '../components/Animatedbg';
import Footer from '../components/footer';

import '../components/Register/register.css'
import Aos from 'aos';
import 'aos/dist/aos.css';
import StudentForm from '../components/Register/StudentForm';


export default function StudentRegistration() {
    React.useEffect(() => {
        Aos.init({ duration: 800 });
    }, []);
    return (
        <div>
            <AnimatedBG />
            <Navigation />
            <div className="slider">
                <h2 data-aos="zoom-in" data-aos-once="true">
                    STUDENT REGISTRATION
                </h2>
                <hr />
            </div>
          
                <StudentForm/>
            <Footer />
        </div>
    );
}
