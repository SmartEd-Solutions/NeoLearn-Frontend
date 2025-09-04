-- Fix the security definer view issue by recreating it without security definer
DROP VIEW IF EXISTS attendance_class_stats;

-- Create a regular view without security definer (it will use caller's permissions)
CREATE VIEW attendance_class_stats AS
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