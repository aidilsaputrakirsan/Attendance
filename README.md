# Smart Attendance System

A modern, responsive web application for tracking student attendance with real-time updates. This system provides an intuitive interface for students to submit their attendance and view a live feed of who has checked in for a specific course.

![Smart Attendance System Preview](/image.png)

## 🌟 Features

### Core Functionality
- **Simple Attendance Submission**: Students can quickly submit their attendance with minimal friction
- **Geolocation Tracking**: Captures location data to verify attendance proximity (optional)
- **Real-time Updates**: Live feed shows attendance submissions in real-time
- **Course Filtering**: Filter the attendance feed by specific courses
- **Weekly Progress**: Automatically tracks which week of the semester the attendance is for

### User Experience
- **Intuitive Interface**: Clean, modern UI that's easy to navigate
- **Responsive Design**: Works seamlessly on mobile devices and desktops
- **Animated Background**: Particle animations for visual appeal
- **Form Validation**: Input validation to ensure data accuracy
- **Interactive Notifications**: Context-aware notifications for success, error, and warnings
- **Loading Indicators**: Visual feedback during data operations

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with custom properties and animations
  - Custom animations and transitions
  - Glassmorphism design elements
  - Responsive layout
- **JavaScript (ES6+)**: 
  - DOM manipulation
  - Form handling and validation
  - Asynchronous requests
  - Geolocation API

### Backend Integration
- **Google Apps Script**: Server-side logic for data processing and storage
- **Google Sheets**: Database for attendance records
- **JSONP**: Cross-origin data fetching technique

### External Resources
- **Font Awesome**: Icon library
- **Google Fonts**: Typography (Poppins)

## 🔄 How It Works

### Attendance Submission Flow
1. Student fills out the attendance form with their details:
   - Full name
   - Student ID (NIM)
   - Class selection
   - Course selection
2. The system automatically captures the student's geolocation (with permission)
3. When submitted, the data is sent to a Google Apps Script endpoint
4. The script processes the data and stores it in a Google Sheet
5. A success notification confirms the submission
6. The live feed automatically updates to show the new entry

### Live Feed Mechanism
- The system uses polling to fetch updates from the Google Sheet backend
- Updates occur every 5 seconds
- Students can filter the feed by selecting different courses
- To conserve resources, polling automatically stops after 3 minutes

## 📋 Implementation Details

### Data Structure
- Each attendance record contains:
  - Student name
  - Student ID (NIM)
  - Class (A, B, or -)
  - Course (Cloud Computing, Web Programming, or Network Design)
  - Timestamp (automatically added)
  - Location coordinates (when available)
  - Week number (calculated on the server)

### API Integration
The system interacts with a Google Apps Script web app that:
- Receives POST requests for new attendance submissions
- Responds to GET requests with JSONP-formatted attendance data
- Handles course filtering and week calculations

### Security Considerations
- Form validation helps prevent data injection
- Google Apps Script provides authentication for the backend
- Sensitive operations are handled server-side

## 🚀 Deployment

This application is designed to be deployed as a static website with the following requirements:

1. A web server capable of serving static files (HTML, CSS, JS)
2. HTTPS protocol for secure geolocation access
3. A configured Google Apps Script web app endpoint

## 🔧 Configuration

To customize this system for your own use:

1. Replace the Google Apps Script endpoint URL in `script.js`:
   ```javascript
   const baseURL = "https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec";
   ```

2. Modify the course options in `index.html` to match your curriculum:
   ```html
   <select id="mataKuliah" name="mataKuliah" class="form-control" required>
     <option value="">Pilih Mata Kuliah</option>
     <option value="Your Course 1">Your Course 1</option>
     <option value="Your Course 2">Your Course 2</option>
     <!-- Add more courses as needed -->
   </select>
   ```

3. Adjust the styling in `style.css` to match your institution's branding:
   ```css
   :root {
     --primary-color: #YourPrimaryColor;
     --primary-light: #YourLightColor;
     --primary-dark: #YourDarkColor;
     /* Other color variables */
   }
   ```

## 🌐 Browser Compatibility

This application works best in modern browsers that support:
- ES6+ JavaScript
- Geolocation API
- CSS Custom Properties
- Backdrop Filter
- Flexbox and Grid Layout

## 🔒 Privacy Considerations

This system collects:
- Student identification information
- Geolocation data (with user permission)

Data is stored in Google Sheets and is subject to your institution's data retention policies.

## 📱 Mobile Experience

The system is fully responsive and provides an optimized experience on mobile devices:
- Touch-friendly input controls
- Responsive layout that adapts to screen size
- Performance optimizations for mobile networks

## 🧩 Extension Possibilities

The system can be extended with:
- Authentication integration
- QR code scanning for attendance
- Profile pictures in the attendance feed
- Attendance statistics and reports
- Integration with learning management systems

## 📚 Usage Guidelines

1. Students should only submit attendance when physically present in class
2. Refresh the page if the live feed stops updating after 3 minutes
3. Contact the course instructor if attendance submission fails
4. Allow location access when prompted for accurate attendance tracking

---

Developed with ❤️ for student attendance tracking. This project streamlines the attendance process while providing an engaging user experience.