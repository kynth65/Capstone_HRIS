<p align="center">
<img src="https://github.com/kynth65/Capstone_HRIS/blob/aa6b877629fa8254afdf34b5c59b06bf55fa289f/gamma%20care%20logo.jpg" alt="HRIS Logo" width="400">
</p>

<p align="center">
<a href="#"><img src="https://img.shields.io/badge/PHP-8.1%2B-blue.svg" alt="PHP Version"></a>
<a href="#"><img src="https://img.shields.io/badge/Laravel-10.x-red.svg" alt="Laravel Version"></a>
<a href="#"><img src="https://img.shields.io/badge/React-18.x-blue.svg" alt="React Version"></a>
<a href="#"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

# GammaCare HRIS: AI-Powered Human Resource Information System

## About The Project

GammaCare HRIS is a comprehensive Human Resource Information System developed for GammaCare Medical Services Inc. This multiplatform solution modernizes HR operations by combining traditional HRIS capabilities with cutting-edge AI features, transforming manual processes into streamlined digital workflows.

### Key Features

- **AI-Powered Resume Screening**
  - Automated candidate evaluation using OpenAI
  - Keyword matching and skills assessment
  - Smart ranking system for applicants

- **Smart Document Management**
  - AI-enhanced document generation
  - Automated template creation for HR documents
  - Document expiration tracking
  - Digital storage and retrieval system

- **Attendance Management**
  - Arduino-based physical attendance tracking
  - Real-time attendance monitoring
  - Leave management system
  - Automated time tracking

- **Employee Management**
  - Comprehensive employee profiles
  - Performance tracking
  - Document repository
  - Benefits administration

### Built With

- **Frontend**
  - React.js
  - Tailwind CSS
  - Axios
  - React Router

- **Backend**
  - Laravel 10
  - PHP 8.1
  - MySQL
  - OpenAI API

- **Hardware**
  - Arduino (Attendance System)
  - RFID Sensors

## Getting Started

### Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 16.0
- MySQL >= 8.0
- Arduino IDE (for attendance system setup)

### Installation

1. Clone the repository
```bash
git clone https://github.com/kynth65/Capstone_HRIS.git
```

2. Install PHP dependencies
```bash
composer install
```

3. Install Node.js dependencies
```bash
npm install
```

4. Configure environment variables
```bash
cp .env.example .env
php artisan key:generate
```

5. Set up the database
```bash
php artisan migrate
php artisan db:seed
```

6. Start the development servers
```bash
php artisan serve
npm run dev
```

## System Architecture

The system implements a modern client-server architecture:
- React frontend for responsive user interface
- Laravel backend API for business logic
- MySQL database for data persistence
- OpenAI integration for AI features
- Arduino system for physical attendance tracking

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Kynth Anthony Marcaida - kynth65@gmail.com

Project Link: [https://github.com/kynth65/gammacare-hris](https://github.com/yourusername/gammacare-hris)

## Acknowledgments

* GammaCare Medical Services Inc. for their collaboration
* OpenAI for AI capabilities
* Laravel and React.js communities
* Arduino community for hardware integration support
