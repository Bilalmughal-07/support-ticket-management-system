-- database/seed.sql
-- Insert sample customers (name, email, phone, company)
INSERT OR IGNORE INTO customers (name, email, phone, company) VALUES
('John Doe',      'john@example.com',  '123-456-7890', 'Acme Corporation'),
('Jane Smith',    'jane@example.com',  '098-765-4321', 'TechNova Ltd'),
('Alice Johnson', 'alice@example.com', '555-123-4567', 'DataSoft Solutions');

-- Insert sample tickets
INSERT OR IGNORE INTO tickets (customer_id, subject, description, priority, status) VALUES
(1, 'Cannot login to account',    'User reports error "Invalid credentials" even after password reset.', 'High',   'Open'),
(2, 'Application is very slow',   'Response time takes more than 10 seconds on dashboard.',              'Medium', 'In Progress'),
(1, 'Feature request: dark mode', 'Customer would like a dark theme option.',                            'Low',    'Closed'),
(3, 'Bug in report export',       'CSV export shows wrong date format.',                                 'High',   'Open');