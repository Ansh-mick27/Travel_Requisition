-- MONITOR REQUISITIONS
-- Run this to see the latest requests coming in.
select 
  id, 
  created_at, 
  requester_id, 
  status, 
  pickup_location, 
  drop_location 
from public.requisitions 
order by created_at desc 
limit 5;
