/*
 * Creates 1,000 synthetic helper profiles for smart_match2.
 * Run after smart_match_fresh.sql:
 *   node scripts/seedHelpers.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const TARGET_COUNT = 1000;
const firstNames = ['Asha', 'Pooja', 'Kavita', 'Sunita', 'Rekha', 'Meena', 'Anjali', 'Sarika', 'Lata', 'Nisha', 'Deepa', 'Priya', 'Suresh', 'Ramesh', 'Mahesh', 'Vijay', 'Ravi', 'Ganesh', 'Seema', 'Jyoti'];
const lastNames = ['Pawar', 'Jadhav', 'Shinde', 'More', 'Kamble', 'Chavan', 'Yadav', 'Gupta', 'Naik', 'Bhosale', 'Patil', 'Rane', 'Salunkhe', 'Waghmare', 'Kadam'];
const areas = [
  ['Andheri West', '400053', 19.1364, 72.8296], ['Andheri East', '400069', 19.1197, 72.8697],
  ['Dadar', '400014', 19.0176, 72.8434], ['Bandra East', '400051', 19.0596, 72.8656],
  ['Powai', '400076', 19.1176, 72.9060], ['Chembur', '400071', 19.0522, 72.9005],
  ['Ghatkopar', '400077', 19.0857, 72.9000], ['Vile Parle', '400057', 19.0993, 72.8481],
  ['Kandivali East', '400101', 19.2041, 72.8690], ['Borivali West', '400092', 19.2307, 72.8484]
];
const roleSubskills = {
  maid: ['Floor cleaning', 'Utensil cleaning', 'Dusting', 'Laundry', 'Bathroom cleaning', 'Vegetable chopping', 'Watering plants', 'Ironing clothes'],
  nanny: ['Japa work', 'Cook for children', 'Bathe children', 'Feed children', 'Play with children', 'Keep room organized', 'Newborn care'],
  cook: ['Vegetarian', 'Non-Vegetarian', 'South Indian', 'North Indian', 'Maharashtrian'],
  caregiver: ['Medication reminders', 'Mobility support', 'Post-surgery care', 'Diabetic care'],
  driver: ['Sedan', 'SUV', 'Airport transfers', 'Outstation trips']
};
const roleCodes = Object.keys(roleSubskills);
const languageCodes = ['hi', 'en', 'mr'];

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const sample = (items, min, max) => {
  const copy = [...items].sort(() => Math.random() - 0.5);
  return copy.slice(0, min + Math.floor(Math.random() * (max - min + 1)));
};
const activityDate = () => {
  const days = Math.random() < 0.55 ? Math.random() * 7 : Math.random() < 0.75 ? 8 + Math.random() * 22 : 31 + Math.random() * 150;
  return new Date(Date.now() - days * 86400000);
};

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_match2',
    connectionLimit: 5
  });

  const [skillRows] = await pool.query('SELECT id, code FROM skills');
  const [subskillRows] = await pool.query('SELECT ss.id, ss.display_name, s.code FROM subskills ss JOIN skills s ON s.id = ss.skill_id');
  const [languageRows] = await pool.query('SELECT id, code FROM languages');
  const skillId = Object.fromEntries(skillRows.map((row) => [row.code, row.id]));
  const languageId = Object.fromEntries(languageRows.map((row) => [row.code, row.id]));
  const subskillId = Object.fromEntries(subskillRows.map((row) => [`${row.code}:${row.display_name}`, row.id]));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (let index = 0; index < TARGET_COUNT; index += 1) {
      const [area, pincode, latitude, longitude] = pick(areas);
      const roles = sample(roleCodes, 1, Math.random() < 0.28 ? 3 : 2);
      const workerType = roles.includes('driver') && roles.length === 1 ? pick(['male', 'female']) : pick(['female', 'female', 'female', 'male', 'couple']);
      const available = Math.random() < 0.72 ? 'available' : Math.random() < 0.9 ? 'unavailable' : Math.random() < 0.96 ? 'paused' : 'employed';
      const experience = Number((1 + Math.random() * 14).toFixed(1));
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      const [result] = await connection.query(
        `INSERT INTO helpers (name, worker_type, address_line, location_area, city, pincode, latitude, longitude, shift_preference, experience_years, rating, availability_status, last_active_at, last_profile_updated_at, education_level, birth_year, lives_with, about_me, member_since, aadhaar_verified, criminal_background_verified, phone_verified)
         VALUES (?, ?, ?, ?, 'Mumbai', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, workerType, `${Math.floor(1 + Math.random() * 120)} ${area}`, area, pincode, latitude, longitude, pick(['Daytime', 'Live-in', 'Nighttime']), experience, Number((3.5 + Math.random() * 1.5).toFixed(1)), available, activityDate(), activityDate(), pick(['Class 6-9', 'Class 10', 'Class 12']), 1968 + Math.floor(Math.random() * 35), pick(['Children', 'Family', 'Spouse and children']), `Experienced home helper offering ${roles.join(', ')} services with care and responsibility.`, '2026-01-01', Math.random() < 0.8, Math.random() < 0.65, Math.random() < 0.9]
      );

      for (const role of roles) {
        await connection.query('INSERT INTO helper_skills (helper_id, skill_id, years_experience) VALUES (?, ?, ?)', [result.insertId, skillId[role], experience]);
        for (const subskill of sample(roleSubskills[role], 2, Math.min(4, roleSubskills[role].length))) {
          await connection.query('INSERT INTO helper_subskills (helper_id, subskill_id) VALUES (?, ?)', [result.insertId, subskillId[`${role}:${subskill}`]]);
        }
      }

      for (const language of sample(languageCodes, 1, 3)) {
        await connection.query('INSERT INTO helper_languages (helper_id, language_id, proficiency) VALUES (?, ?, ?)', [result.insertId, languageId[language], pick(['conversational', 'fluent', 'native'])]);
      }
    }
    await connection.commit();
    console.log(`Created ${TARGET_COUNT} synthetic helper profiles.`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
