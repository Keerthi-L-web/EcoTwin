export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_co2_kg: number;
  deadline: string;
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}
