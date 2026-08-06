-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 06, 2026 at 02:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smart_match`
--

-- --------------------------------------------------------

--
-- Table structure for table `helpers`
--

CREATE TABLE `helpers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `primary_skill` varchar(50) NOT NULL,
  `sub_skills` varchar(255) DEFAULT NULL,
  `shift_preference` varchar(20) DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `location_area` varchar(100) DEFAULT NULL,
  `is_immediately_available` tinyint(1) DEFAULT 0,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 4.0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `helpers`
--

INSERT INTO `helpers` (`id`, `name`, `primary_skill`, `sub_skills`, `shift_preference`, `experience_years`, `location_area`, `is_immediately_available`, `latitude`, `longitude`, `rating`, `created_at`) VALUES
(1, 'Sunita Pawar', 'Cook', 'Maharashtrian, North Indian', 'Evening', 6, 'Andheri West', 1, 19.136400, 72.829600, 4.8, '2026-08-06 07:18:16'),
(2, 'Rekha Jadhav', 'Cook', 'Maharashtrian, South Indian', 'Full Day', 9, 'Dadar', 1, 19.017600, 72.843400, 4.9, '2026-08-06 07:18:16'),
(3, 'Aarti Shinde', 'Cook', 'North Indian, Punjabi', 'Morning', 3, 'Bandra East', 0, 19.059600, 72.865600, 4.3, '2026-08-06 07:18:16'),
(4, 'Vaishali Rane', 'Cook', 'Maharashtrian, Konkani', 'Evening', 12, 'Vile Parle', 1, 19.099300, 72.848100, 5.0, '2026-08-06 07:18:16'),
(5, 'Priya Deshmukh', 'Nanny', 'Infant care, Newborn care', 'Full Day', 5, 'Powai', 1, 19.117600, 72.906000, 4.7, '2026-08-06 07:18:16'),
(6, 'Kavita More', 'Nanny', 'Toddler care, Homework help', 'Evening', 4, 'Andheri East', 0, 19.119700, 72.869700, 4.5, '2026-08-06 07:18:16'),
(7, 'Nisha Kamble', 'Nanny', 'Special needs care, Infant care', 'Morning', 6, 'Kandivali East', 1, 19.204100, 72.869000, 4.8, '2026-08-06 07:18:16'),
(8, 'Meena Kadam', 'Elder Care', 'Post-surgery care, Mobility support', 'Night', 8, 'Chembur', 1, 19.052200, 72.900500, 4.9, '2026-08-06 07:18:16'),
(9, 'Deepa Chavan', 'Elder Care', 'Diabetic care, Physiotherapy support', 'Full Day', 7, 'Ghatkopar', 0, 19.085700, 72.908100, 4.7, '2026-08-06 07:18:16'),
(10, 'Suresh Yadav', 'Driver', 'Sedan, SUV, Airport transfers', 'Full Day', 10, 'Malad West', 1, 19.187400, 72.848400, 4.6, '2026-08-06 07:18:16'),
(11, 'Ramesh Gupta', 'Driver', 'Commercial license, Outstation trips', 'Morning', 7, 'Goregaon', 0, 19.166300, 72.852600, 4.4, '2026-08-06 07:18:16'),
(12, 'Sandeep Waghmare', 'Driver', 'Sedan, Two-wheeler', 'Evening', 3, 'Borivali West', 1, 19.230700, 72.856700, 4.0, '2026-08-06 07:18:16'),
(13, 'Lata Naik', 'Maid', 'Cleaning, Dishwashing, Laundry', 'Morning', 2, 'Andheri West', 1, 19.119700, 72.846400, 4.1, '2026-08-06 07:18:16'),
(14, 'Sarika Bhosale', 'Maid', 'Deep cleaning, Utensils', 'Evening', 6, 'Dadar', 0, 19.020000, 72.841000, 4.6, '2026-08-06 07:18:16'),
(15, 'Anjali Salunkhe', 'Cleaner', 'Office cleaning, Sanitization', 'Night', 4, 'Lower Parel', 1, 19.000000, 72.830000, 4.2, '2026-08-06 07:18:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `helpers`
--
ALTER TABLE `helpers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_primary_skill` (`primary_skill`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `helpers`
--
ALTER TABLE `helpers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
