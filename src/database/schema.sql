
-- 1. Students Table
CREATE TABLE public.Students (
    usn VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5),
    dob DATE,
    address TEXT,
    contact_no VARCHAR(20),
    image_url VARCHAR(512),
    valid_upto DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Students table updated_at
CREATE TRIGGER set_students_updated_at
BEFORE UPDATE ON public.Students
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 2. NFC_Rings Table
CREATE TABLE public.NFC_Rings (
    nfc_uid VARCHAR(100) PRIMARY KEY,
    student_usn VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'lost', 'damaged')),
    assigned_date TIMESTAMPTZ DEFAULT NOW(),
    last_seen_description VARCHAR(255),
    last_seen_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_student_usn FOREIGN KEY (student_usn) REFERENCES public.Students(usn) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Trigger for NFC_Rings table updated_at
CREATE TRIGGER set_nfc_rings_updated_at
BEFORE UPDATE ON public.NFC_Rings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 3. Library_Access_Logs Table
CREATE TABLE public.Library_Access_Logs (
    log_id BIGSERIAL PRIMARY KEY,
    nfc_uid_scanner VARCHAR(100) NOT NULL,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    reader_id VARCHAR(50),
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_nfc_uid_library FOREIGN KEY (nfc_uid_scanner) REFERENCES public.NFC_Rings(nfc_uid) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_library_times CHECK (entry_time IS NOT NULL OR exit_time IS NOT NULL) -- At least one time must be present
);

-- Optional: Add indexes for faster querying on foreign keys and dates
CREATE INDEX idx_library_access_nfc_uid ON public.Library_Access_Logs(nfc_uid_scanner);
CREATE INDEX idx_library_access_log_date ON public.Library_Access_Logs(log_date);

-- 4. Library_Book_Transactions Table
CREATE TABLE public.Library_Book_Transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    nfc_uid_scanner VARCHAR(100) NOT NULL,
    book_id VARCHAR(100) NOT NULL, -- Assuming a book identifier like ISBN or internal ID
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date DATE NOT NULL,
    return_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_nfc_uid_book FOREIGN KEY (nfc_uid_scanner) REFERENCES public.NFC_Rings(nfc_uid) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Trigger for Library_Book_Transactions table updated_at
CREATE TRIGGER set_library_book_transactions_updated_at
BEFORE UPDATE ON public.Library_Book_Transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Optional: Add indexes
CREATE INDEX idx_library_book_nfc_uid ON public.Library_Book_Transactions(nfc_uid_scanner);
CREATE INDEX idx_library_book_book_id ON public.Library_Book_Transactions(book_id);
CREATE INDEX idx_library_book_status ON public.Library_Book_Transactions(status);

-- 5. Hostel_Access_Logs Table
CREATE TABLE public.Hostel_Access_Logs (
    log_id BIGSERIAL PRIMARY KEY,
    nfc_uid_scanner VARCHAR(100) NOT NULL,
    entry_time TIMESTAMPTZ,
    exit_time TIMESTAMPTZ,
    reader_id VARCHAR(50),
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_nfc_uid_hostel FOREIGN KEY (nfc_uid_scanner) REFERENCES public.NFC_Rings(nfc_uid) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_hostel_times CHECK (entry_time IS NOT NULL OR exit_time IS NOT NULL) -- At least one time must be present
);

-- Optional: Add indexes
CREATE INDEX idx_hostel_access_nfc_uid ON public.Hostel_Access_Logs(nfc_uid_scanner);
CREATE INDEX idx_hostel_access_log_date ON public.Hostel_Access_Logs(log_date);

-- Insert some sample data for testing
-- Sample Students
INSERT INTO public.Students (usn, name, blood_group, dob, address, contact_no, image_url, valid_upto) VALUES
('1BY23CS001', 'John Doe', 'B+', '2004-01-15', '123 Main St, Bangalore', '+919876543210', '/placeholder.svg', '2028-06-30'),
('1BY23CS002', 'Jane Smith', 'A-', '2003-11-20', '456 Oak Ave, Bangalore', '+919876543211', '/placeholder.svg', '2028-06-30'),
('1BY23CS003', 'Mike Johnson', 'O+', '2004-03-08', '789 Pine Rd, Bangalore', '+919876543212', '/placeholder.svg', '2028-06-30'),
('1BY23CS004', 'Alice Brown', 'AB+', '2003-09-12', '321 Elm St, Bangalore', '+919876543213', '/placeholder.svg', '2028-06-30'),
('1BY23CS005', 'David Wilson', 'B-', '2004-05-25', '654 Maple Dr, Bangalore', '+919876543214', '/placeholder.svg', '2028-06-30')
ON CONFLICT (usn) DO NOTHING;

-- Sample NFC Rings
INSERT INTO public.NFC_Rings (nfc_uid, student_usn, status, last_seen_description) VALUES
('NFC001ABC123', '1BY23CS001', 'active', 'Library entrance'),
('NFC002DEF456', '1BY23CS002', 'active', 'Hostel gate'),
('NFC003GHI789', '1BY23CS003', 'active', 'Library exit'),
('NFC004JKL012', '1BY23CS004', 'active', 'Main gate'),
('NFC005MNO345', '1BY23CS005', 'inactive', 'Not assigned')
ON CONFLICT (nfc_uid) DO NOTHING;

-- Sample Library Access Logs
INSERT INTO public.Library_Access_Logs (nfc_uid_scanner, entry_time, exit_time, reader_id) VALUES
('NFC001ABC123', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'LIB_READER_01'),
('NFC002DEF456', NOW() - INTERVAL '3 hours', NULL, 'LIB_READER_01'),
('NFC003GHI789', NOW() - INTERVAL '1 day', NOW() - INTERVAL '22 hours', 'LIB_READER_02')
ON CONFLICT DO NOTHING;

-- Sample Library Book Transactions
INSERT INTO public.Library_Book_Transactions (nfc_uid_scanner, book_id, issue_date, due_date, status) VALUES
('NFC001ABC123', 'ISBN9780262033848', NOW() - INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', 'issued'),
('NFC002DEF456', 'ISBN9780262035613', NOW() - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', 'overdue'),
('NFC003GHI789', 'ISBN9780078022159', NOW() - INTERVAL '7 days', CURRENT_DATE - INTERVAL '2 days', 'returned')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.Students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.NFC_Rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Library_Access_Logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Library_Book_Transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Hostel_Access_Logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on Students" ON public.Students FOR ALL USING (true);
CREATE POLICY "Allow all operations on NFC_Rings" ON public.NFC_Rings FOR ALL USING (true);
CREATE POLICY "Allow all operations on Library_Access_Logs" ON public.Library_Access_Logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on Library_Book_Transactions" ON public.Library_Book_Transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on Hostel_Access_Logs" ON public.Hostel_Access_Logs FOR ALL USING (true);
