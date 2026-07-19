import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import FeaturesSection from "../components/FeaturesSection";
import TrendingProjects from "../components/TrendingProjects";
// import MostLikedProjects from "../components/MostLikedProjects";
import MostViewedProjects from "../components/MostViewedProjects";
// import LatestProjects from "../components/LatestProjects";
// import AIBanner from "../components/AIBanner";
// import Footer from "../components/Footer";

function Home() {
  return (
    <div className="bg-[#030712] min-h-screen text-white overflow-x-hidden">

      <Navbar />

      <HeroSection />

       <StatsSection />

      <FeaturesSection />

      <TrendingProjects />

      <MostViewedProjects />

      { /* <LatestProjects />

      <AIBanner />

      <Footer /> */}

    </div>
  );
}

export default Home;