import React from 'react';

function About() {
  return (

    <div>
      
=
    <div style={styles.container}>
      <div style={styles.inclinedBackground}></div> {/* Inclined background */}
      
      <div style={styles.content}>
        <h1 style={styles.title}> Dhananjee Fruit & Sweet Center</h1>

        <p style={styles.text}>
          Welcome to <strong>Dhananjee Fruit & Sweet Center</strong>, a premier family-owned business nestled in the heart of Colombo. Since 2012, we’ve been serving our customers the freshest fruits and finest traditional sweets, offering a delightful and authentic shopping experience.
        </p>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Our Mission</h2>
          <p style={styles.text}>
            At Dhananjee, our mission is to deliver premium fruits and handcrafted sweets that bring joy to every table. We focus on sourcing only the highest quality products to ensure freshness and authenticity, perfect for both everyday indulgences and special celebrations.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Our Products</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Fresh Fruits:</strong> We offer a variety of local and exotic fruits, from tropical favorites like mangoes and papayas to more seasonal selections, all sourced with care.</li>
            <li style={styles.listItem}><strong>Traditional Sweets:</strong> From rich, syrup-soaked <strong>kalu dodol</strong> to delightful <strong>milk toffees</strong>, each sweet is made from time-honored recipes using the finest ingredients.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Why Choose Us?</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Uncompromising Freshness:</strong> We ensure our fruits are sourced daily, with a commitment to freshness that is second to none.</li>
            <li style={styles.listItem}><strong>Handcrafted Sweets:</strong> Every sweet is made with love and the finest local ingredients, ensuring a genuine taste of Sri Lanka.</li>
            <li style={styles.listItem}><strong>Customer Satisfaction:</strong> We’re dedicated to providing excellent service and ensuring your experience with us is always enjoyable.</li>
            <li style={styles.listItem}><strong>Wide Selection:</strong> Whether you’re looking for everyday fruits or special sweets for a celebration, we have something for everyone.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Our Values</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Commitment to Quality:</strong> We uphold the highest standards of product quality to guarantee satisfaction with every purchase.</li>
            <li style={styles.listItem}><strong>Sustainability:</strong> We support sustainable farming practices, working with local farmers who prioritize environmental care.</li>
            <li style={styles.listItem}><strong>Community Engagement:</strong> We believe in strengthening our community by sourcing locally and promoting small-scale businesses.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Contact Us</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Phone:</strong> 0776245362</li>
            <li style={styles.listItem}><strong>Email:</strong> <a href="mailto:Senadheera@gmail.com" style={styles.emailLink}>Senadheera@gmail.com</a></li>
            <li style={styles.listItem}><strong>Address:</strong> 12/A Malwatta, Colombo Road</li>
          </ul>
        </section>

        <p style={styles.text}>
          Visit us today and experience the sweetness of nature at Dhananjee Fruit & Sweet Center.
        </p>
      </div>
    </div>
    </div>
  );
}


export default About


const styles = {
  container: {
    fontFamily: 'Roboto, sans-serif',
    backgroundColor: '#f9f9f9',
    padding: '0',
    margin: '0',
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inclinedBackground: {
    position: 'absolute',
    top: '-50px',
    left: '0',
    width: '100%',
    height: '60%',
    backgroundColor: '#2980b9',
    transform: 'skewY(-10deg)', // Inclined background effect
    zIndex: -1
  },
  content: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: 1,
    lineHeight: '1.6',
  },
  title: {
    textAlign: 'center',
    fontSize: '2.8rem',
    marginBottom: '20px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '2rem',
    color: '#2980b9',
    marginBottom: '15px',
    fontWeight: '500',
  },
  text: {
    fontSize: '1.1rem',
    color: '#555',
    marginBottom: '20px',
    textAlign: 'justify',
  },
  section: {
    marginBottom: '30px',
  },
  list: {
    paddingLeft: '20px',
    listStyleType: 'disc',
  },
  listItem: {
    marginBottom: '12px',
    fontSize: '1.1rem',
  },
  emailLink: {
    color: '#2980b9',
    textDecoration: 'none',
  }
};
