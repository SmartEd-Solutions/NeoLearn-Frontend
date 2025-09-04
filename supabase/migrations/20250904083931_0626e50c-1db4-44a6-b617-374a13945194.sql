-- Add OpenAI API key as a secret first
-- This migration will ensure we have proper attendance tracking and improve the database structure

-- First, let's make sure we have the attendance status enum properly defined
-- (This should already exist but let's ensure it's correct)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
    END IF;
END $$;

-- Create a function to bulk mark attendance for a class
CREATE OR REPLACE FUNCTION public.bulk_mark_attendance(
    p_class_id UUID,
    p_date DATE,
    p_recorded_by UUID,
    p_attendance_data JSONB
)
RETURNS TABLE(success BOOLEAN, message TEXT, affected_rows INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    student_record RECORD;
    attendance_count INTEGER := 0;
BEGIN
    -- Validate the recorded_by user has permission (admin or teacher)
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_recorded_by 
        AND role IN ('admin', 'teacher')
    ) THEN
        RETURN QUERY SELECT false, 'Unauthorized: Only admins and teachers can mark attendance', 0;
        RETURN;
    END IF;

    -- Process each student's attendance
    FOR student_record IN 
        SELECT 
            s.user_id,
            (p_attendance_data->>s.user_id::text)::attendance_status AS status
        FROM students s
        WHERE s.class_id = p_class_id
        AND p_attendance_data ? s.user_id::text
    LOOP
        -- Upsert attendance record
        INSERT INTO attendance (user_id, date, status, recorded_by, class_id)
        VALUES (student_record.user_id, p_date, student_record.status, p_recorded_by, p_class_id)
        ON CONFLICT (user_id, date) 
        DO UPDATE SET 
            status = EXCLUDED.status,
            recorded_by = EXCLUDED.recorded_by,
            class_id = EXCLUDED.class_id;
        
        attendance_count := attendance_count + 1;
    END LOOP;

    RETURN QUERY SELECT true, 'Attendance marked successfully', attendance_count;
END;
$$;

-- Add unique constraint on attendance to prevent duplicates
ALTER TABLE attendance 
ADD CONSTRAINT attendance_user_date_unique 
UNIQUE (user_id, date);

-- Create a view for attendance statistics by class
CREATE OR REPLACE VIEW attendance_class_stats AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    COUNT(DISTINCT s.user_id) as total_students,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused_count,
    ROUND(
        (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) * 100.0) / 
        NULLIF(COUNT(a.id), 0), 
        1
    ) as attendance_rate,
    a.date
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
LEFT JOIN attendance a ON a.user_id = s.user_id
GROUP BY c.id, c.name, a.date
ORDER BY c.name, a.date DESC;

-- Create RLS policy for the new function
GRANT EXECUTE ON FUNCTION public.bulk_mark_attendance TO authenticated;