
-- Students table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(12) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book transactions table
CREATE TABLE IF NOT EXISTS book_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL REFERENCES students(id),
  student_name VARCHAR(255) NOT NULL,
  book_title VARCHAR(500) NOT NULL,
  book_isbn VARCHAR(20) NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library entries table
CREATE TABLE IF NOT EXISTS library_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL REFERENCES students(id),
  student_name VARCHAR(255) NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  exit_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample students
INSERT INTO students (id, name, email, photo_url) VALUES
('CS21001', 'John Doe', 'john.doe@college.edu', '/placeholder.svg'),
('CS21002', 'Jane Smith', 'jane.smith@college.edu', '/placeholder.svg'),
('CS21003', 'Mike Johnson', 'mike.johnson@college.edu', '/placeholder.svg'),
('CS21004', 'Alice Brown', 'alice.brown@college.edu', '/placeholder.svg'),
('CS21005', 'David Wilson', 'david.wilson@college.edu', '/placeholder.svg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample book transactions
INSERT INTO book_transactions (student_id, student_name, book_title, book_isbn, issue_date, due_date, status) VALUES
('CS21001', 'John Doe', 'Data Structures and Algorithms', '978-0262033848', NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', 'issued'),
('CS21002', 'Jane Smith', 'Machine Learning Basics', '978-0262035613', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'overdue'),
('CS21003', 'Mike Johnson', 'Database System Concepts', '978-0078022159', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days', 'returned')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_transactions_student_id ON book_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_book_transactions_status ON book_transactions(status);
CREATE INDEX IF NOT EXISTS idx_library_entries_student_id ON library_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_library_entries_entry_time ON library_entries(entry_time);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations on book_transactions" ON book_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on library_entries" ON library_entries FOR ALL USING (true);
