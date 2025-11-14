import React, { useEffect, useRef, useState } from 'react';
import './Home.css';
import HomeNavbar from '../components/HomeNavbar';
import About from '../components/About';
import Team from '../components/Team';
import Highlights from '../components/Highlights';
import JournalSection from '../components/JournalSection';
import PastCoverage from '../components/PastCoverage';
import UpcomingEvents from '../components/UpcomingEvents';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'team', label: 'Team' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'journal', label: 'Journal' },
  { id: 'past', label: 'Past Coverage' },
  { id: 'events', label: 'Upcoming events' }
];

export default function Home() {
  const refs = useRef({});
  const [active, setActive] = useState(SECTIONS[0].id);

  // create refs for all sections
  SECTIONS.forEach(s => {
    if (!refs.current[s.id]) refs.current[s.id] = React.createRef();
  });

  // scroll / observe logic
  useEffect(() => {
    let lastScrollTime = Date.now();

    const handleScroll = () => {
      // Get all section elements
      const sections = SECTIONS.map(s => ({
        id: s.id,
        element: refs.current[s.id].current
      }));

      // Find which section is most in view
      const viewportHeight = window.innerHeight;
      const scrollPosition = window.scrollY + (viewportHeight * 0.3); // 30% down the viewport

      let currentSection = sections[0];
      sections.forEach(section => {
        if (!section.element) return;
        
        const rect = section.element.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        
        if (scrollPosition >= sectionTop) {
          currentSection = section;
        }
      });

      setActive(currentSection.id);
    };

    // Throttle scroll handler for better performance
    let ticking = false;
    const scrollListener = () => {
      lastScrollTime = Date.now();
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', scrollListener, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [SECTIONS]);

  const scrollTo = (id) => {
    const el = refs.current[id] && refs.current[id].current;
    if (el) {
      // Immediately set active state for instant feedback
      setActive(id);
      
      // Calculate scroll position with offset for header
      const headerOffset = 80; // Adjust based on your header height
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="home-root">
      <div className="home-header">
        <div className="brand">
          <h1>Milestone College Science Club</h1>
          <p className="tag">Explore • Learn • Create</p>
        </div>
      </div>

      <div className="home-main">
        <aside className="home-aside">
          <HomeNavbar sections={SECTIONS} active={active} onSelect={scrollTo} />
        </aside>

        <main className="home-content">
          <section id="about" ref={refs.current['about']}><About /></section>
          <section id="team" ref={refs.current['team']}><Team /></section>
          <section id="highlights" ref={refs.current['highlights']}><Highlights /></section>
          <section id="journal" ref={refs.current['journal']}><JournalSection /></section>
          <section id="past" ref={refs.current['past']}><PastCoverage /></section>
          <section id="events" ref={refs.current['events']}><UpcomingEvents /></section>
          <div style={{ height: 60 }} />
        </main>
      </div>
    </div>
  );
}