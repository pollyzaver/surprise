import { MotionConfig } from "motion/react";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";
import About from "./sections/About.jsx";
import Directions from "./sections/Directions.jsx";
import Stage from "./sections/Stage.jsx";
import Venues from "./sections/Venues.jsx";
import Price from "./sections/Price.jsx";
import Reviews from "./sections/Reviews.jsx";
import Signup from "./sections/Signup.jsx";
import Footer from "./sections/Footer.jsx";
import SignupModal from "./components/SignupModal.jsx";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#directions">
        К направлениям
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Directions />
        <Price />
        <Stage />
        <Venues />
        <Reviews />
        <Signup />
      </main>
      <Footer />
      <SignupModal />
    </MotionConfig>
  );
}
