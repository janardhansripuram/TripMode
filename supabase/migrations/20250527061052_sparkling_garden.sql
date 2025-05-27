/*
  # Group Expense Tracking Schema

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `currency` (text)
      - `default_split_method` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `group_members`
      - `id` (uuid, primary key) 
      - `group_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
      - `status` (text)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `description` (text)
      - `amount` (decimal)
      - `date` (timestamp)
      - `paid_by` (uuid, foreign key)
      - `category` (text)
      - `split_type` (text)
      - `receipt_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `expense_shares`
      - `id` (uuid, primary key)
      - `expense_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `amount` (decimal)
      - `percentage` (decimal)
      - `status` (text)
      - `settled_at` (timestamp)
    
    - `settlements`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key)
      - `payer_id` (uuid, foreign key)
      - `receiver_id` (uuid, foreign key)
      - `amount` (decimal)
      - `status` (text)
      - `settled_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for group members
    - Secure expense and settlement operations
*/

-- Create groups table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  default_split_method text NOT NULL DEFAULT 'equal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(group_id, user_id)
);

-- Create expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal NOT NULL CHECK (amount > 0),
  date timestamptz NOT NULL DEFAULT now(),
  paid_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  split_type text NOT NULL DEFAULT 'equal',
  receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expense_shares table
CREATE TABLE expense_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal NOT NULL DEFAULT 0,
  percentage decimal DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending',
  settled_at timestamptz DEFAULT NULL,
  UNIQUE(expense_id, user_id)
);

-- Create settlements table
CREATE TABLE settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  payer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount decimal NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending',
  settled_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Users can view groups they are members of"
  ON groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Users can create groups"
  ON groups
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Group members can update their groups"
  ON groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Create policies for group_members
CREATE POLICY "Users can view group members"
  ON group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Users can add members to their groups"
  ON group_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = NEW.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Create policies for expenses
CREATE POLICY "Users can view expenses in their groups"
  ON expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = expenses.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Users can create expenses in their groups"
  ON expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = NEW.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Users can update their own expenses"
  ON expenses
  FOR UPDATE
  USING (
    auth.uid() = paid_by
  );

-- Create policies for expense_shares
CREATE POLICY "Users can view expense shares in their groups"
  ON expense_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON e.group_id = gm.group_id
      WHERE e.id = expense_shares.expense_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

-- Create policies for settlements
CREATE POLICY "Users can view settlements in their groups"
  ON settlements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = settlements.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Create functions for expense calculations
CREATE OR REPLACE FUNCTION calculate_equal_split(expense_id uuid)
RETURNS void AS $$
DECLARE
  total_amount decimal;
  member_count integer;
  share_amount decimal;
BEGIN
  -- Get expense amount and member count
  SELECT amount, COUNT(gm.id)
  INTO total_amount, member_count
  FROM expenses e
  JOIN group_members gm ON e.group_id = gm.group_id
  WHERE e.id = expense_id
  AND gm.status = 'active'
  GROUP BY e.amount;

  -- Calculate equal share
  share_amount := ROUND((total_amount / member_count)::numeric, 2);

  -- Create expense shares
  INSERT INTO expense_shares (expense_id, user_id, amount)
  SELECT 
    expense_id,
    gm.user_id,
    CASE 
      WHEN gm.user_id = (SELECT paid_by FROM expenses WHERE id = expense_id)
      THEN share_amount - total_amount -- Payer's share is reduced by total amount
      ELSE share_amount
    END
  FROM group_members gm
  JOIN expenses e ON e.group_id = gm.group_id
  WHERE e.id = expense_id
  AND gm.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic share calculation
CREATE OR REPLACE FUNCTION create_expense_shares()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.split_type = 'equal' THEN
    PERFORM calculate_equal_split(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_shares_trigger
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION create_expense_shares();