/*
  # Seed sample data for development

  1. Sample Data
    - Sample timetable entries
    - Sample attendance records
    - Sample performance records
  
  2. Notes
    - This data is for development/demo purposes
    - Uses placeholder user IDs that should be replaced with real auth user IDs
*/

-- Insert sample timetable data (will need real user IDs after authentication)
-- This is commented out as it requires actual authenticated users
-- Uncomment and modify after users are created through the app

/*
INSERT INTO timetable (user_id, subject, day, start_time, end_time, location) VALUES
  ('user-id-placeholder', 'Mathematics', 'Monday', '09:00', '09:45', 'Room 201'),
  ('user-id-placeholder', 'Physics', 'Monday', '10:30', '12:00', 'Lab 3'),
  ('user-id-placeholder', 'English', 'Tuesday', '08:15', '09:00', 'Room 105'),
  ('user-id-placeholder', 'Chemistry', 'Wednesday', '11:15', '12:00', 'Lab 2'),
  ('user-id-placeholder', 'History', 'Thursday', '14:00', '14:45', 'Room 301'),
  ('user-id-placeholder', 'Biology', 'Friday', '09:00', '10:30', 'Lab 1');
*/

-- Note: Sample data will be inserted through the application after user authentication is set up