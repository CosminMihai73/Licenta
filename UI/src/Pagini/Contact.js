import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MDBContainer, MDBNavbar, MDBNavbarNav, MDBNavbarItem } from 'mdb-react-ui-kit';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Contact = () => {
  const mapRef = useRef(null);

  useEffect(() => {
  
    if (!mapRef.current) {
      const map = L.map('map', {
        center: [45.654321, 25.598109],
        zoom: 17,
      });

     
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const markerIcon = L.icon({
        iconUrl: '/poze/marker-h.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([45.654321, 25.598109], { icon: markerIcon }).addTo(map)
        .bindPopup('Corp B sala BP10');

      
      mapRef.current = map;
    }
  }, []);

  return (
    <>
      <MDBNavbar expand='lg' light bgColor='light'>
        <MDBContainer fluid>
          <a href="/" className="navbar-brand">
            <img src="/poze/logo.png" alt="Chestionar Holland" style={{ maxWidth: '150px' }} />
          </a>
          <MDBNavbarNav className="mr-auto mb-2 mb-lg-0">
            <MDBNavbarItem>
              <Link to="/intrebari" className="nav-link">Chestionarul Holland</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/facultati" className="nav-link">Facultăți</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="https://admitere.unitbv.ro" className="nav-link">Admitere</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/contact" className="nav-link">Contact</Link>
            </MDBNavbarItem>
            <MDBNavbarItem >
              <Link to="/Grafice" className="nav-link">Admin</Link>
            </MDBNavbarItem>
          </MDBNavbarNav>
        </MDBContainer>
      </MDBNavbar>
      <br></br>
      <div id="map" style={{ width: '1200px', height: '600px', margin: 'auto' }}></div>
      <br></br>
      <div style={{ textAlign: 'center' }}>
        <p>Adresa: Strada Universității 1, Brașov 500068, Corp B, sala BP10</p>
        <p>Email: <a href="mailto:consiliere@unitbv.ro">consiliere@unitbv.ro</a></p>
      </div>
    </>
  );
};

export default Contact;
